from rest_framework import status

from core.responses import error_response


class ServiceErrorMixin:
    def handle_service_error(self, exc):
        if isinstance(exc, PermissionError):
            return error_response(str(exc), status.HTTP_403_FORBIDDEN)
        if isinstance(exc, ValueError):
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)
        raise exc
