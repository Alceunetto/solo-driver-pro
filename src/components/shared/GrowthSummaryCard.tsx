import { motion } from "framer-motion";
import { TrendingUp, Trophy, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GrowthMetrics } from "@/services/evaluationService";

interface GrowthSummaryCardProps {
  growth: GrowthMetrics;
}

export function GrowthSummaryCard({ growth }: GrowthSummaryCardProps) {
  const { overallEvolution, topImproved, criticalFocus, hasMultipleEvaluations } = growth;

  if (!hasMultipleEvaluations) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-5 text-center space-y-2">
          <TrendingUp className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Evolução aparecerá aqui</p>
          <p className="text-xs text-muted-foreground">
            Complete mais aulas para comparar com a avaliação inicial.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Análise de Evolução
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {/* Overall */}
          <motion.div
            className="rounded-xl bg-primary/10 p-3 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              Evolução Geral
            </p>
            <p className={`text-2xl font-bold mt-1 ${overallEvolution >= 0 ? "text-success" : "text-destructive"}`}>
              {overallEvolution > 0 ? "+" : ""}
              {overallEvolution}%
            </p>
          </motion.div>

          {/* Top improved */}
          <motion.div
            className="rounded-xl bg-success/10 p-3 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              Maior Avanço
            </p>
            {topImproved ? (
              <>
                <Trophy className="w-4 h-4 mx-auto mt-1 text-success" />
                <p className="text-xs font-semibold text-foreground mt-1 truncate">
                  {topImproved.name.split(" ")[0]}
                </p>
                <p className="text-xs text-success font-bold">+{topImproved.growthPercent}%</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">—</p>
            )}
          </motion.div>

          {/* Critical focus */}
          <motion.div
            className="rounded-xl bg-destructive/10 p-3 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              Foco Crítico
            </p>
            {criticalFocus ? (
              <>
                <AlertTriangle className="w-4 h-4 mx-auto mt-1 text-destructive" />
                <p className="text-xs font-semibold text-foreground mt-1 truncate">
                  {criticalFocus.name.split(" ")[0]}
                </p>
                <p className="text-xs text-destructive font-bold">{criticalFocus.current}%</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">—</p>
            )}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
