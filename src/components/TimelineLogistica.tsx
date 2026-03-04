import { useState } from "react";
import { Lesson } from "@/types/solodrive";
import { LessonCard } from "./LessonCard";
import { DisplacementGapCard } from "./DisplacementGapCard";
import { AddLessonDialog } from "./AddLessonDialog";
import { calculateGaps, openInWaze, openInGoogleMaps } from "@/lib/schedule";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_LESSONS: Lesson[] = [
  {
    id: "1",
    studentName: "Carlos Silva",
    startTime: "08:00",
    endTime: "09:00",
    meetingLocation: "Casa do aluno - Rua das Flores, 120",
    endLocation: "Metrô Jabaquara",
    meetingAddress: "Rua das Flores, 120, São Paulo, SP",
    type: "pratica",
    status: "agendada",
    value: 120,
  },
  {
    id: "2",
    studentName: "Ana Oliveira",
    startTime: "09:30",
    endTime: "10:30",
    meetingLocation: "Estação Conceição",
    endLocation: "Detran - Campo de Baliza",
    meetingAddress: "Estação Conceição, São Paulo, SP",
    type: "baliza",
    status: "agendada",
    value: 140,
  },
];

export function TimelineLogistica() {
  const [lessons, setLessons] = useState<Lesson[]>(DEMO_LESSONS);
  const [gapMinutes, setGapMinutes] = useState(15);
  const [dialogOpen, setDialogOpen] = useState(false);

  const sorted = [...lessons].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const gaps = calculateGaps(lessons, gapMinutes);

  const addLesson = (lesson: Omit<Lesson, "id">) => {
    setLessons((prev) => [...prev, { ...lesson, id: crypto.randomUUID() }]);
  };

  const totalValue = lessons.reduce((sum, l) => sum + l.value, 0);
  const hasConflicts = gaps.some((g) => g.hasConflict);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Timeline do Dia</h2>
            <p className="text-sm text-muted-foreground">
              {sorted.length} aulas · R$ {totalValue.toFixed(2)} previstos
              {hasConflicts && (
                <span className="text-destructive ml-2 font-medium">· ⚠️ Conflitos detectados</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <label className="text-muted-foreground">Gap:</label>
            <select
              value={gapMinutes}
              onChange={(e) => setGapMinutes(Number(e.target.value))}
              className="bg-secondary text-secondary-foreground rounded-lg px-2 py-1 text-sm border border-border"
            >
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
            </select>
          </div>

          <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Nova Aula
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {sorted.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma aula agendada. Adicione sua primeira aula!</p>
          </div>
        )}

        {sorted.map((lesson, index) => {
          const gap = gaps.find((g) => g.fromLesson.id === lesson.id);
          return (
            <div key={lesson.id}>
              <LessonCard
                lesson={lesson}
                onOpenWaze={openInWaze}
                onOpenMaps={openInGoogleMaps}
              />
              {gap && <DisplacementGapCard gap={gap} />}
            </div>
          );
        })}
      </div>

      <AddLessonDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={addLesson} />
    </div>
  );
}
