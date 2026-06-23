import { apiClient } from "@/shared/api/client";
import type { ApiResponse, FileRecord, FileStats } from "@/shared/types";

export async function fetchFiles(): Promise<FileRecord[]> {
  const { data } = await apiClient.get<ApiResponse<FileRecord[]>>("/files/");
  return data.data;
}

export async function fetchFileStats(): Promise<FileStats> {
  const { data } = await apiClient.get<ApiResponse<FileStats>>("/files/stats/");
  return data.data;
}

export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<FileRecord> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<ApiResponse<FileRecord>>("/files/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
  return data.data;
}

export async function deleteFile(fileId: string): Promise<void> {
  await apiClient.delete(`/files/${fileId}/`);
}

export function getDownloadUrl(fileId: string): string {
  const base = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  return `${base}/files/${fileId}/download/`;
}

export function getPreviewUrl(fileId: string): string {
  const base = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  return `${base}/files/${fileId}/preview/`;
}
