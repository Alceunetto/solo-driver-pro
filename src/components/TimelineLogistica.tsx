import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Lesson } from "@/types/solodrive";
import { LessonCard } from "./shared/LessonCard";
import { DisplacementGapCard } from "./shared/DisplacementGapCard";
import { AddLessonDialog } from "./shared/AddLessonDialog";
import { AgendaDialog } from "./shared/AgendaDialog";
import { CalendarStrip } from "./shared/CalendarStrip";
import { calculateGaps, openInWaze, openInGoogleMaps } from "@/lib/schedule";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

function toIsoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

async function fetchTimelineLessons(date: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("id, student_name, start_time, end_time, meeting_location, end_location, meeting_address, type, status, price")
    .eq("date", date)
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

interface TimelineLogisticaProps {
  externalDialogOpen?: boolean;
  onExternalDialogClose?: () => void;
}

export function TimelineLogistica({ externalDialogOpen, onExternalDialogClose }: TimelineLogisticaProps = {}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [gapMinutes, setGapMinutes] = useState(15);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agendaOpen, setAgendaOpen] = useState(false);

  useEffect(() => {
    if (externalDialogOpen) {
      setDialogOpen(true);
    }
  }, [externalDialogOpen]);
  const [newLessonId, setNewLessonId] = useState<string | null>(null);
  const newLessonRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const isoDate = toIsoDate(selectedDate);

  const { data: lessons = [] } = useQuery({
    queryKey: ["timeline-lessons", isoDate],
    queryFn: () => fetchTimelineLessons(isoDate),
  });

  const createLesson = useMutation({
    mutationFn: async (lesson: Omit<Lesson, "id"> & { studentId?: string; date?: string; repeatWeekly?: boolean }) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const lessonDate = lesson.date || isoDate;
      const dates = [lessonDate];

      // If repeat weekly, create for 4 weeks
      if (lesson.repeatWeekly) {
        const base = new Date(lessonDate + "T00:00:00");
        for (let w = 1; w <= 3; w++) {
          const next = new Date(base);
          next.setDate(next.getDate() + 7 * w);
          dates.push(format(next, "yyyy-MM-dd"));
        }
      }

      const rows = dates.map((d) => ({
        instructor_id: user.id,
        student_id: lesson.studentId ?? null,
        student_name: lesson.studentName,
        date: d,
        start_time: lesson.startTime,
        end_time: lesson.endTime,
        meeting_location: lesson.meetingLocation,
        end_location: lesson.endLocation,
        meeting_address: lesson.meetingAddress,
        type: lesson.type,
        status: lesson.status,
        price: lesson.value,
      }));

      const { data, error } = await supabase.from("lessons").insert(rows).select("id");
      if (error) throw error;

      return { count: dates.length, date: lessonDate, firstId: data?.[0]?.id ?? null };
    },
    onSuccess: (result) => {
      // Auto-navigate to the lesson date
      if (result.date) {
        setSelectedDate(new Date(result.date + "T00:00:00"));
      }
      setNewLessonId(result.firstId);
      queryClient.invalidateQueries({ queryKey: ["timeline-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["next-lessons"] });
      setDialogOpen(false);
      toast({
        title: result.count > 1 ? `${result.count} aulas criadas` : "Aula criada",
        description: result.count > 1 ? "Aulas recorrentes adicionadas por 4 semanas." : "A aula já está na timeline.",
      });
      // Clear highlight after 3s
      setTimeout(() => setNewLessonId(null), 3000);
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar aula", description: error.message, variant: "destructive" });
    },
  });

  const sorted = useMemo(
    () => [...lessons].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [lessons]
  );
  const gaps = useMemo(() => calculateGaps(sorted, gapMinutes), [sorted, gapMinutes]);

  // Scroll to new lesson when it appears
  useEffect(() => {
    if (newLessonId && newLessonRef.current) {
      newLessonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [newLessonId, sorted]);

  const totalValue = sorted.reduce((sum, l) => sum + l.value, 0);
  const hasConflicts = gaps.some((g) => g.hasConflict);

  const formattedHeader = format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedHeader = formattedHeader.charAt(0).toUpperCase() + formattedHeader.slice(1);

  return (
    <div className="space-y-4">
      {/* Date Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{capitalizedHeader}</h2>
            <p className="text-xs text-muted-foreground">
              {sorted.length} aulas · R$ {totalValue.toFixed(2)}
              {hasConflicts && (
                <span className="text-destructive ml-1 font-medium">· ⚠️ Conflitos</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={gapMinutes}
              onChange={(e) => setGapMinutes(Number(e.target.value))}
              className="bg-secondary text-secondary-foreground rounded-lg px-2 py-1 text-xs border border-border"
            >
              <option value={10}>10m</option>
              <option value={15}>15m</option>
              <option value={20}>20m</option>
              <option value={30}>30m</option>
            </select>

            <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5 h-8">
              <Plus className="w-3.5 h-3.5" />
              Nova
            </Button>
          </div>
        </div>

        {/* Calendar Strip */}
        <CalendarStrip selected={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {sorted.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma aula neste dia. Adicione uma aula!</p>
          </div>
        )}

        {sorted.map((lesson) => {
          const gap = gaps.find((g) => g.fromLesson.id === lesson.id);
          const isNew = lesson.id === newLessonId;
          return (
            <div key={lesson.id} ref={isNew ? newLessonRef : undefined}>
              <LessonCard lesson={lesson} onOpenWaze={openInWaze} onOpenMaps={openInGoogleMaps} isNew={isNew} />
              {gap && <DisplacementGapCard gap={gap} />}
            </div>
          );
        })}
      </div>

      <AddLessonDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open && onExternalDialogClose) onExternalDialogClose();
        }}
        onAdd={(lesson) => createLesson.mutate(lesson)}
        defaultDate={selectedDate}
        isSubmitting={createLesson.isPending}
      />
    </div>
  );
}
