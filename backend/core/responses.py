from django.conf import settings
from rest_framework.response import Response


def success_response(data=None, message="Success", status_code=200):
    return Response(
        {"success": True, "message": message, "data": data},
        status=status_code,
    )


def error_response(message, status_code=400, details=None):
    payload = {
        "code": status_code,
        "message": message,
    }
    if settings.DEBUG and details is not None:
        payload["details"] = details

    return Response(
        {"success": False, "error": payload},
        status=status_code,
    )
