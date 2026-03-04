import { Lesson, DisplacementGap } from "@/types/solodrive";

export function calculateGaps(lessons: Lesson[], gapMinutes: number = 15): DisplacementGap[] {
  if (lessons.length < 2) return [];

  const sorted = [...lessons].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const gaps: DisplacementGap[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const currentEnd = timeToMinutes(current.endTime);
    const nextStart = timeToMinutes(next.startTime);
    const available = nextStart - currentEnd;

    gaps.push({
      fromLesson: current,
      toLesson: next,
      estimatedMinutes: gapMinutes,
      hasConflict: available < gapMinutes,
    });
  }

  return gaps;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function openInWaze(address: string) {
  const encoded = encodeURIComponent(address);
  window.open(`https://waze.com/ul?q=${encoded}&navigate=yes`, "_blank");
}

export function openInGoogleMaps(address: string) {
  const encoded = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, "_blank");
}

export function getLessonTypeLabel(type: Lesson["type"]): string {
  const labels: Record<Lesson["type"], string> = {
    pratica: "Aula Prática",
    baliza: "Baliza",
    simulado: "Simulado",
    avaliacao: "Avaliação",
  };
  return labels[type];
}

export function getLessonStatusLabel(status: Lesson["status"]): string {
  const labels: Record<Lesson["status"], string> = {
    agendada: "Agendada",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
  };
  return labels[status];
}
