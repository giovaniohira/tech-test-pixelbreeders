import { DashboardLayout } from "@/app/layouts/dashboard-layout";
import { FileTable } from "@/features/files/components/file-table";
import { StatsCards } from "@/features/files/components/stats-cards";
import { UploadZone } from "@/features/files/components/upload-zone";
import { useFiles } from "@/features/files/hooks/use-files";

export function DashboardPage() {
  const { data: files = [], isLoading } = useFiles();

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your files securely in one place.
        </p>
      </div>

      <StatsCards />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Upload</h2>
        <UploadZone />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your files</h2>
        <FileTable files={files} isLoading={isLoading} />
      </section>
    </DashboardLayout>
  );
}
