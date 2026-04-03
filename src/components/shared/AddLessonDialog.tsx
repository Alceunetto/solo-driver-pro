import { useState, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Lesson } from "@/types/solodrive";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StudentCombobox } from "@/components/shared/StudentCombobox";
import { NewStudentDialog } from "@/components/shared/NewStudentDialog";
import { TimePicker } from "@/components/shared/TimePicker";
import { cn } from "@/lib/utils";

interface AddLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (lesson: Omit<Lesson, "id"> & { studentId?: string; date?: string; repeatWeekly?: boolean }) => void;
  defaultDate?: Date;
}

export function AddLessonDialog({ open, onOpenChange, onAdd, defaultDate }: AddLessonDialogProps) {
  const [newStudentOpen, setNewStudentOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    studentName: "",
    date: defaultDate ?? new Date(),
    startTime: "08:00",
    endTime: "08:45",
    meetingLocation: "",
    endLocation: "",
    meetingAddress: "",
    type: "pratica" as Lesson["type"],
    value: "",
    repeatWeekly: false,
  });

  // Sync defaultDate when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && defaultDate) {
      setForm((prev) => ({ ...prev, date: defaultDate }));
    }
    onOpenChange(isOpen);
  };

  const DEFAULT_DURATION = 50;

  const calcEndTime = useCallback((start: string) => {
    const [h, m] = start.split(":").map(Number);
    const total = h * 60 + m + DEFAULT_DURATION;
    const eH = Math.floor(total / 60) % 24;
    const eM = total % 60;
    const snapped = Math.round(eM / 15) * 15;
    const finalM = snapped === 60 ? 0 : snapped;
    const finalH = snapped === 60 ? eH + 1 : eH;
    return `${String(finalH).padStart(2, "0")}:${String(finalM).padStart(2, "0")}`;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId) return;
    onAdd({
      studentName: form.studentName,
      startTime: form.startTime,
      endTime: form.endTime,
      meetingLocation: form.meetingLocation,
      endLocation: form.endLocation,
      meetingAddress: form.meetingAddress,
      type: form.type,
      value: parseFloat(form.value) || 0,
      status: "agendada",
      studentId: form.studentId,
      date: format(form.date, "yyyy-MM-dd"),
      repeatWeekly: form.repeatWeekly,
    });
    setForm({
      studentId: "",
      studentName: "",
      date: defaultDate ?? new Date(),
      startTime: "08:00",
      endTime: "08:45",
      meetingLocation: "",
      endLocation: "",
      meetingAddress: "",
      type: "pratica",
      value: "",
      repeatWeekly: false,
    });
    onOpenChange(false);
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isValid = !!form.studentId && !!form.startTime && !!form.endTime;

  const dayOfWeekLabel = format(form.date, "EEEE", { locale: ptBR });
  const capitalizedDay = dayOfWeekLabel.charAt(0).toUpperCase() + dayOfWeekLabel.slice(1);

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Aula</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Aluno</Label>
              <StudentCombobox
                value={form.studentId}
                onSelect={(id, name) => {
                  setForm((prev) => ({ ...prev, studentId: id, studentName: name }));
                }}
                onAddNew={() => setNewStudentOpen(true)}
              />
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Data</Label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal h-12",
                        !form.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(form.date, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.date}
                      onSelect={(d) => d && setForm((prev) => ({ ...prev, date: d }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-2 rounded-lg whitespace-nowrap">
                  {capitalizedDay}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TimePicker
                label="Início"
                value={form.startTime}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, startTime: v, endTime: calcEndTime(v) }));
                }}
              />
              <TimePicker
                label="Término"
                value={form.endTime}
                onChange={(v) => update("endTime", v)}
              />
            </div>

            <div className="space-y-2">
              <Label>Local de Encontro</Label>
              <Input
                value={form.meetingLocation}
                onChange={(e) => update("meetingLocation", e.target.value)}
                placeholder="Ex: Casa do aluno, Metrô..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Endereço Completo (para navegação)</Label>
              <Input
                value={form.meetingAddress}
                onChange={(e) => update("meetingAddress", e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Local de Término</Label>
              <Input
                value={form.endLocation}
                onChange={(e) => update("endLocation", e.target.value)}
                placeholder="Ex: Detran, Metrô..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="pratica">Aula Prática</option>
                  <option value="baliza">Baliza</option>
                  <option value="simulado">Simulado</option>
                  <option value="avaliacao">Avaliação</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => update("value", e.target.value)}
                  placeholder="120.00"
                  className="h-12"
                  required
                />
              </div>
            </div>

            {/* Repeat Weekly */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Repetir toda {capitalizedDay}
                </p>
                <p className="text-xs text-muted-foreground">Cria aulas nas próximas 4 semanas</p>
              </div>
              <Switch
                checked={form.repeatWeekly}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, repeatWeekly: checked }))}
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={!isValid}>
              Adicionar Aula
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <NewStudentDialog
        open={newStudentOpen}
        onOpenChange={setNewStudentOpen}
      />
    </>
  );
}
