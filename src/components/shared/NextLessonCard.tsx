import { motion } from "framer-motion";
import { MapPin, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { triggerHaptic } from "./FloatingActionButton";

interface NextLessonCardProps {
  student: string;
  time: string;
  location: string;
  address: string;
  onStart?: () => void;
}

export function NextLessonCard({ student, time, location, address, onStart }: NextLessonCardProps) {
  return (
    <motion.div
      className="flex flex-col gap-2.5 p-4 rounded-2xl bg-muted/40 border border-border/30 hover:border-primary/30 transition-all"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base font-bold text-foreground truncate">{student}</span>
          <Badge variant="secondary" className="text-[10px] shrink-0 bg-primary/10 text-primary border-0 font-semibold">
            {time}
          </Badge>
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
      <Button
        size="sm"
        className="w-full gap-2 text-sm font-semibold h-11 rounded-xl bg-primary hover:bg-primary/90 fab-shadow"
        onClick={() => {
          triggerHaptic(20);
          onStart?.();
        }}
      >
        <Play className="w-4 h-4" /> Iniciar Aula
      </Button>
    </motion.div>
  );
}
