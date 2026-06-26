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
  FILES_QUERY_KEY,
  FOLDERS_QUERY_KEY,
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
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEY });
      toast.success("Arquivo movido.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
