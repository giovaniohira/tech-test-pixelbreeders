import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  Home,
  Trash2,
} from "lucide-react";
import { useFolderNavigation } from "@/features/files/hooks/use-folder-navigation";
import {
  buildFolderTree,
  getAncestorIds,
  type FolderTreeNode,
} from "@/features/files/lib/folder-navigation-utils";
import { useAllFolders, useCreateFolder, useDeleteFolder } from "@/features/files/hooks/use-folders";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

interface FolderTreeItemProps {
  node: FolderTreeNode;
  depth: number;
  currentFolderId: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function FolderTreeItem({
  node,
  depth,
  currentFolderId,
  expandedIds,
  onToggleExpand,
  onSelect,
  onDelete,
}: FolderTreeItemProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isActive = currentFolderId === node.id;

  return (
    <div>
      <div
        className="group flex items-center"
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.id)}
            className="shrink-0 p-0.5 rounded hover:bg-muted"
            aria-label={isExpanded ? "Recolher pasta" : "Expandir pasta"}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4.5 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted min-w-0",
            isActive && "bg-primary/10 text-primary font-medium",
          )}
        >
          <Folder className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
          <span className="truncate">{node.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">{node.file_count}</span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
          onClick={() => onDelete(node.id)}
          aria-label={`Excluir pasta ${node.name}`}
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              currentFolderId={currentFolderId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderSidebar() {
  const { currentFolderId, setCurrentFolderId } = useFolderNavigation();
  const { data: allFolders = [] } = useAllFolders();
  const createFolder = useCreateFolder();
  const deleteFolder = useDeleteFolder();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildFolderTree(allFolders), [allFolders]);

  useEffect(() => {
    if (!currentFolderId) return;
    const ancestors = getAncestorIds(allFolders, currentFolderId);
    setExpandedIds((prev) => new Set([...prev, ...ancestors, currentFolderId]));
  }, [allFolders, currentFolderId]);

  function handleToggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    createFolder.mutate(
      { name, parentId: currentFolderId },
      {
        onSuccess: () => {
          setNewName("");
          setShowCreate(false);
        },
      },
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pastas
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setShowCreate(true)}
          aria-label="Nova pasta"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      <nav className="space-y-0.5">
        <button
          type="button"
          onClick={() => setCurrentFolderId(null)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
            currentFolderId === null && "bg-primary/10 text-primary font-medium",
          )}
        >
          <Home className={cn("h-4 w-4 shrink-0", currentFolderId === null ? "text-primary" : "text-muted-foreground")} />
          Raiz
        </button>

        {tree.map((node) => (
          <FolderTreeItem
            key={node.id}
            node={node}
            depth={0}
            currentFolderId={currentFolderId}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            onSelect={setCurrentFolderId}
            onDelete={(id) => deleteFolder.mutate(id)}
          />
        ))}
      </nav>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova pasta</DialogTitle>
            <DialogDescription>
              {currentFolderId
                ? "Criar subpasta dentro da pasta atual."
                : "Criar uma pasta na raiz dos seus arquivos."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              placeholder="Nome da pasta"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={createFolder.isPending || !newName.trim()}>
              Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
