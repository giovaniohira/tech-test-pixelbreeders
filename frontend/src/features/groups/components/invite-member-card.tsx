import { UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import type { GroupInvitation } from "@/shared/types";

interface InviteMemberCardProps {
  username: string;
  pendingInvitations: GroupInvitation[];
  isPending: boolean;
  onUsernameChange: (value: string) => void;
  onInvite: () => void;
}

export function InviteMemberCard({
  username,
  pendingInvitations,
  isPending,
  onUsernameChange,
  onInvite,
}: InviteMemberCardProps) {
  return (
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
            onChange={(event) => onUsernameChange(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && onInvite()}
          />
          <Button onClick={onInvite} disabled={isPending || !username.trim()}>
            Convidar
          </Button>
        </div>
        {pendingInvitations.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Convites pendentes</p>
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between gap-3 rounded-md border border-dashed px-3 py-2 text-sm"
              >
                <span>{invitation.invitee_username}</span>
                <span className="text-xs text-muted-foreground">Aguardando aceite</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
