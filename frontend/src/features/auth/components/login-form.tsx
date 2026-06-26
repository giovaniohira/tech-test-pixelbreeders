import { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useLogin } from "@/features/auth/hooks/use-auth";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ username, password });
  };

  return (
    <Card className="w-full border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
        <CardDescription>Acesse sua conta FileVault</CardDescription>
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
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full cursor-pointer" disabled={login.isPending}>
            <LogIn className="h-4 w-4" />
            {login.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Criar conta grátis
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
