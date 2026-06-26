import { AuthLayout } from "@/app/layouts/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";

export function LoginPage() {
  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Acesse seu cofre digital e continue de onde parou. Seus arquivos estão esperando por você."
    >
      <LoginForm />
    </AuthLayout>
  );
}
