from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.files.serializers import FileRecordSerializer
from apps.groups.models import Group, GroupRole
from apps.groups.serializers import (
    GroupCreateSerializer,
    GroupFileSerializer,
    GroupInvitationSerializer,
    GroupInviteSerializer,
    GroupLeaveSerializer,
    GroupMemberSerializer,
    GroupSerializer,
)
from core.responses import error_response, success_response
from services.group_service import GroupService


class GroupListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        service = GroupService()
        groups = service.get_user_groups(request.user)
        serializer = GroupSerializer(groups, many=True, context={"request": request})
        return success_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = GroupCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = GroupService()
        group = service.create_group(request.user, serializer.validated_data["name"])
        return success_response(
            data=GroupSerializer(group, context={"request": request}).data,
            message="Group created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class GroupDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        group = get_object_or_404(Group, id=id)
        service = GroupService()
        if not service.is_member(request.user, group):
            return error_response("Group not found.", status.HTTP_404_NOT_FOUND)

        members = group.memberships.select_related("user")
        files = service.get_group_files(request.user, group)
        payload = {
            "group": GroupSerializer(group, context={"request": request}).data,
            "members": GroupMemberSerializer(members, many=True).data,
            "files": FileRecordSerializer(files, many=True, context={"request": request}).data,
        }
        if service.is_owner(request.user, group):
            pending = service.get_group_invitations(request.user, group)
            payload["pending_invitations"] = GroupInvitationSerializer(
                pending, many=True
            ).data

        membership = service.get_membership(request.user, group)
        if membership and membership.role != GroupRole.OWNER:
            from apps.groups.models import GroupFile

            payload["my_shared_file_count"] = GroupFile.objects.filter(
                group=group, file__owner=request.user
            ).count()

        return success_response(data=payload)


class GroupInviteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        group = get_object_or_404(Group, id=id)
        serializer = GroupInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = GroupService()
        try:
            invitation = service.invite_user(
                request.user, group, serializer.validated_data["username"]
            )
        except PermissionError as exc:
            return error_response(str(exc), status.HTTP_403_FORBIDDEN)
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)

        return success_response(
            data=GroupInvitationSerializer(invitation).data,
            message="Invitation sent successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class GroupInvitationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = GroupService()
        invitations = service.get_pending_invitations(request.user)
        serializer = GroupInvitationSerializer(invitations, many=True)
        return success_response(data=serializer.data)


class GroupInvitationAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, token):
        from apps.groups.models import GroupInvitation

        invitation = get_object_or_404(GroupInvitation, token=token)
        service = GroupService()
        try:
            membership = service.accept_invitation(request.user, invitation)
        except (PermissionError, ValueError) as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)

        return success_response(
            data=GroupMemberSerializer(membership).data,
            message="Invitation accepted. You are now a member of the group.",
        )


class GroupLeaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        group = get_object_or_404(Group, id=id)
        serializer = GroupLeaveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = GroupService()
        try:
            service.leave_group(
                request.user,
                group,
                remove_files=serializer.validated_data["remove_files"],
            )
        except PermissionError as exc:
            return error_response(str(exc), status.HTTP_403_FORBIDDEN)
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)

        return success_response(message="You have left the group.")


class GroupMemberRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id, member_id):
        group = get_object_or_404(Group, id=id)
        service = GroupService()
        try:
            service.remove_member(request.user, group, member_id)
        except PermissionError as exc:
            return error_response(str(exc), status.HTTP_403_FORBIDDEN)
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)

        return success_response(message="Member removed from group.")


class GroupFileListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        group = get_object_or_404(Group, id=id)
        service = GroupService()
        try:
            files = service.get_group_files(request.user, group)
        except PermissionError as exc:
            return error_response(str(exc), status.HTTP_403_FORBIDDEN)

        return success_response(
            data=FileRecordSerializer(files, many=True, context={"request": request}).data
        )

    def post(self, request, id):
        from apps.files.models import FileRecord

        group = get_object_or_404(Group, id=id)
        file_id = request.data.get("file_id")
        if not file_id:
            return error_response("file_id is required.", status.HTTP_400_BAD_REQUEST)

        service = GroupService()
        if not service.is_member(request.user, group):
            return error_response("Group not found.", status.HTTP_404_NOT_FOUND)

        file_record = FileRecord.objects.filter(id=file_id, owner=request.user).first()
        if not file_record:
            return error_response("File not found.", status.HTTP_404_NOT_FOUND)

        try:
            share = service.add_file_to_group(request.user, group, file_record)
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)

        return success_response(
            data=GroupFileSerializer(share).data,
            message="File shared with group successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class GroupFileRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id, file_id):
        from apps.files.models import FileRecord

        group = get_object_or_404(Group, id=id)
        file_record = get_object_or_404(FileRecord, id=file_id)
        service = GroupService()
        try:
            service.remove_file_from_group(request.user, group, file_record)
        except PermissionError as exc:
            return error_response(str(exc), status.HTTP_403_FORBIDDEN)

        return success_response(message="File removed from group.")
