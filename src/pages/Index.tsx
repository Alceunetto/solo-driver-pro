import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Car, Sun, Moon, Eye, EyeOff, TrendingUp, Fuel, DollarSign,
  Clock, ArrowUpRight, ArrowDownRight, AlertTriangle, Award, LogOut,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/shared/StatsCard";
import { NextLessonCard } from "@/components/shared/NextLessonCard";
import { StudentRadar } from "@/components/shared/StudentRadar";
import { CostBreakdown } from "@/components/shared/CostBreakdown";
import { WeeklyChart } from "@/components/shared/WeeklyChart";
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import { TimelineLogistica } from "@/components/TimelineLogistica";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { ActiveLesson } from "@/components/shared/ActiveLesson";
import { PerformanceReport } from "@/components/shared/PerformanceReport";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFinance } from "@/hooks/useFinance";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPlan } from "@/types/solodrive";
import { saveEvaluations } from "@/services/evaluationService";

// ── Checklist-to-DETRAN-skills mapping (matches lesson_evaluations skill_name) ──
const CHECKLIST_TO_SKILL: Record<string, string> = {
  cinto: "Controle de Embreagem",       // preparation → closest match
  partida: "Controle de Embreagem",
  seta: "Sinalização e Faixa",
  retrovisores: "Uso de Espelhos",
  embreagem: "Controle de Embreagem",
  faixa: "Sinalização e Faixa",
  velocidade: "Direção Defensiva",
  parada: "Controle de Embreagem",
  conversao: "Conversões e Manobras",
  retorno: "Conversões e Manobras",
  baliza: "Baliza / Estacionamento",
  pedestre: "Direção Defensiva",
  sinalizacao: "Sinalização e Faixa",
  rotatoria: "Conversões e Manobras",
  ultrapassagem: "Direção Defensiva",
};

const SKILL_NAMES = [...new Set(Object.values(CHECKLIST_TO_SKILL))];

function KpiSkeleton() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

interface ActiveLessonData {
  id: string;
  studentId?: string;
  studentName: string;
  startTime: string;
  endTime: string;
  meetingLocation: string;
  type: string;
  value: number;
  index: number;
}

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [showFinancials, setShowFinancials] = useState(true);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<ActiveLessonData | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const { toast } = useToast();

  const userPlan: SubscriptionPlan = "free";

  const now = new Date();
  const {
    students, month, weeklyData, nextLessons,
    totalCosts, netProfit: mockNetProfit, hourlyRate: mockHourlyRate,
    revenueGrowth, independentGain, costPerLesson, kmToOil,
    studentLimit, canAdd, isLoading: isDashboardLoading,
  } = useDashboardData(userPlan);

  const { summary, isLoading: isFinanceLoading } = useFinance(now.getMonth() + 1, now.getFullYear());

  const revenue = summary?.total_revenue ?? month.revenue;
  const expenses = summary?.total_expenses ?? totalCosts;
  const netProfit = summary?.net_profit ?? mockNetProfit;
  const hourlyRate = summary?.hourly_rate ?? mockHourlyRate;

  const handleAddStudent = () => {
    if (!canAdd) {
      setUpgradeOpen(true);
    } else {
      toast({ title: "Novo aluno", description: "Formulário em breve!" });
    }
  };

  const handleStartLesson = (index: number) => {
    if (activeLesson) {
      toast({
        title: "Aula em andamento",
        description: "Finalize a aula atual antes de iniciar outra.",
        variant: "destructive",
      });
      return;
    }

    const lesson = nextLessons[index];
    setActiveLesson({
      id: lesson.id,
      studentId: lesson.studentId ?? undefined,
      studentName: lesson.student,
      startTime: lesson.time,
      endTime: (() => {
        const [h, m] = lesson.time.split(":").map(Number);
        const endH = h + 1;
        return `${endH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      })(),
      meetingLocation: lesson.location,
      type: "pratica",
      value: 120,
      index,
    });

    toast({ title: "Aula iniciada!", description: `Aula com ${lesson.student}` });
  };

  const handleFinishLesson = async (checkedItems: string[], elapsedSeconds: number) => {
    if (!activeLesson) return;

    // Build skills from checklist
    const skillScores: Record<string, { checked: number; total: number }> = {};
    SKILL_NAMES.forEach((name) => {
      skillScores[name] = { checked: 0, total: 0 };
    });

    Object.entries(CHECKLIST_TO_SKILL).forEach(([checkId, skillName]) => {
      skillScores[skillName].total++;
      if (checkedItems.includes(checkId)) {
        skillScores[skillName].checked++;
      }
    });

    const skills = SKILL_NAMES.map((name) => ({
      name,
      value: skillScores[name].total > 0
        ? Math.round((skillScores[name].checked / skillScores[name].total) * 100)
        : 0,
    }));

    const averageProgress = Math.round(
      skills.reduce((sum, s) => sum + s.value, 0) / skills.length
    );

    const durationMinutes = Math.ceil(elapsedSeconds / 60);

    // Save evaluations to database
    if (activeLesson.studentId && user?.id) {
      try {
        const scores: Record<string, number> = {};
        skills.forEach((s) => { scores[s.name] = s.value; });
        await saveEvaluations(activeLesson.id, activeLesson.studentId, user.id, scores);
        // Invalidate skill queries so prontuário updates
        queryClient.invalidateQueries({ queryKey: ["student-skills", activeLesson.studentId] });
        queryClient.invalidateQueries({ queryKey: ["student-lessons", activeLesson.studentId] });
      } catch (err) {
        console.error("Erro ao salvar avaliações:", err);
        toast({
          title: "Aviso",
          description: "Avaliações não foram salvas no banco, mas o relatório foi gerado.",
          variant: "destructive",
        });
      }
    }

    setReportData({
      studentName: activeLesson.studentName,
      instructorName: "Instrutor",
      date: new Date().toLocaleDateString("pt-BR"),
      duration: durationMinutes,
      skills,
      averageProgress,
      evolution: Math.round(averageProgress * 0.1),
      lessonValue: activeLesson.value,
    });

    setActiveLesson(null);
    toast({ title: "Aula finalizada!", description: "Relatório de desempenho gerado." });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  if (isDashboardLoading) return <DashboardSkeleton />;

  const masked = (v: string) => (showFinancials ? v : "••••");
  const profitColor = netProfit >= 0 ? "text-success" : "text-destructive";

  // Active lesson fullscreen
  if (activeLesson) {
    return (
      <ActiveLesson
        lesson={activeLesson}
        onFinish={handleFinishLesson}
        onCancel={() => setActiveLesson(null)}
      />
    );
  }

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
            <button
              onClick={async () => { await signOut(); navigate("/auth", { replace: true }); }}
              className="p-2 rounded-lg bg-secondary hover:bg-destructive/10 transition-colors"
              aria-label="Sair"
              title="Sair da conta"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="container py-5 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isFinanceLoading ? (
            <>
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                icon={DollarSign}
                iconBgClass="bg-primary/10"
                iconColorClass="text-primary"
                label="Receita Mês"
                value={masked(`R$ ${revenue.toLocaleString("pt-BR")}`)}
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
                className={`border-${netProfit >= 0 ? "success" : "destructive"}/30 cursor-pointer hover:border-${netProfit >= 0 ? "success" : "destructive"}/60 transition-colors`}
                onClick={() => setBreakdownOpen(!breakdownOpen)}
              >
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${netProfit >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
                      <TrendingUp className={`w-4 h-4 ${profitColor}`} />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">Lucro Líquido</span>
                  </div>
                  <p className={`text-2xl font-bold ${profitColor}`}>
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
                footer={
                  <p className="text-[10px] text-muted-foreground">
                    {summary?.total_hours?.toFixed(0) ?? month.hours}h trabalhadas
                  </p>
                }
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
            </>
          )}
        </div>

        {/* Breakdown */}
        {breakdownOpen && showFinancials && (
          <CostBreakdown month={month} totalCosts={expenses} />
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
              <NextLessonCard
                key={i}
                {...lesson}
                onStart={() => handleStartLesson(i)}
              />
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

      {/* Performance Report after finishing a lesson */}
      <PerformanceReport
        data={reportData ?? {
          studentName: "",
          instructorName: "",
          date: "",
          duration: 0,
          skills: [],
          averageProgress: 0,
          evolution: 0,
        }}
        open={!!reportData}
        onClose={() => setReportData(null)}
      />
    </div>
  );
};

export default Index;
