import { useState, useEffect } from "react";
import {
  Car, Sun, Moon, Eye, EyeOff, TrendingUp, Fuel, DollarSign,
  Clock, ArrowUpRight, ArrowDownRight, AlertTriangle, Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/StatsCard";
import { NextLessonCard } from "@/components/NextLessonCard";
import { StudentRadar } from "@/components/StudentRadar";
import { CostBreakdown } from "@/components/CostBreakdown";
import { WeeklyChart } from "@/components/WeeklyChart";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { TimelineLogistica } from "@/components/TimelineLogistica";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPlan } from "@/types/solodrive";

const Index = () => {
  const [isDark, setIsDark] = useState(true);
  const [showFinancials, setShowFinancials] = useState(true);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { toast } = useToast();

  const userPlan: SubscriptionPlan = "free";

  const {
    students, month, weeklyData, nextLessons,
    totalCosts, netProfit, hourlyRate, revenueGrowth,
    independentGain, costPerLesson, kmToOil,
    studentLimit, canAdd, isLoading,
  } = useDashboardData(userPlan);

  const handleAddStudent = () => {
    if (!canAdd) {
      setUpgradeOpen(true);
    } else {
      toast({ title: "Novo aluno", description: "Formulário em breve!" });
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  if (isLoading) return <DashboardSkeleton />;

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
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard
            icon={DollarSign}
            iconBgClass="bg-primary/10"
            iconColorClass="text-primary"
            label="Receita Mês"
            value={masked(`R$ ${month.revenue.toLocaleString("pt-BR")}`)}
            footer={
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
            }
          />

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

          <StatsCard
            icon={Clock}
            iconBgClass="bg-accent/10"
            iconColorClass="text-accent"
            label="Valor/Hora Real"
            value={masked(`R$ ${hourlyRate.toFixed(0)}`)}
            footer={<p className="text-[10px] text-muted-foreground">{month.hours}h trabalhadas</p>}
          />

          <StatsCard
            icon={Fuel}
            iconBgClass={kmToOil < 2000 ? "bg-warning/10" : "bg-muted"}
            iconColorClass={kmToOil < 2000 ? "text-warning" : "text-muted-foreground"}
            label="Custo/Aula"
            value={masked(`R$ ${costPerLesson.toFixed(1)}`)}
            className={kmToOil < 2000 ? "border-warning/50" : ""}
            footer={
              kmToOil < 2000 ? (
                <div className="flex items-center gap-1 text-[10px] text-warning font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  Troca de óleo em {kmToOil.toLocaleString("pt-BR")} km
                </div>
              ) : undefined
            }
          />
        </div>

        {/* Breakdown */}
        {breakdownOpen && showFinancials && (
          <CostBreakdown month={month} totalCosts={totalCosts} />
        )}

        {/* Weekly Chart */}
        <WeeklyChart data={weeklyData} visible={showFinancials} />

        {/* Next Lessons */}
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Próximas Aulas</span>
            </div>
            {nextLessons.map((lesson, i) => (
              <NextLessonCard key={i} {...lesson} />
            ))}
          </CardContent>
        </Card>

        {/* Student Radar */}
        <StudentRadar
          students={students}
          userPlan={userPlan}
          studentLimit={studentLimit}
          canAdd={canAdd}
          onAddStudent={handleAddStudent}
          onUpgrade={() => setUpgradeOpen(true)}
        />

        {/* Timeline */}
        <TimelineLogistica />
      </main>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
};

export default Index;
