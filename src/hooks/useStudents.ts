import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/services/studentService";
import type { Student } from "@/types";
import { toast } from "sonner";

export const STUDENTS_QUERY_KEY = ["students"] as const;

export function useStudents() {
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: STUDENTS_QUERY_KEY,
    queryFn: studentService.getAll,
  });

  const createStudent = useMutation({
    mutationFn: (student: Partial<Student>) => studentService.create(student),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Aluno adicionado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar aluno: ${error.message}`);
    },
  });

  const updateStudent = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Student> }) =>
      studentService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
      toast.success("Aluno atualizado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteStudent = useMutation({
    mutationFn: (id: string) => studentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Aluno removido.");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  return {
    students: studentsQuery.data ?? [],
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error,
    addStudent: createStudent.mutate,
    updateStudent: updateStudent.mutate,
    deleteStudent: deleteStudent.mutate,
    isAdding: createStudent.isPending,
  };
}
