import { FolderNavigationProvider } from "@/features/files/context/folder-navigation-provider";
import { DashboardShell } from "@/app/layouts/dashboard-shell";
import { DashboardDesktopSidebar } from "@/app/layouts/dashboard-sidebars";

export function FilesDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <FolderNavigationProvider>
      <DashboardShell sidebar={<DashboardDesktopSidebar />}>{children}</DashboardShell>
    </FolderNavigationProvider>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <FilesDashboardLayout>{children}</FilesDashboardLayout>;
}
