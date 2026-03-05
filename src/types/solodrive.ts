// ── Core Domain Types ──

export type SubscriptionPlan = "free" | "empreendedor" | "frota";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface Instructor {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  cnh?: string;
  cnhCategory?: string;
  cnhExpiry?: string;
  avatarUrl?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  studentLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  instructorId: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  progress: number; // 0-100
  totalLessons: number;
  completedLessons: number;
  paid: boolean;
  status: "ativo" | "inativo" | "formado";
  createdAt: string;
}

export interface Vehicle {
  id: string;
  instructorId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  currentKm: number;
  oilChangeKm: number;
  fuelType: "gasolina" | "etanol" | "flex" | "diesel";
  avgConsumption: number; // km/l
  createdAt: string;
}

export interface GamificationBadge {
  id: string;
  studentId: string;
  type: "baliza_expert" | "primeiro_percurso" | "zero_infractions" | "aula_10" | "aprovado";
  label: string;
  description: string;
  icon: string;
  earnedAt: string;
}

// ── Lesson & Schedule ──

export interface Lesson {
  id: string;
  studentName: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  meetingLocation: string;
  endLocation: string;
  meetingAddress: string; // full address for navigation
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

// ── UI / Plan ──

export interface PlanConfig {
  plan: SubscriptionPlan;
  studentLimit: number;
  features: string[];
  price: number; // monthly R$
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    plan: "free",
    studentLimit: 3,
    features: ["Até 3 alunos", "Relatórios básicos", "Timeline do dia"],
    price: 0,
  },
  empreendedor: {
    plan: "empreendedor",
    studentLimit: Infinity,
    features: ["Alunos ilimitados", "Gestão financeira", "Logística de mapas", "Relatórios VIP"],
    price: 39.9,
  },
  frota: {
    plan: "frota",
    studentLimit: Infinity,
    features: ["Tudo do Empreendedor", "Multi-veículo", "Equipe de instrutores", "API WhatsApp"],
    price: 79.9,
  },
};
