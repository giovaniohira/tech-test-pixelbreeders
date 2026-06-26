import { apiClient } from "@/shared/api/client";
import type { ApiResponse, Folder } from "@/shared/types";

export async function fetchAllFolders(): Promise<Folder[]> {
  const { data } = await apiClient.get<ApiResponse<Folder[]>>("/files/folders/", {
    params: { all: "true" },
  });
  return data.data;
}

export async function createFolder(name: string, parentId?: string | null): Promise<Folder> {
  const { data } = await apiClient.post<ApiResponse<Folder>>("/files/folders/", {
    name,
    parent_id: parentId ?? null,
  });
  return data.data;
}

export async function deleteFolder(folderId: string): Promise<void> {
  await apiClient.delete(`/files/folders/${folderId}/`);
}

export async function moveFileToFolder(
  fileId: string,
  folderId: string | null,
): Promise<void> {
  await apiClient.patch(`/files/${fileId}/move/`, { folder_id: folderId });
}
