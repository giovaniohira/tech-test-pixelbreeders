from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.validators import UnicodeUsernameValidator
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "password_confirm")
        extra_kwargs = {
            "username": {"validators": [UnicodeUsernameValidator()]},
            "email": {"validators": []},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"non_field_errors": ["Unable to register with provided credentials."]}
            )

        validate_password(attrs["password"])

        email_taken = User.objects.filter(email__iexact=attrs["email"]).exists()
        username_taken = User.objects.filter(username__iexact=attrs["username"]).exists()
        if email_taken or username_taken:
            raise serializers.ValidationError(
                {"non_field_errors": ["Unable to register with provided credentials."]}
            )

        attrs["email"] = attrs["email"].lower()
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")
        read_only_fields = fields
