import { supabase } from "@/lib/supabase";

export const lessonService = {
  startLesson: async (lessonId: string) => {
    const { data, error } = await supabase
      .from("lessons")
      .update({ status: "em_andamento" })
      .eq("id", lessonId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  finishLesson: async (lessonId: string) => {
    const { data, error } = await supabase
      .from("lessons")
      .update({ status: "concluida" })
      .eq("id", lessonId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getTodayLessons: async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("date", today)
      .order("start_time");
    if (error) throw error;
    return data ?? [];
  },

  getActiveLesson: async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("status", "em_andamento")
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
