import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Car, FileText, Calculator, Shield, Zap, Users, TrendingUp,
  CheckCircle, ChevronRight, Star, Smartphone, BarChart3,
  Clock, DollarSign, Award, ArrowRight,
} from "lucide-react";

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

export default function Landing() {
  const [lessonsPerDay, setLessonsPerDay] = useState(4);
  const [pricePerLesson, setPricePerLesson] = useState(140);

  const workDays = 22;
  const monthlyGross = lessonsPerDay * pricePerLesson * workDays;
  const estimatedCosts = monthlyGross * 0.18;
  const monthlyNet = monthlyGross - estimatedCosts;
  const cltEquiv = 3800;
  const gain = monthlyNet - cltEquiv;

  return (
    <div className="min-h-screen bg-[hsl(228,25%,6%)] text-[hsl(210,20%,92%)]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(228,18%,14%)] bg-[hsl(228,25%,6%)]/90 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[hsl(239,84%,67%)]/15">
              <Car className="w-5 h-5 text-[hsl(239,84%,67%)]" />
            </div>
            <span className="text-lg font-bold tracking-tight">SoloDrive</span>
          </div>
          <Button
            className="bg-[hsl(239,84%,67%)] hover:bg-[hsl(239,84%,57%)] text-white font-semibold text-sm px-5"
          >
            Começar Grátis
          </Button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(239,84%,67%)]/8 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(239,84%,67%)]/5 blur-[120px]" />
        <div className="container relative py-20 md:py-32 text-center max-w-3xl mx-auto space-y-6">
          <Badge className="bg-[hsl(160,60%,45%)]/15 text-[hsl(160,60%,45%)] border-[hsl(160,60%,45%)]/30 font-medium text-sm px-4 py-1.5">
            Lei 2026 · Nova era do instrutor autônomo
          </Badge>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            A Lei mudou.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(239,84%,67%)] to-[hsl(160,60%,45%)]">
              Sua carreira também.
            </span>
          </h1>
          <p className="text-base md:text-lg text-[hsl(215,15%,55%)] max-w-xl mx-auto leading-relaxed">
            Saia do caderninho e do amadorismo. Gerencie seus alunos, sua frota e seus lucros com a plataforma líder para o novo instrutor autônomo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="bg-[hsl(239,84%,67%)] hover:bg-[hsl(239,84%,57%)] text-white font-bold text-base h-13 px-8 rounded-xl shadow-[0_0_30px_hsl(239,84%,67%,0.3)]"
            >
              Começar Teste Grátis de 7 Dias
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <p className="text-xs text-[hsl(215,15%,45%)]">Sem cartão de crédito · Cancele quando quiser</p>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ─── */}
      <section className="border-y border-[hsl(228,18%,14%)] bg-[hsl(228,22%,8%)]">
        <div className="container py-5 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm text-[hsl(215,15%,50%)]">
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[hsl(239,84%,67%)]" /> <span><strong className="text-[hsl(210,20%,92%)]">1.200+</strong> instrutores ativos</span></div>
          <div className="flex items-center gap-2"><Star className="w-4 h-4 text-[hsl(45,93%,58%)]" /> <span><strong className="text-[hsl(210,20%,92%)]">4.9</strong> no Google</span></div>
          <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[hsl(160,60%,45%)]" /> <span><strong className="text-[hsl(210,20%,92%)]">R$ 2.4M</strong> gerenciados/mês</span></div>
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
              className="bg-[hsl(228,22%,10%)] border-[hsl(228,18%,16%)] hover:border-[hsl(239,84%,67%)]/40 transition-all duration-300 group"
            >
              <CardContent className="p-6 space-y-4">
                <div className="p-3 rounded-xl bg-[hsl(239,84%,67%)]/10 w-fit group-hover:bg-[hsl(239,84%,67%)]/20 transition-colors">
                  <card.icon className="w-6 h-6 text-[hsl(239,84%,67%)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[hsl(210,20%,92%)]">{card.title}</h3>
                  <p className="text-[hsl(160,60%,45%)] font-semibold">{card.subtitle}</p>
                </div>
                <p className="text-sm text-[hsl(215,15%,55%)] leading-relaxed">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── SEÇÃO 03: DIFERENCIAL ─── */}
      <section className="bg-[hsl(228,22%,8%)] border-y border-[hsl(228,18%,14%)]">
        <div className="container py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-[hsl(160,60%,45%)]/15 text-[hsl(160,60%,45%)] border-[hsl(160,60%,45%)]/30 text-xs">
                Exclusivo SoloDrive
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                Venda{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(160,60%,45%)] to-[hsl(160,60%,65%)]">
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
                    <CheckCircle className="w-4 h-4 text-[hsl(160,60%,45%)] shrink-0" />
                    <span className="text-[hsl(210,20%,85%)]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative w-[280px] md:w-[300px]">
                <div className="rounded-[2rem] border-2 border-[hsl(228,18%,18%)] bg-[hsl(228,25%,6%)] p-3 shadow-2xl shadow-[hsl(239,84%,67%)]/10">
                  <div className="rounded-[1.5rem] bg-[hsl(228,22%,10%)] overflow-hidden">
                    {/* Status bar */}
                    <div className="h-6 bg-[hsl(228,22%,12%)] flex items-center justify-center">
                      <div className="w-16 h-1 rounded-full bg-[hsl(228,18%,20%)]" />
                    </div>
                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div className="text-center space-y-1">
                        <Smartphone className="w-5 h-5 text-[hsl(239,84%,67%)] mx-auto" />
                        <p className="text-[10px] font-bold text-[hsl(210,20%,92%)]">Relatório de Evolução</p>
                        <p className="text-[9px] text-[hsl(215,15%,50%)]">Maria Silva · 04/03/2026</p>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2 rounded-lg bg-[hsl(160,60%,45%)]/10">
                          <p className="text-[9px] font-semibold text-[hsl(160,60%,45%)]">💪 Pontos Fortes</p>
                          <p className="text-[8px] text-[hsl(215,15%,55%)] mt-0.5">• Controle de embreagem<br />• Uso de retrovisores</p>
                        </div>
                        <div className="p-2 rounded-lg bg-[hsl(45,93%,58%)]/10">
                          <p className="text-[9px] font-semibold text-[hsl(45,93%,58%)]">⚠️ Pontos a Melhorar</p>
                          <p className="text-[8px] text-[hsl(215,15%,55%)] mt-0.5">• Baliza<br />• Controle de ansiedade</p>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-[hsl(239,84%,67%)]/10">
                          <span className="text-[9px] text-[hsl(215,15%,55%)]">Evolução</span>
                          <span className="text-[11px] font-bold text-[hsl(160,60%,45%)]">+12%</span>
                        </div>
                      </div>
                      <div className="h-8 rounded-lg bg-[hsl(160,60%,45%)] flex items-center justify-center gap-1">
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

      {/* ─── SEÇÃO 04: CALCULADORA ─── */}
      <section className="container py-20 md:py-28 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
            Calculadora de{" "}
            <span className="text-[hsl(160,60%,45%)]">Lucro Real</span>
          </h2>
          <p className="text-[hsl(215,15%,55%)]">
            Descubra quanto você pode ganhar como instrutor independente.
          </p>
        </div>

        <Card className="max-w-xl mx-auto bg-[hsl(228,22%,10%)] border-[hsl(228,18%,16%)]">
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
            <div className="space-y-3 pt-4 border-t border-[hsl(228,18%,16%)]">
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
              <div className="flex items-center justify-between pt-2 border-t border-[hsl(228,18%,14%)]">
                <span className="text-base font-semibold text-[hsl(210,20%,92%)]">Lucro líquido/mês</span>
                <span className="text-2xl font-extrabold text-[hsl(160,60%,45%)]">
                  R$ {monthlyNet.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </span>
              </div>
              {gain > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[hsl(160,60%,45%)]/10 mt-2">
                  <TrendingUp className="w-5 h-5 text-[hsl(160,60%,45%)]" />
                  <p className="text-sm text-[hsl(160,60%,45%)] font-semibold">
                    +R$ {gain.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} a mais que CLT de autoescola
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ─── SEÇÃO 05: PLANOS ─── */}
      <section className="bg-[hsl(228,22%,8%)] border-y border-[hsl(228,18%,14%)]">
        <div className="container py-20 md:py-28 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
              Planos que cabem no{" "}
              <span className="text-[hsl(239,84%,67%)]">seu bolso</span>
            </h2>
            <p className="text-[hsl(215,15%,55%)]">Comece grátis por 7 dias. Sem compromisso.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Prata */}
            <Card className="bg-[hsl(228,22%,10%)] border-[hsl(228,18%,16%)] relative">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[hsl(210,20%,92%)]">Prata</h3>
                  <p className="text-sm text-[hsl(215,15%,55%)]">Para quem está começando</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[hsl(210,20%,92%)]">R$ 49</span>
                  <span className="text-sm text-[hsl(215,15%,50%)]">/mês</span>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Até 10 alunos ativos",
                    "Agendamento de aulas",
                    "Prontuário digital básico",
                    "Controle de frota",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[hsl(210,20%,85%)]">
                      <CheckCircle className="w-4 h-4 text-[hsl(215,15%,45%)] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full h-11 border-[hsl(228,18%,20%)] text-[hsl(210,20%,85%)] hover:bg-[hsl(228,18%,16%)] font-semibold"
                >
                  Escolher Prata
                </Button>
              </CardContent>
            </Card>

            {/* Ouro */}
            <Card className="bg-[hsl(228,22%,10%)] border-[hsl(239,84%,67%)]/50 relative shadow-xl shadow-[hsl(239,84%,67%)]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[hsl(239,84%,67%)] text-white font-bold text-xs px-4 py-1 shadow-lg">
                  Recomendado
                </Badge>
              </div>
              <CardContent className="p-6 md:p-8 space-y-6 pt-8">
                <div>
                  <h3 className="text-xl font-bold text-[hsl(210,20%,92%)]">Ouro</h3>
                  <p className="text-sm text-[hsl(215,15%,55%)]">Para o instrutor profissional</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[hsl(210,20%,92%)]">R$ 79</span>
                  <span className="text-sm text-[hsl(215,15%,50%)]">/mês</span>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Alunos ilimitados",
                    "Relatórios de Performance (WhatsApp)",
                    "Gestão Financeira completa",
                    "Calculadora de lucro real",
                    "Suporte prioritário",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[hsl(210,20%,85%)]">
                      <CheckCircle className="w-4 h-4 text-[hsl(160,60%,45%)] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full h-11 bg-[hsl(239,84%,67%)] hover:bg-[hsl(239,84%,57%)] text-white font-bold shadow-lg shadow-[hsl(239,84%,67%)]/25"
                >
                  Escolher Ouro
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
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
          className="bg-[hsl(239,84%,67%)] hover:bg-[hsl(239,84%,57%)] text-white font-bold text-base h-13 px-10 rounded-xl shadow-[0_0_40px_hsl(239,84%,67%,0.3)]"
        >
          Começar Teste Grátis Agora
          <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[hsl(228,18%,14%)] bg-[hsl(228,25%,5%)]">
        <div className="container py-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Car className="w-4 h-4 text-[hsl(239,84%,67%)]" />
            <span className="font-bold text-sm">SoloDrive</span>
          </div>
          <p className="text-xs text-[hsl(215,15%,40%)]">
            Criado por quem entende a nova realidade do trânsito brasileiro em 2026.
          </p>
          <p className="text-[10px] text-[hsl(215,15%,30%)]">© 2026 SoloDrive. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
