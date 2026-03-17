import { motion } from "framer-motion";
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { SkillMetric } from "@/types";
import type { GrowthSkill } from "@/services/evaluationService";

interface SkillRadarChartProps {
  skills: SkillMetric[];
  isEmpty: boolean;
  growthSkills?: GrowthSkill[];
}

export function SkillRadarChart({ skills, isEmpty, growthSkills }: SkillRadarChartProps) {
  const hasGrowth = growthSkills && growthSkills.some((g) => g.baseline !== g.current);

  const data = skills.map((s) => {
    const growth = growthSkills?.find((g) => g.name === s.name);
    return {
      skill: s.name.split(" ")[0],
      fullName: s.name,
      value: s.average,
      baseline: growth?.baseline ?? s.average,
      fullMark: 100,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickCount={5}
          />

          {/* Baseline layer – subtle dashed */}
          {hasGrowth && (
            <Radar
              name="Nível Inicial"
              dataKey="baseline"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.08}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          )}

          {/* Current layer – bold brand color */}
          <Radar
            name="Nível Atual"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.25}
            strokeWidth={2}
          />

          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null;
              const item = payload[0].payload;
              return (
                <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
                  <p className="text-xs font-semibold text-foreground">{item.fullName}</p>
                  <p className="text-sm text-primary font-bold">Atual: {item.value}%</p>
                  {hasGrowth && (
                    <p className="text-xs text-muted-foreground">Inicial: {item.baseline}%</p>
                  )}
                </div>
              );
            }}
          />

          {hasGrowth && (
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              iconSize={10}
              formatter={(value: string) => (
                <span className="text-muted-foreground text-xs">{value}</span>
              )}
            />
          )}
        </RechartsRadar>
      </ResponsiveContainer>

      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl bg-card/90 backdrop-blur-sm px-4 py-3 border border-border shadow-lg text-center">
            <p className="text-sm font-semibold text-foreground">Linha de Base</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete a primeira aula para ver os dados de desempenho.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
