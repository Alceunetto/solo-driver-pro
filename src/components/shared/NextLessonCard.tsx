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
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{student}</span>
          <Badge variant="secondary" className="text-[10px]">{time}</Badge>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
        >
          <MapPin className="w-3 h-3" /> {location}
        </a>
      </div>
      <Button size="sm" variant="outline" className="gap-1 shrink-0 text-xs" onClick={onStart}>
        <Play className="w-3 h-3" /> Iniciar
      </Button>
    </div>
  );
}
