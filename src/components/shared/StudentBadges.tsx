import { Badge } from "@/components/ui/badge";
import type { GamificationBadge } from "@/types";

interface BadgeConfig {
  type: GamificationBadge["type"];
  label: string;
  description: string;
  icon: string;
  condition: (ctx: BadgeContext) => boolean;
}

interface BadgeContext {
  completedLessons: number;
  progress: number;
  status: string;
  skills?: Record<string, number>;
}

const BADGE_CONFIGS: BadgeConfig[] = [
  {
    type: "primeiro_percurso",
    label: "Primeiro Percurso",
    description: "Completou a primeira aula prática",
    icon: "🏁",
    condition: (ctx) => ctx.completedLessons >= 1,
  },
  {
    type: "aula_10",
    label: "Dedicação Total",
    description: "Completou 10 aulas",
    icon: "🔥",
    condition: (ctx) => ctx.completedLessons >= 10,
  },
  {
    type: "baliza_expert",
    label: "Rei da Baliza",
    description: "Média de baliza acima de 90%",
    icon: "🅿️",
    condition: (ctx) => (ctx.skills?.["Baliza"] ?? 0) >= 90,
  },
  {
    type: "zero_infractions",
    label: "Zero Infrações",
    description: "Progresso acima de 80% sem cancelamentos",
    icon: "🛡️",
    condition: (ctx) => ctx.progress >= 80,
  },
  {
    type: "aprovado",
    label: "Aprovado!",
    description: "Concluiu todas as aulas com sucesso",
    icon: "🏆",
    condition: (ctx) => ctx.status === "completed",
  },
];

interface StudentBadgesProps {
  completedLessons: number;
  progress: number;
  status: string;
  skills?: Record<string, number>;
}

export function StudentBadges({ completedLessons, progress, status, skills }: StudentBadgesProps) {
  const ctx: BadgeContext = { completedLessons, progress, status, skills };
  const earned = BADGE_CONFIGS.filter((b) => b.condition(ctx));
  const locked = BADGE_CONFIGS.filter((b) => !b.condition(ctx));

  return (
    <div className="space-y-3">
      {earned.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conquistados</p>
          <div className="flex flex-wrap gap-2">
            {earned.map((b) => (
              <Badge
                key={b.type}
                className="bg-accent/15 text-accent border-0 text-sm px-3 py-1.5 gap-1.5"
                title={b.description}
              >
                <span>{b.icon}</span> {b.label}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {locked.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bloqueados</p>
          <div className="flex flex-wrap gap-2">
            {locked.map((b) => (
              <Badge
                key={b.type}
                className="bg-muted text-muted-foreground border-0 text-sm px-3 py-1.5 gap-1.5 opacity-50"
                title={b.description}
              >
                <span className="grayscale">🔒</span> {b.label}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
