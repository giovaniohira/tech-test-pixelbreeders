from django.conf import settings
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


class StorageQuotaExceeded(Exception):
    """Raised when a user exceeds their storage quota."""


def _build_error_payload(status_code, message, details=None):
    payload = {
        "code": status_code,
        "message": message,
    }
    if settings.DEBUG and details is not None:
        payload["details"] = details
    return payload


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            "success": False,
            "error": _build_error_payload(
                response.status_code,
                _extract_message(response.data),
                response.data if isinstance(response.data, dict) else None,
            ),
        }
        return response

    return Response(
        {
            "success": False,
            "error": _build_error_payload(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "An unexpected error occurred.",
            ),
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _extract_message(data):
    if isinstance(data, dict):
        if "detail" in data:
            return str(data["detail"])
        for value in data.values():
            if isinstance(value, list) and value:
                return str(value[0])
            if isinstance(value, str):
                return value
    if isinstance(data, list) and data:
        return str(data[0])
    return "Request failed."
