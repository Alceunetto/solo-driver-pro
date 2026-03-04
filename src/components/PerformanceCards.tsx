import { DollarSign, Clock, Fuel, TrendingUp } from "lucide-react";

interface PerformanceCardsProps {
  totalRevenue: number;
  totalCosts: number;
  totalHours: number;
  fuelCost: number;
}

export function PerformanceCards({ totalRevenue, totalCosts, totalHours, fuelCost }: PerformanceCardsProps) {
  const hourlyRate = totalHours > 0 ? (totalRevenue - totalCosts) / totalHours : 0;
  const profitOdometer = totalRevenue - fuelCost;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">Faturamento</span>
        </div>
        <p className="text-2xl font-bold text-foreground">R$ {totalRevenue.toFixed(0)}</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-success/10">
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">Valor/Hora</span>
        </div>
        <p className="text-2xl font-bold text-success">R$ {hourlyRate.toFixed(0)}</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <Fuel className="w-4 h-4 text-accent" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">Custo Combustível</span>
        </div>
        <p className="text-2xl font-bold text-accent">R$ {fuelCost.toFixed(0)}</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-success/10">
            <Clock className="w-4 h-4 text-success" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">Odômetro de Lucro</span>
        </div>
        <p className={`text-2xl font-bold ${profitOdometer >= 0 ? "text-success" : "text-destructive"}`}>
          R$ {profitOdometer.toFixed(0)}
        </p>
      </div>
    </div>
  );
}
