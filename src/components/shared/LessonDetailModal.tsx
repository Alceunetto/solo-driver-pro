import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lesson } from "@/types/solodrive";
import { getLessonTypeLabel, getLessonStatusLabel } from "@/lib/schedule";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Clock, MapPin, DollarSign, Play, User, Navigation,
} from "lucide-react";

interface LessonDetailModalProps {
  lesson: (Lesson & { date?: string; studentId?: string }) | null;
  onClose: () => void;
}

export function LessonDetailModal({ lesson, onClose }: LessonDetailModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (!lesson) return null;

  const canStart = lesson.status === "agendada";

  const handleStart = async () => {
    try {
      await supabase
        .from("lessons")
        .update({ status: "em_andamento" })
        .eq("id", lesson.id);

      queryClient.invalidateQueries({ queryKey: ["weekly-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["timeline-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["next-lessons"] });
      toast({ title: "Aula iniciada!", description: `Aula com ${lesson.studentName}` });
      onClose();
    } catch {
      toast({ title: "Erro ao iniciar aula", variant: "destructive" });
    }
  };

  const handleViewStudent = () => {
    if (lesson.studentId) {
      navigate(`/prontuario/${lesson.studentId}`);
      onClose();
    }
  };

  return (
    <Dialog open={!!lesson} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {lesson.studentName}
          </DialogTitle>
          <DialogDescription className="sr-only">Detalhes da aula</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {getLessonTypeLabel(lesson.type)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getLessonStatusLabel(lesson.status)}
            </Badge>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">
                {lesson.startTime} – {lesson.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-success" />
              <span>{lesson.meetingLocation || "Não definido"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Navigation className="w-4 h-4 text-accent" />
              <span>{lesson.endLocation || "Não definido"}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-success" />
              <span className="font-bold text-success">R$ {lesson.value.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {canStart && (
              <Button onClick={handleStart} className="w-full gap-2 h-12">
                <Play className="w-4 h-4" />
                Iniciar Aula
              </Button>
            )}
            {lesson.studentId && (
              <Button variant="outline" onClick={handleViewStudent} className="w-full gap-2 h-11">
                <User className="w-4 h-4" />
                Ver Prontuário
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
