// Supabase client placeholder
// Will be replaced with real client when Lovable Cloud is enabled.
// For now, services use mock data with this interface ready.

export const supabase = null as any;

// Helper to check if Supabase is connected
export const isSupabaseConnected = (): boolean => {
  return supabase !== null && typeof supabase?.from === "function";
};
