import { AuthLayout } from "@/app/layouts/auth-layout";
import { RegisterForm } from "@/features/auth/components/register-form";

export function RegisterPage() {
  return (
    <AuthLayout
      title="Comece gratuitamente"
      subtitle="Crie sua conta e tenha um espaço seguro para guardar documentos, imagens e arquivos importantes."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
