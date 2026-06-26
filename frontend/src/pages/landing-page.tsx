import { Link } from "react-router-dom";
import {
  ArrowRight,
  CloudUpload,
  Eye,
  FolderLock,
  HardDrive,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { MarketingLayout } from "@/app/layouts/marketing-layout";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

const features = [
  {
    icon: CloudUpload,
    title: "Upload sem complicação",
    description:
      "Arraste e solte PDFs, imagens e documentos. O FileVault cuida do resto com validação automática.",
    className: "md:col-span-2",
  },
  {
    icon: FolderLock,
    title: "Cofre privado",
    description: "Cada conta tem seu espaço isolado. Ninguém acessa seus arquivos além de você.",
    className: "",
  },
  {
    icon: Eye,
    title: "Pré-visualização rápida",
    description: "Visualize imagens e documentos sem precisar baixar.",
    className: "",
  },
  {
    icon: HardDrive,
    title: "Controle de armazenamento",
    description: "Acompanhe uso, histórico e estatísticas em tempo real no seu painel.",
    className: "md:col-span-2",
  },
];

const steps = [
  {
    step: "01",
    title: "Crie sua conta",
    description: "Cadastro em menos de um minuto. Sem cartão de crédito.",
  },
  {
    step: "02",
    title: "Envie seus arquivos",
    description: "Upload por arrastar e soltar ou seleção manual — do jeito que preferir.",
  },
  {
    step: "03",
    title: "Gerencie com confiança",
    description: "Organize, visualize, baixe ou remova arquivos quando quiser.",
  },
];

export function LandingPage() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-40 right-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Armazenamento seguro para o seu dia a dia
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Seus arquivos,{" "}
              <span className="text-primary">protegidos e acessíveis</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              O FileVault é o cofre digital que simplifica o gerenciamento de documentos.
              Envie, organize e acesse seus arquivos com segurança — de qualquer dispositivo.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto cursor-pointer">
                <Link to="/register">
                  Começar grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto cursor-pointer"
              >
                <Link to="/login">Já tenho conta</Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Grátis para começar · Sem instalação · Pronto em segundos
            </p>
          </div>

          <div className="mt-16 mx-auto max-w-4xl">
            <div className="rounded-xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
                <span className="ml-2 text-xs text-muted-foreground">app.filevault.io/dashboard</span>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {["12 arquivos", "4.2 MB", "Hoje"].map((stat) => (
                    <div
                      key={stat}
                      className="rounded-lg border border-border bg-background/50 p-4"
                    >
                      <div className="h-2 w-16 rounded bg-muted mb-3" />
                      <p className="text-lg font-semibold">{stat}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                  <CloudUpload className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Arraste seus arquivos aqui</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF, TXT</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-28 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="mt-4 text-muted-foreground">
              Recursos pensados para quem precisa de praticidade sem abrir mão da segurança.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className={`group border-border/60 bg-card/50 hover:border-primary/30 hover:bg-card transition-all duration-200 cursor-default ${feature.className}`}
              >
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Como funciona</h2>
            <p className="mt-4 text-muted-foreground">
              Três passos simples para ter seu cofre digital funcionando.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {steps.map((item) => (
              <div key={item.step} className="text-center md:text-left">
                <span className="text-4xl font-bold text-primary/30">{item.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Segurança em primeiro lugar
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Autenticação segura, isolamento por usuário e validação rigorosa de arquivos.
                  O FileVault foi construído para proteger o que é importante para você.
                </p>
              </div>
              <Button size="lg" asChild className="shrink-0 cursor-pointer">
                <Link to="/register">
                  Criar conta
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Pronto para organizar seus arquivos?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Junte-se a quem já confia no FileVault para guardar documentos com tranquilidade.
          </p>
          <Button size="lg" className="mt-8 cursor-pointer" asChild>
            <Link to="/register">
              Começar agora — é grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </MarketingLayout>
  );
}
