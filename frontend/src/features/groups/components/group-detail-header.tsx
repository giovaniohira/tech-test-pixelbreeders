import { Link } from "react-router-dom";
import { ArrowLeft, LogOut, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { Group } from "@/shared/types";

interface GroupDetailHeaderProps {
  group?: Group;
  isLoading: boolean;
  isMember: boolean;
  onLeave: () => void;
}

export function GroupDetailHeader({
  group,
  isLoading,
  isMember,
  onLeave,
}: GroupDetailHeaderProps) {
  return (
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
              <span className="truncate">{group?.name}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {group?.member_count} membros · {group?.file_count} arquivos compartilhados
            </p>
          </div>
        )}
      </div>

      {isMember && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 text-destructive hover:text-destructive"
          onClick={onLeave}
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          Sair do grupo
        </Button>
      )}
    </div>
  );
}
