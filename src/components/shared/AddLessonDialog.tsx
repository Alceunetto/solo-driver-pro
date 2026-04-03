import { useState, useCallback } from "react";
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
import { StudentCombobox } from "@/components/shared/StudentCombobox";
import { NewStudentDialog } from "@/components/shared/NewStudentDialog";
import { TimePicker } from "@/components/shared/TimePicker";

interface AddLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (lesson: Omit<Lesson, "id"> & { studentId?: string }) => void;
}

export function AddLessonDialog({ open, onOpenChange, onAdd }: AddLessonDialogProps) {
  const [newStudentOpen, setNewStudentOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    studentName: "",
    startTime: "08:00",
    endTime: "08:45",
    meetingLocation: "",
    endLocation: "",
    meetingAddress: "",
    type: "pratica" as Lesson["type"],
    value: "",
  });

  const DEFAULT_DURATION = 50; // minutes

  const calcEndTime = useCallback((start: string) => {
    const [h, m] = start.split(":").map(Number);
    const total = h * 60 + m + DEFAULT_DURATION;
    const eH = Math.floor(total / 60) % 24;
    const eM = total % 60;
    // snap to nearest 15
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
    });
    setForm({
      studentId: "",
      studentName: "",
      startTime: "08:00",
      endTime: "08:45",
      meetingLocation: "",
      endLocation: "",
      meetingAddress: "",
      type: "pratica",
      value: "",
    });
    onOpenChange(false);
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isValid = !!form.studentId && !!form.startTime && !!form.endTime;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Início</Label>
                <Input
                  type="text"
                  value={form.startTime}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d:]/g, "");
                    if (v.length === 2 && !v.includes(":") && form.startTime.length < 3) v += ":";
                    if (v.length <= 5) update("startTime", v);
                  }}
                  placeholder="09:00"
                  maxLength={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Término</Label>
                <Input
                  type="text"
                  value={form.endTime}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d:]/g, "");
                    if (v.length === 2 && !v.includes(":") && form.endTime.length < 3) v += ":";
                    if (v.length <= 5) update("endTime", v);
                  }}
                  placeholder="10:00"
                  maxLength={5}
                  required
                />
              </div>
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!isValid}>
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
