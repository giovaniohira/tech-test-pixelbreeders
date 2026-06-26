import { useMemo } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { getFolderPath } from "@/features/files/lib/folder-navigation-utils";
import { useAllFolders, useMoveFileToFolder } from "@/features/files/hooks/use-folders";
import {
  useAddFileToGroup,
  useGroups,
  useRemoveFileFromGroup,
} from "@/features/groups/hooks/use-groups";
import type { FileRecord, Folder } from "@/shared/types";

interface FileContextMenuProps {
  file: FileRecord;
  children: React.ReactNode;
  onPreview?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

function getFolderLabel(folders: Folder[], folder: Folder): string {
  const path = getFolderPath(folders, folder.id);
  return path.map((f) => f.name).join(" / ");
}

export function FileContextMenu({
  file,
  children,
  onPreview,
  onDownload,
  onDelete,
}: FileContextMenuProps) {
  const { data: groups = [] } = useGroups();
  const { data: allFolders = [] } = useAllFolders();
  const addToGroup = useAddFileToGroup();
  const removeFromGroup = useRemoveFileFromGroup();
  const moveToFolder = useMoveFileToFolder();

  const sortedFolders = useMemo(
    () =>
      allFolders.toSorted((a, b) =>
        getFolderLabel(allFolders, a).localeCompare(getFolderLabel(allFolders, b)),
      ),
    [allFolders],
  );

  const sharedGroups = groups.filter((g) => file.group_ids.includes(g.id));
  const availableGroups = groups.filter((g) => !file.group_ids.includes(g.id));

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {file.is_image && onPreview && (
          <ContextMenuItem onClick={onPreview}>Visualizar</ContextMenuItem>
        )}
        {onDownload && <ContextMenuItem onClick={onDownload}>Baixar</ContextMenuItem>}

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>Adicionar ao grupo</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {availableGroups.length === 0 ? (
              <ContextMenuItem disabled>Nenhum grupo disponível</ContextMenuItem>
            ) : (
              availableGroups.map((group) => (
                <ContextMenuItem
                  key={group.id}
                  onClick={() => addToGroup.mutate({ fileId: file.id, groupId: group.id })}
                >
                  {group.name}
                </ContextMenuItem>
              ))
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {sharedGroups.length > 0 && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>Remover do grupo</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {sharedGroups.map((group) => (
                <ContextMenuItem
                  key={group.id}
                  onClick={() => removeFromGroup.mutate({ fileId: file.id, groupId: group.id })}
                >
                  {group.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        <ContextMenuSub>
          <ContextMenuSubTrigger>Mover para pasta</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56 max-h-64 overflow-y-auto">
            <ContextMenuItem onClick={() => moveToFolder.mutate({ fileId: file.id, folderId: null })}>
              Raiz
            </ContextMenuItem>
            {sortedFolders.map((folder) => (
              <ContextMenuItem
                key={folder.id}
                onClick={() => moveToFolder.mutate({ fileId: file.id, folderId: folder.id })}
              >
                {getFolderLabel(allFolders, folder)}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {onDelete && (
          <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            Excluir
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
