import { useMemo, useRef, useEffect, useCallback } from "react";
import { format, addDays, isSameDay, isToday as checkIsToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CalendarStripProps {
  selected: Date;
  onChange: (date: Date) => void;
}

const DAYS_RANGE = 60;

export function CalendarStrip({ selected, onChange }: CalendarStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const today = useMemo(() => new Date(), []);

  const days = useMemo(() => {
    const start = addDays(today, -7);
    return Array.from({ length: DAYS_RANGE + 7 }, (_, i) => addDays(start, i));
  }, [today]);

  // Auto-scroll to selected date on mount & when selected changes
  useEffect(() => {
    const target = selectedRef.current;
    if (target && scrollRef.current) {
      const container = scrollRef.current;
      const scrollLeft = target.offsetLeft - container.offsetWidth / 2 + target.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [selected]);

  // Initial scroll to today on mount
  useEffect(() => {
    const target = todayRef.current ?? selectedRef.current;
    if (target && scrollRef.current) {
      const container = scrollRef.current;
      const scrollLeft = target.offsetLeft - container.offsetWidth / 2 + target.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "instant" });
    }
  }, []);

  const scrollToToday = useCallback(() => {
    onChange(today);
  }, [today, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {format(selected, "MMMM yyyy", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())}
        </span>
        <button
          type="button"
          onClick={scrollToToday}
          className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors px-2 py-0.5 rounded-md hover:bg-primary/10"
        >
          Hoje
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-1 -mx-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {days.map((day, i) => {
          const isSelected = isSameDay(day, selected);
          const isToday = checkIsToday(day);
          const dayLabel = format(day, "EEEEE", { locale: ptBR }).toUpperCase();
          const dayNum = format(day, "d");

          return (
            <button
              key={i}
              ref={(el) => {
                if (isSelected) (selectedRef as any).current = el;
                if (isToday) (todayRef as any).current = el;
              }}
              type="button"
              onClick={() => onChange(day)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-xl transition-all min-w-[46px] min-h-[56px] snap-center shrink-0",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                  : isToday
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "text-muted-foreground hover:bg-muted active:scale-95"
              )}
            >
              <span className="text-[11px] font-semibold tracking-wide">{dayLabel}</span>
              <span className={cn("text-base font-bold", isSelected && "text-primary-foreground")}>
                {dayNum}
              </span>
              {isToday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
