import { useMemo, useState } from "react";
import { LayoutGrid, LayoutList, Search } from "lucide-react";
import { FileGrid } from "@/features/files/components/file-grid";
import { FileTable } from "@/features/files/components/file-table";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { FileRecord, FileTypeFilter, FileViewMode } from "@/shared/types";
import { cn } from "@/shared/lib/utils";

interface FileExplorerProps {
  files: FileRecord[];
  isLoading: boolean;
}

const TYPE_OPTIONS: { value: FileTypeFilter; label: string }[] = [
  { value: "all", label: "Todos os tipos" },
  { value: "image", label: "Imagens" },
  { value: "pdf", label: "PDF" },
  { value: "text", label: "Texto" },
];

function matchesTypeFilter(file: FileRecord, filter: FileTypeFilter): boolean {
  switch (filter) {
    case "image":
      return file.mime_type.startsWith("image/");
    case "pdf":
      return file.mime_type === "application/pdf";
    case "text":
      return file.mime_type.startsWith("text/");
    default:
      return true;
  }
}

export function FileExplorer({ files, isLoading }: FileExplorerProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FileTypeFilter>("all");
  const [viewMode, setViewMode] = useState<FileViewMode>("list");

  const filteredFiles = useMemo(() => {
    const query = search.toLowerCase().trim();
    return files.filter((file) => {
      const matchesSearch =
        !query || file.original_filename.toLowerCase().includes(query);
      const matchesType = matchesTypeFilter(file, typeFilter);
      return matchesSearch && matchesType;
    });
  }, [files, search, typeFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar arquivos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FileTypeFilter)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filtrar por tipo"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="flex items-center rounded-md border border-input p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "list" && "bg-primary/10 text-primary")}
              onClick={() => setViewMode("list")}
              aria-label="Visualização em lista"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "grid" && "bg-primary/10 text-primary")}
              onClick={() => setViewMode("grid")}
              aria-label="Visualização em grade"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <FileTable files={filteredFiles} isLoading={isLoading} hideSearch />
      ) : (
        <FileGrid files={filteredFiles} isLoading={isLoading} />
      )}
    </div>
  );
}
