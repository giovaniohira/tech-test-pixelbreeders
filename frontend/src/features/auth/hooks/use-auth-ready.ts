import { useAuthStore } from "@/features/auth/store/auth-store";

export function useAuthReady() {
  return useAuthStore((state) => state.isAuthenticated && !!state.accessToken);
}
