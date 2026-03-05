import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "@/services/financeService";
import type { Expense } from "@/types/finance";
import { toast } from "sonner";

export const FINANCE_QUERY_KEY = "finance-summary";
export const EXPENSES_QUERY_KEY = "expenses";

export function useFinance(month: number, year: number) {
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: [FINANCE_QUERY_KEY, month, year],
    queryFn: () => financeService.getSummary(month, year),
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  const expensesQuery = useQuery({
    queryKey: [EXPENSES_QUERY_KEY, month, year],
    queryFn: () => financeService.getExpenses(month, year),
    staleTime: 1000 * 60 * 5,
  });

  const addExpense = useMutation({
    mutationFn: (expense: Omit<Expense, "id" | "created_at">) =>
      financeService.addExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FINANCE_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Despesa registrada!");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteExpense = useMutation({
    mutationFn: (id: string) => financeService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FINANCE_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Despesa removida.");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  return {
    summary: summaryQuery.data ?? null,
    expenses: expensesQuery.data ?? [],
    isLoading: summaryQuery.isLoading,
    error: summaryQuery.error,
    addExpense: addExpense.mutate,
    deleteExpense: deleteExpense.mutate,
    isAdding: addExpense.isPending,
  };
}
