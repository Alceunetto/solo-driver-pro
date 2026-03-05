import { SubscriptionPlan, PLAN_CONFIGS } from "@/types/solodrive";

export function canAddStudent(plan: SubscriptionPlan, currentCount: number): boolean {
  const config = PLAN_CONFIGS[plan];
  return currentCount < config.studentLimit;
}

export function getStudentLimit(plan: SubscriptionPlan): number {
  return PLAN_CONFIGS[plan].studentLimit;
}

export function isFeatureLocked(plan: SubscriptionPlan, feature: "financeiro" | "mapas" | "relatorios_vip"): boolean {
  if (plan === "free") return true;
  return false;
}
