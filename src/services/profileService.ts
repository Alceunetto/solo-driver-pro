import { supabase, isSupabaseConnected } from "@/lib/supabase";
import type { Profile } from "@/types";

const MOCK_PROFILE: Profile = {
  id: "mock-instructor-1",
  full_name: "Instrutor Demo",
  role: "instructor",
  plan: "free",
  student_limit: 3,
  subscription_status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const profileService = {
  getCurrent: async (): Promise<Profile> => {
    if (!isSupabaseConnected()) return MOCK_PROFILE;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return data;
  },

  update: async (updates: Partial<Profile>): Promise<Profile> => {
    if (!isSupabaseConnected()) {
      Object.assign(MOCK_PROFILE, updates);
      return MOCK_PROFILE;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
