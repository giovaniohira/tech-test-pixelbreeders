import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { downloadFileRecord } from "@/features/files/api/files-api";
import { DeleteFileDialog } from "@/features/files/components/delete-file-dialog";
import { FileContextMenu } from "@/features/files/components/file-context-menu";
import { ImagePreviewModal } from "@/features/files/components/image-preview-modal";
import { useDeleteFile } from "@/features/files/hooks/use-files";
import { useGroups } from "@/features/groups/hooks/use-groups";
import { getErrorMessage } from "@/shared/api/client";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { FileRecord } from "@/shared/types";
import { formatBytes, formatDate } from "@/shared/lib/utils";
import { useMemo, useState } from "react";

interface FileGridProps {
  files: FileRecord[];
  isLoading: boolean;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  return FileText;
}

async function handleFileDownload(file: FileRecord) {
  try {
    await downloadFileRecord(file);
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
}

export function FileGrid({ files, isLoading }: FileGridProps) {
  const deleteMutation = useDeleteFile();
  const { data: groups = [] } = useGroups();
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [deleteFile, setDeleteFile] = useState<FileRecord | null>(null);

  const groupMap = useMemo(
    () => new Map(groups.map((g) => [g.id, g.name])),
    [groups],
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-36 w-full rounded-lg" />
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
              onDownload={() => handleFileDownload(file)}
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
                    {file.group_ids.map((gid) => (
                      <Badge key={gid} variant="outline" className="text-[10px]">
                        {groupMap.get(gid) || "Grupo"}
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
                    onClick={() => handleFileDownload(file)}
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

      {previewFile && (
        <ImagePreviewModal
          file={previewFile}
          open={!!previewFile}
          onOpenChange={(open) => !open && setPreviewFile(null)}
        />
      )}

      {deleteFile && (
        <DeleteFileDialog
          filename={deleteFile.original_filename}
          open={!!deleteFile}
          onOpenChange={(open) => !open && setDeleteFile(null)}
          onConfirm={() => {
            deleteMutation.mutate(deleteFile.id, {
              onSuccess: () => setDeleteFile(null),
            });
          }}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </>
  );
}
