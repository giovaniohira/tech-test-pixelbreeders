import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function PublicRoute() {
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!isBootstrapped) {
    return null;
  }

  if (isAuthenticated && accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
