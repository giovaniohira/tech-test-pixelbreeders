import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  FileText,
  Search,
  Trash2,
} from "lucide-react";

import { FileContextMenu } from "@/features/files/components/file-context-menu";
import { useFileRowActions } from "@/features/files/hooks/use-file-row-actions";
import { downloadFileWithToast } from "@/features/files/lib/file-actions";
import { getFileIcon } from "@/features/files/lib/file-icons";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { FileRecord, SortDirection, SortField } from "@/shared/types";
import { formatBytes, formatDate } from "@/shared/lib/utils";

interface FileTableProps {
  files: FileRecord[];
  isLoading: boolean;
  hideSearch?: boolean;
}

function sortFiles(
  files: FileRecord[],
  field: SortField,
  direction: SortDirection,
): FileRecord[] {
  return files.toSorted((left, right) => {
    let comparison = 0;
    switch (field) {
      case "name":
        comparison = left.original_filename.localeCompare(right.original_filename);
        break;
      case "size":
        comparison = left.size - right.size;
        break;
      case "uploaded_at":
        comparison =
          new Date(left.uploaded_at).getTime() - new Date(right.uploaded_at).getTime();
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

export function FileTable({ files, isLoading, hideSearch = false }: FileTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("uploaded_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const { groupMap, setPreviewFile, setDeleteFile, modals } = useFileRowActions();

  const filteredFiles = useMemo(() => {
    const query = hideSearch ? "" : search.toLowerCase().trim();
    const filtered = query
      ? files.filter((file) => file.original_filename.toLowerCase().includes(query))
      : files;
    return sortFiles(filtered, sortField, sortDirection);
  }, [files, search, sortField, sortDirection, hideSearch]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("asc");
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((placeholder) => (
          <Skeleton key={placeholder} className="h-14 w-full" />
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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">
            {!hideSearch && search ? "Nenhum arquivo corresponde à busca" : "Nenhum arquivo encontrado"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {!hideSearch && search
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
              sortField={sortField}
              sortDirection={sortDirection}
              onToggle={toggleSort}
            />
            <SortButton
              field="size"
              label="Tamanho"
              sortField={sortField}
              sortDirection={sortDirection}
              onToggle={toggleSort}
            />
            <SortButton
              field="uploaded_at"
              label="Enviado"
              sortField={sortField}
              sortDirection={sortDirection}
              onToggle={toggleSort}
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
                    file.is_image ? () => setPreviewFile(file) : undefined
                  }
                  onDownload={() => downloadFileWithToast(file)}
                  onDelete={() => setDeleteFile(file)}
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
                          {file.group_ids.map((groupId) => (
                            <Badge key={groupId} variant="outline" className="text-[10px]">
                              {groupMap.get(groupId) || "Grupo"}
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
                          onClick={() => setPreviewFile(file)}
                          aria-label="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadFileWithToast(file)}
                        aria-label="Baixar"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteFile(file)}
                        aria-label="Excluir"
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

      {modals}
    </div>
  );
}
