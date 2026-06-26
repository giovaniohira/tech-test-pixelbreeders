import { Files, LayoutDashboard, Upload } from "lucide-react";
import { DashboardLayout } from "@/app/layouts/dashboard-layout";
import { useFolderNavigation } from "@/features/files/hooks/use-folder-navigation";
import { FileExplorer } from "@/features/files/components/file-explorer";
import { FolderBreadcrumb } from "@/features/files/components/folder-breadcrumb";
import { FolderSidebar } from "@/features/files/components/folder-sidebar";
import { SidebarStats } from "@/features/files/components/sidebar-stats";
import { UploadZone } from "@/features/files/components/upload-zone";
import { useFiles } from "@/features/files/hooks/use-files";
import { GroupsSidebar } from "@/features/groups/components/groups-sidebar";
import { SectionHeader } from "@/shared/components/section-header";
import { Card, CardContent } from "@/shared/components/ui/card";

function DashboardPageContent() {
  const { currentFolderId } = useFolderNavigation();
  const { data: files = [], isLoading, isError } = useFiles(currentFolderId);

  return (
    <>
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <LayoutDashboard className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Painel</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie seus arquivos, pastas e grupos compartilhados.
          </p>
          <FolderBreadcrumb />
        </div>
      </div>

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

      <section className="space-y-4">
        <SectionHeader
          icon={Upload}
          title="Enviar arquivo"
          description={
            currentFolderId
              ? "O arquivo será adicionado à pasta atual."
              : "Arraste ou selecione um arquivo para adicionar ao seu cofre."
          }
        />
        <UploadZone folderId={currentFolderId} />
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={Files}
          title="Seus arquivos"
          description="Clique com o botão direito em um arquivo para adicioná-lo a um grupo ou mover para outra pasta."
        />
        {isError ? (
          <Card className="border-destructive/30">
            <CardContent className="py-6">
              <p className="text-sm text-destructive">
                Não foi possível carregar seus arquivos. Verifique a conexão e tente novamente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <FileExplorer files={files} isLoading={isLoading} />
        )}
      </section>
    </>
  );
}

export function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardPageContent />
    </DashboardLayout>
  );
}
