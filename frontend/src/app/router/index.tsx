import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useSessionBootstrap } from "@/features/auth/hooks/use-auth-hydrated";
import { FallbackRedirect } from "@/app/router/fallback-redirect";
import { ProtectedRoute } from "@/app/router/protected-route";
import { PublicRoute } from "@/app/router/public-route";
import { GroupDetailPage } from "@/pages/group-detail-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { RegisterPage } from "@/pages/register-page";

export function AppRouter() {
  useSessionBootstrap();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/groups/:groupId" element={<GroupDetailPage />} />
        </Route>

        <Route path="*" element={<FallbackRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
