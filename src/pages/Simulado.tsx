import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, RotateCcw, Play, Pause, Volume2,
  CheckCircle2, XCircle, UserCheck, ArrowLeft,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { StudentCombobox } from "@/components/shared/StudentCombobox";
import { GrowthSummaryCard } from "@/components/shared/GrowthSummaryCard";
import { useAuth } from "@/hooks/useAuth";
import { useStudentGrowth } from "@/hooks/useStudentGrowth";
import { useStudents } from "@/hooks/useStudents";
import { supabase } from "@/integrations/supabase/client";
import { saveEvaluations } from "@/services/evaluationService";
import { PageTransition } from "@/components/shared/PageTransition";

// ── Fault Catalog ──

interface Fault {
  id: string;
  label: string;
  category: "leve" | "media" | "grave" | "eliminatoria";
  points: number;
  skill: string; // maps to DETRAN skill for radar
}

const faultCatalog: Fault[] = [
  { id: "f1", label: "Não afivelar cinto", category: "eliminatoria", points: 0, skill: "Sinalização" },
  { id: "f2", label: "Avançar sinal vermelho", category: "eliminatoria", points: 0, skill: "Sinalização" },
  { id: "f3", label: "Exceder tempo de baliza", category: "eliminatoria", points: 0, skill: "Baliza" },
  { id: "f4", label: "Não usar seta ao converter", category: "grave", points: 5, skill: "Sinalização" },
  { id: "f5", label: "Velocidade incompatível", category: "grave", points: 5, skill: "Frenagem" },
  { id: "f6", label: "Não observar espelhos", category: "media", points: 3, skill: "Noção de Espaço" },
  { id: "f7", label: "Marcha inadequada", category: "media", points: 3, skill: "Controle de Embreagem" },
  { id: "f8", label: "Uso irregular da buzina", category: "leve", points: 1, skill: "Sinalização" },
  { id: "f9", label: "Posição incorreta no volante", category: "leve", points: 1, skill: "Controle de Embreagem" },
  { id: "f10", label: "Não verificar ponto cego", category: "media", points: 3, skill: "Noção de Espaço" },
];

const categoryConfig = {
  leve: { label: "Leve", color: "bg-accent/20 text-accent", max: "1 pt" },
  media: { label: "Média", color: "bg-warning/20 text-warning", max: "3 pts" },
  grave: { label: "Grave", color: "bg-destructive/20 text-destructive", max: "5 pts" },
  eliminatoria: { label: "Eliminatória", color: "bg-destructive text-destructive-foreground", max: "Reprova" },
};

const SKILL_LIST = [
  "Controle de Embreagem",
  "Baliza",
  "Sinalização",
  "Frenagem",
  "Noção de Espaço",
  "Arrancada em Aclive",
];

// ── Helpers ──

function computeSkillScores(markedFaultIds: string[]): Record<string, number> {
  // For each skill, calculate score based on faults committed
  // Each fault in a skill reduces score; no faults = 100
  const skillFaultCount: Record<string, number> = {};
  const skillTotalFaults: Record<string, number> = {};

  SKILL_LIST.forEach((s) => {
    skillFaultCount[s] = 0;
    skillTotalFaults[s] = faultCatalog.filter((f) => f.skill === s).length;
  });

  markedFaultIds.forEach((id) => {
    const fault = faultCatalog.find((f) => f.id === id);
    if (fault) skillFaultCount[fault.skill] = (skillFaultCount[fault.skill] || 0) + 1;
  });

  const scores: Record<string, number> = {};
  SKILL_LIST.forEach((s) => {
    const total = Math.max(skillTotalFaults[s], 1);
    const committed = skillFaultCount[s];
    scores[s] = Math.max(0, Math.round(((total - committed) / total) * 100));
  });

  return scores;
}

// ── Main Component ──

export default function Simulado() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { students } = useStudents();

  // Student selection
  const paramStudentId = searchParams.get("studentId") || "";
  const [selectedStudentId, setSelectedStudentId] = useState(paramStudentId);
  const [selectedStudentName, setSelectedStudentName] = useState("");

  // Simulation state
  const [markedFaults, setMarkedFaults] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showVerdict, setShowVerdict] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Growth data for post-save comparison
  const { data: growthData } = useStudentGrowth(saved ? selectedStudentId : undefined);

  // Resolve student name from param
  useEffect(() => {
    if (paramStudentId && students.length > 0) {
      const s = students.find((st) => st.id === paramStudentId);
      if (s) {
        setSelectedStudentId(s.id);
        setSelectedStudentName(s.name);
      }
    }
  }, [paramStudentId, students]);

  // Timer
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning]);

  // Beep at 3min and 4min
  useEffect(() => {
    if (timerSeconds === 180 || timerSeconds === 240) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.frequency.value = timerSeconds === 240 ? 800 : 600;
        osc.connect(ctx.destination);
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 300);
      } catch {}
    }
  }, [timerSeconds]);

  const toggleFault = (id: string) => {
    setMarkedFaults((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const totalPoints = markedFaults.reduce((sum, id) => {
    const f = faultCatalog.find((fc) => fc.id === id);
    return sum + (f?.points || 0);
  }, 0);

  const hasEliminatoria = markedFaults.some((id) =>
    faultCatalog.find((f) => f.id === id)?.category === "eliminatoria"
  );

  const getVerdict = () => {
    if (hasEliminatoria) {
      const elimFault = faultCatalog.find(
        (f) => f.category === "eliminatoria" && markedFaults.includes(f.id)
      );
      return {
        pass: false,
        message: `Reprovado por falta eliminatória: "${elimFault?.label}"`,
        suggestion: "Recomenda-se mais 5 horas de treino focando em procedimentos básicos de segurança.",
      };
    }
    if (totalPoints >= 5) {
      const worstLabels = markedFaults
        .map((id) => faultCatalog.find((f) => f.id === id))
        .filter((f) => f && f.category !== "leve")
        .map((f) => f!.label);
      return {
        pass: false,
        message: `Reprovado por acúmulo de faltas (${totalPoints} pontos).`,
        suggestion: `Precisa de mais treino em: ${worstLabels.join(", ")}.`,
      };
    }
    return {
      pass: true,
      message: "Aprovado! Excelente desempenho.",
      suggestion: "Aluno pronto para o exame oficial.",
    };
  };

  // ── Save evaluation to DB ──
  const handleSaveEvaluation = async () => {
    if (!selectedStudentId) {
      toast.error("Selecione um aluno antes de salvar.");
      return;
    }
    if (!user?.id) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Create a lesson record of type "simulado"
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const { data: lesson, error: lessonErr } = await supabase
        .from("lessons")
        .insert({
          instructor_id: user.id,
          student_id: selectedStudentId,
          student_name: selectedStudentName,
          type: "simulado",
          status: "concluida",
          start_time: timeStr,
          end_time: timeStr,
          date: now.toISOString().split("T")[0],
          price: 0,
          payment_status: "paid",
        })
        .select("id")
        .single();

      if (lessonErr) throw lessonErr;

      // 2. Compute skill scores and save evaluations
      const scores = computeSkillScores(markedFaults);
      await saveEvaluations(lesson.id, selectedStudentId, user.id, scores);

      // 3. Invalidate caches
      queryClient.invalidateQueries({ queryKey: ["student-skills", selectedStudentId] });
      queryClient.invalidateQueries({ queryKey: ["student-growth", selectedStudentId] });
      queryClient.invalidateQueries({ queryKey: ["student-lessons", selectedStudentId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      setSaved(true);
      toast.success(`Avaliação de ${selectedStudentName} salva! Radar atualizado 🚀`);
    } catch (err: any) {
      toast.error(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const resetSimulado = () => {
    setMarkedFaults([]);
    setTimerSeconds(0);
    setTimerRunning(false);
    setShowVerdict(false);
    setSaved(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const timerProgress = Math.min((timerSeconds / 300) * 100, 100);

  return (
    <PageTransition>
      <div className="container py-6 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Simulado de Exame</h1>
        </div>

        {/* Student Selector */}
        <Card className="glass-card border-0">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Aluno Avaliado</p>
            </div>
            <StudentCombobox
              value={selectedStudentId}
              onSelect={(id, name) => {
                setSelectedStudentId(id);
                setSelectedStudentName(name);
              }}
            />
            {!selectedStudentId && (
              <p className="text-xs text-destructive">
                ⚠ Selecione um aluno para vincular a avaliação.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Timer Card */}
        <Card className="glass-card border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Cronômetro de Baliza</p>
                <p className={`text-4xl font-mono font-bold ${timerSeconds >= 240 ? "text-destructive" : timerSeconds >= 180 ? "text-accent" : "text-foreground"}`}>
                  {formatTime(timerSeconds)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                  Bip: 3min / 4min
                </Badge>
              </div>
            </div>
            <Progress value={timerProgress} className="h-2 mb-3" />
            <div className="flex gap-2">
              <Button
                onClick={() => setTimerRunning(!timerRunning)}
                variant={timerRunning ? "destructive" : "default"}
                className="flex-1 h-11"
              >
                {timerRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {timerRunning ? "Pausar" : "Iniciar"}
              </Button>
              <Button onClick={() => { setTimerSeconds(0); setTimerRunning(false); }} variant="outline" size="icon" className="h-11 w-11">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fault Score */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Faltas</p>
            <p className="text-2xl font-bold text-foreground">{markedFaults.length}</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Pontos</p>
            <p className={`text-2xl font-bold ${totalPoints >= 5 ? "text-destructive" : "text-foreground"}`}>{totalPoints}</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className={`text-sm font-bold ${hasEliminatoria || totalPoints >= 5 ? "text-destructive" : "text-success"}`}>
              {hasEliminatoria ? "ELIM." : totalPoints >= 5 ? "REPROV." : "OK"}
            </p>
          </div>
        </div>

        {/* Fault Catalog */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent" />
              Marcação de Faltas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(["eliminatoria", "grave", "media", "leve"] as const).map((cat) => (
              <div key={cat} className="space-y-1.5">
                <Badge className={`${categoryConfig[cat].color} border-0 text-xs`}>
                  {categoryConfig[cat].label} ({categoryConfig[cat].max})
                </Badge>
                {faultCatalog
                  .filter((f) => f.category === cat)
                  .map((fault) => {
                    const active = markedFaults.includes(fault.id);
                    return (
                      <button
                        key={fault.id}
                        onClick={() => toggleFault(fault.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                          active
                            ? "bg-destructive/10 border-destructive/30 text-foreground"
                            : "bg-card border-border/50 text-muted-foreground hover:border-border"
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{fault.label}</span>
                          {active && <XCircle className="w-4 h-4 text-destructive" />}
                        </span>
                      </button>
                    );
                  })}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Verdict & Save */}
        <AnimatePresence mode="wait">
          {!showVerdict ? (
            <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                onClick={() => setShowVerdict(true)}
                disabled={!selectedStudentId}
                className="w-full h-12 text-base font-semibold"
              >
                Gerar Veredito
              </Button>
            </motion.div>
          ) : (
            <motion.div key="verdict" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className={`border-2 ${getVerdict().pass ? "border-success bg-success/5" : "border-destructive bg-destructive/5"}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    {getVerdict().pass ? (
                      <CheckCircle2 className="w-8 h-8 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-8 h-8 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-lg font-bold ${getVerdict().pass ? "text-success" : "text-destructive"}`}>
                        {getVerdict().message}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">{getVerdict().suggestion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              {!saved ? (
                <Button
                  onClick={handleSaveEvaluation}
                  disabled={isSaving || !selectedStudentId}
                  className="w-full h-12 text-base font-semibold"
                >
                  {isSaving ? "Salvando..." : `Salvar Avaliação de ${selectedStudentName || "..."}`}
                </Button>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className="glass-card border-success/30 border">
                    <CardContent className="p-4 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Avaliação salva com sucesso!</p>
                        <p className="text-xs text-muted-foreground">Radar e timeline atualizados.</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Growth comparison after save */}
              {saved && growthData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <GrowthSummaryCard growth={growthData} />
                </motion.div>
              )}

              {/* Navigate to student profile */}
              {saved && selectedStudentId && (
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => navigate(`/prontuario/${selectedStudentId}`)}
                >
                  Ver Prontuário de {selectedStudentName}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Button onClick={resetSimulado} variant="outline" className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" /> Reiniciar Simulado
        </Button>
      </div>
    </PageTransition>
  );
}
