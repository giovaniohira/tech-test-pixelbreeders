import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { DashboardLayout } from "@/app/layouts/dashboard-layout";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { GroupDetailHeader } from "@/features/groups/components/group-detail-header";
import { GroupFilesList } from "@/features/groups/components/group-files-list";
import { GroupMembersList } from "@/features/groups/components/group-members-list";
import { InviteMemberCard } from "@/features/groups/components/invite-member-card";
import { LeaveGroupDialog } from "@/features/groups/components/leave-group-dialog";
import { RemoveMemberDialog } from "@/features/groups/components/remove-member-dialog";
import {
  useGroupDetail,
  useInviteToGroup,
  useLeaveGroup,
  useRemoveGroupMember,
} from "@/features/groups/hooks/use-groups";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { GroupMember } from "@/shared/types";

export function GroupDetailPage() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const { data, isLoading, isError } = useGroupDetail(groupId ?? "");
  const invite = useInviteToGroup();
  const leaveGroup = useLeaveGroup();
  const removeMember = useRemoveGroupMember();
  const [username, setUsername] = useState("");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null);

  if (!groupId) return null;

  const isOwner = data?.group.my_role === "owner";
  const isMember = data?.group.my_role === "member";
  const sharedByMeCount = data?.my_shared_file_count ?? 0;

  function handleInvite() {
    const name = username.trim();
    if (!name || !groupId) return;
    invite.mutate({ groupId, username: name }, { onSuccess: () => setUsername("") });
  }

  function handleLeave(removeFiles: boolean) {
    if (!groupId) return;
    leaveGroup.mutate(
      { groupId, removeFiles },
      {
        onSuccess: () => {
          setShowLeaveDialog(false);
          navigate("/dashboard");
        },
      },
    );
  }

  function handleRemoveMember() {
    if (!memberToRemove || !groupId) return;
    removeMember.mutate(
      { groupId, memberId: memberToRemove.id },
      { onSuccess: () => setMemberToRemove(null) },
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <GroupDetailHeader
          group={data?.group}
          isLoading={isLoading}
          isMember={isMember}
          onLeave={() => setShowLeaveDialog(true)}
        />

        {isError && (
          <Card className="border-destructive/30">
            <CardContent className="py-6">
              <p className="text-sm text-destructive">Não foi possível carregar o grupo.</p>
            </CardContent>
          </Card>
        )}

        {data && isOwner && (
          <InviteMemberCard
            username={username}
            pendingInvitations={data.pending_invitations ?? []}
            isPending={invite.isPending}
            onUsernameChange={setUsername}
            onInvite={handleInvite}
          />
        )}

        {data && (
          <>
            <GroupMembersList
              members={data.members}
              currentUsername={currentUser?.username}
              isOwner={isOwner}
              onRemoveMember={setMemberToRemove}
            />
            <GroupFilesList files={data.files} />
          </>
        )}
      </div>

      <LeaveGroupDialog
        open={showLeaveDialog}
        sharedByMeCount={sharedByMeCount}
        isPending={leaveGroup.isPending}
        onOpenChange={setShowLeaveDialog}
        onLeave={handleLeave}
      />

      <RemoveMemberDialog
        member={memberToRemove}
        isPending={removeMember.isPending}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
      />
    </DashboardLayout>
  );
}
