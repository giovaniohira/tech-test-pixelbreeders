export const SESSION_BOOTSTRAP_QUERY_KEY = ["sessionBootstrap"] as const;
export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;
export const FILES_QUERY_KEY = ["files"] as const;
export const FILE_STATS_QUERY_KEY = ["fileStats"] as const;

export function filePreviewQueryKey(fileId: string) {
  return ["filePreview", fileId] as const;
}
