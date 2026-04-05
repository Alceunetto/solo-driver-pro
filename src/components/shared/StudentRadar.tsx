import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Lock, Crown, Phone, MessageCircle, Filter } from "lucide-react";
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

type FilterType = "all" | "pending" | "paid";

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
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = students.filter((s) => {
    if (filter === "pending") return !s.paid;
    if (filter === "paid") return s.paid;
    return true;
  });

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 space-y-2">
        <div className="flex items-center justify-between">
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
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2">
          <Filter className="w-3 h-3 text-muted-foreground" />
          {(["all", "pending", "paid"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                filter === f
                  ? "bg-primary/15 text-primary"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {f === "all" ? "Todos" : f === "pending" ? "Pendentes" : "Pagos"}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-1 pb-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 cursor-pointer rounded-xl p-2.5 -mx-1 hover:bg-muted/50 transition-colors group"
            onClick={() => navigate(`/prontuario/${s.id}`)}
          >
            {/* Name + Badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">{s.name}</span>
                <Badge
                  variant={s.paid ? "default" : "destructive"}
                  className="text-[10px] px-1.5 py-0 shrink-0"
                >
                  {s.paid ? "Pago" : "Pendente"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Progress value={s.progress} className="h-1 flex-1" />
                <span className="text-[10px] text-muted-foreground shrink-0">{s.progress}%</span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
              <a
                href={`https://wa.me/55${s.whatsapp?.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-success/10 hover:bg-success/20 transition-colors active:scale-95"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-success" />
              </a>
              <a
                href={`tel:+55${s.whatsapp?.replace(/\D/g, "")}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors active:scale-95"
                title="Ligar"
              >
                <Phone className="w-4 h-4 text-primary" />
              </a>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum aluno {filter === "pending" ? "pendente" : filter === "paid" ? "pago" : ""} encontrado.
          </p>
        )}

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
