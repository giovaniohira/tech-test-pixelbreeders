import { Files, LayoutDashboard, Upload } from "lucide-react";
import { DashboardMobileSidebars } from "@/app/layouts/dashboard-sidebars";
import { DashboardLayout } from "@/app/layouts/dashboard-layout";
import { useFolderNavigation } from "@/features/files/hooks/use-folder-navigation";
import { FileExplorer } from "@/features/files/components/file-explorer";
import { FolderBreadcrumb } from "@/features/files/components/folder-breadcrumb";
import { UploadZone } from "@/features/files/components/upload-zone";
import { useFiles } from "@/features/files/hooks/use-files";
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

      <DashboardMobileSidebars />

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
