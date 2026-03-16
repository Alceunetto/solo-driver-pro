import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const PROFILE_QUERY_KEY = ["profile"] as const;

export interface ProfileData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  plan: string;
  student_limit: number;
  subscription_status: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async (): Promise<ProfileData> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data as unknown as ProfileData;
    },
    enabled: !!user,
  });

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
  };
}
