import { apiClient, fetchBlob } from "@/shared/api/client";
import { sanitizeFilename } from "@/shared/lib/sanitize-filename";
import type { ApiResponse, FileRecord, FileStats } from "@/shared/types";

export async function fetchUploadConfig() {
  const { data } = await apiClient.get<ApiResponse<import("@/features/files/types").UploadConfig>>(
    "/files/upload-config/",
  );
  return data.data;
}

export async function fetchFiles(folderId?: string | null): Promise<FileRecord[]> {
  const params = folderId ? { folder_id: folderId } : {};
  const { data } = await apiClient.get<ApiResponse<FileRecord[]>>("/files/", { params });
  return data.data;
}

export async function fetchFileStats(): Promise<FileStats> {
  const { data } = await apiClient.get<ApiResponse<FileStats>>("/files/stats/");
  return data.data;
}

export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void,
  folderId?: string | null,
): Promise<FileRecord> {
  const formData = new FormData();
  formData.append("file", file);
  if (folderId) {
    formData.append("folder_id", folderId);
  }

  const { data } = await apiClient.post<ApiResponse<FileRecord>>("/files/", formData, {
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

export async function downloadFileRecord(file: FileRecord): Promise<void> {
  const blob = await fetchBlob(`/files/${file.id}/download/`);
  const link = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = sanitizeFilename(file.original_filename);
  link.click();
  URL.revokeObjectURL(objectUrl);
}
