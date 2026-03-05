import { Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyFinancials } from "@/types/solodrive";

interface CostBreakdownProps {
  month: MonthlyFinancials;
  totalCosts: number;
}

const COST_ITEMS = (m: MonthlyFinancials) => [
  { label: "Combustível", value: m.fuel, color: "bg-warning" },
  { label: "Manutenção", value: m.maintenance, color: "bg-accent" },
  { label: "Taxas 2026", value: m.taxes, color: "bg-destructive" },
];

export function CostBreakdown({ month, totalCosts }: CostBreakdownProps) {
  return (
    <Card className="border-success/20 animate-in slide-in-from-top-2 duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Wrench className="w-4 h-4 text-muted-foreground" />
          Detalhamento de Custos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 pb-4">
        {COST_ITEMS(month).map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              R$ {item.value.toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
        <div className="border-t border-border pt-2 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Total Custos</span>
          <span className="text-sm font-bold text-destructive">
            R$ {totalCosts.toLocaleString("pt-BR")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
