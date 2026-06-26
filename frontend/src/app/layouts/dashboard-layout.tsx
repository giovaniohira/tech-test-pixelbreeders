import { AccountMenu } from "@/features/auth/components/account-menu";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { FolderNavigationProvider } from "@/features/files/context/folder-navigation-provider";
import { SidebarStats } from "@/features/files/components/sidebar-stats";
import { FolderSidebar } from "@/features/files/components/folder-sidebar";
import { GroupsSidebar } from "@/features/groups/components/groups-sidebar";
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

function DashboardSidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card/30 h-screen sticky top-0">
      <div className="flex h-14 items-center border-b border-border px-5">
        <Logo to="/dashboard" />
      </div>
      <div className="border-b border-border px-4 py-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          Resumo
        </p>
        <SidebarStats />
      </div>
      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4">
          <FolderSidebar />
        </div>
        <div className="shrink-0 border-t border-border p-4 bg-card/50">
          <GroupsSidebar />
        </div>
      </div>
    </aside>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <FolderNavigationProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 px-4 py-6 lg:px-8 space-y-6">{children}</main>
        </div>
      </div>
    </FolderNavigationProvider>
  );
}
