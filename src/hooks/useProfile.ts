import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services/profileService";

export const PROFILE_QUERY_KEY = ["profile"] as const;

export function useProfile() {
  const profileQuery = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileService.getCurrent,
  });

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
  };
}
