import { useMemo, useState } from "react";

import { DeleteFileDialog } from "@/features/files/components/delete-file-dialog";
import { ImagePreviewModal } from "@/features/files/components/image-preview-modal";
import { useDeleteFile } from "@/features/files/hooks/use-files";
import { useGroups } from "@/features/groups/hooks/use-groups";
import type { FileRecord } from "@/shared/types";

export function useFileRowActions() {
  const deleteMutation = useDeleteFile();
  const { data: groups = [] } = useGroups();
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [deleteFile, setDeleteFile] = useState<FileRecord | null>(null);

  const groupMap = useMemo(
    () => new Map(groups.map((group) => [group.id, group.name])),
    [groups],
  );

  const modals = (
    <>
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

  return {
    groupMap,
    previewFile,
    deleteFile,
    setPreviewFile,
    setDeleteFile,
    modals,
  };
}
