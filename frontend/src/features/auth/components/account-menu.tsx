import { ChevronDown, LogOut, RefreshCw, User } from "lucide-react";

import { useLogout } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

interface AccountMenuProps {
  isLoading?: boolean;
  className?: string;
}

export function AccountMenu({ isLoading, className }: AccountMenuProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm shadow-sm outline-none",
          "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        {isLoading ? (
          <Skeleton className="h-4 w-16" />
        ) : (
          <span className="font-medium max-w-[120px] truncate">{user?.username}</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{user?.username ?? "Conta"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout.mutate("Entre com outra conta.")}
          disabled={logout.isPending}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Trocar de conta
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => logout.mutate("Sessão encerrada.")}
          disabled={logout.isPending}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
