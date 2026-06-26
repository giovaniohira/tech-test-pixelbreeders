import type { Folder } from "@/shared/types";

export interface FolderTreeNode extends Folder {
  children: FolderTreeNode[];
}

export function buildFolderTree(folders: Folder[]): FolderTreeNode[] {
  const nodes = new Map<string, FolderTreeNode>(
    folders.map((folder) => [folder.id, { ...folder, children: [] }]),
  );
  const roots: FolderTreeNode[] = [];

  for (const folder of folders) {
    const node = nodes.get(folder.id)!;
    if (folder.parent_id && nodes.has(folder.parent_id)) {
      nodes.get(folder.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (items: FolderTreeNode[]) => {
    items.sort((a, b) => a.name.localeCompare(b.name));
    items.forEach((item) => sortNodes(item.children));
  };
  sortNodes(roots);
  return roots;
}

export function getFolderPath(folders: Folder[], folderId: string | null): Folder[] {
  if (!folderId) return [];
  const map = new Map(folders.map((f) => [f.id, f]));
  const path: Folder[] = [];
  let current = map.get(folderId);
  while (current) {
    path.unshift(current);
    current = current.parent_id ? map.get(current.parent_id) : undefined;
  }
  return path;
}

export function getAncestorIds(folders: Folder[], folderId: string | null): Set<string> {
  const ids = new Set<string>();
  const map = new Map(folders.map((f) => [f.id, f]));
  let current = folderId ? map.get(folderId) : undefined;
  while (current?.parent_id) {
    ids.add(current.parent_id);
    current = map.get(current.parent_id);
  }
  return ids;
}
