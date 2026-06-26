from rest_framework import serializers

from apps.files.models import Folder


class FolderSerializer(serializers.ModelSerializer):
    file_count = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = (
            "id",
            "name",
            "parent_id",
            "created_at",
            "file_count",
        )
        read_only_fields = ("id", "created_at", "file_count")

    def get_file_count(self, obj) -> int:
        return obj.files.count()


class FolderCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    parent_id = serializers.UUIDField(required=False, allow_null=True, default=None)
