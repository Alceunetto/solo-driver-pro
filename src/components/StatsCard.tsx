import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
  label: string;
  value: string;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function StatsCard({
  icon: Icon,
  iconColorClass = "text-primary",
  iconBgClass = "bg-primary/10",
  label,
  value,
  footer,
  className = "",
  onClick,
}: StatsCardProps) {
  return (
    <Card
      className={`border-border/50 ${onClick ? "cursor-pointer hover:border-primary/40 transition-colors" : ""} ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-1">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${iconBgClass}`}>
            <Icon className={`w-4 h-4 ${iconColorClass}`} />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {footer && <div>{footer}</div>}
      </CardContent>
    </Card>
  );
}
