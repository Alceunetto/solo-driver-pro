import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Car, FileText, Calculator, Shield, Zap, Users, TrendingUp,
  CheckCircle, ChevronRight, Star, Smartphone, BarChart3,
  Clock, DollarSign, Award, ArrowRight, HelpCircle, ChevronDown,
  MapPin, Crown, Sparkles, Lock,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/* ── Data ── */

const PAIN_CARDS = [
  {
    icon: Shield,
    title: "Burocracia de 2026?",
    subtitle: "Nós simplificamos.",
    description: "Documentação digital, contratos e prontuários organizados em um só lugar.",
  },
  {
    icon: Clock,
    title: "Alunos esquecendo horários?",
    subtitle: "Automatizamos lembretes.",
    description: "Notificações automáticas via WhatsApp para zero faltas.",
  },
  {
    icon: Calculator,
    title: "Não sabe quanto lucra por aula?",
    subtitle: "Nós calculamos.",
    description: "Dashboard financeiro em tempo real com custo por km e valor/hora líquido.",
  },
];

const FEATURES = [
  "Prontuário digital com checklist de habilidades",
  "Relatório de performance via WhatsApp",
  "Gestão financeira com valor/hora real",
  "Agendamento inteligente de aulas",
  "Controle de frota e manutenção",
  "Calculadora de lucro independente",
];

const FAQ_ITEMS = [
  {
    q: "Funciona na nova lei de 2026?",
    a: "Sim, totalmente adaptado à nova legislação que permite instrutores autônomos. Todos os processos, documentos e relatórios já seguem as exigências legais de 2026.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem multas no plano mensal. Cancele a qualquer momento direto pelo app. No plano anual, você pode usar até o fim do período contratado.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Seus dados são protegidos com criptografia de ponta e backup automático na nuvem. Privacidade total para você e seus alunos.",
  },
  {
    q: "Preciso de cartão de crédito para o plano grátis?",
    a: "Não! O plano Iniciante é totalmente gratuito e não pede cartão de crédito. Comece agora e faça upgrade quando quiser.",
  },
];

const PLAN_FREE_FEATURES = [
  "Gestão de até 3 alunos",
  "Relatórios de Performance",
  "Agenda Básica",
  "Prontuário digital",
];

const PLAN_PRO_FEATURES = [
  "Alunos Ilimitados",
  "Relatórios Personalizados",
  "Gestão Financeira Completa (ROI)",
  "Otimizador de Rotas (Maps/Waze)",
  "Suporte Prioritário",
  "Controle de frota avançado",
];

export default function Landing() {
  const [lessonsPerDay, setLessonsPerDay] = useState(4);
  const [pricePerLesson, setPricePerLesson] = useState(140);

  const workDays = 22;
  const monthlyGross = lessonsPerDay * pricePerLesson * workDays;
  const estimatedCosts = monthlyGross * 0.18;
  const monthlyNet = monthlyGross - estimatedCosts;
  const softwareCost = 39.9;
  const softwarePercent = ((softwareCost / monthlyNet) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-[hsl(222,47%,5%)] text-[hsl(210,20%,92%)]">
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(222,20%,12%)] bg-[hsl(222,47%,5%)]/90 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[hsl(239,84%,67%)]/15">
              <Car className="w-5 h-5 text-[hsl(239,84%,67%)]" />
            </div>
            <span className="text-lg font-bold tracking-tight">SoloDrive</span>
          </div>
          <Button className="bg-[hsl(239,84%,67%)] hover:bg-[hsl(239,84%,57%)] text-white font-semibold text-sm px-5">
            Começar Grátis
          </Button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(239,84%,67%)]/8 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(239,84%,67%)]/5 blur-[120px]" />
        <div className="container relative py-20 md:py-32 text-center max-w-3xl mx-auto space-y-6">
          <Badge className="bg-[hsl(160,84%,39%)]/15 text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%)]/30 font-medium text-sm px-4 py-1.5">
            ✨ Comece grátis · Até 3 alunos · Sem cartão
          </Badge>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            A Lei de 2026 chegou.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(239,84%,67%)] to-[hsl(160,84%,39%)]">
              Agora você é o Dono do seu Negócio.
            </span>
          </h1>
          <p className="text-base md:text-lg text-[hsl(215,15%,55%)] max-w-xl mx-auto leading-relaxed">
            Gerencie seus alunos, envie relatórios VIP via WhatsApp e controle seus lucros.
            Comece agora com até 3 alunos totalmente grátis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="bg-[hsl(160,84%,39%)] hover:bg-[hsl(160,84%,34%)] text-white font-bold text-base h-13 px-8 rounded-xl shadow-[0_0_30px_hsl(160,84%,39%,0.3)]"
            >
              Começar Agora (Grátis)
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <p className="text-xs text-[hsl(215,15%,45%)]">Sem cartão de crédito · Cancele quando quiser</p>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="border-y border-[hsl(222,20%,12%)] bg-[hsl(222,30%,7%)]">
        <div className="container py-5 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm text-[hsl(215,15%,50%)]">
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[hsl(239,84%,67%)]" /> <span><strong className="text-[hsl(210,20%,92%)]">1.200+</strong> instrutores ativos</span></div>
          <div className="flex items-center gap-2"><Star className="w-4 h-4 text-[hsl(45,93%,58%)]" /> <span><strong className="text-[hsl(210,20%,92%)]">4.9</strong> no Google</span></div>
          <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[hsl(160,84%,39%)]" /> <span><strong className="text-[hsl(210,20%,92%)]">R$ 2.4M</strong> gerenciados/mês</span></div>
        </div>
      </section>

      {/* ─── SEÇÃO 02: O PROBLEMA ─── */}
      <section className="container py-20 md:py-28 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
            O fim da era das autoescolas{" "}
            <span className="text-[hsl(239,84%,67%)]">engessadas.</span>
          </h2>
          <p className="text-[hsl(215,15%,55%)] text-base">
            A nova legislação te deu liberdade. Agora você precisa da ferramenta certa para lucrar com ela.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {PAIN_CARDS.map((card) => (
            <Card
              key={card.title}
              className="bg-[hsl(222,30%,8%)] border-[hsl(222,20%,14%)] hover:border-[hsl(239,84%,67%)]/40 transition-all duration-300 group"
            >
              <CardContent className="p-6 space-y-4">
                <div className="p-3 rounded-xl bg-[hsl(239,84%,67%)]/10 w-fit group-hover:bg-[hsl(239,84%,67%)]/20 transition-colors">
                  <card.icon className="w-6 h-6 text-[hsl(239,84%,67%)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[hsl(210,20%,92%)]">{card.title}</h3>
                  <p className="text-[hsl(160,84%,39%)] font-semibold">{card.subtitle}</p>
                </div>
                <p className="text-sm text-[hsl(215,15%,55%)] leading-relaxed">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── SEÇÃO 03: DIFERENCIAL ─── */}
      <section className="bg-[hsl(222,30%,7%)] border-y border-[hsl(222,20%,12%)]">
        <div className="container py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-[hsl(160,84%,39%)]/15 text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%)]/30 text-xs">
                Exclusivo SoloDrive
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                Venda{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(160,84%,39%)] to-[hsl(160,60%,55%)]">
                  Valor
                </span>
                , não apenas Horas.
              </h2>
              <p className="text-[hsl(215,15%,55%)] leading-relaxed">
                Envie relatórios de performance profissionais direto no WhatsApp do aluno.
                Mostre evolução pedagógica, pontos fortes e áreas de melhoria.
                Seja visto como um mentor de elite e cobre o preço que você merece.
              </p>
              <ul className="space-y-3">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-[hsl(160,84%,39%)] shrink-0" />
                    <span className="text-[hsl(210,20%,85%)]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative w-[280px] md:w-[300px]">
                <div className="rounded-[2rem] border-2 border-[hsl(222,20%,16%)] bg-[hsl(222,47%,5%)] p-3 shadow-2xl shadow-[hsl(239,84%,67%)]/10">
                  <div className="rounded-[1.5rem] bg-[hsl(222,30%,8%)] overflow-hidden">
                    <div className="h-6 bg-[hsl(222,30%,10%)] flex items-center justify-center">
                      <div className="w-16 h-1 rounded-full bg-[hsl(222,20%,18%)]" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="text-center space-y-1">
                        <Smartphone className="w-5 h-5 text-[hsl(239,84%,67%)] mx-auto" />
                        <p className="text-[10px] font-bold text-[hsl(210,20%,92%)]">Relatório de Evolução</p>
                        <p className="text-[9px] text-[hsl(215,15%,50%)]">Maria Silva · 04/03/2026</p>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2 rounded-lg bg-[hsl(160,84%,39%)]/10">
                          <p className="text-[9px] font-semibold text-[hsl(160,84%,39%)]">💪 Pontos Fortes</p>
                          <p className="text-[8px] text-[hsl(215,15%,55%)] mt-0.5">• Controle de embreagem<br />• Uso de retrovisores</p>
                        </div>
                        <div className="p-2 rounded-lg bg-[hsl(45,93%,58%)]/10">
                          <p className="text-[9px] font-semibold text-[hsl(45,93%,58%)]">⚠️ Pontos a Melhorar</p>
                          <p className="text-[8px] text-[hsl(215,15%,55%)] mt-0.5">• Baliza<br />• Controle de ansiedade</p>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-[hsl(239,84%,67%)]/10">
                          <span className="text-[9px] text-[hsl(215,15%,55%)]">Evolução</span>
                          <span className="text-[11px] font-bold text-[hsl(160,84%,39%)]">+12%</span>
                        </div>
                      </div>
                      <div className="h-8 rounded-lg bg-[hsl(160,84%,39%)] flex items-center justify-center gap-1">
                        <FileText className="w-3 h-3 text-white" />
                        <span className="text-[9px] font-bold text-white">Enviar via WhatsApp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO ROI ─── */}
      <section className="container py-16 md:py-20">
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-[hsl(239,84%,67%)]/10 via-[hsl(222,30%,8%)] to-[hsl(160,84%,39%)]/10 border-[hsl(239,84%,67%)]/30 shadow-2xl shadow-[hsl(239,84%,67%)]/5">
          <CardContent className="p-8 md:p-12 text-center space-y-5">
            <div className="p-3 rounded-2xl bg-[hsl(160,84%,39%)]/15 w-fit mx-auto">
              <DollarSign className="w-8 h-8 text-[hsl(160,84%,39%)]" />
            </div>
            <h2 className="text-xl md:text-3xl font-bold tracking-tight">
              O software que{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(160,84%,39%)] to-[hsl(160,60%,55%)]">
                se paga sozinho.
              </span>
            </h2>
            <p className="text-[hsl(215,15%,60%)] max-w-lg mx-auto leading-relaxed text-base">
              Faça a conta: Se você der apenas <strong className="text-[hsl(210,20%,92%)]">uma aula de reforço no ano inteiro</strong> graças ao profissionalismo do nosso relatório, o SoloDrive já saiu de graça para você.{" "}
              <strong className="text-[hsl(160,84%,39%)]">Todo o resto é lucro puro no seu bolso.</strong>
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-[hsl(215,15%,50%)]">
              <TrendingUp className="w-4 h-4 text-[hsl(160,84%,39%)]" />
              <span>ROI médio de <strong className="text-[hsl(210,20%,92%)]">2.400%</strong> ao ano</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ─── SEÇÃO 04: CALCULADORA ─── */}
      <section className="container py-20 md:py-28 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
            Calculadora de{" "}
            <span className="text-[hsl(160,84%,39%)]">Lucro Real</span>
          </h2>
          <p className="text-[hsl(215,15%,55%)]">
            Descubra quanto você fatura e veja que o SoloDrive custa menos de 1% do seu ganho.
          </p>
        </div>

        <Card className="max-w-xl mx-auto bg-[hsl(222,30%,8%)] border-[hsl(222,20%,14%)]">
          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Lessons/day */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[hsl(210,20%,85%)]">Aulas por dia</label>
                <span className="text-xl font-bold text-[hsl(239,84%,67%)]">{lessonsPerDay}</span>
              </div>
              <Slider
                value={[lessonsPerDay]}
                onValueChange={(v) => setLessonsPerDay(v[0])}
                min={1}
                max={10}
                step={1}
                className="[&_[data-orientation=horizontal]]:h-2 [&_[role=slider]]:bg-[hsl(239,84%,67%)] [&_[role=slider]]:border-[hsl(239,84%,67%)] [&_.bg-primary]:bg-[hsl(239,84%,67%)]"
              />
              <div className="flex justify-between text-[10px] text-[hsl(215,15%,45%)]">
                <span>1 aula</span><span>10 aulas</span>
              </div>
            </div>

            {/* Price/lesson */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[hsl(210,20%,85%)]">Valor por aula</label>
                <span className="text-xl font-bold text-[hsl(239,84%,67%)]">R$ {pricePerLesson}</span>
              </div>
              <Slider
                value={[pricePerLesson]}
                onValueChange={(v) => setPricePerLesson(v[0])}
                min={80}
                max={250}
                step={10}
                className="[&_[data-orientation=horizontal]]:h-2 [&_[role=slider]]:bg-[hsl(239,84%,67%)] [&_[role=slider]]:border-[hsl(239,84%,67%)] [&_.bg-primary]:bg-[hsl(239,84%,67%)]"
              />
              <div className="flex justify-between text-[10px] text-[hsl(215,15%,45%)]">
                <span>R$ 80</span><span>R$ 250</span>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-3 pt-4 border-t border-[hsl(222,20%,14%)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(215,15%,55%)]">Faturamento bruto/mês</span>
                <span className="text-lg font-bold text-[hsl(210,20%,92%)]">
                  R$ {monthlyGross.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(215,15%,55%)]">Custos estimados (18%)</span>
                <span className="text-sm font-medium text-[hsl(0,72%,51%)]">
                  - R$ {estimatedCosts.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[hsl(222,20%,12%)]">
                <span className="text-base font-semibold text-[hsl(210,20%,92%)]">Lucro líquido/mês</span>
                <span className="text-2xl font-extrabold text-[hsl(160,84%,39%)]">
                  R$ {monthlyNet.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Software cost comparison */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(239,84%,67%)]/10 mt-2">
                <Sparkles className="w-5 h-5 text-[hsl(239,84%,67%)] shrink-0" />
                <div className="text-sm">
                  <p className="text-[hsl(210,20%,85%)]">
                    O SoloDrive custa apenas <strong className="text-[hsl(239,84%,67%)]">R$ {softwareCost.toFixed(2).replace(".", ",")}</strong>/mês
                  </p>
                  <p className="text-[hsl(215,15%,50%)] text-xs">
                    Representa apenas <strong className="text-[hsl(160,84%,39%)]">{softwarePercent.replace(".", ",")}%</strong> do seu lucro líquido
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ─── SEÇÃO 05: PLANOS ─── */}
      <section className="bg-[hsl(222,30%,7%)] border-y border-[hsl(222,20%,12%)]">
        <div className="container py-20 md:py-28 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
              Planos que cabem no{" "}
              <span className="text-[hsl(239,84%,67%)]">seu bolso</span>
            </h2>
            <p className="text-[hsl(215,15%,55%)]">Comece 100% grátis. Faça upgrade quando quiser.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {/* FREE */}
            <Card className="bg-[hsl(222,30%,8%)] border-[hsl(222,20%,14%)] relative">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[hsl(210,20%,92%)]">Iniciante</h3>
                  <p className="text-sm text-[hsl(215,15%,55%)]">Para quem está começando</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[hsl(210,20%,92%)]">R$ 0</span>
                  <span className="text-sm text-[hsl(215,15%,50%)]">/sempre</span>
                </div>
                <ul className="space-y-2.5">
                  {PLAN_FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[hsl(210,20%,85%)]">
                      <CheckCircle className="w-4 h-4 text-[hsl(215,15%,45%)] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full h-11 border-[hsl(222,20%,18%)] text-[hsl(210,20%,85%)] hover:bg-[hsl(222,20%,14%)] font-semibold"
                >
                  Começar Grátis
                </Button>
              </CardContent>
            </Card>

            {/* ANNUAL — HIGHLIGHTED */}
            <Card className="bg-[hsl(222,30%,8%)] border-[hsl(239,84%,67%)]/50 relative shadow-xl shadow-[hsl(239,84%,67%)]/10 md:-mt-4 md:mb-[-1rem]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[hsl(239,84%,67%)] text-white font-bold text-xs px-4 py-1 shadow-lg">
                  <Crown className="w-3 h-3 mr-1" /> Mais Escolhido
                </Badge>
              </div>
              <CardContent className="p-6 md:p-8 space-y-6 pt-8">
                <div>
                  <h3 className="text-xl font-bold text-[hsl(210,20%,92%)]">Empreendedor</h3>
                  <p className="text-sm text-[hsl(215,15%,55%)]">Plano Anual · Para o profissional</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-[hsl(210,20%,92%)]">R$ 39,90</span>
                    <span className="text-sm text-[hsl(215,15%,50%)]">/mês</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[hsl(215,15%,45%)]">Cobrado anualmente: R$ 478,80</span>
                    <Badge className="bg-[hsl(160,84%,39%)]/15 text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%)]/30 text-[10px] px-2 py-0.5">
                      Economize 33%
                    </Badge>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {PLAN_PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[hsl(210,20%,85%)]">
                      <CheckCircle className="w-4 h-4 text-[hsl(160,84%,39%)] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-center text-[hsl(160,84%,39%)] font-medium">
                  💡 Custa menos que 1 única aula de reforço por mês!
                </p>
                <Button className="w-full h-11 bg-[hsl(239,84%,67%)] hover:bg-[hsl(239,84%,57%)] text-white font-bold shadow-lg shadow-[hsl(239,84%,67%)]/25">
                  Assinar Plano Anual
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* MONTHLY */}
            <Card className="bg-[hsl(222,30%,8%)] border-[hsl(222,20%,14%)] relative">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[hsl(210,20%,92%)]">Profissional</h3>
                  <p className="text-sm text-[hsl(215,15%,55%)]">Plano Mensal · Sem compromisso</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[hsl(210,20%,92%)]">R$ 59,90</span>
                  <span className="text-sm text-[hsl(215,15%,50%)]">/mês</span>
                </div>
                <ul className="space-y-2.5">
                  {PLAN_PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[hsl(210,20%,85%)]">
                      <CheckCircle className="w-4 h-4 text-[hsl(160,84%,39%)] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full h-11 border-[hsl(222,20%,18%)] text-[hsl(210,20%,85%)] hover:bg-[hsl(222,20%,14%)] font-semibold"
                >
                  Assinar Plano Mensal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="container py-20 md:py-28 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
            Perguntas{" "}
            <span className="text-[hsl(239,84%,67%)]">frequentes</span>
          </h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {FAQ_ITEMS.map((item) => (
            <Collapsible key={item.q}>
              <Card className="bg-[hsl(222,30%,8%)] border-[hsl(222,20%,14%)]">
                <CollapsibleTrigger className="w-full">
                  <CardContent className="p-5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[hsl(210,20%,90%)] text-left">{item.q}</span>
                    <ChevronDown className="w-4 h-4 text-[hsl(215,15%,45%)] shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-5 pb-5">
                    <p className="text-sm text-[hsl(215,15%,55%)] leading-relaxed">{item.a}</p>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="container py-20 md:py-28 text-center max-w-2xl mx-auto space-y-6">
        <Award className="w-10 h-10 text-[hsl(239,84%,67%)] mx-auto" />
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
          Pronto para ser o dono da sua carreira?
        </h2>
        <p className="text-[hsl(215,15%,55%)] max-w-md mx-auto">
          Junte-se a mais de 1.200 instrutores que já profissionalizaram sua instrução independente.
        </p>
        <Button
          size="lg"
          className="bg-[hsl(160,84%,39%)] hover:bg-[hsl(160,84%,34%)] text-white font-bold text-base h-13 px-10 rounded-xl shadow-[0_0_40px_hsl(160,84%,39%,0.3)]"
        >
          Começar Agora (Grátis)
          <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[hsl(222,20%,12%)] bg-[hsl(222,47%,4%)]">
        <div className="container py-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Car className="w-4 h-4 text-[hsl(239,84%,67%)]" />
            <span className="font-bold text-sm">SoloDrive</span>
          </div>
          <p className="text-xs text-[hsl(215,15%,50%)] font-medium">
            SoloDrive: O padrão ouro para o instrutor de elite.
          </p>
          <p className="text-[10px] text-[hsl(215,15%,30%)]">© 2026 SoloDrive. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
