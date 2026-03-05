import { MonthlyFinancials } from "@/types/solodrive";

export function calculateNetProfit(month: MonthlyFinancials) {
  const totalCosts = month.fuel + month.maintenance + month.taxes;
  const netProfit = month.revenue - totalCosts;
  return { totalCosts, netProfit };
}

export function calculateHourlyRate(netProfit: number, hours: number) {
  return hours > 0 ? netProfit / hours : 0;
}

export function calculateRevenueGrowth(current: number, previous: number) {
  return previous > 0 ? ((current - previous) / previous) * 100 : 0;
}

export function calculateIndependentGain(netProfit: number, autoescolaEquiv: number) {
  return netProfit - autoescolaEquiv;
}

export function calculateCostPerLesson(fuelCost: number, hours: number) {
  return hours > 0 ? fuelCost / hours : 0;
}

export function calculateKmToOilChange(oilChangeKm: number, currentKm: number) {
  return oilChangeKm - currentKm;
}
