import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RotateCcw, Play, Pause, Volume2, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Fault {
  id: string;
  label: string;
  category: "leve" | "media" | "grave" | "eliminatoria";
  points: number;
}

const faultCatalog: Fault[] = [
  { id: "f1", label: "Não afivelar cinto", category: "eliminatoria", points: 0 },
  { id: "f2", label: "Avançar sinal vermelho", category: "eliminatoria", points: 0 },
  { id: "f3", label: "Exceder tempo de baliza", category: "eliminatoria", points: 0 },
  { id: "f4", label: "Não usar seta ao converter", category: "grave", points: 5 },
  { id: "f5", label: "Velocidade incompatível", category: "grave", points: 5 },
  { id: "f6", label: "Não observar espelhos", category: "media", points: 3 },
  { id: "f7", label: "Marcha inadequada", category: "media", points: 3 },
  { id: "f8", label: "Uso irregular da buzina", category: "leve", points: 1 },
  { id: "f9", label: "Posição incorreta no volante", category: "leve", points: 1 },
  { id: "f10", label: "Não verificar ponto cego", category: "media", points: 3 },
];

const categoryConfig = {
  leve: { label: "Leve", color: "bg-accent/20 text-accent", max: "1 pt" },
  media: { label: "Média", color: "bg-warning/20 text-warning", max: "3 pts" },
  grave: { label: "Grave", color: "bg-destructive/20 text-destructive", max: "5 pts" },
  eliminatoria: { label: "Eliminatória", color: "bg-destructive text-destructive-foreground", max: "Reprova" },
};

export default function Simulado() {
  const [markedFaults, setMarkedFaults] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showVerdict, setShowVerdict] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning]);

  // Beep at 3min and 4min
  useEffect(() => {
    if (timerSeconds === 180 || timerSeconds === 240) {
      playBeep(timerSeconds === 240 ? 800 : 600);
    }
  }, [timerSeconds]);

  const playBeep = (freq: number) => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.frequency.value = freq;
      osc.connect(ctx.destination);
      osc.start();
      setTimeout(() => { osc.stop(); ctx.close(); }, 300);
    } catch {}
  };

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

  const approved = !hasEliminatoria && totalPoints < 5;

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
      const worstCategories = markedFaults
        .map((id) => faultCatalog.find((f) => f.id === id))
        .filter((f) => f && f.category !== "leve")
        .map((f) => f!.label);
      return {
        pass: false,
        message: `Reprovado por acúmulo de faltas (${totalPoints} pontos).`,
        suggestion: `Este aluno precisa de mais 3 horas de treino em: ${worstCategories.join(", ")}.`,
      };
    }
    return {
      pass: true,
      message: "Aprovado! Excelente desempenho.",
      suggestion: "Aluno pronto para o exame oficial.",
    };
  };

  const resetSimulado = () => {
    setMarkedFaults([]);
    setTimerSeconds(0);
    setTimerRunning(false);
    setShowVerdict(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const timerProgress = Math.min((timerSeconds / 300) * 100, 100);

  return (
    <div className="container py-6 pb-24 space-y-6">
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
              className="flex-1"
            >
              {timerRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {timerRunning ? "Pausar" : "Iniciar"}
            </Button>
            <Button onClick={() => { setTimerSeconds(0); setTimerRunning(false); }} variant="outline" size="icon">
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
          <p className={`text-sm font-bold ${hasEliminatoria ? "text-destructive" : totalPoints >= 5 ? "text-destructive" : "text-success"}`}>
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

      {/* Verdict */}
      {!showVerdict ? (
        <Button onClick={() => setShowVerdict(true)} className="w-full h-12 text-base font-semibold">
          Gerar Veredito
        </Button>
      ) : (
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
      )}

      <Button onClick={resetSimulado} variant="outline" className="w-full">
        <RotateCcw className="w-4 h-4 mr-2" /> Reiniciar Simulado
      </Button>
    </div>
  );
}
