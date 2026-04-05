import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, BookOpen, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SkillCard } from "@/components/shared/SkillCard";
import { LessonTimeline } from "@/components/shared/LessonTimeline";
import { StudentBadges } from "@/components/shared/StudentBadges";
import { useStudentProfile } from "@/hooks/useStudentProfile";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-success/15 text-success border-0" },
  completed: { label: "Concluído", className: "bg-primary/15 text-primary border-0" },
  inactive: { label: "Inativo", className: "bg-muted text-muted-foreground border-0" },
};

// Derive skill scores from completed lessons
function deriveSkills(lessons: any[]) {
  const completedCount = lessons.filter((l) => l.status === "concluida").length;
  const typeCount: Record<string, number> = {};
  lessons
    .filter((l) => l.status === "concluida")
    .forEach((l) => {
      typeCount[l.type] = (typeCount[l.type] || 0) + 1;
    });

  const total = Math.max(completedCount, 1);
  const skills: { name: string; value: number; icon: string }[] = [
    { name: "Controle de Embreagem", value: Math.min(100, Math.round((completedCount / 20) * 100)), icon: "🚗" },
    { name: "Baliza", value: Math.min(100, Math.round(((typeCount["baliza"] ?? 0) / 5) * 100)), icon: "🅿️" },
    { name: "Direção Defensiva", value: Math.min(100, Math.round((completedCount / 15) * 100)), icon: "🛡️" },
    { name: "Sinalização", value: Math.min(100, Math.round((completedCount / 12) * 100)), icon: "🚦" },
    { name: "Manobras", value: Math.min(100, Math.round((completedCount / 18) * 100)), icon: "🔄" },
    { name: "Percepção de Trânsito", value: Math.min(100, Math.round((completedCount / 16) * 100)), icon: "👁️" },
  ];

  return skills;
}

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
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { student, lessons, isLoading, error } = useStudentProfile(id);

  if (isLoading) return <ProfileSkeleton />;

  if (error || !student) {
    return (
      <div className="container py-12 text-center space-y-4">
        <p className="text-lg font-semibold text-foreground">Aluno não encontrado</p>
        <p className="text-sm text-muted-foreground">O registro pode ter sido removido ou o link é inválido.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_LABELS[student.status] ?? STATUS_LABELS.active;
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const remaining = Math.max(0, student.total_lessons - student.completed_lessons);
  const skills = deriveSkills(lessons);
  const avgSkill = skills.length > 0 ? Math.round(skills.reduce((s, sk) => s + sk.value, 0) / skills.length) : 0;
  const skillsMap: Record<string, number> = {};
  skills.forEach((s) => (skillsMap[s.name] = s.value));

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex items-center gap-3 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Perfil do Aluno</h1>
        </div>
      </header>

      <main className="container px-4 py-5 space-y-6 max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="glass-card p-5 flex items-center gap-4">
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
        </div>

        {/* Overall Progress */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 text-center space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Progresso Geral</p>
            <p className="text-3xl font-bold text-foreground">{student.progress}%</p>
            <Progress value={student.progress} className="h-2" />
          </div>
          <div className="glass-card p-4 text-center space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Média Habilidades</p>
            <p className="text-3xl font-bold text-primary">{avgSkill}%</p>
            <Progress value={avgSkill} className="h-2" />
          </div>
        </div>

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

        {/* Skills Grid */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Habilidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {skills.map((skill) => (
                <SkillCard key={skill.name} name={skill.name} value={skill.value} icon={skill.icon} />
              ))}
            </div>
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
      </main>
    </div>
  );
}
