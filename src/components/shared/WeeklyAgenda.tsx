import { useMemo, useState, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Lesson } from "@/types/solodrive";
import { cn } from "@/lib/utils";
import { LessonDetailModal } from "./LessonDetailModal";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HOUR_START = 7;
const HOUR_END = 21;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const SLOT_HEIGHT = 60; // px per hour

interface WeekLesson extends Lesson {
  date: string;
  studentId?: string;
}

async function fetchWeekLessons(start: string, end: string): Promise<WeekLesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("id, student_name, student_id, start_time, end_time, meeting_location, end_location, meeting_address, type, status, price, date")
    .gte("date", start)
    .lte("date", end)
    .order("start_time", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((l) => ({
    id: l.id,
    studentName: l.student_name,
    studentId: l.student_id ?? undefined,
    startTime: l.start_time?.slice(0, 5) ?? "00:00",
    endTime: l.end_time?.slice(0, 5) ?? "00:00",
    meetingLocation: l.meeting_location,
    endLocation: l.end_location,
    meetingAddress: l.meeting_address,
    type: l.type as Lesson["type"],
    status: l.status as Lesson["status"],
    value: Number(l.price ?? 0),
    date: l.date,
  }));
}

function timeToOffset(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h - HOUR_START) * SLOT_HEIGHT + (m / 60) * SLOT_HEIGHT;
}

function durationPx(start: string, end: string): number {
  const s = timeToOffset(start);
  const e = timeToOffset(end);
  return Math.max(e - s, 24);
}

const statusColor: Record<string, string> = {
  agendada: "bg-primary/20 border-primary/40 text-primary",
  em_andamento: "bg-accent/20 border-accent/40 text-accent",
  concluida: "bg-muted/60 border-border text-muted-foreground",
  cancelada: "bg-destructive/15 border-destructive/30 text-destructive",
};

const TimeGrid = memo(function TimeGrid() {
  return (
    <div className="relative" style={{ height: HOURS.length * SLOT_HEIGHT }}>
      {HOURS.map((h) => (
        <div
          key={h}
          className="absolute left-0 right-0 border-t border-border/30"
          style={{ top: (h - HOUR_START) * SLOT_HEIGHT }}
        />
      ))}
    </div>
  );
});

export function WeeklyAgenda() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<WeekLesson | null>(null);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekStart = useMemo(() => startOfWeek(baseDate, { weekStartsOn: 0 }), [baseDate]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const startIso = format(days[0], "yyyy-MM-dd");
  const endIso = format(days[6], "yyyy-MM-dd");

  const { data: lessons = [] } = useQuery({
    queryKey: ["weekly-lessons", startIso, endIso],
    queryFn: () => fetchWeekLessons(startIso, endIso),
  });

  const lessonsByDay = useMemo(() => {
    const map: Record<string, WeekLesson[]> = {};
    days.forEach((d) => { map[format(d, "yyyy-MM-dd")] = []; });
    lessons.forEach((l) => {
      if (map[l.date]) map[l.date].push(l);
    });
    return map;
  }, [lessons, days]);

  const weekLabel = `${format(days[0], "dd MMM", { locale: ptBR })} – ${format(days[6], "dd MMM", { locale: ptBR })}`;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/10">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-foreground">Agenda Semanal</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((p) => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <button
            onClick={() => setWeekOffset(0)}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            {weekLabel}
          </button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((p) => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="glass-card p-0 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Day headers */}
          <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-border/40 sticky top-0 bg-background/90 backdrop-blur-sm z-10">
            <div />
            {days.map((d, i) => {
              const isToday = isSameDay(d, new Date());
              return (
                <div
                  key={i}
                  className={cn(
                    "text-center py-2 border-l border-border/20",
                    isToday && "bg-primary/5"
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {format(d, "EEE", { locale: ptBR })}
                  </p>
                  <p className={cn(
                    "text-sm font-bold",
                    isToday ? "text-primary" : "text-foreground"
                  )}>
                    {format(d, "d")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Time grid body */}
          <div className="grid grid-cols-[48px_repeat(7,1fr)]">
            {/* Hour labels */}
            <div className="relative" style={{ height: HOURS.length * SLOT_HEIGHT }}>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 flex items-start justify-end pr-2"
                  style={{ top: (h - HOUR_START) * SLOT_HEIGHT }}
                >
                  <span className="text-[10px] text-muted-foreground font-medium -mt-1.5">
                    {String(h).padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((d, i) => {
              const iso = format(d, "yyyy-MM-dd");
              const dayLessons = lessonsByDay[iso] ?? [];
              const isToday = isSameDay(d, new Date());

              return (
                <div
                  key={i}
                  className={cn(
                    "relative border-l border-border/20",
                    isToday && "bg-primary/[0.03]"
                  )}
                  style={{ height: HOURS.length * SLOT_HEIGHT }}
                >
                  <TimeGrid />

                  {dayLessons.map((lesson) => {
                    const top = Math.max(timeToOffset(lesson.startTime), 0);
                    const height = durationPx(lesson.startTime, lesson.endTime);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={cn(
                          "absolute left-0.5 right-0.5 rounded-lg border px-1.5 py-1 overflow-hidden text-left transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                          statusColor[lesson.status] ?? statusColor.agendada
                        )}
                        style={{ top, height, minHeight: 24 }}
                      >
                        <p className="text-[10px] font-bold truncate leading-tight">
                          {lesson.studentName}
                        </p>
                        {height > 30 && (
                          <p className="text-[9px] opacity-75 truncate">
                            {lesson.startTime}–{lesson.endTime}
                          </p>
                        )}
                      </button>
                    );
                  })}

                  {dayLessons.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-[9px] text-muted-foreground">Livre</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <LessonDetailModal
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
      />
    </div>
  );
}
