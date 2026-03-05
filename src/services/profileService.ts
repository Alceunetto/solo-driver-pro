import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

export const profileService = {
  getCurrent: async (): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return data as unknown as Profile;
  },

  update: async (updates: Partial<Profile>): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates as any)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as Profile;
  },
};
