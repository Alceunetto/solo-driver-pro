import { supabase } from "@/lib/supabase";
import type { Expense, FinancialSummary } from "@/types/finance";

function getMonthRange(month: number, year: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
  return { start, end };
}

export const financeService = {
  getSummary: async (month: number, year: number): Promise<FinancialSummary> => {
    const { start, end } = getMonthRange(month, year);

    // Fetch paid lessons for revenue
    const { data: lessons, error: lError } = await supabase
      .from("lessons")
      .select("price, start_time, end_time")
      .eq("payment_status", "paid")
      .gte("date", start)
      .lte("date", end);

    if (lError) throw lError;

    // Fetch all expenses
    const { data: expenses, error: eError } = await supabase
      .from("expenses")
      .select("amount, category")
      .gte("date", start)
      .lte("date", end);

    if (eError) throw eError;

    const total_revenue = (lessons ?? []).reduce((sum, l) => sum + Number(l.price), 0);

    const breakdown = { fuel: 0, maintenance: 0, tax: 0, other: 0 };
    (expenses ?? []).forEach((e) => {
      const cat = e.category as keyof typeof breakdown;
      if (cat in breakdown) breakdown[cat] += Number(e.amount);
    });

    const total_expenses = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const net_profit = total_revenue - total_expenses;
    const profit_margin = total_revenue > 0 ? (net_profit / total_revenue) * 100 : 0;

    // Calculate hours from lessons
    let total_minutes = 0;
    (lessons ?? []).forEach((l) => {
      if (l.start_time && l.end_time) {
        const [sh, sm] = l.start_time.split(":").map(Number);
        const [eh, em] = l.end_time.split(":").map(Number);
        total_minutes += (eh * 60 + em) - (sh * 60 + sm);
      }
    });

    const total_hours = total_minutes / 60;
    const hourly_rate = total_hours > 0 ? net_profit / total_hours : 0;

    return {
      total_revenue,
      total_expenses,
      net_profit,
      profit_margin,
      expense_breakdown: breakdown,
      total_hours,
      hourly_rate,
      lesson_count: (lessons ?? []).length,
    };
  },

  getExpenses: async (month: number, year: number): Promise<Expense[]> => {
    const { start, end } = getMonthRange(month, year);

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Expense[];
  },

  addExpense: async (expense: Omit<Expense, "id" | "created_at">): Promise<Expense> => {
    const { data, error } = await supabase
      .from("expenses")
      .insert(expense)
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  },

  deleteExpense: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
