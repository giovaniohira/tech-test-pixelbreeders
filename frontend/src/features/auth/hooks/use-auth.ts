import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  type LoginPayload,
  type RegisterPayload,
} from "@/features/auth/api/auth-api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getErrorMessage } from "@/shared/api/client";
import {
  CURRENT_USER_QUERY_KEY,
  FILES_QUERY_KEY,
  FILE_STATS_QUERY_KEY,
} from "@/shared/constants/query-keys";

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.access);
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FILE_STATS_QUERY_KEY });
      toast.success("Bem-vindo de volta!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.access);
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FILE_STATS_QUERY_KEY });
      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async (successMessage?: string) => {
      await logoutUser();
      return successMessage;
    },
    onSettled: (_data, _error, successMessage) => {
      logout();
      queryClient.clear();
      navigate("/login");
      toast.success(successMessage ?? "Sessão encerrada.");
    },
  });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const user = await fetchCurrentUser();
      setUser(user);
      return user;
    },
    enabled: isAuthenticated && !!accessToken,
    retry: false,
  });
}
