import { apiClient } from "@/shared/api/client";
import type {
  ApiResponse,
  Group,
  GroupDetail,
  GroupInvitation,
} from "@/shared/types";

export async function fetchGroups(): Promise<Group[]> {
  const { data } = await apiClient.get<ApiResponse<Group[]>>("/groups/");
  return data.data;
}

export async function createGroup(name: string): Promise<Group> {
  const { data } = await apiClient.post<ApiResponse<Group>>("/groups/", { name });
  return data.data;
}

export async function fetchGroupDetail(groupId: string): Promise<GroupDetail> {
  const { data } = await apiClient.get<ApiResponse<GroupDetail>>(`/groups/${groupId}/`);
  return data.data;
}

export async function inviteToGroup(groupId: string, username: string): Promise<GroupInvitation> {
  const { data } = await apiClient.post<ApiResponse<GroupInvitation>>(
    `/groups/${groupId}/invite/`,
    { username },
  );
  return data.data;
}

export async function fetchPendingInvitations(): Promise<GroupInvitation[]> {
  const { data } = await apiClient.get<ApiResponse<GroupInvitation[]>>("/groups/invitations/");
  return data.data;
}

export async function acceptInvitation(token: string): Promise<void> {
  await apiClient.post(`/groups/invitations/${token}/accept/`);
}

export async function leaveGroup(groupId: string, removeFiles: boolean): Promise<void> {
  await apiClient.post(`/groups/${groupId}/leave/`, { remove_files: removeFiles });
}

export async function removeGroupMember(groupId: string, memberId: string): Promise<void> {
  await apiClient.delete(`/groups/${groupId}/members/${memberId}/`);
}

export async function addFileToGroup(fileId: string, groupId: string): Promise<void> {
  await apiClient.post(`/groups/${groupId}/files/`, { file_id: fileId });
}

export async function removeFileFromGroup(fileId: string, groupId: string): Promise<void> {
  await apiClient.delete(`/groups/${groupId}/files/${fileId}/`);
}
