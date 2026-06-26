from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone

from apps.files.models import FileRecord
from apps.groups.models import Group, GroupFile, GroupInvitation, GroupMembership, GroupRole, InvitationStatus


class GroupService:
    @transaction.atomic
    def create_group(self, user: User, name: str) -> Group:
        group = Group.objects.create(name=name, created_by=user)
        GroupMembership.objects.create(group=group, user=user, role=GroupRole.OWNER)
        return group

    def get_user_groups(self, user: User):
        return Group.objects.filter(memberships__user=user).distinct()

    def is_member(self, user: User, group: Group) -> bool:
        return GroupMembership.objects.filter(group=group, user=user).exists()

    def is_owner(self, user: User, group: Group) -> bool:
        return GroupMembership.objects.filter(
            group=group, user=user, role=GroupRole.OWNER
        ).exists()

    def get_membership(self, user: User, group: Group) -> GroupMembership | None:
        return GroupMembership.objects.filter(group=group, user=user).first()

    @transaction.atomic
    def invite_user(self, inviter: User, group: Group, username: str) -> GroupInvitation:
        if not self.is_owner(inviter, group):
            raise PermissionError("Only group owners can invite members.")

        invitee = User.objects.filter(username__iexact=username).first()
        if not invitee:
            raise ValueError("Unable to send invitation.")
        if invitee == inviter:
            raise ValueError("Unable to send invitation.")
        if self.is_member(invitee, group):
            raise ValueError("Unable to send invitation.")

        existing = GroupInvitation.objects.filter(
            group=group,
            invitee_username__iexact=username,
            status=InvitationStatus.PENDING,
        ).first()
        if existing and not existing.is_expired:
            return existing

        return GroupInvitation.objects.create(
            group=group,
            invitee_username=invitee.username,
            invited_by=inviter,
        )

    @transaction.atomic
    def accept_invitation(self, user: User, invitation: GroupInvitation) -> GroupMembership:
        if invitation.status != InvitationStatus.PENDING:
            raise ValueError("This invitation is no longer valid.")
        if invitation.is_expired:
            invitation.status = InvitationStatus.REVOKED
            invitation.save(update_fields=["status"])
            raise ValueError("This invitation has expired.")
        if user.username.lower() != invitation.invitee_username.lower():
            raise PermissionError("This invitation is not for you.")
        if self.is_member(user, invitation.group):
            invitation.status = InvitationStatus.ACCEPTED
            invitation.save(update_fields=["status"])
            return self.get_membership(user, invitation.group)

        membership = GroupMembership.objects.create(
            group=invitation.group,
            user=user,
            role=GroupRole.MEMBER,
        )
        invitation.status = InvitationStatus.ACCEPTED
        invitation.save(update_fields=["status"])
        return membership

    def get_pending_invitations(self, user: User):
        return GroupInvitation.objects.filter(
            invitee_username__iexact=user.username,
            status=InvitationStatus.PENDING,
            expires_at__gt=timezone.now(),
        ).select_related("group", "invited_by")

    def get_group_invitations(self, user: User, group: Group):
        if not self.is_owner(user, group):
            raise PermissionError("Only group owners can view invitations.")
        return GroupInvitation.objects.filter(
            group=group,
            status=InvitationStatus.PENDING,
            expires_at__gt=timezone.now(),
        )

    def _remove_user_files_from_group(self, user: User, group: Group) -> int:
        deleted, _ = GroupFile.objects.filter(group=group, file__owner=user).delete()
        return deleted

    @transaction.atomic
    def leave_group(self, user: User, group: Group, *, remove_files: bool) -> None:
        membership = self.get_membership(user, group)
        if not membership:
            raise PermissionError("You are not a member of this group.")
        if membership.role == GroupRole.OWNER:
            raise ValueError("Group owners cannot leave the group.")

        if remove_files:
            self._remove_user_files_from_group(user, group)
        membership.delete()

    @transaction.atomic
    def remove_member(self, owner: User, group: Group, membership_id) -> None:
        if not self.is_owner(owner, group):
            raise PermissionError("Only group owners can remove members.")

        membership = GroupMembership.objects.filter(id=membership_id, group=group).first()
        if not membership:
            raise ValueError("Member not found.")
        if membership.role == GroupRole.OWNER:
            raise ValueError("Cannot remove the group owner.")

        self._remove_user_files_from_group(membership.user, group)
        membership.delete()

    @transaction.atomic
    def add_file_to_group(self, user: User, group: Group, file_record: FileRecord) -> GroupFile:
        if not self.is_member(user, group):
            raise PermissionError("You are not a member of this group.")
        if file_record.owner != user:
            raise PermissionError("You can only share your own files.")

        share, created = GroupFile.objects.get_or_create(
            group=group,
            file=file_record,
            defaults={"added_by": user},
        )
        if not created:
            raise ValueError("File is already shared with this group.")
        return share

    @transaction.atomic
    def remove_file_from_group(self, user: User, group: Group, file_record: FileRecord) -> None:
        if not self.is_member(user, group):
            raise PermissionError("You are not a member of this group.")
        if file_record.owner != user and not self.is_owner(user, group):
            raise PermissionError("You cannot remove this file from the group.")

        GroupFile.objects.filter(group=group, file=file_record).delete()

    def get_group_files(self, user: User, group: Group):
        if not self.is_member(user, group):
            raise PermissionError("You are not a member of this group.")
        file_ids = GroupFile.objects.filter(group=group).values_list("file_id", flat=True)
        return FileRecord.objects.filter(id__in=file_ids)

    def get_group_ids_for_file(self, file_record: FileRecord) -> list:
        return self.build_group_ids_map([file_record]).get(str(file_record.id), [])

    def get_group_detail(self, user: User, group: Group) -> dict:
        detail = {
            "group": group,
            "members": group.memberships.select_related("user"),
            "files": self.get_group_files(user, group),
            "pending_invitations": None,
            "my_shared_file_count": None,
        }

        if self.is_owner(user, group):
            detail["pending_invitations"] = self.get_group_invitations(user, group)

        membership = self.get_membership(user, group)
        if membership and membership.role != GroupRole.OWNER:
            detail["my_shared_file_count"] = GroupFile.objects.filter(
                group=group,
                file__owner=user,
            ).count()

        return detail

    def user_can_access_file(self, user: User, file_record: FileRecord) -> bool:
        if file_record.owner == user:
            return True
        return GroupFile.objects.filter(
            file=file_record,
            group__memberships__user=user,
        ).exists()
