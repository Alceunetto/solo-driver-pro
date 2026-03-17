import { MapPin, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NextLessonCardProps {
  student: string;
  time: string;
  location: string;
  address: string;
  onStart?: () => void;
}

export function NextLessonCard({ student, time, location, address, onStart }: NextLessonCardProps) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">{student}</span>
          <Badge variant="secondary" className="text-[10px] shrink-0">{time}</Badge>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0 ml-2"
        >
          <MapPin className="w-3 h-3" /> {location}
        </a>
      </div>
      <Button size="sm" className="w-full gap-1.5 text-xs" onClick={onStart}>
        <Play className="w-3.5 h-3.5" /> Iniciar Aula
      </Button>
    </div>
  );
}
