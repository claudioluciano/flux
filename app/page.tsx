import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  FileText,
  Receipt,
  HandCoins,
  ArrowUpDown,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Building2 className="h-6 w-6" />
            <span>Flux</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Começar Grátis</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Gestão empresarial{" "}
              <span className="text-primary">simplificada</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Controle suas finanças, clientes, fornecedores e documentos em um
              só lugar. Feito para pequenas e médias empresas brasileiras.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="min-w-40">
                  Começar Grátis
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="min-w-40">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/50 py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Tudo que você precisa para gerenciar seu negócio
              </h2>
              <p className="mt-4 text-muted-foreground">
                Módulos integrados que trabalham juntos para simplificar sua
                rotina
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Users}
                title="Clientes e Fornecedores"
                description="Cadastre e gerencie todas as suas entidades com validação de CPF/CNPJ e histórico completo."
              />
              <FeatureCard
                icon={FileText}
                title="Documentos"
                description="Armazene contratos, certidões e documentos com alertas de vencimento automáticos."
              />
              <FeatureCard
                icon={Receipt}
                title="Contas a Pagar"
                description="Controle suas despesas, parcele pagamentos e nunca perca um vencimento."
              />
              <FeatureCard
                icon={HandCoins}
                title="Contas a Receber"
                description="Acompanhe seus recebíveis, registre pagamentos parciais e reduza inadimplência."
              />
              <FeatureCard
                icon={ArrowUpDown}
                title="Fluxo de Caixa"
                description="Visualize entradas e saídas em tempo real com projeções futuras."
              />
              <FeatureCard
                icon={BarChart3}
                title="Relatórios"
                description="Dashboard completo com indicadores financeiros e visão geral do negócio."
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24">
          <div className="container">
            <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Por que escolher o Flux?
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Desenvolvido especialmente para a realidade das empresas
                  brasileiras, com foco em simplicidade e eficiência.
                </p>
              </div>
              <div className="space-y-6">
                <BenefitItem
                  icon={Zap}
                  title="Rápido e Intuitivo"
                  description="Interface limpa e moderna. Comece a usar em minutos, sem treinamento."
                />
                <BenefitItem
                  icon={Shield}
                  title="Seguro e Confiável"
                  description="Seus dados protegidos com criptografia e backups automáticos."
                />
                <BenefitItem
                  icon={CheckCircle2}
                  title="Validações Brasileiras"
                  description="CPF, CNPJ e regras fiscais já integradas ao sistema."
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-primary py-16 text-primary-foreground">
          <div className="container">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Pronto para simplificar sua gestão?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Crie sua conta gratuitamente e comece a organizar seu negócio
                hoje mesmo.
              </p>
              <Link href="/register" className="mt-8">
                <Button
                  size="lg"
                  variant="secondary"
                  className="min-w-40 font-semibold"
                >
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Flux by ShelTech</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ShelTech. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function BenefitItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
