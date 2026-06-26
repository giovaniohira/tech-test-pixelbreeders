import { Download, Eye, FileText, Trash2 } from "lucide-react";

import { useFileRowActions } from "@/features/files/hooks/use-file-row-actions";
import { downloadFileWithToast } from "@/features/files/lib/file-actions";
import { getFileIcon } from "@/features/files/lib/file-icons";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { FileRecord } from "@/shared/types";
import { formatBytes, formatDate } from "@/shared/lib/utils";

interface FileGridProps {
  files: FileRecord[];
  isLoading: boolean;
}

export function FileGrid({ files, isLoading }: FileGridProps) {
  const { groupMap, setPreviewFile, setDeleteFile, modals } = useFileRowActions();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((placeholder) => (
          <Skeleton key={placeholder} className="h-36 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <FileText className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="font-medium">Nenhum arquivo encontrado</p>
        <p className="text-sm text-muted-foreground mt-1">
          Envie um arquivo ou ajuste os filtros.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => {
          const Icon = getFileIcon(file.mime_type);
          return (
            <FileContextMenu
              key={file.id}
              file={file}
              onPreview={file.is_image ? () => setPreviewFile(file) : undefined}
              onDownload={() => downloadFileWithToast(file)}
              onDelete={() => setDeleteFile(file)}
            >
              <div className="group rounded-lg border bg-card p-4 hover:border-primary/40 transition-colors cursor-default">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" title={file.original_filename}>
                        {file.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatBytes(file.size)} · {formatDate(file.uploaded_at)}
                      </p>
                    </div>
                  </div>
                </div>
                {file.group_ids.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {file.group_ids.map((groupId) => (
                      <Badge key={groupId} variant="outline" className="text-[10px]">
                        {groupMap.get(groupId) || "Grupo"}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.is_image && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewFile(file)}
                      aria-label="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => downloadFileWithToast(file)}
                    aria-label="Baixar"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteFile(file)}
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </FileContextMenu>
          );
        })}
      </div>
      {modals}
    </>
  );
}
