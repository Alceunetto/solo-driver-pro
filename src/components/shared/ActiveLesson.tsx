import { useState, useEffect, useCallback, useRef } from "react";
import {
  Timer, Square, CheckCircle2, AlertTriangle, User, MapPin, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// DETRAN maneuver checklist
const DETRAN_CHECKLIST = [
  { id: "cinto", label: "Cinto de segurança e espelhos" },
  { id: "partida", label: "Partida e saída correta" },
  { id: "seta", label: "Uso correto de setas" },
  { id: "retrovisores", label: "Verificação de retrovisores" },
  { id: "embreagem", label: "Controle de embreagem" },
  { id: "faixa", label: "Manutenção de faixa" },
  { id: "velocidade", label: "Controle de velocidade" },
  { id: "parada", label: "Parada em aclive/declive" },
  { id: "conversao", label: "Conversões (esq/dir)" },
  { id: "retorno", label: "Retorno / inversão de marcha" },
  { id: "baliza", label: "Baliza (estacionamento)" },
  { id: "pedestre", label: "Respeito ao pedestre" },
  { id: "sinalizacao", label: "Obediência à sinalização" },
  { id: "rotatoria", label: "Rotatória" },
  { id: "ultrapassagem", label: "Ultrapassagem segura" },
];

interface ActiveLessonProps {
  lesson: {
    id: string;
    studentName: string;
    startTime: string;
    endTime: string;
    meetingLocation: string;
    type: string;
    value: number;
  };
  onFinish: (checkedItems: string[], elapsedSeconds: number) => void;
  onCancel: () => void;
}

export function ActiveLesson({ lesson, onFinish, onCancel }: ActiveLessonProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const startTimeRef = useRef(Date.now());
  const { toast } = useToast();

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate remaining time based on lesson end time
  const endMinutes = (() => {
    const [h, m] = lesson.endTime.split(":").map(Number);
    return h * 60 + m;
  })();
  const startMinutes = (() => {
    const [h, m] = lesson.startTime.split(":").map(Number);
    return h * 60 + m;
  })();
  const totalDurationMinutes = endMinutes - startMinutes;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingMinutes = Math.max(0, totalDurationMinutes - elapsedMinutes);
  const isOvertime = remainingMinutes === 0 && elapsedMinutes > totalDurationMinutes;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleItem = useCallback((id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const progress = (checkedItems.size / DETRAN_CHECKLIST.length) * 100;

  const handleFinish = () => {
    if (!confirmFinish) {
      setConfirmFinish(true);
      return;
    }
    onFinish(Array.from(checkedItems), elapsedSeconds);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-background flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10">
            <Timer className="w-5 h-5 text-accent" />
          </div>
          <span className="text-sm font-bold text-foreground">Aula em Curso</span>
        </div>
        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
          {lesson.type === "pratica" ? "Prática" : lesson.type === "baliza" ? "Baliza" : lesson.type}
        </Badge>
      </div>

      {/* Timer Section */}
      <div className="bg-card/50 border-b border-border px-4 py-5 text-center">
        <div className={`text-5xl font-mono font-bold tracking-tight ${isOvertime ? "text-destructive" : "text-foreground"}`}>
          {formatTime(elapsedSeconds)}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          {isOvertime ? (
            <div className="flex items-center gap-1 text-xs text-destructive font-medium">
              <AlertTriangle className="w-3 h-3" />
              Tempo excedido!
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              {remainingMinutes} min restantes
            </span>
          )}
        </div>
      </div>

      {/* Student Info */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{lesson.studentName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {lesson.meetingLocation}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {lesson.startTime} – {lesson.endTime}
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-foreground">Checklist Pedagógico</span>
          <span className="text-xs text-muted-foreground">
            {checkedItems.size}/{DETRAN_CHECKLIST.length}
          </span>
        </div>
        <Progress value={progress} className="h-2 mb-3" />

        <div className="space-y-1">
          {DETRAN_CHECKLIST.map((item) => {
            const isChecked = checkedItems.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  isChecked
                    ? "bg-success/10 border border-success/30"
                    : "bg-muted/40 border border-transparent hover:border-border"
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="pointer-events-none"
                />
                <span className={`text-sm ${isChecked ? "text-success font-medium" : "text-foreground"}`}>
                  {item.label}
                </span>
                {isChecked && <CheckCircle2 className="w-4 h-4 text-success ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card p-4 space-y-2 pb-safe">
        {confirmFinish ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-3 space-y-3">
              <p className="text-sm text-foreground font-medium text-center">
                Finalizar aula com {checkedItems.size} de {DETRAN_CHECKLIST.length} itens marcados?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setConfirmFinish(false)}>
                  Voltar
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={handleFinish}
                >
                  <Square className="w-4 h-4" />
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="destructive"
            className="w-full gap-2 h-12 text-base"
            onClick={handleFinish}
          >
            <Square className="w-5 h-5" />
            Finalizar Aula
          </Button>
        )}
      </div>
    </div>
  );
}
