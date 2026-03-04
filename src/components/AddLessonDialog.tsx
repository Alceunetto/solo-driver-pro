import { useState } from "react";
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

interface AddLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (lesson: Omit<Lesson, "id">) => void;
}

export function AddLessonDialog({ open, onOpenChange, onAdd }: AddLessonDialogProps) {
  const [form, setForm] = useState({
    studentName: "",
    startTime: "",
    endTime: "",
    meetingLocation: "",
    endLocation: "",
    meetingAddress: "",
    type: "pratica" as Lesson["type"],
    value: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...form,
      value: parseFloat(form.value) || 0,
      status: "agendada",
    });
    setForm({
      studentName: "",
      startTime: "",
      endTime: "",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Aula</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Aluno</Label>
            <Input
              value={form.studentName}
              onChange={(e) => update("studentName", e.target.value)}
              placeholder="Nome do aluno"
              required
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

          <Button type="submit" className="w-full">
            Adicionar Aula
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
