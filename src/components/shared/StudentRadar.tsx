import { useNavigate } from "react-router-dom";
import { Users, Plus, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Student, SubscriptionPlan } from "@/types/solodrive";

interface StudentRadarProps {
  students: Student[];
  userPlan: SubscriptionPlan;
  studentLimit: number;
  canAdd: boolean;
  onAddStudent: () => void;
  onUpgrade: () => void;
}

export function StudentRadar({
  students,
  userPlan,
  studentLimit,
  canAdd,
  onAddStudent,
  onUpgrade,
}: StudentRadarProps) {
  const isAtLimit = !canAdd;
  const navigate = useNavigate();

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Radar de Alunos
          {userPlan === "free" && (
            <Badge variant="secondary" className="text-[10px]">
              {students.length}/{studentLimit}
            </Badge>
          )}
        </CardTitle>
        <Button
          size="sm"
          className="gap-1 text-xs h-8"
          onClick={canAdd ? onAddStudent : onUpgrade}
        >
          <Plus className="w-3 h-3" /> Novo Aluno
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        {students.map((s) => (
          <div key={s.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{s.name}</span>
                <Badge
                  variant={s.paid ? "default" : "destructive"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {s.paid ? "Pago" : "Pendente"}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{s.progress}%</span>
            </div>
            <Progress value={s.progress} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground">{s.completed_lessons} aulas realizadas</p>
          </div>
        ))}

        {isAtLimit && (
          <button
            onClick={onUpgrade}
            className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex items-center gap-3 group"
          >
            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
              <Lock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Desbloqueie mais vagas
              </p>
              <p className="text-[10px] text-muted-foreground">
                Assine o Plano Empreendedor para alunos ilimitados
              </p>
            </div>
            <Crown className="w-4 h-4 text-accent ml-auto shrink-0" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}
