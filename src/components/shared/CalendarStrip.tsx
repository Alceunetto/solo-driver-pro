import { useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CalendarStripProps {
  selected: Date;
  onChange: (date: Date) => void;
}

const DAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function CalendarStrip({ selected, onChange }: CalendarStripProps) {
  const week = useMemo(() => {
    const start = startOfWeek(selected, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selected]);

  return (
    <div className="flex items-center justify-between gap-1 px-1">
      {week.map((day, i) => {
        const isSelected = isSameDay(day, selected);
        const isToday = isSameDay(day, new Date());
        const dayNum = format(day, "d");

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(day)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 px-2.5 rounded-xl transition-all min-w-[40px]",
              isSelected
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                : isToday
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              {DAY_LABELS[i]}
            </span>
            <span className={cn("text-sm font-bold", isSelected && "text-primary-foreground")}>
              {dayNum}
            </span>
          </button>
        );
      })}
    </div>
  );
}
