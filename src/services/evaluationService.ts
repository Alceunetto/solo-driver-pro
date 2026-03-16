import { supabase } from "@/integrations/supabase/client";
import type { SkillMetrics, SkillMetric, DetranSkillName, DETRAN_SKILLS, LessonEvaluation } from "@/types";

const SKILL_LIST: readonly string[] = [
  "Controle de Embreagem",
  "Baliza / Estacionamento",
  "Direção Defensiva",
  "Sinalização e Faixa",
  "Uso de Espelhos",
  "Conversões e Manobras",
];

export async function getStudentSkillMetrics(studentId: string): Promise<SkillMetrics> {
  const { data, error } = await supabase
    .from("lesson_evaluations")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const evaluations = (data ?? []) as unknown as LessonEvaluation[];

  // Group by skill_name
  const grouped: Record<string, number[]> = {};
  SKILL_LIST.forEach((s) => (grouped[s] = []));
  evaluations.forEach((e) => {
    if (!grouped[e.skill_name]) grouped[e.skill_name] = [];
    grouped[e.skill_name].push(e.score);
  });

  const lessonIds = new Set(evaluations.map((e) => e.lesson_id));

  const skills: SkillMetric[] = SKILL_LIST.map((name) => {
    const scores = grouped[name] ?? [];
    const average = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const lastScore = scores.length > 0 ? scores[scores.length - 1] : null;

    let trend: SkillMetric["trend"] = "none";
    if (lastScore !== null && scores.length > 1) {
      const diff = lastScore - average;
      trend = diff > 3 ? "up" : diff < -3 ? "down" : "stable";
    }

    return {
      name: name as DetranSkillName,
      average,
      lastScore,
      trend,
      totalEvaluations: scores.length,
    };
  });

  const overallAverage =
    skills.length > 0
      ? Math.round(skills.reduce((s, sk) => s + sk.average, 0) / skills.length)
      : 0;

  return {
    skills,
    overallAverage,
    totalLessonsEvaluated: lessonIds.size,
  };
}

export async function saveEvaluations(
  lessonId: string,
  studentId: string,
  instructorId: string,
  scores: Record<string, number>
) {
  const rows = Object.entries(scores).map(([skill_name, score]) => ({
    lesson_id: lessonId,
    student_id: studentId,
    instructor_id: instructorId,
    skill_name,
    score,
  }));

  const { error } = await supabase.from("lesson_evaluations").insert(rows as any);
  if (error) throw error;
}
