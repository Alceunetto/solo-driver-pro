import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatsCardProps {
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
  label: string;
  value: string;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void;
  index?: number;
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
  index = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card
        className={`glass-card border-0 ${onClick ? "cursor-pointer hover:glow-primary active:scale-[0.97] transition-all" : ""} ${className}`}
        onClick={onClick}
      >
        <CardContent className="p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl ${iconBgClass}`}>
              <Icon className={`w-4 h-4 ${iconColorClass}`} />
            </div>
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{value}</p>
          {footer && <div>{footer}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
