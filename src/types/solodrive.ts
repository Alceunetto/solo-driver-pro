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

export interface PerformanceMetrics {
  hourlyRate: number;
  totalRevenue: number;
  totalCosts: number;
  totalHours: number;
  profitOdometer: number;
  fuelCost: number;
}
