import { use } from "react";

import { FolderNavigationContext } from "@/features/files/context/folder-navigation-context";

export function useFolderNavigation() {
  const ctx = use(FolderNavigationContext);
  if (!ctx) {
    throw new Error("useFolderNavigation must be used within FolderNavigationProvider");
  }
  return ctx;
}
