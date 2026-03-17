// ── Core Domain Types ──
// Central barrel export for all application types

export type SubscriptionPlan = "free" | "monthly" | "annual";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: "instructor" | "admin";
  plan: SubscriptionPlan;
  student_limit: number;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  instructor_id: string;
  name: string;
  whatsapp: string;
  email?: string;
  cpf?: string;
  category?: string;
  exam_date?: string;
  progress: number; // 0-100
  total_lessons: number;
  completed_lessons: number;
  paid: boolean;
  status: "active" | "completed" | "inactive";
  created_at: string;
}

export interface Vehicle {
  id: string;
  instructor_id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  current_km: number;
  oil_change_km: number;
  fuel_type: "gasolina" | "etanol" | "flex" | "diesel";
  avg_consumption: number; // km/l
  created_at: string;
}

export interface GamificationBadge {
  id: string;
  student_id: string;
  type: "baliza_expert" | "primeiro_percurso" | "zero_infractions" | "aula_10" | "aprovado";
  label: string;
  description: string;
  icon: string;
  earned_at: string;
}

// ── Lesson & Schedule ──

export interface Lesson {
  id: string;
  studentName: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  meetingLocation: string;
  endLocation: string;
  meetingAddress: string;
  type: "pratica" | "baliza" | "simulado" | "avaliacao";
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
  value: number; // R$
}

export interface DisplacementGap {
  fromLesson: Lesson;
  toLesson: Lesson;
  estimatedMinutes: number;
  hasConflict: boolean;
}

export interface DaySchedule {
  date: string;
  lessons: Lesson[];
  gaps: DisplacementGap[];
}

// ── Financial ──

export interface PerformanceMetrics {
  hourlyRate: number;
  totalRevenue: number;
  totalCosts: number;
  totalHours: number;
  profitOdometer: number;
  fuelCost: number;
}

// ── Skill Metrics ──

export const DETRAN_SKILLS = [
  "Controle de Embreagem",
  "Baliza",
  "Sinalização",
  "Frenagem",
  "Noção de Espaço",
  "Arrancada em Aclive",
] as const;

export type DetranSkillName = (typeof DETRAN_SKILLS)[number];

export interface SkillMetric {
  name: DetranSkillName;
  average: number; // 0-100
  lastScore: number | null; // most recent lesson score
  trend: "up" | "down" | "stable" | "none"; // comparing last to average
  totalEvaluations: number;
}

export interface SkillMetrics {
  skills: SkillMetric[];
  overallAverage: number;
  totalLessonsEvaluated: number;
}

export interface LessonEvaluation {
  id: string;
  lesson_id: string;
  student_id: string;
  instructor_id: string;
  skill_name: string;
  score: number;
  created_at: string;
}

export interface MonthlyFinancials {
  revenue: number;
  prevRevenue: number;
  fuel: number;
  maintenance: number;
  taxes: number;
  hours: number;
  kmPerLesson: number;
  currentKm: number;
  oilChangeKm: number;
  autoescolaEquiv: number;
}

export interface WeeklyDataPoint {
  day: string;
  receita: number;
  despesa: number;
}

// ── Plan Config ──

export interface PlanConfig {
  plan: SubscriptionPlan;
  studentLimit: number;
  features: string[];
  price: number;
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    plan: "free",
    studentLimit: 3,
    features: ["Até 3 alunos", "Relatórios básicos", "Timeline do dia"],
    price: 0,
  },
  monthly: {
    plan: "monthly",
    studentLimit: Infinity,
    features: ["Alunos ilimitados", "Gestão financeira", "Logística de mapas", "Relatórios VIP"],
    price: 49.9,
  },
  annual: {
    plan: "annual",
    studentLimit: Infinity,
    features: ["Tudo do Mensal", "Economia de 33%", "Suporte prioritário"],
    price: 39.9,
  },
};
