import { useQuery } from "@tanstack/react-query";
import { fetchBlob } from "@/shared/api/client";
import { filePreviewQueryKey } from "@/shared/constants/query-keys";

export function useFilePreview(fileId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: fileId ? filePreviewQueryKey(fileId) : ["filePreview", "idle"],
    queryFn: () => fetchBlob(`/files/${fileId}/preview/`),
    enabled: enabled && !!fileId,
    staleTime: 5 * 60 * 1000,
  });
}
