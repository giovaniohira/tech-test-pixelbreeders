import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function FallbackRedirect() {
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!isBootstrapped) {
    return null;
  }

  return (
    <Navigate to={isAuthenticated && accessToken ? "/dashboard" : "/"} replace />
  );
}
