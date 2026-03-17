import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon, User, Phone, GraduationCap, Activity, Info,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { supabase } from "@/integrations/supabase/client";
import { DETRAN_SKILLS } from "@/types";
import { toast } from "sonner";

/* ── WhatsApp mask ── */
function formatWhatsApp(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function unformatWhatsApp(formatted: string) {
  return formatted.replace(/\D/g, "");
}

/* ── Skill tooltips ── */
const SKILL_TOOLTIPS: Record<string, { low: string; high: string }> = {
  "Controle de Embreagem": {
    low: "Morre o motor com frequência, arrancadas bruscas",
    high: "Saídas suaves, controle perfeito em subidas e manobras",
  },
  "Baliza": {
    low: "Não consegue estacionar, bate nos cones",
    high: "Estaciona em qualquer vaga com precisão",
  },
  "Sinalização": {
    low: "Esquece setas, ignora placas e semáforos",
    high: "Usa setas antecipadamente, respeita toda sinalização",
  },
  "Frenagem": {
    low: "Freadas bruscas, passageiro desconfortável",
    high: "Frenagem progressiva e suave em todas as situações",
  },
  "Noção de Espaço": {
    low: "Não percebe veículos ao redor, raspa em meio-fios",
    high: "Excelente percepção de distâncias e pontos cegos",
  },
  "Arrancada em Aclive": {
    low: "Deixa o carro recuar na subida, motor morre",
    high: "Saída firme em qualquer ladeira sem recuar",
  },
};

/* ── Schema ── */
const studentSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  whatsapp: z
    .string()
    .refine((v) => unformatWhatsApp(v).length === 11, "WhatsApp deve ter 11 dígitos (DDD + número)"),
  category: z.enum(["A", "B", "AB"]),
  examDate: z.date().optional(),
  skills: z.object({
    "Controle de Embreagem": z.number().min(0).max(100),
    "Baliza": z.number().min(0).max(100),
    "Sinalização": z.number().min(0).max(100),
    "Frenagem": z.number().min(0).max(100),
    "Noção de Espaço": z.number().min(0).max(100),
    "Arrancada em Aclive": z.number().min(0).max(100),
  }),
});

type StudentFormValues = z.infer<typeof studentSchema>;

const DEFAULT_SKILLS = Object.fromEntries(
  DETRAN_SKILLS.map((s) => [s, 50])
) as StudentFormValues["skills"];

/* ── Main Component ── */
interface NewStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewStudentDialog({ open, onOpenChange }: NewStudentDialogProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addStudent } = useStudents();
  const [saving, setSaving] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      whatsapp: "",
      category: "B",
      skills: DEFAULT_SKILLS,
    },
  });

  const onSubmit = useCallback(
    async (values: StudentFormValues) => {
      if (!user) return;
      setSaving(true);

      try {
        // 1. Create student
        const { data: newStudent, error: studentError } = await supabase
          .from("students")
          .insert({
            instructor_id: user.id,
            name: values.name.trim(),
            whatsapp: unformatWhatsApp(values.whatsapp),
            category: values.category,
            exam_date: values.examDate
              ? format(values.examDate, "yyyy-MM-dd")
              : null,
          } as any)
          .select()
          .single();

        if (studentError) throw studentError;

        // 2. Create baseline lesson for initial assessment
        const { data: baselineLesson, error: lessonError } = await supabase
          .from("lessons")
          .insert({
            instructor_id: user.id,
            student_id: newStudent.id,
            student_name: values.name.trim(),
            start_time: "00:00",
            end_time: "00:00",
            type: "avaliacao",
            status: "concluida",
            price: 0,
            meeting_location: "Avaliação Inicial",
            end_location: "Avaliação Inicial",
            meeting_address: "",
          } as any)
          .select()
          .single();

        if (lessonError) throw lessonError;

        // 3. Save initial skill evaluations
        const evaluationRows = DETRAN_SKILLS.map((skillName) => ({
          lesson_id: baselineLesson.id,
          student_id: newStudent.id,
          instructor_id: user.id,
          skill_name: skillName,
          score: values.skills[skillName],
        }));

        const { error: evalError } = await supabase
          .from("lesson_evaluations")
          .insert(evaluationRows as any);

        if (evalError) throw evalError;

        toast.success("Aluno adicionado com sucesso!");
        onOpenChange(false);
        form.reset({ name: "", whatsapp: "", category: "B", skills: DEFAULT_SKILLS });

        // Navigate to the new student's prontuário
        navigate(`/prontuario/${newStudent.id}`);
      } catch (err: any) {
        console.error("Erro ao criar aluno:", err);
        toast.error(err.message || "Erro ao criar aluno. Tente novamente.");
      } finally {
        setSaving(false);
      }
    },
    [user, form, navigate, onOpenChange]
  );

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Identity Section ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Identificação</h3>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: João Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> WhatsApp
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 99999-9999"
                    inputMode="tel"
                    value={field.value}
                    onChange={(e) => field.onChange(formatWhatsApp(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Categoria
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A">A (Moto)</SelectItem>
                      <SelectItem value="B">B (Carro)</SelectItem>
                      <SelectItem value="AB">AB (Ambos)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="examDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" /> Data do Exame
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? format(field.value, "dd/MM/yy", { locale: ptBR })
                            : "Selecionar"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* ── Initial Assessment Section ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Avaliação Inicial</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Defina o nível inicial do aluno em cada habilidade para formar a linha de base do Radar.
          </p>

          {DETRAN_SKILLS.map((skillName) => (
            <FormField
              key={skillName}
              control={form.control}
              name={`skills.${skillName}` as any}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="flex items-center gap-1.5 text-xs">
                      {skillName}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px] text-xs">
                          <p>
                            <span className="font-semibold text-destructive">0:</span>{" "}
                            {SKILL_TOOLTIPS[skillName]?.low}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold text-success">100:</span>{" "}
                            {SKILL_TOOLTIPS[skillName]?.high}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <span className="text-xs font-bold text-primary tabular-nums w-8 text-right">
                      {field.value}
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[field.value as number]}
                      onValueChange={([v]) => field.onChange(v)}
                      className="py-1"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>

        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={saving}>
          {saving ? "Salvando..." : "Cadastrar Aluno"}
        </Button>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Novo Aluno
            </DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="px-4 pb-6 overflow-y-auto max-h-[75vh]">
            {formContent}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Novo Aluno
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4 overflow-y-auto">
          {formContent}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
