import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

type ViewMode = "month" | "year";

interface AgendaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

async function fetchAgendaLessons(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("lessons")
    .select("id, student_name, date, start_time, end_time, type, status, meeting_location, price")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

const STATUS_COLORS: Record<string, string> = {
  agendada: "bg-primary/15 text-primary",
  em_andamento: "bg-warning/15 text-warning",
  concluida: "bg-success/15 text-success",
  cancelada: "bg-destructive/15 text-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  agendada: "Agendada",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const TYPE_LABELS: Record<string, string> = {
  pratica: "Prática",
  baliza: "Baliza",
  simulado: "Simulado",
  avaliacao: "Avaliação",
};

export function AgendaDialog({ open, onOpenChange }: AgendaDialogProps) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [refDate, setRefDate] = useState(new Date());

  const range = useMemo(() => {
    if (viewMode === "month") {
      return {
        start: format(startOfMonth(refDate), "yyyy-MM-dd"),
        end: format(endOfMonth(refDate), "yyyy-MM-dd"),
      };
    }
    return {
      start: format(startOfYear(refDate), "yyyy-MM-dd"),
      end: format(endOfYear(refDate), "yyyy-MM-dd"),
    };
  }, [refDate, viewMode]);

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["agenda-lessons", range.start, range.end],
    queryFn: () => fetchAgendaLessons(range.start, range.end),
    enabled: open,
  });

  // Group lessons by date
  const grouped = useMemo(() => {
    const map = new Map<string, typeof lessons>();
    lessons.forEach((l) => {
      const existing = map.get(l.date) ?? [];
      existing.push(l);
      map.set(l.date, existing);
    });
    return Array.from(map.entries());
  }, [lessons]);

  const navigate = (dir: number) => {
    const next = new Date(refDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() + dir);
    } else {
      next.setFullYear(next.getFullYear() + dir);
    }
    setRefDate(next);
  };

  const headerLabel = viewMode === "month"
    ? format(refDate, "MMMM yyyy", { locale: ptBR }).replace(/^./, (c) => c.toUpperCase())
    : format(refDate, "yyyy");

  const totalLessons = lessons.length;
  const totalRevenue = lessons.reduce((s, l) => s + Number(l.price ?? 0), 0);

  const content = (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold text-foreground min-w-[120px] text-center">{headerLabel}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setViewMode("month")}
          >
            Mês
          </Button>
          <Button
            variant={viewMode === "year" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setViewMode("year")}
          >
            Ano
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span>{totalLessons} aulas</span>
        <span>·</span>
        <span>R$ {totalRevenue.toFixed(2)}</span>
      </div>

      {/* Lessons list */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma aula neste período</p>
        </div>
      ) : (
        grouped.map(([date, dayLessons]) => {
          const dateObj = new Date(date + "T00:00:00");
          const dayLabel = format(dateObj, "EEEE, d 'de' MMMM", { locale: ptBR });

          return (
            <div key={date} className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}
              </p>
              {dayLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/20"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground truncate">{lesson.student_name}</span>
                      <Badge variant="outline" className={`text-[9px] border-0 ${STATUS_COLORS[lesson.status] ?? ""}`}>
                        {STATUS_LABELS[lesson.status] ?? lesson.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lesson.start_time?.slice(0, 5)} – {lesson.end_time?.slice(0, 5)} · {TYPE_LABELS[lesson.type] ?? lesson.type}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-success shrink-0 ml-2">
                    R$ {Number(lesson.price ?? 0).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader className="px-0">
            <DrawerTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Agenda Completa
            </DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Agenda Completa
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
