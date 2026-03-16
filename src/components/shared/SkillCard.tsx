import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SkillCardProps {
  name: string;
  value: number;
  icon?: string;
}

function getSkillColor(value: number) {
  if (value >= 75) return "text-success";
  if (value >= 50) return "text-accent";
  return "text-destructive";
}

export function SkillCard({ name, value, icon }: SkillCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {icon && <span className="mr-1.5">{icon}</span>}
            {name}
          </span>
          <span className={`text-sm font-bold ${getSkillColor(value)}`}>
            {value}%
          </span>
        </div>
        <Progress value={value} className="h-2" />
      </CardContent>
    </Card>
  );
}
