import { ChevronRight, Home } from "lucide-react";
import { useFolderNavigation } from "@/features/files/hooks/use-folder-navigation";
import { getFolderPath } from "@/features/files/lib/folder-navigation-utils";
import { useAllFolders } from "@/features/files/hooks/use-folders";
import { cn } from "@/shared/lib/utils";

export function FolderBreadcrumb() {
  const { currentFolderId, setCurrentFolderId } = useFolderNavigation();
  const { data: allFolders = [] } = useAllFolders();
  const path = getFolderPath(allFolders, currentFolderId);

  if (path.length === 0) return null;

  return (
    <nav aria-label="Caminho da pasta" className="flex items-center gap-1 text-sm flex-wrap">
      <button
        type="button"
        onClick={() => setCurrentFolderId(null)}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        Raiz
      </button>
      {path.map((folder) => (
        <span key={folder.id} className="inline-flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <button
            type="button"
            onClick={() => setCurrentFolderId(folder.id)}
            className={cn(
              "hover:text-foreground transition-colors truncate max-w-[140px]",
              folder.id === currentFolderId
                ? "text-primary font-medium"
                : "text-muted-foreground",
            )}
          >
            {folder.name}
          </button>
        </span>
      ))}
    </nav>
  );
}
