import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Car, DollarSign, ChevronRight, ChevronLeft,
  Camera, Check, Loader2, Fuel, Gauge, CreditCard, Package,
  Gift, Sparkles, Phone, Clock, Target, AlertTriangle, SkipForward,
} from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PROFILE_QUERY_KEY } from "@/hooks/useProfile";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";

/* ── masks ── */
function formatWhatsApp(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatPlate(raw: string) {
  const v = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (v.length <= 3) return v;
  return v.slice(0, 3) + "-" + v.slice(3);
}

function formatCurrency(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const num = parseInt(digits || "0", 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrency(formatted: string) {
  return parseFloat(formatted.replace(/\./g, "").replace(",", ".")) || 0;
}

/* ── Zod schemas ── */
const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  whatsapp: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "WhatsApp inválido (ex: 11 99999-9999)"),
});

const vehicleSchema = z.object({
  carModel: z.string().trim().min(2, "Informe o modelo do carro"),
  fuelType: z.string().min(1, "Selecione o combustível"),
});

const pricingSchema = z.object({
  hourRate: z.number().positive("Valor deve ser maior que zero"),
  lessonDuration: z.number().min(30, "Mínimo 30 minutos").max(180, "Máximo 180 minutos"),
});

/* ── types ── */
interface OnboardingData {
  avatarUrl: string;
  name: string;
  whatsapp: string;
  carModel: string;
  plate: string;
  fuelType: string;
  consumption: string;
  hourRate: string;
  lessonDuration: string;
  monthlyGoal: string;
  package10: string;
  package20: string;
  pixKey: string;
  skippedVehicle: boolean;
}

const INITIAL: OnboardingData = {
  avatarUrl: "",
  name: "",
  whatsapp: "",
  carModel: "",
  plate: "",
  fuelType: "",
  consumption: "",
  hourRate: "",
  lessonDuration: "50",
  monthlyGoal: "",
  package10: "",
  package20: "",
  pixKey: "",
  skippedVehicle: false,
};

const STEPS = [
  { label: "Perfil", icon: User },
  { label: "Veículo", icon: Car },
  { label: "Valores", icon: DollarSign },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

function triggerHaptic(ms = 10) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "free";
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = useCallback(
    <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
      setData((d) => ({ ...d, [key]: value }));
      setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
    },
    [],
  );

  const progress = done ? 100 : ((step + 1) / STEPS.length) * 100;

  /* ── validation ── */
  const validate = useCallback((): boolean => {
    if (step === 0) {
      const result = profileSchema.safeParse({ name: data.name, whatsapp: data.whatsapp });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((e) => {
          fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
        return false;
      }
    }
    if (step === 1 && !data.skippedVehicle) {
      const result = vehicleSchema.safeParse({ carModel: data.carModel, fuelType: data.fuelType });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((e) => {
          fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
        return false;
      }
    }
    if (step === 2) {
      const result = pricingSchema.safeParse({
        hourRate: parseCurrency(data.hourRate),
        lessonDuration: parseInt(data.lessonDuration) || 0,
      });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((e) => {
          fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
        return false;
      }
    }
    setErrors({});
    return true;
  }, [step, data]);

  const canAdvance = (() => {
    if (step === 0) return data.name.trim().length >= 2 && data.whatsapp.replace(/\D/g, "").length === 11;
    if (step === 1) return data.skippedVehicle || (data.carModel.trim().length >= 2 && data.fuelType !== "");
    if (step === 2) return parseCurrency(data.hourRate) > 0 && parseInt(data.lessonDuration) >= 30;
    return true;
  })();

  /* ── avatar ── */
  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    set("avatarUrl", url);
  };

  /* ── navigation ── */
  const goNext = () => {
    if (!validate()) return;
    triggerHaptic(15);
    setDirection(1);
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  const goBack = () => {
    triggerHaptic(10);
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const skipVehicle = () => {
    triggerHaptic(10);
    set("skippedVehicle", true);
    setDirection(1);
    setStep(2);
  };

  /* ── finish ── */
  const handleFinish = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.name.trim(),
          onboarding_completed: true,
        } as any)
        .eq("id", user.id);
      if (profileError) throw profileError;

      // Save vehicle if not skipped
      if (!data.skippedVehicle && data.carModel.trim()) {
        const { error: vehicleError } = await supabase.from("vehicles").insert({
          instructor_id: user.id,
          model: data.carModel.trim(),
          plate: data.plate.replace("-", ""),
          fuel_type: data.fuelType || "flex",
          avg_consumption: parseFloat(data.consumption) || 10,
        });
        if (vehicleError) console.warn("Vehicle save failed:", vehicleError);
      }

      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });

      setSaving(false);
      setDone(true);
    } catch (err: any) {
      setSaving(false);
      toast({
        title: "Erro ao salvar",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  }, [data, user, queryClient, toast]);

  useEffect(() => {
    if (done) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }
  }, [done]);

  /* ── computed ── */
  const hourValue = parseCurrency(data.hourRate);
  const lessonDur = parseInt(data.lessonDuration) || 50;
  const lessonsPerDay = Math.floor((8 * 60) / lessonDur);
  const monthlyEstimate = hourValue * lessonsPerDay * 22;
  const goalValue = parseCurrency(data.monthlyGoal);

  const isFreePlan = plan === "free";

  /* ── render steps ── */
  const renderStep = () => {
    if (done) {
      return (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex flex-col items-center text-center gap-5 py-8"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">
            Bem-vindo à Elite, {data.name.split(" ")[0]}! 🏁
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Seu escritório móvel está configurado. Hora de transformar aulas em resultados.
          </p>
          {data.skippedVehicle && (
            <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-xl px-4 py-2.5">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <span className="text-xs text-warning font-medium">
                Recursos de ROI e Combustível estarão desativados até cadastrar um veículo.
              </span>
            </div>
          )}
          {isFreePlan && (
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-medium">
                Plano Iniciante ativo · Até 3 alunos gratuitos
              </span>
            </div>
          )}
          <Button
            className="mt-4 gap-2 h-12 text-base font-bold rounded-xl w-full max-w-xs"
            onClick={() => navigate("/")}
          >
            Ir para meu Cockpit
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      );
    }

    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">
                Bem-vindo à Elite.
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Vamos configurar seu escritório móvel. Seus alunos verão essas informações nos relatórios.
              </p>
            </div>

            {/* avatar */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative group"
              >
                <Avatar className="w-24 h-24 border-2 border-primary/30">
                  <AvatarImage src={data.avatarUrl} />
                  <AvatarFallback className="text-3xl font-bold text-muted-foreground bg-muted">
                    {data.name ? data.name[0].toUpperCase() : <User className="w-10 h-10" />}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-background" />
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatar}
                />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Nome completo</Label>
                <Input
                  placeholder="Ex: Instrutor Marcelo"
                  value={data.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="mt-1.5 h-12 text-base"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <Phone className="w-3.5 h-3.5" /> WhatsApp
                </Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={data.whatsapp}
                  onChange={(e) => set("whatsapp", formatWhatsApp(e.target.value))}
                  className="mt-1.5 h-12 text-base"
                  inputMode="tel"
                  maxLength={15}
                />
                {errors.whatsapp && <p className="text-xs text-destructive mt-1">{errors.whatsapp}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  Usado para enviar relatórios aos alunos.
                </p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">
                Seu instrumento de trabalho
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Esses dados alimentam os módulos de Manutenção e ROI de Combustível.
              </p>
            </div>

            {data.skippedVehicle ? (
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Veículo não cadastrado</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Os recursos de ROI e alerta de manutenção ficarão desativados. Você pode cadastrar depois nas configurações.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-1.5"
                      onClick={() => set("skippedVehicle", false)}
                    >
                      Quero cadastrar agora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <Car className="w-3.5 h-3.5" /> Modelo do Carro
                  </Label>
                  <Input
                    placeholder="Ex: VW Gol, Hyundai HB20"
                    value={data.carModel}
                    onChange={(e) => set("carModel", e.target.value)}
                    className="mt-1.5 h-12 text-base"
                  />
                  {errors.carModel && <p className="text-xs text-destructive mt-1">{errors.carModel}</p>}
                </div>
                <div>
                  <Label className="text-sm font-semibold">Placa (Mercosul)</Label>
                  <Input
                    placeholder="ABC-1D23"
                    value={data.plate}
                    onChange={(e) => set("plate", formatPlate(e.target.value))}
                    className="mt-1.5 h-12 text-base uppercase"
                    maxLength={8}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <Fuel className="w-3.5 h-3.5" /> Combustível
                  </Label>
                  <Select value={data.fuelType} onValueChange={(v) => set("fuelType", v)}>
                    <SelectTrigger className="mt-1.5 h-12 text-base">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasolina">Gasolina</SelectItem>
                      <SelectItem value="etanol">Etanol</SelectItem>
                      <SelectItem value="gnv">GNV</SelectItem>
                      <SelectItem value="flex">Flex</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.fuelType && <p className="text-xs text-destructive mt-1">{errors.fuelType}</p>}
                </div>
                <div>
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <Gauge className="w-3.5 h-3.5" /> Consumo Médio (km/l)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ex: 12"
                    value={data.consumption}
                    onChange={(e) => set("consumption", e.target.value)}
                    className="mt-1.5 h-12 text-base"
                    inputMode="decimal"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">
                Quanto vale sua hora?
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Defina seus valores para alimentar o Dashboard Financeiro.
              </p>
            </div>

            {isFreePlan && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">Plano Iniciante (Free)</p>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0">Ativo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Até 3 alunos gratuitos. Teste todos os recursos!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <DollarSign className="w-3.5 h-3.5" /> Valor da Hora-Aula (R$) *
                </Label>
                <Input
                  placeholder="0,00"
                  value={data.hourRate}
                  onChange={(e) => set("hourRate", formatCurrency(e.target.value))}
                  className="mt-1.5 h-12 text-base"
                  inputMode="decimal"
                />
                {errors.hourRate && <p className="text-xs text-destructive mt-1">{errors.hourRate}</p>}
              </div>

              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <Clock className="w-3.5 h-3.5" /> Duração da Aula (min) *
                </Label>
                <Select value={data.lessonDuration} onValueChange={(v) => set("lessonDuration", v)}>
                  <SelectTrigger className="mt-1.5 h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="40">40 minutos</SelectItem>
                    <SelectItem value="50">50 minutos</SelectItem>
                    <SelectItem value="60">60 minutos (1 hora)</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                    <SelectItem value="120">120 minutos (2 horas)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.lessonDuration && <p className="text-xs text-destructive mt-1">{errors.lessonDuration}</p>}
              </div>

              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <Target className="w-3.5 h-3.5" /> Meta Mensal (R$)
                </Label>
                <Input
                  placeholder="0,00"
                  value={data.monthlyGoal}
                  onChange={(e) => set("monthlyGoal", formatCurrency(e.target.value))}
                  className="mt-1.5 h-12 text-base"
                  inputMode="decimal"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Opcional — usado para acompanhar seu progresso no dashboard.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <Package className="w-3.5 h-3.5" /> Pacote 10 aulas
                  </Label>
                  <Input
                    placeholder="0,00"
                    value={data.package10}
                    onChange={(e) => set("package10", formatCurrency(e.target.value))}
                    className="mt-1.5 h-12 text-base"
                    inputMode="decimal"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Pacote 20 aulas</Label>
                  <Input
                    placeholder="0,00"
                    value={data.package20}
                    onChange={(e) => set("package20", formatCurrency(e.target.value))}
                    className="mt-1.5 h-12 text-base"
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <CreditCard className="w-3.5 h-3.5" /> Chave Pix
                </Label>
                <Input
                  placeholder="CPF, e-mail ou celular"
                  value={data.pixKey}
                  onChange={(e) => set("pixKey", e.target.value)}
                  className="mt-1.5 h-12 text-base"
                />
              </div>
            </div>

            {/* dynamic estimate */}
            {hourValue > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center space-y-1.5">
                  <p className="text-xs text-muted-foreground">
                    Com {lessonsPerDay} aulas de {lessonDur}min/dia, seu faturamento estimado:
                  </p>
                  <p className="text-3xl font-extrabold text-primary">
                    R$ {monthlyEstimate.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  {goalValue > 0 && (
                    <p className={`text-xs font-semibold ${monthlyEstimate >= goalValue ? "text-success" : "text-warning"}`}>
                      {monthlyEstimate >= goalValue
                        ? `✅ Acima da meta de R$ ${goalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : `⚠️ Abaixo da meta de R$ ${goalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* top bar */}
      {!done && (
        <motion.div
          className="px-4 pt-6 pb-2 space-y-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-center gap-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const completed = i < step;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      completed
                        ? "bg-primary text-primary-foreground"
                        : active
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                    animate={active ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {completed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </motion.div>
                  <span
                    className={`text-[10px] font-semibold ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>
      )}

      {/* content */}
      <div className="flex-1 flex flex-col justify-between px-4 pb-6">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={done ? "done" : step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* nav buttons — thumb zone (bottom) */}
        {!done && (
          <div className="flex flex-col gap-2 max-w-sm mx-auto w-full mt-6">
            {/* Skip vehicle button */}
            {step === 1 && !data.skippedVehicle && (
              <Button
                variant="ghost"
                className="gap-1.5 text-muted-foreground text-sm"
                onClick={skipVehicle}
              >
                <SkipForward className="w-4 h-4" />
                Pular por agora
              </Button>
            )}

            <div className="flex gap-3">
              {step > 0 && (
                <Button
                  variant="outline"
                  className="gap-1 h-12"
                  onClick={goBack}
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </Button>
              )}
              <Button
                className="flex-1 gap-1 h-12 text-base font-bold rounded-xl"
                disabled={!canAdvance || saving}
                onClick={goNext}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : step < STEPS.length - 1 ? (
                  <>
                    Próximo: {STEPS[step + 1].label}
                    <ChevronRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Finalizar Configuração
                    <Check className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
