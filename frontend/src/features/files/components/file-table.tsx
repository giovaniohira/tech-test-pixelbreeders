import { useMemo, useReducer } from "react";
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
import { toast } from "sonner";
import { useDeleteFile } from "@/features/files/hooks/use-files";
import { downloadFileRecord } from "@/features/files/api/files-api";
import { ImagePreviewModal } from "@/features/files/components/image-preview-modal";
import { DeleteFileDialog } from "@/features/files/components/delete-file-dialog";
import { FileContextMenu } from "@/features/files/components/file-context-menu";
import { useGroups } from "@/features/groups/hooks/use-groups";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getErrorMessage } from "@/shared/api/client";
import type { FileRecord, SortDirection, SortField } from "@/shared/types";
import { formatBytes, formatDate } from "@/shared/lib/utils";

interface FileTableProps {
  files: FileRecord[];
  isLoading: boolean;
  hideSearch?: boolean;
}

type FileTableState = {
  search: string;
  sortField: SortField;
  sortDirection: SortDirection;
  previewFile: FileRecord | null;
  deleteFile: FileRecord | null;
};

type FileTableAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "TOGGLE_SORT"; payload: SortField }
  | { type: "SET_PREVIEW"; payload: FileRecord | null }
  | { type: "SET_DELETE"; payload: FileRecord | null };

const initialState: FileTableState = {
  search: "",
  sortField: "uploaded_at",
  sortDirection: "desc",
  previewFile: null,
  deleteFile: null,
};

function fileTableReducer(state: FileTableState, action: FileTableAction): FileTableState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "TOGGLE_SORT":
      if (state.sortField === action.payload) {
        return {
          ...state,
          sortDirection: state.sortDirection === "asc" ? "desc" : "asc",
        };
      }
      return { ...state, sortField: action.payload, sortDirection: "asc" };
    case "SET_PREVIEW":
      return { ...state, previewFile: action.payload };
    case "SET_DELETE":
      return { ...state, deleteFile: action.payload };
    default:
      return state;
  }
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
  return files.toSorted((a, b) => {
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
}

interface SortButtonProps {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDirection: SortDirection;
  onToggle: (field: SortField) => void;
}

function SortButton({
  field,
  label,
  sortField,
  sortDirection,
  onToggle,
}: SortButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(field)}
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
}

async function handleFileDownload(file: FileRecord) {
  try {
    await downloadFileRecord(file);
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
}

export function FileTable({ files, isLoading, hideSearch = false }: FileTableProps) {
  const [state, dispatch] = useReducer(fileTableReducer, initialState);
  const deleteMutation = useDeleteFile();
  const { data: groups = [] } = useGroups();

  const groupMap = useMemo(
    () => new Map(groups.map((g) => [g.id, g.name])),
    [groups],
  );

  const filteredFiles = useMemo(() => {
    const query = hideSearch ? "" : state.search.toLowerCase().trim();
    const filtered = query
      ? files.filter((f) => f.original_filename.toLowerCase().includes(query))
      : files;
    return sortFiles(filtered, state.sortField, state.sortDirection);
  }, [files, state.search, state.sortField, state.sortDirection, hideSearch]);

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
      {!hideSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar arquivos..."
            value={state.search}
            onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
            className="pl-9"
          />
        </div>
      )}

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">
            {!hideSearch && state.search ? "Nenhum arquivo corresponde à busca" : "Nenhum arquivo encontrado"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {!hideSearch && state.search
              ? "Tente outro termo de busca"
              : "Envie seu primeiro arquivo para começar"}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-[1fr_100px_140px_120px] gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
            <SortButton
              field="name"
              label="Nome"
              sortField={state.sortField}
              sortDirection={state.sortDirection}
              onToggle={(field) => dispatch({ type: "TOGGLE_SORT", payload: field })}
            />
            <SortButton
              field="size"
              label="Tamanho"
              sortField={state.sortField}
              sortDirection={state.sortDirection}
              onToggle={(field) => dispatch({ type: "TOGGLE_SORT", payload: field })}
            />
            <SortButton
              field="uploaded_at"
              label="Enviado"
              sortField={state.sortField}
              sortDirection={state.sortDirection}
              onToggle={(field) => dispatch({ type: "TOGGLE_SORT", payload: field })}
            />
            <span>Ações</span>
          </div>
          <ul className="divide-y">
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.mime_type);
              return (
                <FileContextMenu
                  key={file.id}
                  file={file}
                  onPreview={
                    file.is_image
                      ? () => dispatch({ type: "SET_PREVIEW", payload: file })
                      : undefined
                  }
                  onDownload={() => handleFileDownload(file)}
                  onDelete={() => dispatch({ type: "SET_DELETE", payload: file })}
                >
                  <li className="grid grid-cols-1 sm:grid-cols-[1fr_100px_140px_120px] gap-2 sm:gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-default">
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" title={file.original_filename}>
                          {file.original_filename}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="secondary" className="sm:hidden text-[10px]">
                            {file.mime_type.split("/")[1]?.toUpperCase()}
                          </Badge>
                          {file.group_ids.map((gid) => (
                            <Badge key={gid} variant="outline" className="text-[10px]">
                              {groupMap.get(gid) || "Grupo"}
                            </Badge>
                          ))}
                        </div>
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
                          onClick={() => dispatch({ type: "SET_PREVIEW", payload: file })}
                          aria-label="Preview image"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleFileDownload(file)}
                        aria-label="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => dispatch({ type: "SET_DELETE", payload: file })}
                        aria-label="Delete file"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                </FileContextMenu>
              );
            })}
          </ul>
        </div>
      )}

      {state.previewFile && (
        <ImagePreviewModal
          file={state.previewFile}
          open={!!state.previewFile}
          onOpenChange={(open) =>
            !open && dispatch({ type: "SET_PREVIEW", payload: null })
          }
        />
      )}

      {state.deleteFile && (
        <DeleteFileDialog
          filename={state.deleteFile.original_filename}
          open={!!state.deleteFile}
          onOpenChange={(open) =>
            !open && dispatch({ type: "SET_DELETE", payload: null })
          }
          onConfirm={() => {
            deleteMutation.mutate(state.deleteFile!.id, {
              onSuccess: () => dispatch({ type: "SET_DELETE", payload: null }),
            });
          }}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
