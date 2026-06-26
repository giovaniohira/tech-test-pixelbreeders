import { useQuery } from "@tanstack/react-query";
import { fetchAuthenticatedBlob } from "@/shared/api/authenticated-fetch";
import { filePreviewQueryKey } from "@/shared/constants/query-keys";

export function useFilePreview(fileId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: fileId ? filePreviewQueryKey(fileId) : ["filePreview", "idle"],
    queryFn: () => fetchAuthenticatedBlob(`/files/${fileId}/preview/`),
    enabled: enabled && !!fileId,
    staleTime: 5 * 60 * 1000,
  });
}
