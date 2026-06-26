import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useRegister } from "@/features/auth/hooks/use-auth";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const register = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    register.mutate({
      username,
      email,
      password,
      password_confirm: passwordConfirm,
    });
  };

  return (
    <Card className="w-full border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
        <CardDescription>Configure seu cofre digital em segundos</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="seu.usuario"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="voce@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Confirmar senha</Label>
            <Input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Repita a senha"
            />
          </div>
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={register.isPending || password !== passwordConfirm}
          >
            <UserPlus className="h-4 w-4" />
            {register.isPending ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
