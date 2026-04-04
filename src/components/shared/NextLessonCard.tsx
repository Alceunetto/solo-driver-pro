import { motion } from "framer-motion";
import { MapPin, Play, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { triggerHaptic } from "./FloatingActionButton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NextLessonCardProps {
  student: string;
  time: string;
  endTime?: string;
  date?: string;
  location: string;
  address: string;
  price?: number;
  status?: string;
  onStart?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  agendada: { label: "Agendada", class: "bg-primary/10 text-primary" },
  em_andamento: { label: "Em andamento", class: "bg-warning/10 text-warning" },
};

export function NextLessonCard({ student, time, endTime, date, location, address, price, status = "agendada", onStart }: NextLessonCardProps) {
  const isToday = date === new Date().toISOString().split("T")[0];
  const isInProgress = status === "em_andamento";

  const dateLabel = date
    ? isToday
      ? "Hoje"
      : format(new Date(date + "T00:00:00"), "EEE, d MMM", { locale: ptBR }).replace(/^./, (c) => c.toUpperCase())
    : "";

  return (
    <motion.div
      className="flex flex-col gap-2.5 p-4 rounded-2xl bg-muted/40 border border-border/30 hover:border-primary/30 transition-all"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base font-bold text-foreground truncate">{student}</span>
          <Badge variant="secondary" className={`text-[10px] shrink-0 border-0 font-semibold ${STATUS_CONFIG[status]?.class ?? "bg-primary/10 text-primary"}`}>
            {STATUS_CONFIG[status]?.label ?? status}
          </Badge>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0 ml-2"
        >
          <MapPin className="w-3 h-3" /> {location}
        </a>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {dateLabel && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {dateLabel}
          </span>
        )}
        <span className="font-semibold text-foreground">{time}{endTime ? ` – ${endTime}` : ""}</span>
        {price != null && price > 0 && (
          <span className="text-success font-semibold ml-auto">R$ {price.toFixed(0)}</span>
        )}
      </div>

      <Button
        size="sm"
        className={`w-full gap-2 text-sm font-semibold h-11 rounded-xl fab-shadow ${
          isInProgress
            ? "bg-warning hover:bg-warning/90"
            : "bg-primary hover:bg-primary/90"
        }`}
        onClick={() => {
          triggerHaptic(20);
          onStart?.();
        }}
      >
        <Play className="w-4 h-4" /> {isInProgress ? "Continuar Aula" : "Iniciar Aula"}
      </Button>
    </motion.div>
  );
}
