import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/shared/constants";
import { SESSION_BOOTSTRAP_QUERY_KEY } from "@/shared/constants/query-keys";
import { fetchCurrentUser } from "@/features/auth/api/auth-api";
import { useAuthStore } from "@/features/auth/store/auth-store";

async function bootstrapSession(): Promise<void> {
  const { accessToken, setTokens, setUser, logout } = useAuthStore.getState();

  if (accessToken) {
    return;
  }

  try {
    const response = await axios.post(
      `${API_URL}/auth/refresh/`,
      {},
      { withCredentials: true },
    );
    const access = response.data.data.tokens.access as string;
    setTokens(access);
    const user = await fetchCurrentUser();
    setUser(user);
  } catch {
    logout();
  }
}

export function useSessionBootstrap() {
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);

  const { isFetched } = useQuery({
    queryKey: SESSION_BOOTSTRAP_QUERY_KEY,
    queryFn: bootstrapSession,
    enabled: !isBootstrapped,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    if (isFetched) {
      setBootstrapped(true);
    }
  }, [isFetched, setBootstrapped]);

  return isBootstrapped;
}
