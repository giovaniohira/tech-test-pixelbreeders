import { FolderSidebar } from "@/features/files/components/folder-sidebar";
import { SidebarStats } from "@/features/files/components/sidebar-stats";
import { GroupsSidebar } from "@/features/groups/components/groups-sidebar";
import { Logo } from "@/shared/components/logo";

export function DashboardDesktopSidebar() {
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

export function DashboardMobileSidebars() {
  return (
    <div className="md:hidden space-y-4">
      <div className="rounded-lg border border-border bg-card/40 px-3 py-2.5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          Resumo
        </p>
        <SidebarStats />
      </div>
      <FolderSidebar />
      <GroupsSidebar />
    </div>
  );
}
