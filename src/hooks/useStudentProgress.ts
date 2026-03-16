import { useQuery } from "@tanstack/react-query";
import { getStudentSkillMetrics } from "@/services/evaluationService";

export function useStudentProgress(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student-skills", studentId],
    queryFn: () => getStudentSkillMetrics(studentId!),
    enabled: !!studentId,
  });
}
