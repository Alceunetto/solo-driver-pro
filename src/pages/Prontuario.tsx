import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, TrendingUp, Camera, Share2, BookOpen, Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { SkillRadarChart } from "@/components/shared/SkillRadarChart";
import { SkillCardAnimated } from "@/components/shared/SkillCardAnimated";
import { StudentBadges } from "@/components/shared/StudentBadges";
import { LessonTimeline } from "@/components/shared/LessonTimeline";
import { PerformanceReport } from "@/components/shared/PerformanceReport";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { useStudentProgress } from "@/hooks/useStudentProgress";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-success/15 text-success border-0" },
  completed: { label: "Concluído", className: "bg-primary/15 text-primary border-0" },
  inactive: { label: "Inativo", className: "bg-muted text-muted-foreground border-0" },
};

function ProfileSkeleton() {
  return (
    <div className="container py-6 pb-24 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="glass-card p-5 flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function Prontuario() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reportOpen, setReportOpen] = useState(false);

  // If no id in URL, show student picker or redirect
  const { student, lessons, isLoading: profileLoading } = useStudentProfile(id);
  const { data: metrics, isLoading: metricsLoading } = useStudentProgress(id);

  const isLoading = profileLoading || metricsLoading;

  if (!id) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
          <div className="container flex items-center gap-3 py-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Prontuário</h1>
          </div>
        </header>
        <div className="container py-12 text-center space-y-4">
          <p className="text-lg font-semibold text-foreground">Selecione um aluno</p>
          <p className="text-sm text-muted-foreground">
            Acesse o perfil de um aluno no dashboard para ver o prontuário detalhado.
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) return <ProfileSkeleton />;

  if (!student) {
    return (
      <div className="container py-12 text-center space-y-4">
        <p className="text-lg font-semibold text-foreground">Aluno não encontrado</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_LABELS[student.status] ?? STATUS_LABELS.active;
  const initials = student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const remaining = Math.max(0, student.total_lessons - student.completed_lessons);
  const skills = metrics?.skills ?? [];
  const overallAvg = metrics?.overallAverage ?? 0;
  const isEmpty = (metrics?.totalLessonsEvaluated ?? 0) === 0;

  const skillsMap: Record<string, number> = {};
  skills.forEach((s) => (skillsMap[s.name] = s.average));

  const reportSkills = skills.map((s) => ({ name: s.name, value: s.average }));

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex items-center gap-3 py-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Prontuário</h1>
        </div>
      </header>

      <main className="container py-5 space-y-6">
        {/* Profile Card */}
        <motion.div
          className="glass-card p-5 flex items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Avatar className="w-16 h-16 border-2 border-primary/30">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground truncate">{student.name}</h2>
            <p className="text-sm text-muted-foreground">
              {student.completed_lessons} aulas realizadas · {remaining} restantes
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className="bg-primary/15 text-primary border-0">Categoria B</Badge>
              <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
            </div>
          </div>
        </motion.div>

        {/* Overall Progress Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="glass-card p-4 text-center space-y-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p className="text-xs text-muted-foreground font-medium">Progresso Geral</p>
            <p className="text-3xl font-bold text-foreground">{student.progress}%</p>
            <Progress value={student.progress} className="h-2" />
          </motion.div>
          <motion.div
            className="glass-card p-4 text-center space-y-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <p className="text-xs text-muted-foreground font-medium">Média Habilidades</p>
            <p className="text-3xl font-bold text-primary">{overallAvg}%</p>
            <Progress value={overallAvg} className="h-2" />
          </motion.div>
        </div>

        {/* Radar Chart */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Star className="w-4 h-4 text-accent" />
              Radar de Competências DETRAN
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SkillRadarChart skills={skills} isEmpty={isEmpty} />
          </CardContent>
        </Card>

        {/* Skill Cards */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Habilidades Detalhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skills.map((skill, i) => (
                <SkillCardAnimated key={skill.name} skill={skill} index={i} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StudentBadges
              completedLessons={student.completed_lessons}
              progress={student.progress}
              status={student.status}
              skills={skillsMap}
            />
          </CardContent>
        </Card>

        {/* Lesson Timeline */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Histórico de Aulas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LessonTimeline lessons={lessons} />
          </CardContent>
        </Card>

        {/* Generate Report */}
        <Button
          onClick={() => setReportOpen(true)}
          className="w-full h-12 text-base font-semibold bg-success hover:bg-success/90 text-success-foreground"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Gerar Relatório de Evolução
        </Button>

        <PerformanceReport
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          data={{
            studentName: student.name,
            instructorName: "Instrutor",
            date: new Date().toLocaleDateString("pt-BR"),
            duration: 50,
            skills: reportSkills,
            averageProgress: overallAvg,
            evolution: 0,
            lessonValue: 140,
          }}
        />
      </main>
    </div>
  );
}
