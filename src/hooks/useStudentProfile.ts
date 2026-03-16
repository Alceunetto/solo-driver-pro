import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/services/studentService";

export function useStudentProfile(studentId: string | undefined) {
  const studentQuery = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => studentService.getById(studentId!),
    enabled: !!studentId,
  });

  const lessonsQuery = useQuery({
    queryKey: ["student-lessons", studentId],
    queryFn: () => studentService.getStudentLessons(studentId!),
    enabled: !!studentId,
  });

  return {
    student: studentQuery.data,
    lessons: lessonsQuery.data ?? [],
    isLoading: studentQuery.isLoading || lessonsQuery.isLoading,
    error: studentQuery.error || lessonsQuery.error,
  };
}
