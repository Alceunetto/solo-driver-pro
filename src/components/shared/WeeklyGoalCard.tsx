import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface WeeklyGoalCardProps {
  completedLessons: number;
  goalLessons?: number;
}

export function WeeklyGoalCard({ completedLessons, goalLessons = 20 }: WeeklyGoalCardProps) {
  const pct = Math.min(Math.round((completedLessons / goalLessons) * 100), 100);

  const message =
    pct >= 100
      ? "Meta atingida! 🏆"
      : pct >= 75
        ? "Quase lá! Continue assim! 🔥"
        : pct >= 50
          ? "Bom ritmo! Continue assim! 💪"
          : "Vamos acelerar esta semana! 🚀";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass-card border-0 p-3.5 flex items-center gap-3"
    >
      <div className="p-2 rounded-xl bg-accent/10 shrink-0">
        <Target className="w-4 h-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Meta Semanal</span>
          <span className="text-xs font-bold text-accent">{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" />
        <p className="text-[10px] text-muted-foreground font-medium truncate">
          {completedLessons}/{goalLessons} aulas · {message}
        </p>
      </div>
    </motion.div>
  );
}
