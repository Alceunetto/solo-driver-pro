export interface Expense {
  id: string;
  instructor_id: string;
  category: "fuel" | "maintenance" | "tax" | "other";
  amount: number;
  date: string;
  description?: string | null;
  created_at: string;
}

export interface FinancialSummary {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  expense_breakdown: {
    fuel: number;
    maintenance: number;
    tax: number;
    other: number;
  };
  total_hours: number;
  hourly_rate: number;
  lesson_count: number;
}
