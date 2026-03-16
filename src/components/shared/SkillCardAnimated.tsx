import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SkillMetric } from "@/types";

interface SkillCardProps {
  skill: SkillMetric;
  index: number;
}

function getSkillColor(value: number) {
  if (value >= 75) return "text-success";
  if (value >= 50) return "text-accent";
  return "text-destructive";
}

function TrendIcon({ trend }: { trend: SkillMetric["trend"] }) {
  switch (trend) {
    case "up":
      return <ArrowUp className="w-3.5 h-3.5 text-success" />;
    case "down":
      return <ArrowDown className="w-3.5 h-3.5 text-destructive" />;
    case "stable":
      return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
    default:
      return null;
  }
}

export function SkillCardAnimated({ skill, index }: SkillCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground truncate pr-2">
              {skill.name}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <TrendIcon trend={skill.trend} />
              <span className={`text-sm font-bold ${getSkillColor(skill.average)}`}>
                {skill.average}%
              </span>
            </div>
          </div>
          <Progress value={skill.average} className="h-2" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{skill.totalEvaluations} avaliações</span>
            {skill.lastScore !== null && (
              <span>Última: {skill.lastScore}%</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
