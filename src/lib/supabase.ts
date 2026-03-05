// Re-export the auto-generated Supabase client
export { supabase } from "@/integrations/supabase/client";

export const isSupabaseConnected = (): boolean => {
  return true; // Cloud is now connected
};
