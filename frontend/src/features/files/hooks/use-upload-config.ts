import { useQuery } from "@tanstack/react-query";

import { fetchUploadConfig } from "@/features/files/api/files-api";
import { useAuthReady } from "@/features/auth/hooks/use-auth-ready";

export const UPLOAD_CONFIG_QUERY_KEY = ["uploadConfig"] as const;

export function useUploadConfig() {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: UPLOAD_CONFIG_QUERY_KEY,
    queryFn: fetchUploadConfig,
    enabled: authReady,
    staleTime: 5 * 60 * 1000,
  });
}
