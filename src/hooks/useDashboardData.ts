import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { supabase } from "@/integrations/supabase/client";

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

export interface NextLesson {
  id: string;
  student: string;
  studentId: string | null;
  time: string;
  endTime: string;
  location: string;
  address: string;
  price: number;
  phone: string;
}

async function fetchNextLessons(): Promise<NextLesson[]> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("lessons")
    .select("id, student_name, student_id, start_time, end_time, meeting_location, meeting_address, date, price")
    .gte("date", today)
    .eq("status", "agendada")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(5);

  if (error) throw error;

  const lessons = data ?? [];

  // Fetch student phones for linked students
  const studentIds = [...new Set(lessons.map((l) => l.student_id).filter(Boolean))] as string[];
  let phonesMap: Record<string, string> = {};
  if (studentIds.length > 0) {
    const { data: students } = await supabase
      .from("students")
      .select("id, whatsapp")
      .in("id", studentIds);
    (students ?? []).forEach((s) => {
      phonesMap[s.id] = s.whatsapp ?? "";
    });
  }

  return lessons.map((l) => ({
    id: l.id,
    student: l.student_name,
    studentId: l.student_id,
    time: l.start_time?.substring(0, 5) ?? "",
    endTime: l.end_time?.substring(0, 5) ?? "",
    location: l.meeting_location,
    address: l.meeting_address,
    price: Number(l.price ?? 0),
    phone: l.student_id ? (phonesMap[l.student_id] ?? "") : "",
  }));
}

export function useDashboardData(userPlan: SubscriptionPlan = "free") {
  const { students, isLoading: studentsLoading } = useStudents();
  const month = MOCK_MONTH;
  const weeklyData = WEEKLY_DATA;

  const { data: nextLessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ["next-lessons"],
    queryFn: fetchNextLessons,
  });

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
    isLoading: studentsLoading || lessonsLoading,
    error: null,
  };
}
