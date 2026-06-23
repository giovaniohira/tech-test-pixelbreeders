import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteFile,
  fetchFiles,
  fetchFileStats,
  uploadFile,
} from "@/features/files/api/files-api";
import { getErrorMessage } from "@/shared/api/client";

export const FILES_QUERY_KEY = ["files"];
export const FILE_STATS_QUERY_KEY = ["fileStats"];

export function useFiles() {
  return useQuery({
    queryKey: FILES_QUERY_KEY,
    queryFn: fetchFiles,
  });
}

export function useFileStats() {
  return useQuery({
    queryKey: FILE_STATS_QUERY_KEY,
    queryFn: fetchFileStats,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => uploadFile(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FILE_STATS_QUERY_KEY });
      toast.success("File uploaded successfully.");
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
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FILE_STATS_QUERY_KEY });
      toast.success("File deleted successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
