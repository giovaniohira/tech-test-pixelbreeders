import { AccountMenu } from "@/features/auth/components/account-menu";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { Logo } from "@/shared/components/logo";
import { ThemeToggle } from "@/shared/components/theme-toggle";

function DashboardHeader() {
  const { isLoading: isUserLoading } = useCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6 relative">
      <Logo to="/dashboard" className="md:hidden absolute left-4" />
      <ThemeToggle className="h-9 w-9" />
      <AccountMenu isLoading={isUserLoading} />
    </header>
  );
}

export function DashboardShell({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {sidebar}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 px-4 py-6 lg:px-8 space-y-6">{children}</main>
      </div>
    </div>
  );
}
