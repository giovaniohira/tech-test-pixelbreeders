import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  deleteFile,
  fetchFiles,
  fetchFileStats,
  uploadFile,
} from "@/features/files/api/files-api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getErrorMessage } from "@/shared/api/client";
import {
  FILE_STATS_QUERY_KEY,
  filesQueryKey,
} from "@/shared/constants/query-keys";

function useAuthReady() {
  return useAuthStore((s) => s.isAuthenticated && !!s.accessToken);
}

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
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: FILE_STATS_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: FILE_STATS_QUERY_KEY });
      toast.success("Arquivo excluído.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
