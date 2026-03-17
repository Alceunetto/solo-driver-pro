import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lesson } from "@/types/solodrive";
import { LessonCard } from "./shared/LessonCard";
import { DisplacementGapCard } from "./shared/DisplacementGapCard";
import { AddLessonDialog } from "./shared/AddLessonDialog";
import { calculateGaps, openInWaze, openInGoogleMaps } from "@/lib/schedule";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

function getTodayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

async function fetchTimelineLessons(): Promise<Lesson[]> {
  const today = getTodayIsoDate();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, student_name, start_time, end_time, meeting_location, end_location, meeting_address, type, status, price")
    .eq("date", today)
    .in("status", ["agendada", "em_andamento"])
    .order("start_time", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((lesson) => ({
    id: lesson.id,
    studentName: lesson.student_name,
    startTime: lesson.start_time?.slice(0, 5) ?? "00:00",
    endTime: lesson.end_time?.slice(0, 5) ?? "00:00",
    meetingLocation: lesson.meeting_location,
    endLocation: lesson.end_location,
    meetingAddress: lesson.meeting_address,
    type: lesson.type as Lesson["type"],
    status: lesson.status as Lesson["status"],
    value: Number(lesson.price ?? 0),
  }));
}

export function TimelineLogistica() {
  const [gapMinutes, setGapMinutes] = useState(15);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: lessons = [] } = useQuery({
    queryKey: ["timeline-lessons"],
    queryFn: fetchTimelineLessons,
  });

  const createLesson = useMutation({
    mutationFn: async (lesson: Omit<Lesson, "id"> & { studentId?: string }) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const { error } = await supabase.from("lessons").insert({
        instructor_id: user.id,
        student_id: lesson.studentId ?? null,
        student_name: lesson.studentName,
        date: getTodayIsoDate(),
        start_time: lesson.startTime,
        end_time: lesson.endTime,
        meeting_location: lesson.meetingLocation,
        end_location: lesson.endLocation,
        meeting_address: lesson.meetingAddress,
        type: lesson.type,
        status: lesson.status,
        price: lesson.value,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["next-lessons"] });
      setDialogOpen(false);
      toast({ title: "Aula criada", description: "A aula já está em Próximas Aulas." });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar aula",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sorted = useMemo(
    () => [...lessons].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [lessons]
  );
  const gaps = useMemo(() => calculateGaps(sorted, gapMinutes), [sorted, gapMinutes]);

  const totalValue = sorted.reduce((sum, l) => sum + l.value, 0);
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

        {sorted.map((lesson) => {
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

      <AddLessonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={(lesson) => createLesson.mutate(lesson)}
      />
    </div>
  );
}
