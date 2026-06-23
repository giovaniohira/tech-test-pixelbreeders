import mimetypes
from pathlib import Path

from django.conf import settings
from rest_framework import serializers


def validate_upload_file(file_obj):
    if file_obj.size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise serializers.ValidationError(
            f"File size exceeds the maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB} MB."
        )

    extension = Path(file_obj.name).suffix.lower()
    if extension not in settings.ALLOWED_FILE_EXTENSIONS:
        raise serializers.ValidationError(
            "File type not allowed. Allowed types: PNG, JPG, PDF, TXT."
        )

    guessed_mime, _ = mimetypes.guess_type(file_obj.name)
    content_type = file_obj.content_type or guessed_mime or ""

    if content_type and content_type not in settings.ALLOWED_MIME_TYPES:
        raise serializers.ValidationError("File MIME type is not allowed.")

    return file_obj
