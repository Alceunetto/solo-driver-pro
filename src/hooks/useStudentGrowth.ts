import { useQuery } from "@tanstack/react-query";
import { getStudentGrowthMetrics } from "@/services/evaluationService";

export function useStudentGrowth(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student-growth", studentId],
    queryFn: () => getStudentGrowthMetrics(studentId!),
    enabled: !!studentId,
  });
}
