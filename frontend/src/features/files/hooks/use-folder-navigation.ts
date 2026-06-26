import { use } from "react";

import { FolderNavigationContext } from "@/features/files/context/folder-navigation-context";

export function useFolderNavigation() {
  const context = use(FolderNavigationContext);
  if (!context) {
    throw new Error("useFolderNavigation must be used within FolderNavigationProvider");
  }
  return context;
}
