import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Plus, Users } from "lucide-react";
import {
  useAcceptInvitation,
  useCreateGroup,
  useGroups,
  usePendingInvitations,
} from "@/features/groups/hooks/use-groups";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

export function GroupsSidebar() {
  const { data: groups = [] } = useGroups();
  const { data: invitations = [] } = usePendingInvitations();
  const createGroup = useCreateGroup();
  const acceptInvitation = useAcceptInvitation();
  const [showCreate, setShowCreate] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [newName, setNewName] = useState("");

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    createGroup.mutate(name, {
      onSuccess: () => {
        setNewName("");
        setShowCreate(false);
      },
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Grupos
        </h3>
        <div className="flex gap-1">
          {invitations.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 relative"
              onClick={() => setShowInvites(true)}
              aria-label="Convites pendentes"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                {invitations.length}
              </span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowCreate(true)}
            aria-label="Novo grupo"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="space-y-0.5 max-h-40 overflow-y-auto">
        {groups.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2">Nenhum grupo ainda.</p>
        ) : (
          groups.map((group) => (
            <Link
              key={group.id}
              to={`/dashboard/groups/${group.id}`}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
              )}
            >
              <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate flex-1">{group.name}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5">
                {group.file_count}
              </Badge>
            </Link>
          ))
        )}
      </nav>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo grupo</DialogTitle>
            <DialogDescription>
              Crie um grupo para compartilhar arquivos com outros usuários.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              placeholder="Nome do grupo"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={createGroup.isPending || !newName.trim()}>
              Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInvites} onOpenChange={setShowInvites}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convites pendentes</DialogTitle>
            <DialogDescription>Convites para entrar em grupos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{inv.group_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Convidado por {inv.invited_by_username}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => acceptInvitation.mutate(inv.token)}
                  disabled={acceptInvitation.isPending}
                >
                  Aceitar
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
