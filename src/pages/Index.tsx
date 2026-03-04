import { useState, useEffect } from "react";
import {
  Car, Sun, Moon, Eye, EyeOff, TrendingUp, Fuel, DollarSign,
  Clock, MapPin, Play, ChevronRight, AlertTriangle, Award,
  ArrowUpRight, ArrowDownRight, Wrench, Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { TimelineLogistica } from "@/components/TimelineLogistica";

/* ── mock data ── */
const WEEKLY_DATA = [
  { day: "Seg", receita: 480, despesa: 65 },
  { day: "Ter", receita: 360, despesa: 52 },
  { day: "Qua", receita: 600, despesa: 78 },
  { day: "Qui", receita: 240, despesa: 40 },
  { day: "Sex", receita: 480, despesa: 55 },
  { day: "Sáb", receita: 720, despesa: 90 },
  { day: "Dom", receita: 0, despesa: 0 },
];

const STUDENTS = [
  { name: "Carlos Silva", progress: 75, paid: true, lessons: 8 },
  { name: "Ana Oliveira", progress: 45, paid: false, lessons: 4 },
  { name: "Pedro Santos", progress: 90, paid: true, lessons: 18 },
  { name: "Juliana Costa", progress: 30, paid: true, lessons: 3 },
];

const NEXT_LESSONS = [
  { student: "Carlos Silva", time: "08:00", location: "Rua das Flores, 120", address: "Rua das Flores, 120, São Paulo" },
  { student: "Ana Oliveira", time: "09:30", location: "Estação Conceição", address: "Estação Conceição, São Paulo" },
  { student: "Pedro Santos", time: "11:00", location: "Detran - Campo de Baliza", address: "Detran Santo Amaro, São Paulo" },
];

const MONTH = {
  revenue: 8640,
  prevRevenue: 7500,
  fuel: 680,
  maintenance: 350,
  taxes: 420,
  hours: 72,
  kmPerLesson: 12.5,
  currentKm: 48200,
  oilChangeKm: 50000,
  autoescolaEquiv: 5400,
};

const Index = () => {
  const [isDark, setIsDark] = useState(true);
  const [showFinancials, setShowFinancials] = useState(true);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const totalCosts = MONTH.fuel + MONTH.maintenance + MONTH.taxes;
  const netProfit = MONTH.revenue - totalCosts;
  const hourlyRate = MONTH.hours > 0 ? netProfit / MONTH.hours : 0;
  const revenueGrowth = ((MONTH.revenue - MONTH.prevRevenue) / MONTH.prevRevenue) * 100;
  const independentGain = netProfit - MONTH.autoescolaEquiv;
  const kmToOil = MONTH.oilChangeKm - MONTH.currentKm;
  const costPerLesson = MONTH.fuel / (MONTH.hours); // simplified

  const masked = (v: string) => (showFinancials ? v : "••••");

  return (
    <div className="min-h-screen bg-background transition-colors pb-24">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">SoloDrive</h1>
              <p className="text-xs text-muted-foreground">Cockpit do Instrutor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFinancials(!showFinancials)}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Ocultar valores"
              title={showFinancials ? "Ocultar valores" : "Mostrar valores"}
            >
              {showFinancials ? (
                <Eye className="w-5 h-5 text-muted-foreground" />
              ) : (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Alternar tema"
            >
              {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-foreground" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container py-5 space-y-6">
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Faturamento Bruto */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">Receita Mês</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {masked(`R$ ${MONTH.revenue.toLocaleString("pt-BR")}`)}
              </p>
              <div className="flex items-center gap-1 text-xs">
                {revenueGrowth >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-success" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-destructive" />
                )}
                <span className={revenueGrowth >= 0 ? "text-success" : "text-destructive"}>
                  {showFinancials ? `${revenueGrowth.toFixed(0)}%` : "••"} vs mês anterior
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Lucro Líquido */}
          <Card
            className="border-success/30 cursor-pointer hover:border-success/60 transition-colors"
            onClick={() => setBreakdownOpen(!breakdownOpen)}
          >
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-success/10">
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">Lucro Líquido</span>
              </div>
              <p className="text-2xl font-bold text-success">
                {masked(`R$ ${netProfit.toLocaleString("pt-BR")}`)}
              </p>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-primary" />
                <span className="text-[10px] text-primary font-medium">
                  {showFinancials
                    ? `+R$ ${independentGain.toLocaleString("pt-BR")} vs autoescola`
                    : "•• vs autoescola"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Valor/Hora */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <Clock className="w-4 h-4 text-accent" />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">Valor/Hora Real</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {masked(`R$ ${hourlyRate.toFixed(0)}`)}
              </p>
              <p className="text-[10px] text-muted-foreground">{MONTH.hours}h trabalhadas</p>
            </CardContent>
          </Card>

          {/* Saúde da Frota */}
          <Card className={`border-border/50 ${kmToOil < 2000 ? "border-warning/50" : ""}`}>
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${kmToOil < 2000 ? "bg-warning/10" : "bg-muted"}`}>
                  <Fuel className={`w-4 h-4 ${kmToOil < 2000 ? "text-warning" : "text-muted-foreground"}`} />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">Custo/Aula</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {masked(`R$ ${costPerLesson.toFixed(1)}`)}
              </p>
              {kmToOil < 2000 && (
                <div className="flex items-center gap-1 text-[10px] text-warning font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  Troca de óleo em {kmToOil.toLocaleString("pt-BR")} km
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Breakdown (expandable) ── */}
        {breakdownOpen && showFinancials && (
          <Card className="border-success/20 animate-in slide-in-from-top-2 duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                Detalhamento de Custos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 pb-4">
              {[
                { label: "Combustível", value: MONTH.fuel, color: "bg-warning" },
                { label: "Manutenção", value: MONTH.maintenance, color: "bg-accent" },
                { label: "Taxas 2026", value: MONTH.taxes, color: "bg-destructive" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    R$ {item.value.toLocaleString("pt-BR")}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Custos</span>
                <span className="text-sm font-bold text-destructive">
                  R$ {totalCosts.toLocaleString("pt-BR")}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Revenue vs Expenses Chart ── */}
        <Card className="border-border/50">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold">Faturamento vs Despesas (semana)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {showFinancials ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={WEEKLY_DATA} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => `R$ ${v}`}
                  />
                  <Bar dataKey="receita" radius={[4, 4, 0, 0]} barSize={16}>
                    {WEEKLY_DATA.map((_, i) => (
                      <Cell key={i} fill="hsl(var(--success))" />
                    ))}
                  </Bar>
                  <Bar dataKey="despesa" radius={[4, 4, 0, 0]} barSize={16}>
                    {WEEKLY_DATA.map((_, i) => (
                      <Cell key={i} fill="hsl(var(--destructive))" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                <EyeOff className="w-4 h-4 mr-2" /> Valores ocultos
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Próximas Aulas Widget ── */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Próximas Aulas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            {NEXT_LESSONS.map((lesson, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{lesson.student}</span>
                    <Badge variant="secondary" className="text-[10px]">{lesson.time}</Badge>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lesson.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
                  >
                    <MapPin className="w-3 h-3" /> {lesson.location}
                  </a>
                </div>
                <Button size="sm" variant="outline" className="gap-1 shrink-0 text-xs">
                  <Play className="w-3 h-3" /> Iniciar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Radar de Alunos ── */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Radar de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-4">
            {STUDENTS.map((s) => (
              <div key={s.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                    <Badge
                      variant={s.paid ? "default" : "destructive"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {s.paid ? "Pago" : "Pendente"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{s.progress}%</span>
                </div>
                <Progress value={s.progress} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground">{s.lessons} aulas realizadas</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Timeline Logística (existing) ── */}
        <TimelineLogistica />
      </main>
    </div>
  );
};

export default Index;
