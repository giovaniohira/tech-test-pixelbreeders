import { UserMinus } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { GroupMember } from "@/shared/types";

interface GroupMembersListProps {
  members: GroupMember[];
  currentUsername?: string;
  isOwner: boolean;
  onRemoveMember: (member: GroupMember) => void;
}

export function GroupMembersList({
  members,
  currentUsername,
  isOwner,
  onRemoveMember,
}: GroupMembersListProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Membros</h2>
      <div className="rounded-lg border divide-y">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium truncate">{member.username}</span>
              {member.role === "owner" && (
                <Badge variant="secondary" className="text-[10px]">
                  dono
                </Badge>
              )}
              {member.username === currentUsername && (
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
                onClick={() => onRemoveMember(member)}
              >
                <UserMinus className="h-4 w-4 mr-1" />
                Remover
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
