from rest_framework import serializers

from apps.files.models import FileRecord
from apps.files.validators import validate_upload_file


class FileRecordSerializer(serializers.ModelSerializer):
    is_image = serializers.SerializerMethodField()

    class Meta:
        model = FileRecord
        fields = (
            "id",
            "original_filename",
            "mime_type",
            "size",
            "uploaded_at",
            "is_image",
        )
        read_only_fields = fields

    def get_is_image(self, obj) -> bool:
        return obj.mime_type.startswith("image/")


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        return validate_upload_file(value)


class FileStatsSerializer(serializers.Serializer):
    total_files = serializers.IntegerField()
    storage_used = serializers.IntegerField()
    latest_upload = FileRecordSerializer(allow_null=True)
