import { useMemo } from "react";
import { MonthlyFinancials, WeeklyDataPoint, SubscriptionPlan } from "@/types/solodrive";
import {
  calculateNetProfit,
  calculateHourlyRate,
  calculateRevenueGrowth,
  calculateIndependentGain,
  calculateCostPerLesson,
  calculateKmToOilChange,
} from "@/services/financials";
import { canAddStudent, getStudentLimit } from "@/services/planGuard";
import { useStudents } from "@/hooks/useStudents";

// ── Mock data (will be replaced by TanStack Query fetches) ──

const WEEKLY_DATA: WeeklyDataPoint[] = [
  { day: "Seg", receita: 480, despesa: 65 },
  { day: "Ter", receita: 360, despesa: 52 },
  { day: "Qua", receita: 600, despesa: 78 },
  { day: "Qui", receita: 240, despesa: 40 },
  { day: "Sex", receita: 480, despesa: 55 },
  { day: "Sáb", receita: 720, despesa: 90 },
  { day: "Dom", receita: 0, despesa: 0 },
];

const MOCK_MONTH: MonthlyFinancials = {
  revenue: 8640,
  prevRevenue: 7500,
  fuel: 680,
  maintenance: 350,
  taxes: 420,
  hours: 72,
  kmPerLesson: 12.5,
  currentKm: 48200,
  oilChangeKm: 50000,
  autoescolaEquiv: 5400,
};

const NEXT_LESSONS = [
  { student: "Carlos Silva", time: "08:00", location: "Rua das Flores, 120", address: "Rua das Flores, 120, São Paulo" },
  { student: "Ana Oliveira", time: "09:30", location: "Estação Conceição", address: "Estação Conceição, São Paulo" },
  { student: "Pedro Santos", time: "11:00", location: "Detran - Campo de Baliza", address: "Detran Santo Amaro, São Paulo" },
];

export function useDashboardData(userPlan: SubscriptionPlan = "free") {
  const { students, isLoading: studentsLoading } = useStudents();
  const month = MOCK_MONTH;
  const weeklyData = WEEKLY_DATA;
  const nextLessons = NEXT_LESSONS;

  const computed = useMemo(() => {
    const { totalCosts, netProfit } = calculateNetProfit(month);
    const hourlyRate = calculateHourlyRate(netProfit, month.hours);
    const revenueGrowth = calculateRevenueGrowth(month.revenue, month.prevRevenue);
    const independentGain = calculateIndependentGain(netProfit, month.autoescolaEquiv);
    const costPerLesson = calculateCostPerLesson(month.fuel, month.hours);
    const kmToOil = calculateKmToOilChange(month.oilChangeKm, month.currentKm);
    const studentLimit = getStudentLimit(userPlan);
    const canAdd = canAddStudent(userPlan, students.length);

    return {
      totalCosts,
      netProfit,
      hourlyRate,
      revenueGrowth,
      independentGain,
      costPerLesson,
      kmToOil,
      studentLimit,
      canAdd,
    };
  }, [month, userPlan, students.length]);

  return {
    students,
    month,
    weeklyData,
    nextLessons,
    ...computed,
    isLoading: studentsLoading,
    error: null,
  };
}
