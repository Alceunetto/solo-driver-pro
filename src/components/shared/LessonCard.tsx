import { Lesson } from "@/types/solodrive";
import { getLessonTypeLabel, getLessonStatusLabel } from "@/lib/schedule";
import { Clock, MapPin, User, Navigation, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LessonCardProps {
  lesson: Lesson;
  onOpenWaze: (address: string) => void;
  onOpenMaps: (address: string) => void;
  isNew?: boolean;
}

const statusColors: Record<Lesson["status"], string> = {
  agendada: "bg-primary/15 text-primary border-primary/30",
  em_andamento: "bg-accent/15 text-accent border-accent/30",
  concluida: "bg-success/15 text-success border-success/30",
  cancelada: "bg-destructive/15 text-destructive border-destructive/30",
};

const typeColors: Record<Lesson["type"], string> = {
  pratica: "bg-primary/10 text-primary",
  baliza: "bg-accent/10 text-accent",
  simulado: "bg-success/10 text-success",
  avaliacao: "bg-destructive/10 text-destructive",
};

export function LessonCard({ lesson, onOpenWaze, onOpenMaps, isNew }: LessonCardProps) {
  return (
    <div className={`glass-card p-4 transition-all hover:shadow-xl hover:border-primary/30 group ${isNew ? "animate-pulse ring-2 ring-primary/50 ring-offset-2 ring-offset-background" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-lg font-bold text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            {lesson.startTime} - {lesson.endTime}
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[lesson.type]}`}>
            {getLessonTypeLabel(lesson.type)}
          </span>
          <Badge variant="outline" className={`text-xs ${statusColors[lesson.status]}`}>
            {getLessonStatusLabel(lesson.status)}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <User className="w-4 h-4 text-muted-foreground" />
        <span className="font-semibold text-foreground">{lesson.studentName}</span>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-success" />
          <span>Encontro: {lesson.meetingLocation}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-destructive" />
          <span>Término: {lesson.endLocation}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-success font-bold">
          <DollarSign className="w-4 h-4" />
          R$ {lesson.value.toFixed(2)}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onOpenWaze(lesson.meetingAddress)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            Waze
          </button>
          <button
            onClick={() => onOpenMaps(lesson.meetingAddress)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            Maps
          </button>
        </div>
      </div>
    </div>
  );
}
