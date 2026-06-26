from rest_framework import serializers

from apps.groups.models import Group, GroupFile, GroupInvitation, GroupMembership
from apps.files.serializers import FileRecordSerializer


class GroupMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = GroupMembership
        fields = ("id", "username", "role", "joined_at")
        read_only_fields = fields


class GroupSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    file_count = serializers.SerializerMethodField()
    my_role = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = (
            "id",
            "name",
            "created_at",
            "member_count",
            "file_count",
            "my_role",
        )
        read_only_fields = ("id", "created_at", "member_count", "file_count", "my_role")

    def get_member_count(self, obj) -> int:
        return obj.memberships.count()

    def get_file_count(self, obj) -> int:
        return obj.shared_files.count()

    def get_my_role(self, obj) -> str | None:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        membership = obj.memberships.filter(user=request.user).first()
        return membership.role if membership else None


class GroupCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)


class GroupInviteSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)


class GroupLeaveSerializer(serializers.Serializer):
    remove_files = serializers.BooleanField(default=False)


class GroupInvitationSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source="group.name", read_only=True)
    invited_by_username = serializers.CharField(source="invited_by.username", read_only=True)

    class Meta:
        model = GroupInvitation
        fields = (
            "id",
            "group_id",
            "group_name",
            "invitee_username",
            "invited_by_username",
            "token",
            "status",
            "created_at",
            "expires_at",
        )
        read_only_fields = fields


class GroupFileSerializer(serializers.ModelSerializer):
    file = FileRecordSerializer(read_only=True)
    added_by_username = serializers.CharField(source="added_by.username", read_only=True)

    class Meta:
        model = GroupFile
        fields = ("id", "file", "added_by_username", "added_at")
        read_only_fields = fields
