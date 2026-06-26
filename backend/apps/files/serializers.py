from rest_framework import serializers

from apps.files.models import FileRecord
from apps.files.validators import validate_upload_file


class FileRecordSerializer(serializers.ModelSerializer):
    is_image = serializers.SerializerMethodField()
    folder_id = serializers.UUIDField(source="folder.id", read_only=True, allow_null=True)
    group_ids = serializers.SerializerMethodField()

    class Meta:
        model = FileRecord
        fields = (
            "id",
            "original_filename",
            "mime_type",
            "size",
            "uploaded_at",
            "is_image",
            "folder_id",
            "group_ids",
        )
        read_only_fields = fields

    def get_is_image(self, obj) -> bool:
        return obj.mime_type.startswith("image/")

    def get_group_ids(self, obj) -> list:
        mapping = self.context.get("group_ids_map")
        if mapping is not None:
            return mapping.get(str(obj.id), [])
        return []


class FileMoveSerializer(serializers.Serializer):
    folder_id = serializers.UUIDField(required=False, allow_null=True)


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    folder_id = serializers.UUIDField(required=False, allow_null=True, default=None)

    def validate_file(self, value):
        validate_upload_file(value)
        value.seek(0)
        return value


class FileStatsSerializer(serializers.Serializer):
    total_files = serializers.IntegerField()
    storage_used = serializers.IntegerField()
    latest_upload = serializers.SerializerMethodField()

    def get_latest_upload(self, obj):
        latest = obj.get("latest_upload")
        if not latest:
            return None
        context = self.context.get("latest_upload_context", self.context)
        return FileRecordSerializer(latest, context=context).data
