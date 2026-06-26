import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createFolder,
  deleteFolder,
  fetchAllFolders,
  moveFileToFolder,
} from "@/features/files/api/folders-api";
import { useAuthReady } from "@/features/auth/hooks/use-auth-ready";
import { getErrorMessage } from "@/shared/api/client";
import {
  FOLDERS_QUERY_KEY,
  invalidateFiles,
  invalidateFolders,
} from "@/shared/constants/query-keys";

export function useAllFolders() {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: [...FOLDERS_QUERY_KEY, "all"] as const,
    queryFn: fetchAllFolders,
    enabled: authReady,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, parentId }: { name: string; parentId?: string | null }) =>
      createFolder(name, parentId),
    onSuccess: () => {
      invalidateFolders(queryClient);
      toast.success("Pasta criada com sucesso.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      invalidateFolders(queryClient);
      invalidateFiles(queryClient);
      toast.success("Pasta excluída.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useMoveFileToFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, folderId }: { fileId: string; folderId: string | null }) =>
      moveFileToFolder(fileId, folderId),
    onSuccess: () => {
      invalidateFiles(queryClient);
      toast.success("Arquivo movido.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
