import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Search,
  Trash2,
} from "lucide-react";
import { useDeleteFile } from "@/features/files/hooks/use-files";
import { getDownloadUrl } from "@/features/files/api/files-api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { ImagePreviewModal } from "@/features/files/components/image-preview-modal";
import { DeleteFileDialog } from "@/features/files/components/delete-file-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { FileRecord, SortDirection, SortField } from "@/shared/types";
import { formatBytes, formatDate } from "@/shared/lib/utils";

interface FileTableProps {
  files: FileRecord[];
  isLoading: boolean;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  return FileText;
}

function sortFiles(
  files: FileRecord[],
  field: SortField,
  direction: SortDirection,
): FileRecord[] {
  const sorted = [...files].sort((a, b) => {
    let comparison = 0;
    switch (field) {
      case "name":
        comparison = a.original_filename.localeCompare(b.original_filename);
        break;
      case "size":
        comparison = a.size - b.size;
        break;
      case "uploaded_at":
        comparison = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
        break;
    }
    return direction === "asc" ? comparison : -comparison;
  });
  return sorted;
}

export function FileTable({ files, isLoading }: FileTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("uploaded_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [deleteFile, setDeleteFile] = useState<FileRecord | null>(null);
  const deleteMutation = useDeleteFile();
  const accessToken = useAuthStore((s) => s.accessToken);

  const filteredFiles = useMemo(() => {
    const query = search.toLowerCase().trim();
    const filtered = query
      ? files.filter((f) => f.original_filename.toLowerCase().includes(query))
      : files;
    return sortFiles(filtered, sortField, sortDirection);
  }, [files, search, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDownload = async (file: FileRecord) => {
    const url = getDownloadUrl(file.id);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return;
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file.original_filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      type="button"
      onClick={() => toggleSort(field)}
      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      {label}
      {sortField === field &&
        (sortDirection === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        ))}
    </button>
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">
            {search ? "No files match your search" : "No files yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {search
              ? "Try a different search term"
              : "Upload your first file to get started"}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-[1fr_100px_140px_120px] gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
            <SortButton field="name" label="Name" />
            <SortButton field="size" label="Size" />
            <SortButton field="uploaded_at" label="Uploaded" />
            <span>Actions</span>
          </div>
          <ul className="divide-y">
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.mime_type);
              return (
                <li
                  key={file.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_100px_140px_120px] gap-2 sm:gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" title={file.original_filename}>
                        {file.original_filename}
                      </p>
                      <Badge variant="secondary" className="mt-1 sm:hidden text-[10px]">
                        {file.mime_type.split("/")[1]?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {formatBytes(file.size)}
                  </span>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {formatDate(file.uploaded_at)}
                  </span>
                  <div className="flex items-center gap-1 justify-end">
                    {file.is_image && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewFile(file)}
                        aria-label="Preview image"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(file)}
                      aria-label="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteFile(file)}
                      aria-label="Delete file"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

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
    </div>
  );
}
