import { Download } from "lucide-react";
import { downloadFileWithToast } from "@/features/files/lib/file-actions";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { FileRecord } from "@/shared/types";
import { formatBytes, formatDate } from "@/shared/lib/utils";

interface GroupFilesListProps {
  files: FileRecord[];
}

export function GroupFilesList({ files }: GroupFilesListProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Arquivos compartilhados</h2>
      {files.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhum arquivo compartilhado ainda. Clique com o botão direito em um arquivo no painel
            e adicione ao grupo.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden divide-y">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/30"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{file.original_filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)} · {formatDate(file.uploaded_at)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => downloadFileWithToast(file)}
                aria-label="Baixar"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
