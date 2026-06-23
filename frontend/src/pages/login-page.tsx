import { LoginForm } from "@/features/auth/components/login-form";

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="mb-8 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary mb-3">
          <span className="text-primary-foreground text-sm font-bold">FV</span>
        </div>
        <h1 className="text-xl font-semibold">FileVault</h1>
        <p className="text-sm text-muted-foreground mt-1">Secure file management</p>
      </div>
      <LoginForm />
    </div>
  );
}
