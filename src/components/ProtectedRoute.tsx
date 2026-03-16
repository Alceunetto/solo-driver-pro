import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Route } from "lucide-react";

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
        <Route className="w-7 h-7 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">Carregando SoloDrive…</p>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const location = useLocation();

  // 1. Still loading auth
  if (authLoading) return <FullScreenLoader />;

  // 2. Not authenticated
  if (!user) return <Navigate to="/auth" replace />;

  // 3. Still loading profile
  if (profileLoading) return <FullScreenLoader />;

  // 4. Onboarding not completed → force to /onboarding
  const onboardingDone = profile?.onboarding_completed === true;
  const isOnboardingRoute = location.pathname === "/onboarding";

  if (!onboardingDone && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  // 5. Onboarding already done → prevent going back to /onboarding
  if (onboardingDone && isOnboardingRoute) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
