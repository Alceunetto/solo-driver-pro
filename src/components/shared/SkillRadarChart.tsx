import { motion } from "framer-motion";
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SkillMetric } from "@/types";

interface SkillRadarChartProps {
  skills: SkillMetric[];
  isEmpty: boolean;
}

export function SkillRadarChart({ skills, isEmpty }: SkillRadarChartProps) {
  const data = skills.map((s) => ({
    skill: s.name.split(" ")[0], // short label for axis
    fullName: s.name,
    value: s.average,
    fullMark: 100,
  }));

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
          <Radar
            name="Habilidades"
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
                  <p className="text-sm text-primary font-bold">{item.value}%</p>
                </div>
              );
            }}
          />
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
