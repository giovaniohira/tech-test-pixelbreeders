import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  acceptInvitation,
  addFileToGroup,
  createGroup,
  fetchGroupDetail,
  fetchGroups,
  fetchPendingInvitations,
  inviteToGroup,
  leaveGroup,
  removeFileFromGroup,
  removeGroupMember,
} from "@/features/groups/api/groups-api";
import { useAuthReady } from "@/features/auth/hooks/use-auth-ready";
import { getErrorMessage } from "@/shared/api/client";
import {
  FILES_QUERY_KEY,
  GROUPS_QUERY_KEY,
  GROUP_INVITATIONS_QUERY_KEY,
  groupDetailQueryKey,
} from "@/shared/constants/query-keys";

export function useGroups() {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: GROUPS_QUERY_KEY,
    queryFn: fetchGroups,
    enabled: authReady,
  });
}

export function useGroupDetail(groupId: string) {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: groupDetailQueryKey(groupId),
    queryFn: () => fetchGroupDetail(groupId),
    enabled: authReady && !!groupId,
  });
}

export function usePendingInvitations() {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: GROUP_INVITATIONS_QUERY_KEY,
    queryFn: fetchPendingInvitations,
    enabled: authReady,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
      toast.success("Grupo criado com sucesso.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useInviteToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, username }: { groupId: string; username: string }) =>
      inviteToGroup(groupId, username),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupDetailQueryKey(groupId) });
      toast.success("Convite enviado.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_INVITATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
      toast.success("Convite aceito! Você entrou no grupo.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAddFileToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, groupId }: { fileId: string; groupId: string }) =>
      addFileToGroup(fileId, groupId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: groupDetailQueryKey(groupId) });
      toast.success("Arquivo adicionado ao grupo.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRemoveFileFromGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, groupId }: { fileId: string; groupId: string }) =>
      removeFileFromGroup(fileId, groupId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: groupDetailQueryKey(groupId) });
      toast.success("Arquivo removido do grupo.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, removeFiles }: { groupId: string; removeFiles: boolean }) =>
      leaveGroup(groupId, removeFiles),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEY });
      queryClient.removeQueries({ queryKey: groupDetailQueryKey(groupId) });
      toast.success("Você saiu do grupo.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      removeGroupMember(groupId, memberId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: groupDetailQueryKey(groupId) });
      toast.success("Membro removido do grupo.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
