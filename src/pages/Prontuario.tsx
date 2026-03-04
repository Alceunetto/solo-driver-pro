import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Share2, TrendingUp, Star, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PerformanceReport } from "@/components/PerformanceReport";

interface Skill {
  id: string;
  name: string;
  value: number;
  previousValue: number;
}

interface TimelineEntry {
  id: string;
  date: string;
  note: string;
  type: "aula" | "marco" | "foto";
}

const initialSkills: Skill[] = [
  { id: "embreagem", name: "Controle de Embreagem", value: 45, previousValue: 30 },
  { id: "baliza", name: "Baliza / Estacionamento", value: 60, previousValue: 50 },
  { id: "defensiva", name: "Direção Defensiva", value: 70, previousValue: 65 },
  { id: "espelhamento", name: "Uso de Espelhos", value: 55, previousValue: 40 },
  { id: "conversao", name: "Conversões", value: 40, previousValue: 35 },
  { id: "sinalizacao", name: "Sinalização e Faixa", value: 80, previousValue: 75 },
];

const mockTimeline: TimelineEntry[] = [
  { id: "1", date: "04/03/2026", note: "Primeira aula prática - controle de embreagem", type: "aula" },
  { id: "2", date: "06/03/2026", note: "Conseguiu fazer baliza sem auxílio! 🎉", type: "marco" },
  { id: "3", date: "08/03/2026", note: "Foto da baliza perfeita", type: "foto" },
  { id: "4", date: "10/03/2026", note: "Direção em via movimentada - excelente", type: "aula" },
];

export default function Prontuario() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [selectedStudent] = useState("Maria Silva");
  const [reportOpen, setReportOpen] = useState(false);
  const { toast } = useToast();

  const averageProgress = Math.round(
    skills.reduce((sum, s) => sum + s.value, 0) / skills.length
  );

  const totalEvolution = Math.round(
    skills.reduce((sum, s) => sum + (s.value - s.previousValue), 0) / skills.length
  );

  const handleSkillChange = (id: string, newValue: number[]) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value: newValue[0] } : s))
    );
  };

  const generateReport = () => {
    setReportOpen(true);
  };

  const getSkillColor = (value: number) => {
    if (value >= 75) return "text-success";
    if (value >= 50) return "text-accent";
    return "text-destructive";
  };

  const getEvolutionBadge = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 0) return <Badge className="bg-success/20 text-success border-0 text-xs">+{diff}%</Badge>;
    if (diff < 0) return <Badge className="bg-destructive/20 text-destructive border-0 text-xs">{diff}%</Badge>;
    return <Badge className="bg-muted text-muted-foreground border-0 text-xs">0%</Badge>;
  };

  return (
    <div className="container py-6 pb-24 space-y-6">
      {/* Student Header */}
      <div className="glass-card p-5 flex items-center gap-4">
        <Avatar className="w-16 h-16 border-2 border-primary/30">
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">MS</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{selectedStudent}</h2>
          <p className="text-sm text-muted-foreground">12 aulas realizadas · 8 restantes</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-primary/15 text-primary border-0">Categoria B</Badge>
            <Badge className="bg-success/15 text-success border-0">Ativo</Badge>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">Progresso Geral</p>
          <p className={`text-3xl font-bold ${getSkillColor(averageProgress)}`}>{averageProgress}%</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">Evolução Sessão</p>
          <p className="text-3xl font-bold text-success">+{totalEvolution}%</p>
        </div>
      </div>

      {/* Skills Checklist */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-accent" />
            Checklist de Habilidades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {skills.map((skill) => (
            <div key={skill.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{skill.name}</span>
                <div className="flex items-center gap-2">
                  {getEvolutionBadge(skill.value, skill.previousValue)}
                  <span className={`text-sm font-bold ${getSkillColor(skill.value)}`}>
                    {skill.value}%
                  </span>
                </div>
              </div>
              <Slider
                value={[skill.value]}
                onValueChange={(v) => handleSkillChange(skill.id, v)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Linha do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {mockTimeline.map((entry, i) => (
              <div key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full mt-1 ${
                      entry.type === "marco"
                        ? "bg-accent"
                        : entry.type === "foto"
                        ? "bg-primary"
                        : "bg-muted-foreground/40"
                    }`}
                  />
                  {i < mockTimeline.length - 1 && (
                    <div className="w-px h-full bg-border min-h-[2rem]" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                  <p className="text-sm text-foreground">{entry.note}</p>
                  {entry.type === "foto" && (
                    <button className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
                      <Camera className="w-3 h-3" /> Ver foto
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Report Button */}
      <Button
        onClick={generateReport}
        className="w-full h-12 text-base font-semibold bg-success hover:bg-success/90 text-success-foreground"
      >
        <Share2 className="w-5 h-5 mr-2" />
        Gerar Relatório de Evolução
      </Button>

      {/* Report Modal */}
      <PerformanceReport
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        data={{
          studentName: selectedStudent,
          instructorName: "Instrutor Marcelo",
          date: new Date().toLocaleDateString("pt-BR"),
          duration: 50,
          km: 15,
          phone: "(11) 99999-9999",
          skills: skills.map((s) => ({ name: s.name, value: s.value })),
          averageProgress,
          evolution: totalEvolution,
          lessonValue: 140,
        }}
      />
    </div>
  );
}
