import { CheckCircle2, XCircle, Clock, FileText } from "lucide-react";

interface LessonTimelineProps {
  lessons: Array<{
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    type: string;
    student_name: string;
    meeting_location?: string;
  }>;
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  concluida: { icon: CheckCircle2, color: "text-success", label: "Concluída" },
  cancelada: { icon: XCircle, color: "text-destructive", label: "Cancelada" },
  agendada: { icon: Clock, color: "text-accent", label: "Agendada" },
  em_andamento: { icon: Clock, color: "text-primary", label: "Em andamento" },
};

const TYPE_LABELS: Record<string, string> = {
  pratica: "Prática",
  baliza: "Baliza",
  simulado: "Simulado",
  avaliacao: "Avaliação",
};

export function LessonTimeline({ lessons }: LessonTimelineProps) {
  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <div className="p-4 rounded-full bg-primary/10">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Pronto para a primeira aula? 🚀</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Nenhuma aula registrada ainda. Agende a primeira aula para começar o acompanhamento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {lessons.map((lesson, i) => {
        const config = STATUS_CONFIG[lesson.status] ?? STATUS_CONFIG.agendada;
        const Icon = config.icon;
        const formattedDate = new Date(lesson.date + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        });

        return (
          <div key={lesson.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`mt-0.5 ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              {i < lessons.length - 1 && (
                <div className="w-px flex-1 bg-border min-h-[2rem]" />
              )}
            </div>
            <div className="pb-4 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                  {formattedDate} · {lesson.start_time?.slice(0, 5)} – {lesson.end_time?.slice(0, 5)}
                </p>
                <span className={`text-[10px] font-semibold ${config.color}`}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-foreground mt-0.5">
                {TYPE_LABELS[lesson.type] ?? lesson.type}
              </p>
              {lesson.meeting_location && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  📍 {lesson.meeting_location}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
