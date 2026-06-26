import { useMemo, useState, type ReactNode } from "react";

import { FolderNavigationContext } from "@/features/files/context/folder-navigation-context";

export function FolderNavigationProvider({ children }: { children: ReactNode }) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const value = useMemo(
    () => ({ currentFolderId, setCurrentFolderId }),
    [currentFolderId],
  );
  return (
    <FolderNavigationContext.Provider value={value}>{children}</FolderNavigationContext.Provider>
  );
}
