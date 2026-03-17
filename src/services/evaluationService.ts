import { supabase } from "@/integrations/supabase/client";
import type { SkillMetrics, SkillMetric, DetranSkillName, DETRAN_SKILLS, LessonEvaluation } from "@/types";

const SKILL_LIST: readonly string[] = [
  "Controle de Embreagem",
  "Baliza",
  "Sinalização",
  "Frenagem",
  "Noção de Espaço",
  "Arrancada em Aclive",
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

export interface GrowthSkill {
  name: string;
  baseline: number;
  current: number;
  growthPercent: number; // ((current - baseline) / baseline) * 100
}

export interface GrowthMetrics {
  skills: GrowthSkill[];
  overallEvolution: number;
  topImproved: GrowthSkill | null;
  criticalFocus: GrowthSkill | null;
  hasMultipleEvaluations: boolean;
}

export async function getStudentGrowthMetrics(studentId: string): Promise<GrowthMetrics> {
  const { data, error } = await supabase
    .from("lesson_evaluations")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const evaluations = (data ?? []) as unknown as LessonEvaluation[];

  // Group by skill, preserving order
  const grouped: Record<string, number[]> = {};
  SKILL_LIST.forEach((s) => (grouped[s] = []));
  evaluations.forEach((e) => {
    if (!grouped[e.skill_name]) grouped[e.skill_name] = [];
    grouped[e.skill_name].push(e.score);
  });

  // Determine unique lesson_ids to check if we have > 1 evaluation session
  const lessonIds = [...new Set(evaluations.map((e) => e.lesson_id))];
  const hasMultiple = lessonIds.length > 1;

  const skills: GrowthSkill[] = SKILL_LIST.map((name) => {
    const scores = grouped[name] ?? [];
    const baseline = scores.length > 0 ? scores[0] : 0;
    const current = scores.length > 0 ? scores[scores.length - 1] : 0;
    const growthPercent =
      baseline > 0 ? Math.round(((current - baseline) / baseline) * 100) : 0;

    return { name, baseline, current, growthPercent };
  });

  const overallEvolution =
    skills.length > 0
      ? Math.round(skills.reduce((s, sk) => s + sk.growthPercent, 0) / skills.length)
      : 0;

  const withGrowth = skills.filter((s) => s.baseline > 0);
  const topImproved =
    withGrowth.length > 0
      ? withGrowth.reduce((best, s) => (s.growthPercent > best.growthPercent ? s : best))
      : null;
  const criticalFocus =
    skills.length > 0
      ? skills.reduce((worst, s) => (s.current < worst.current ? s : worst))
      : null;

  return { skills, overallEvolution, topImproved, criticalFocus, hasMultipleEvaluations: hasMultiple };
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
