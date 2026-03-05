import { EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { WeeklyDataPoint } from "@/types/solodrive";

interface WeeklyChartProps {
  data: WeeklyDataPoint[];
  visible: boolean;
}

export function WeeklyChart({ data, visible }: WeeklyChartProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-semibold">Faturamento vs Despesas (semana)</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {visible ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => `R$ ${v}`}
              />
              <Bar dataKey="receita" radius={[4, 4, 0, 0]} barSize={16}>
                {data.map((_, i) => (
                  <Cell key={i} fill="hsl(var(--success))" />
                ))}
              </Bar>
              <Bar dataKey="despesa" radius={[4, 4, 0, 0]} barSize={16}>
                {data.map((_, i) => (
                  <Cell key={i} fill="hsl(var(--destructive))" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
            <EyeOff className="w-4 h-4 mr-2" /> Valores ocultos
          </div>
        )}
      </CardContent>
    </Card>
  );
}
