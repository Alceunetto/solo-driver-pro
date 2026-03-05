import { supabase } from "@/lib/supabase";
import type { Student } from "@/types";

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data ?? []) as unknown as Student[];
  },

  getById: async (id: string): Promise<Student> => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as unknown as Student;
  },

  create: async (student: Partial<Student>): Promise<Student> => {
    const { data, error } = await supabase
      .from("students")
      .insert(student as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as Student;
  },

  update: async (id: string, updates: Partial<Student>): Promise<Student> => {
    const { data, error } = await supabase
      .from("students")
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as Student;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  count: async (): Promise<number> => {
    const { count, error } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  },
};
