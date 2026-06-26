import { Link } from "react-router-dom";
import { Cloud, Lock, Zap } from "lucide-react";
import { Logo } from "@/shared/components/logo";
import { ThemeToggle } from "@/shared/components/theme-toggle";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const highlights = [
  {
    icon: Lock,
    title: "Criptografia ponta a ponta",
    description: "Seus arquivos permanecem privados e protegidos em todo o fluxo.",
  },
  {
    icon: Cloud,
    title: "Acesso de qualquer lugar",
    description: "Envie, organize e recupere documentos com velocidade e confiança.",
  },
  {
    icon: Zap,
    title: "Upload instantâneo",
    description: "Arraste, solte e pronto — sem fricção no dia a dia.",
  },
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-400/5 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10">
          <Logo to="/" className="text-white [&_span]:text-white" />
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
            <p className="mt-3 text-slate-400 text-lg leading-relaxed max-w-md">{subtitle}</p>
          </div>

          <ul className="space-y-5">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <item.icon className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} FileVault. Todos os direitos reservados.
        </p>
      </div>

      <div className="flex flex-col min-h-screen bg-background">
        <header className="flex items-center justify-between p-4 lg:p-6">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-4 pb-10">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="p-4 text-center text-xs text-muted-foreground lg:hidden">
          <Link to="/" className="hover:text-foreground transition-colors">
            Voltar para o início
          </Link>
        </footer>
      </div>
    </div>
  );
}
