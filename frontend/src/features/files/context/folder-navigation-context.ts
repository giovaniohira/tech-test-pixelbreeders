import { createContext } from "react";

export interface FolderNavigationContextValue {
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
}

export const FolderNavigationContext = createContext<FolderNavigationContextValue | null>(null);
