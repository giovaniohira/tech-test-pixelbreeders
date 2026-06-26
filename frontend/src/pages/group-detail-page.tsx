import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, LogOut, UserMinus, UserPlus, Users } from "lucide-react";

import { DashboardLayout } from "@/app/layouts/dashboard-layout";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { downloadFileWithToast } from "@/features/files/lib/file-actions";
import {
  useGroupDetail,
  useInviteToGroup,
  useLeaveGroup,
  useRemoveGroupMember,
} from "@/features/groups/hooks/use-groups";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatBytes, formatDate } from "@/shared/lib/utils";
import type { GroupMember } from "@/shared/types";

export function GroupDetailPage() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const currentUser = useAuthStore((s) => s.user);
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
    invite.mutate(
      { groupId, username: name },
      { onSuccess: () => setUsername("") },
    );
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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard" aria-label="Voltar">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary shrink-0" />
                  <span className="truncate">{data?.group.name}</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {data?.group.member_count} membros · {data?.group.file_count} arquivos compartilhados
                </p>
              </div>
            )}
          </div>

          {isMember && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={() => setShowLeaveDialog(true)}
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Sair do grupo
            </Button>
          )}
        </div>

        {isError && (
          <Card className="border-destructive/30">
            <CardContent className="py-6">
              <p className="text-sm text-destructive">Não foi possível carregar o grupo.</p>
            </CardContent>
          </Card>
        )}

        {data && isOwner && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Convidar membro
              </h2>
              <div className="flex gap-2 max-w-md">
                <Input
                  placeholder="Nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
                <Button onClick={handleInvite} disabled={invite.isPending || !username.trim()}>
                  Convidar
                </Button>
              </div>
              {(data.pending_invitations?.length ?? 0) > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Convites pendentes</p>
                  {data.pending_invitations!.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-dashed px-3 py-2 text-sm"
                    >
                      <span>{inv.invitee_username}</span>
                      <span className="text-xs text-muted-foreground">Aguardando aceite</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {data && (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Membros</h2>
              <div className="rounded-lg border divide-y">
                {data.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">{member.username}</span>
                      {member.role === "owner" && (
                        <Badge variant="secondary" className="text-[10px]">
                          dono
                        </Badge>
                      )}
                      {member.username === currentUser?.username && (
                        <Badge variant="outline" className="text-[10px]">
                          você
                        </Badge>
                      )}
                    </div>
                    {isOwner && member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => setMemberToRemove(member)}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Arquivos compartilhados</h2>
              {data.files.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum arquivo compartilhado ainda. Clique com o botão direito em um arquivo no
                    painel e adicione ao grupo.
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-lg border overflow-hidden divide-y">
                  {data.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/30"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.original_filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(file.size)} · {formatDate(file.uploaded_at)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadFileWithToast(file)}
                        aria-label="Baixar"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sair do grupo</DialogTitle>
            <DialogDescription>
              {sharedByMeCount > 0
                ? `Você compartilhou ${sharedByMeCount} arquivo${sharedByMeCount > 1 ? "s" : ""} neste grupo. O que deseja fazer com eles?`
                : "Você não compartilhou arquivos neste grupo. Deseja sair?"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
              Cancelar
            </Button>
            {sharedByMeCount > 0 && (
              <Button
                variant="secondary"
                onClick={() => handleLeave(false)}
                disabled={leaveGroup.isPending}
              >
                Manter arquivos no grupo
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => handleLeave(sharedByMeCount > 0)}
              disabled={leaveGroup.isPending}
            >
              {sharedByMeCount > 0 ? "Remover arquivos e sair" : "Sair do grupo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover membro</DialogTitle>
            <DialogDescription>
              Remover <strong>{memberToRemove?.username}</strong> do grupo? Os arquivos que essa
              pessoa compartilhou serão removidos do grupo (não serão excluídos da conta dela).
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={removeMember.isPending}
            >
              Remover membro
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
