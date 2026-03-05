import { supabase, isSupabaseConnected } from "@/lib/supabase";
import type { Student } from "@/types";

// ── Mock data (used while Supabase is not connected) ──
const MOCK_STUDENTS: Student[] = [
  { id: "1", instructor_id: "i1", name: "Carlos Silva", whatsapp: "11999990001", progress: 75, total_lessons: 12, completed_lessons: 8, paid: true, status: "active", created_at: new Date().toISOString() },
  { id: "2", instructor_id: "i1", name: "Ana Oliveira", whatsapp: "11999990002", progress: 45, total_lessons: 10, completed_lessons: 4, paid: false, status: "active", created_at: new Date().toISOString() },
  { id: "3", instructor_id: "i1", name: "Pedro Santos", whatsapp: "11999990003", progress: 90, total_lessons: 20, completed_lessons: 18, paid: true, status: "active", created_at: new Date().toISOString() },
];

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    if (!isSupabaseConnected()) return MOCK_STUDENTS;

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },

  getById: async (id: string): Promise<Student> => {
    if (!isSupabaseConnected()) {
      const student = MOCK_STUDENTS.find((s) => s.id === id);
      if (!student) throw new Error("Student not found");
      return student;
    }

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (student: Partial<Student>): Promise<Student> => {
    if (!isSupabaseConnected()) {
      const newStudent: Student = {
        id: crypto.randomUUID(),
        instructor_id: "i1",
        name: student.name ?? "",
        whatsapp: student.whatsapp ?? "",
        progress: 0,
        total_lessons: 0,
        completed_lessons: 0,
        paid: false,
        status: "active",
        created_at: new Date().toISOString(),
        ...student,
      };
      MOCK_STUDENTS.push(newStudent);
      return newStudent;
    }

    const { data, error } = await supabase
      .from("students")
      .insert(student)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Student>): Promise<Student> => {
    if (!isSupabaseConnected()) {
      const index = MOCK_STUDENTS.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("Student not found");
      Object.assign(MOCK_STUDENTS[index], updates);
      return MOCK_STUDENTS[index];
    }

    const { data, error } = await supabase
      .from("students")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    if (!isSupabaseConnected()) {
      const index = MOCK_STUDENTS.findIndex((s) => s.id === id);
      if (index !== -1) MOCK_STUDENTS.splice(index, 1);
      return;
    }

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  count: async (): Promise<number> => {
    if (!isSupabaseConnected()) return MOCK_STUDENTS.length;

    const { count, error } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  },
};
