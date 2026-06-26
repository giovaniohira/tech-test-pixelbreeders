import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  deleteFile,
  fetchFiles,
  fetchFileStats,
  uploadFile,
} from "@/features/files/api/files-api";
import { useAuthReady } from "@/features/auth/hooks/use-auth-ready";
import { getErrorMessage } from "@/shared/api/client";
import {
  FILE_STATS_QUERY_KEY,
  filesQueryKey,
  invalidateFileStats,
  invalidateFiles,
} from "@/shared/constants/query-keys";

export function useFiles(folderId?: string | null) {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: filesQueryKey(folderId),
    queryFn: () => fetchFiles(folderId),
    enabled: authReady,
  });
}

export function useFileStats() {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: FILE_STATS_QUERY_KEY,
    queryFn: fetchFileStats,
    enabled: authReady,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      onProgress,
      folderId,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
      folderId?: string | null;
    }) => uploadFile(file, onProgress, folderId),
    onSuccess: () => {
      invalidateFiles(queryClient);
      invalidateFileStats(queryClient);
      toast.success("Arquivo enviado com sucesso.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      invalidateFiles(queryClient);
      invalidateFileStats(queryClient);
      toast.success("Arquivo excluído.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
