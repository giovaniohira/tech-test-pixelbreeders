import { Link } from "react-router-dom";
import { Logo } from "@/shared/components/logo";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { Button } from "@/shared/components/ui/button";
import { COPYRIGHT_YEAR } from "@/shared/constants";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors cursor-pointer">
              Recursos
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors cursor-pointer">
              Como funciona
            </a>
            <a href="#security" className="hover:text-foreground transition-colors cursor-pointer">
              Segurança
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-sm">
              Armazenamento seguro de arquivos para equipes que valorizam privacidade e simplicidade.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-foreground transition-colors">
                Entrar
              </Link>
              <Link to="/register" className="hover:text-foreground transition-colors">
                Criar conta
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-xs text-muted-foreground">
            © {COPYRIGHT_YEAR} FileVault. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
