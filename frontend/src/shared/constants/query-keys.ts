import type { QueryClient } from "@tanstack/react-query";

export const SESSION_BOOTSTRAP_QUERY_KEY = ["sessionBootstrap"] as const;
export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;
export const FILES_QUERY_KEY = ["files"] as const;
export const FILE_STATS_QUERY_KEY = ["fileStats"] as const;
export const FOLDERS_QUERY_KEY = ["folders"] as const;
export const GROUPS_QUERY_KEY = ["groups"] as const;
export const GROUP_INVITATIONS_QUERY_KEY = ["groupInvitations"] as const;

export function filesQueryKey(folderId?: string | null) {
  return folderId ? (["files", { folderId }] as const) : FILES_QUERY_KEY;
}

export function groupDetailQueryKey(groupId: string) {
  return ["group", groupId] as const;
}

export function filePreviewQueryKey(fileId: string) {
  return ["filePreview", fileId] as const;
}

export function invalidateFiles(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEY });
}

export function invalidateFolders(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
}

export function invalidateGroups(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
}

export function invalidateFileStats(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: FILE_STATS_QUERY_KEY });
}
