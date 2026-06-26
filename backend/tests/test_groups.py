import uuid
from unittest.mock import patch

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.files.models import FileRecord
from apps.groups.models import Group, GroupFile, GroupMembership, GroupRole


class GroupSecurityTestCase(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="owner", email="owner@example.com", password="SecurePass123!"
        )
        self.member = User.objects.create_user(
            username="member", email="member@example.com", password="SecurePass123!"
        )
        self.outsider = User.objects.create_user(
            username="outsider", email="outsider@example.com", password="SecurePass123!"
        )
        self.owner_tokens = self._get_tokens(self.owner)
        self.member_tokens = self._get_tokens(self.member)
        self.outsider_tokens = self._get_tokens(self.outsider)

        self.group = Group.objects.create(name="Test Group", created_by=self.owner)
        GroupMembership.objects.create(group=self.group, user=self.owner, role=GroupRole.OWNER)
        GroupMembership.objects.create(group=self.group, user=self.member, role=GroupRole.MEMBER)

        self.owner_file = FileRecord.objects.create(
            owner=self.owner,
            original_filename="owner.txt",
            storage_filename="owner.txt",
            mime_type="text/plain",
            size=100,
        )
        self.outsider_file = FileRecord.objects.create(
            owner=self.outsider,
            original_filename="outsider.txt",
            storage_filename="outsider.txt",
            mime_type="text/plain",
            size=100,
        )
        self.member_file = FileRecord.objects.create(
            owner=self.member,
            original_filename="member.txt",
            storage_filename="member.txt",
            mime_type="text/plain",
            size=100,
        )
        GroupFile.objects.create(
            group=self.group,
            file=self.member_file,
            added_by=self.member,
        )

    def _get_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {"access": str(refresh.access_token), "refresh": str(refresh)}

    def _auth_as(self, tokens):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

    def test_share_other_users_file_returns_404_not_403(self):
        self._auth_as(self.member_tokens)
        url = reverse("group-files", kwargs={"id": self.group.id})
        response = self.client.post(url, {"file_id": str(self.outsider_file.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_share_nonexistent_file_returns_404(self):
        self._auth_as(self.member_tokens)
        url = reverse("group-files", kwargs={"id": self.group.id})
        response = self.client.post(url, {"file_id": str(uuid.uuid4())}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_invite_unknown_user_generic_error(self):
        self._auth_as(self.owner_tokens)
        url = reverse("groups-invite", kwargs={"id": self.group.id})
        response = self.client.post(url, {"username": "nonexistent_user"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"]["message"], "Unable to send invitation.")

    def test_invite_existing_member_generic_error(self):
        self._auth_as(self.owner_tokens)
        url = reverse("groups-invite", kwargs={"id": self.group.id})
        response = self.client.post(url, {"username": "member"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"]["message"], "Unable to send invitation.")

    def test_invite_duplicate_pending_returns_existing(self):
        from apps.groups.models import GroupInvitation, InvitationStatus

        GroupInvitation.objects.create(
            group=self.group,
            invitee_username="outsider",
            invited_by=self.owner,
            status=InvitationStatus.PENDING,
        )
        self._auth_as(self.owner_tokens)
        url = reverse("groups-invite", kwargs={"id": self.group.id})
        response = self.client.post(url, {"username": "outsider"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["invitee_username"], "outsider")
        self.assertEqual(
            GroupInvitation.objects.filter(
                group=self.group,
                invitee_username__iexact="outsider",
                status=InvitationStatus.PENDING,
            ).count(),
            1,
        )

    def test_group_members_do_not_expose_email(self):
        self._auth_as(self.member_tokens)
        url = reverse("groups-detail", kwargs={"id": self.group.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for member in response.data["data"]["members"]:
            self.assertNotIn("email", member)

    def test_member_can_leave_and_keep_files(self):
        self._auth_as(self.member_tokens)
        url = reverse("groups-leave", kwargs={"id": self.group.id})
        response = self.client.post(url, {"remove_files": False}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            GroupMembership.objects.filter(group=self.group, user=self.member).exists()
        )
        self.assertTrue(
            GroupFile.objects.filter(group=self.group, file=self.member_file).exists()
        )

    def test_member_can_leave_and_remove_files(self):
        self._auth_as(self.member_tokens)
        url = reverse("groups-leave", kwargs={"id": self.group.id})
        response = self.client.post(url, {"remove_files": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            GroupMembership.objects.filter(group=self.group, user=self.member).exists()
        )
        self.assertFalse(
            GroupFile.objects.filter(group=self.group, file=self.member_file).exists()
        )

    def test_owner_cannot_leave_group(self):
        self._auth_as(self.owner_tokens)
        url = reverse("groups-leave", kwargs={"id": self.group.id})
        response = self.client.post(url, {"remove_files": False}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_owner_can_remove_member_and_their_files(self):
        membership = GroupMembership.objects.get(group=self.group, user=self.member)
        self._auth_as(self.owner_tokens)
        url = reverse("groups-member-remove", kwargs={"id": self.group.id, "member_id": membership.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            GroupMembership.objects.filter(group=self.group, user=self.member).exists()
        )
        self.assertFalse(
            GroupFile.objects.filter(group=self.group, file=self.member_file).exists()
        )

    def test_member_cannot_remove_other_members(self):
        membership = GroupMembership.objects.get(group=self.group, user=self.member)
        self._auth_as(self.member_tokens)
        url = reverse("groups-member-remove", kwargs={"id": self.group.id, "member_id": membership.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_group_member_can_download_shared_file(self):
        GroupFile.objects.create(
            group=self.group,
            file=self.owner_file,
            added_by=self.owner,
        )
        self._auth_as(self.member_tokens)
        with patch("apps.files.file_views.os.path.exists", return_value=True), patch(
            "builtins.open", create=True
        ), patch("services.file_service.LocalFileStorage") as mock_storage_cls:
            mock_storage_cls.return_value.get_path.return_value = "/fake/owner.txt"
            download_url = reverse("files-download", kwargs={"id": self.owner_file.id})
            response = self.client.get(download_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_group_member_cannot_delete_shared_file(self):
        GroupFile.objects.create(
            group=self.group,
            file=self.owner_file,
            added_by=self.owner,
        )
        self._auth_as(self.member_tokens)
        delete_url = reverse("files-detail", kwargs={"id": self.owner_file.id})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(FileRecord.objects.filter(id=self.owner_file.id).exists())

    def test_group_member_cannot_read_metadata_of_shared_file(self):
        GroupFile.objects.create(
            group=self.group,
            file=self.owner_file,
            added_by=self.owner,
        )
        self._auth_as(self.member_tokens)
        detail_url = reverse("files-detail", kwargs={"id": self.owner_file.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
