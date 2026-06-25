from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.authentication.serializers import RegisterSerializer, UserSerializer
from core.auth_cookies import clear_refresh_cookie, get_refresh_token, set_refresh_cookie
from core.exceptions import _build_error_payload, _extract_message
from core.responses import error_response, success_response


def _wrap_jwt_error_response(response):
    details = response.data if isinstance(response.data, dict) else None
    return Response(
        {
            "success": False,
            "error": _build_error_payload(
                response.status_code,
                _extract_message(response.data),
                details,
            ),
        },
        status=response.status_code,
    )


def _tokens_payload(access: str) -> dict:
    return {"tokens": {"access": access}}


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        response = success_response(
            data={
                "user": UserSerializer(user).data,
                **_tokens_payload(str(refresh.access_token)),
            },
            message="Registration successful.",
            status_code=status.HTTP_201_CREATED,
        )
        set_refresh_cookie(response, str(refresh))
        return response


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code != status.HTTP_200_OK:
            return _wrap_jwt_error_response(response)

        username = request.data.get("username")
        user = User.objects.filter(username=username).first()
        access = response.data["access"]
        refresh = response.data["refresh"]

        api_response = success_response(
            data={
                "user": UserSerializer(user).data if user else None,
                **_tokens_payload(access),
            },
            message="Login successful.",
        )
        set_refresh_cookie(api_response, refresh)
        return api_response


class RefreshTokenView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request, *args, **kwargs):
        refresh = get_refresh_token(request)
        if not refresh:
            return error_response(
                "Authentication credentials were not provided.",
                status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh})
        serializer.is_valid(raise_exception=True)

        access = serializer.validated_data["access"]
        api_response = success_response(
            data=_tokens_payload(access),
            message="Token refreshed.",
        )

        new_refresh = serializer.validated_data.get("refresh")
        if new_refresh:
            set_refresh_cookie(api_response, str(new_refresh))

        return api_response


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        refresh_token = get_refresh_token(request)
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass

        response = success_response(message="Logged out successfully.")
        clear_refresh_cookie(response)
        return response


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return success_response(data=serializer.data)
