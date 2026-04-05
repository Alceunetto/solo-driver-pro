import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Car, Sun, Moon, Eye, EyeOff, TrendingUp, Fuel, DollarSign,
  Clock, ArrowUpRight, ArrowDownRight, AlertTriangle, Award, LogOut,
  UserPlus, CalendarPlus, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { NewStudentDialog } from "@/components/shared/NewStudentDialog";
import { FloatingActionButton, triggerHaptic } from "@/components/shared/FloatingActionButton";
import { PageTransition } from "@/components/shared/PageTransition";
import { ShimmerSkeleton } from "@/components/shared/ShimmerSkeleton";
import { AgendaDialog } from "@/components/shared/AgendaDialog";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFinance, FINANCE_QUERY_KEY, EXPENSES_QUERY_KEY } from "@/hooks/useFinance";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { WeeklyGoalCard } from "@/components/shared/WeeklyGoalCard";
import { SubscriptionPlan } from "@/types/solodrive";
import { saveEvaluations } from "@/services/evaluationService";
import { supabase } from "@/integrations/supabase/client";
import { timeToMinutes } from "@/lib/schedule";

const CHECKLIST_TO_SKILL: Record<string, string> = {
  cinto: "Controle de Embreagem",
  partida: "Controle de Embreagem",
  seta: "Sinalização",
  retrovisores: "Noção de Espaço",
  embreagem: "Controle de Embreagem",
  faixa: "Sinalização",
  velocidade: "Frenagem",
  parada: "Frenagem",
  conversao: "Noção de Espaço",
  retorno: "Noção de Espaço",
  baliza: "Baliza",
  pedestre: "Sinalização",
  sinalizacao: "Sinalização",
  rotatoria: "Noção de Espaço",
  ultrapassagem: "Frenagem",
  arrancada: "Arrancada em Aclive",
};

const SKILL_NAMES = [...new Set(Object.values(CHECKLIST_TO_SKILL))];

const ACTIVE_LESSON_KEY = "solodrive_active_lesson";

function KpiSkeleton() {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShimmerSkeleton className="w-8 h-8 rounded-xl" />
        <ShimmerSkeleton className="h-3 w-16" />
      </div>
      <ShimmerSkeleton className="h-8 w-24" />
      <ShimmerSkeleton className="h-3 w-32" />
    </div>
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
  phone: string;
  index: number;
  startedAt: number; // timestamp when lesson was started
}

function saveActiveLessonToStorage(lesson: ActiveLessonData | null) {
  if (lesson) {
    localStorage.setItem(ACTIVE_LESSON_KEY, JSON.stringify(lesson));
  } else {
    localStorage.removeItem(ACTIVE_LESSON_KEY);
  }
}

function loadActiveLessonFromStorage(): ActiveLessonData | null {
  try {
    const stored = localStorage.getItem(ACTIVE_LESSON_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as ActiveLessonData;
  } catch {
    localStorage.removeItem(ACTIVE_LESSON_KEY);
    return null;
  }
}

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [isDark, setIsDark] = useState(true);
  const [showFinancials, setShowFinancials] = useState(true);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<ActiveLessonData | null>(() => loadActiveLessonFromStorage());
  const [reportData, setReportData] = useState<any>(null);
  const [newStudentOpen, setNewStudentOpen] = useState(false);
  const [fabLessonDialogOpen, setFabLessonDialogOpen] = useState(false);
  const [agendaOpen, setAgendaOpen] = useState(false);
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

  // Persist active lesson changes to localStorage
  useEffect(() => {
    saveActiveLessonToStorage(activeLesson);
  }, [activeLesson]);

  const handleAddStudent = () => {
    if (!canAdd) {
      setUpgradeOpen(true);
    } else {
      setNewStudentOpen(true);
    }
  };

  const handleStartLesson = async (index: number) => {
    if (activeLesson) {
      toast({
        title: "Aula em andamento",
        description: "Finalize a aula atual antes de iniciar outra.",
        variant: "destructive",
      });
      return;
    }

    triggerHaptic(25);
    const lesson = nextLessons[index];

    // Update lesson status in DB
    try {
      await supabase
        .from("lessons")
        .update({ status: "em_andamento" })
        .eq("id", lesson.id);
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }

    const activeLessonData: ActiveLessonData = {
      id: lesson.id,
      studentId: lesson.studentId ?? undefined,
      studentName: lesson.student,
      startTime: lesson.time,
      endTime: lesson.endTime || (() => {
        const [h, m] = lesson.time.split(":").map(Number);
        return `${(h + 1).toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      })(),
      meetingLocation: lesson.location,
      type: "pratica",
      value: lesson.price || 120,
      phone: lesson.phone || "",
      index,
      startedAt: Date.now(),
    };

    setActiveLesson(activeLessonData);
    queryClient.invalidateQueries({ queryKey: ["next-lessons"] });
    queryClient.invalidateQueries({ queryKey: ["timeline-lessons"] });
    toast({ title: "Aula iniciada!", description: `Aula com ${lesson.student}` });
  };

  const handleFinishLesson = async (checkedItems: string[], elapsedSeconds: number) => {
    if (!activeLesson) return;

    triggerHaptic(30);

    // 1. Calculate skill scores
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

    // 2. Save evaluations to DB (Pedagogical Bridge)
    if (activeLesson.studentId && user?.id) {
      try {
        const scores: Record<string, number> = {};
        skills.forEach((s) => { scores[s.name] = s.value; });
        await saveEvaluations(activeLesson.id, activeLesson.studentId, user.id, scores);
        queryClient.invalidateQueries({ queryKey: ["student-skills", activeLesson.studentId] });
        queryClient.invalidateQueries({ queryKey: ["student-lessons", activeLesson.studentId] });
        queryClient.invalidateQueries({ queryKey: ["student-growth", activeLesson.studentId] });
      } catch (err) {
        console.error("Erro ao salvar avaliações:", err);
        toast({
          title: "Aviso",
          description: "Avaliações não foram salvas no banco, mas o relatório foi gerado.",
          variant: "destructive",
        });
      }
    }

    // 3. Update lesson status to finished + paid (Revenue Bridge)
    try {
      await supabase
        .from("lessons")
        .update({ status: "concluida", payment_status: "paid" })
        .eq("id", activeLesson.id);
    } catch (err) {
      console.error("Erro ao finalizar aula:", err);
    }

    // 4. Invalidate all related caches
    queryClient.invalidateQueries({ queryKey: ["next-lessons"] });
    queryClient.invalidateQueries({ queryKey: ["timeline-lessons"] });
    queryClient.invalidateQueries({ queryKey: [FINANCE_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY] });

    // 5. Generate report (WhatsApp Bridge)
    const instructorName = profile?.full_name || "Instrutor";
    setReportData({
      studentName: activeLesson.studentName,
      instructorName,
      date: new Date().toLocaleDateString("pt-BR"),
      duration: durationMinutes,
      skills,
      averageProgress,
      evolution: Math.round(averageProgress * 0.1),
      lessonValue: activeLesson.value,
      phone: activeLesson.phone,
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

  if (activeLesson) {
    return (
      <ActiveLesson
        lesson={activeLesson}
        onFinish={handleFinishLesson}
        onCancel={() => setActiveLesson(null)}
        startedAt={activeLesson.startedAt}
      />
    );
  }

  const fabActions = [
    {
      icon: UserPlus,
      label: "Novo Aluno",
      onClick: handleAddStudent,
      colorClass: "bg-success/15",
    },
    {
      icon: CalendarPlus,
      label: "Nova Aula",
      onClick: () => {
        setFabLessonDialogOpen(true);
        const el = document.getElementById("timeline-section");
        el?.scrollIntoView({ behavior: "smooth" });
      },
      colorClass: "bg-primary/15",
    },
  ];

  return (
    <PageTransition className="min-h-screen bg-background transition-colors pb-24">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="container px-4 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-primary/10 glow-primary">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-foreground tracking-tight">SoloDrive</h1>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Cockpit do Instrutor</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowFinancials(!showFinancials)}
              className="p-2.5 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors active:scale-95"
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
              className="p-2.5 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors active:scale-95"
              aria-label="Alternar tema"
            >
              {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-foreground" />}
            </button>
            <button
              onClick={async () => { await signOut(); navigate("/auth", { replace: true }); }}
              className="p-2.5 rounded-xl bg-secondary/60 hover:bg-destructive/10 transition-colors active:scale-95"
              aria-label="Sair"
              title="Sair da conta"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-5 space-y-6 max-w-4xl mx-auto">
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
                index={0}
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

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.06 }}
              >
                <Card
                  className={`glass-card border-0 cursor-pointer hover:glow-${netProfit >= 0 ? "success" : "primary"} active:scale-[0.97] transition-all`}
                  onClick={() => setBreakdownOpen(!breakdownOpen)}
                >
                  <CardContent className="p-4 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl ${netProfit >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
                        <TrendingUp className={`w-4 h-4 ${profitColor}`} />
                      </div>
                      <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Lucro Líquido</span>
                    </div>
                     <p className={`text-2xl sm:text-3xl font-black ${profitColor} tracking-tight`}>
                      {masked(`R$ ${netProfit.toLocaleString("pt-BR")}`)}
                    </p>
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-primary" />
                      <span className="text-[10px] text-primary font-semibold">
                        {showFinancials
                          ? `+R$ ${independentGain.toLocaleString("pt-BR")} vs autoescola`
                          : "•• vs autoescola"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <StatsCard
                icon={Clock}
                iconBgClass="bg-accent/10"
                iconColorClass="text-accent"
                label="Valor/Hora"
                value={masked(`R$ ${hourlyRate.toFixed(0)}`)}
                index={2}
                footer={
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {summary?.total_hours?.toFixed(0) ?? month.hours}h trabalhadas
                  </p>
                }
              />

              <StatsCard
                icon={Fuel}
                iconBgClass={kmToOil < 2000 ? "bg-warning/15" : "bg-muted"}
                iconColorClass={kmToOil < 2000 ? "text-warning drop-shadow-[0_0_6px_hsl(var(--warning)/0.5)]" : "text-muted-foreground"}
                label="Custo/Aula"
                value={masked(`R$ ${costPerLesson.toFixed(1)}`)}
                className={kmToOil < 2000 ? "border-2 border-warning/40 shadow-warning/10 shadow-lg" : ""}
                index={3}
                footer={
                  kmToOil < 2000 ? (
                    <div className="flex items-center gap-1 text-[11px] text-warning font-bold animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      ⚠️ Troca de óleo em {kmToOil.toLocaleString("pt-BR")} km
                    </div>
                  ) : undefined
                }
              />
            </>
          )}
        </div>

        {/* Breakdown */}
        {breakdownOpen && showFinancials && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CostBreakdown month={month} totalCosts={expenses} />
          </motion.div>
        )}

        {/* Weekly Chart */}
        <WeeklyChart data={weeklyData} visible={showFinancials} />

        {/* Next Lessons with Displacement Gaps */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <Card className="glass-card border-0">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-primary/10">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Próximas Aulas</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary gap-1"
                  onClick={() => setAgendaOpen(true)}
                >
                  Ver Agenda <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
              {nextLessons.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma aula agendada. Use o botão + para criar uma.
                </p>
              ) : (
                nextLessons.slice(0, Math.max(3, nextLessons.length)).map((lesson, i, arr) => {
                  // Calculate displacement gap to next lesson on same day
                  const next = arr[i + 1];
                  let gapMinutes: number | null = null;
                  let hasConflict = false;

                  if (next && lesson.date === next.date) {
                    const endMins = timeToMinutes(lesson.endTime || lesson.time);
                    const nextStartMins = timeToMinutes(next.time);
                    const diff = nextStartMins - endMins;
                    if (diff >= 0 && diff <= 120) {
                      gapMinutes = diff;
                      hasConflict = diff < 15;
                    }
                  }

                  return (
                    <div key={lesson.id}>
                      <NextLessonCard
                        student={lesson.student}
                        time={lesson.time}
                        endTime={lesson.endTime}
                        date={lesson.date}
                        location={lesson.location}
                        address={lesson.address}
                        price={lesson.price}
                        status={lesson.status}
                        onStart={() => handleStartLesson(i)}
                      />
                      {gapMinutes !== null && (
                        <div className="flex items-center justify-center py-1.5">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                            hasConflict
                              ? "bg-destructive/10 border-destructive/30 text-destructive"
                              : "bg-accent/10 border-accent/30 text-muted-foreground"
                          }`}>
                            {hasConflict ? (
                              <>
                                <AlertTriangle className="w-3 h-3" />
                                <span>⚠️ Intervalo insuficiente ({gapMinutes}min)</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>Deslocamento: ~{gapMinutes}min</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

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
        <div id="timeline-section">
          <TimelineLogistica externalDialogOpen={fabLessonDialogOpen} onExternalDialogClose={() => setFabLessonDialogOpen(false)} />
        </div>
      </main>

      {/* FAB */}
      <FloatingActionButton actions={fabActions} />

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <NewStudentDialog open={newStudentOpen} onOpenChange={setNewStudentOpen} />
      <AgendaDialog open={agendaOpen} onOpenChange={setAgendaOpen} />

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
    </PageTransition>
  );
};

export default Index;
