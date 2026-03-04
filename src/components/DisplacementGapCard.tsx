import { DisplacementGap } from "@/types/solodrive";
import { AlertTriangle, ArrowDown, Clock } from "lucide-react";

interface DisplacementGapCardProps {
  gap: DisplacementGap;
}

export function DisplacementGapCard({ gap }: DisplacementGapCardProps) {
  const fromEnd = gap.fromLesson.endTime;
  const toStart = gap.toLesson.startTime;

  return (
    <div className="flex items-center justify-center py-2">
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border ${
          gap.hasConflict
            ? "bg-destructive/10 border-destructive/30 text-destructive"
            : "bg-accent/10 border-accent/30 text-accent-foreground"
        }`}
      >
        <ArrowDown className="w-4 h-4" />
        {gap.hasConflict ? (
          <>
            <AlertTriangle className="w-4 h-4 animate-pulse-slow" />
            <span>⚠️ Conflito! Intervalo insuficiente ({fromEnd} → {toStart})</span>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4" />
            <span>Deslocamento: ~{gap.estimatedMinutes} min ({fromEnd} → {toStart})</span>
          </>
        )}
      </div>
    </div>
  );
}
