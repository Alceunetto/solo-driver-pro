import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User, Car, DollarSign, ChevronRight, ChevronLeft,
  Camera, Check, Loader2, Fuel, Gauge, CreditCard, Package,
  Gift, Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";

/* ── masks ── */
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

/* ── types ── */
interface OnboardingData {
  avatarUrl: string;
  name: string;
  bio: string;
  carModel: string;
  plate: string;
  fuelType: string;
  consumption: string;
  hourRate: string;
  package10: string;
  package20: string;
  pixKey: string;
}

const INITIAL: OnboardingData = {
  avatarUrl: "",
  name: "",
  bio: "",
  carModel: "",
  plate: "",
  fuelType: "",
  consumption: "",
  hourRate: "",
  package10: "",
  package20: "",
  pixKey: "",
};

const STEPS = [
  { label: "Perfil", icon: User },
  { label: "Veículo", icon: Car },
  { label: "Valores", icon: DollarSign },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "free";

  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = useCallback(
    <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) =>
      setData((d) => ({ ...d, [key]: value })),
    [],
  );

  const progress = done ? 100 : ((step + 1) / STEPS.length) * 100;

  /* ── validation ── */
  const canAdvance = (() => {
    if (step === 0) return data.name.trim().length >= 2;
    if (step === 1) return data.carModel.trim().length >= 2 && data.fuelType !== "";
    if (step === 2) return parseCurrency(data.hourRate) > 0;
    return true;
  })();

  /* ── avatar ── */
  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    set("avatarUrl", url);
  };

  /* ── finish ── */
  const handleFinish = useCallback(async () => {
    setSaving(true);
    // Simulate saving profile with subscription_status and student_limit
    const profilePayload = {
      ...data,
      subscription_status: plan === "annual" ? "annual" : plan === "monthly" ? "monthly" : "free",
      student_limit: plan === "free" ? 3 : null, // null = unlimited
    };
    console.log("Profile payload:", profilePayload);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setDone(true);
  }, [data, plan]);

  useEffect(() => {
    if (done) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [done]);

  /* ── monthly estimate ── */
  const hourValue = parseCurrency(data.hourRate);
  const monthlyEstimate = hourValue * 5 * 22;

  /* ── plan info ── */
  const planLabel =
    plan === "annual" ? "Empreendedor (Anual)" :
    plan === "monthly" ? "Profissional (Mensal)" :
    "Iniciante (Grátis)";

  const isFreePlan = plan === "free";

  /* ── render steps ── */
  const renderStep = () => {
    if (done) {
      return (
        <div className="flex flex-col items-center text-center gap-4 py-8 animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Tudo pronto, {data.name.split(" ")[0]}!
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Você agora é um instrutor independente 2026. Sua central de comando está configurada.
          </p>
          {isFreePlan && (
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-medium">
                Plano Iniciante ativo · Até 3 alunos gratuitos
              </span>
            </div>
          )}
          <Button className="mt-4 gap-2" onClick={() => navigate("/")}>
            Ir para meu Cockpit
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    switch (step) {
      case 0:
        return (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Como você quer ser chamado?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Seus alunos verão este nome nos relatórios.
              </p>
            </div>

            {/* avatar */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative group"
              >
                <Avatar className="w-20 h-20 border-2 border-border">
                  <AvatarImage src={data.avatarUrl} />
                  <AvatarFallback className="text-2xl font-semibold text-muted-foreground">
                    {data.name ? data.name[0].toUpperCase() : <User className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-background" />
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

            <div className="space-y-3">
              <div>
                <Label>Nome completo / Nome de guerra</Label>
                <Input
                  placeholder="Ex: Instrutor Marcelo"
                  value={data.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Bio curta</Label>
                <Textarea
                  placeholder="Ex: Especialista em alunos com medo de dirigir"
                  value={data.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Seu instrumento de trabalho
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Usamos esses dados para calcular sua margem de lucro real por aula.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5" /> Modelo do Carro
                </Label>
                <Input
                  placeholder="Ex: VW Gol, Hyundai HB20"
                  value={data.carModel}
                  onChange={(e) => set("carModel", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Placa (Mercosul)</Label>
                <Input
                  placeholder="ABC-1D23"
                  value={data.plate}
                  onChange={(e) => set("plate", formatPlate(e.target.value))}
                  className="mt-1 uppercase"
                  maxLength={8}
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5" /> Combustível
                </Label>
                <Select value={data.fuelType} onValueChange={(v) => set("fuelType", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasolina">Gasolina</SelectItem>
                    <SelectItem value="etanol">Etanol</SelectItem>
                    <SelectItem value="gnv">GNV</SelectItem>
                    <SelectItem value="flex">Flex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" /> Consumo Médio (km/l)
                </Label>
                <Input
                  type="number"
                  placeholder="Ex: 12"
                  value={data.consumption}
                  onChange={(e) => set("consumption", e.target.value)}
                  className="mt-1"
                  inputMode="decimal"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Quanto vale sua hora?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Defina seus valores e comece a faturar.
              </p>
            </div>

            {/* Free plan incentive card */}
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
                      Você tem direito a gerenciar até 3 alunos gratuitamente. Aproveite para testar todos os recursos!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <div>
                <Label className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Valor da Hora-Aula (R$) *
                </Label>
                <Input
                  placeholder="0,00"
                  value={data.hourRate}
                  onChange={(e) => set("hourRate", formatCurrency(e.target.value))}
                  className="mt-1"
                  inputMode="decimal"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> Pacote 10 aulas
                  </Label>
                  <Input
                    placeholder="0,00"
                    value={data.package10}
                    onChange={(e) => set("package10", formatCurrency(e.target.value))}
                    className="mt-1"
                    inputMode="decimal"
                  />
                </div>
                <div>
                  <Label>Pacote 20 aulas</Label>
                  <Input
                    placeholder="0,00"
                    value={data.package20}
                    onChange={(e) => set("package20", formatCurrency(e.target.value))}
                    className="mt-1"
                    inputMode="decimal"
                  />
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Chave Pix
                </Label>
                <Input
                  placeholder="CPF, e-mail ou celular"
                  value={data.pixKey}
                  onChange={(e) => set("pixKey", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* dynamic estimate card */}
            {hourValue > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Com 5 aulas por dia, seu faturamento mensal será de
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {monthlyEstimate.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
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
        <div className="px-4 pt-6 pb-2 space-y-3">
          <div className="flex items-center justify-center gap-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const completed = i < step;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      completed
                        ? "bg-primary text-primary-foreground"
                        : active
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {completed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* content */}
      <div className="flex-1 flex flex-col justify-between px-4 pb-6">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          {renderStep()}
        </div>

        {/* nav buttons */}
        {!done && (
          <div className="flex gap-3 max-w-sm mx-auto w-full mt-6">
            {step > 0 && (
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => setStep((s) => s - 1)}
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
            )}
            <Button
              className="flex-1 gap-1"
              disabled={!canAdvance || saving}
              onClick={() => {
                if (step < STEPS.length - 1) {
                  setStep((s) => s + 1);
                } else {
                  handleFinish();
                }
              }}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step < STEPS.length - 1 ? (
                <>
                  Próximo: {STEPS[step + 1].label}
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Finalizar Configuração
                  <Check className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
