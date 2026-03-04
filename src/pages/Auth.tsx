import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Route, MessageSquare, Mail, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

/* ── helpers ── */
function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isPhoneValid(v: string) {
  return v.replace(/\D/g, "").length === 11;
}

function isEmailValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/* ── component ── */
export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "free";

  const [tab, setTab] = useState<"whatsapp" | "email">("whatsapp");

  // whatsapp state
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loadingWa, setLoadingWa] = useState(false);

  // email state
  const [email, setEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // countdown
  const [countdown, setCountdown] = useState(0);

  // fade-in
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── actions ── */
  const handleSendOtp = useCallback(async () => {
    setLoadingWa(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoadingWa(false);
    setOtpSent(true);
    setCountdown(60);
  }, []);

  const handleVerifyOtp = useCallback(async () => {
    setLoadingWa(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoadingWa(false);
    // New user → onboarding with plan param
    navigate(`/onboarding?plan=${plan}`);
  }, [navigate, plan]);

  const handleMagicLink = useCallback(async () => {
    setLoadingEmail(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoadingEmail(false);
    setMagicSent(true);
  }, []);

  const handleResend = useCallback(async () => {
    if (countdown > 0) return;
    if (tab === "whatsapp") {
      setLoadingWa(true);
      await new Promise((r) => setTimeout(r, 800));
      setLoadingWa(false);
    } else {
      setLoadingEmail(true);
      await new Promise((r) => setTimeout(r, 800));
      setLoadingEmail(false);
    }
    setCountdown(60);
  }, [countdown, tab]);

  const planLabel =
    plan === "annual" ? "Empreendedor (Anual)" :
    plan === "monthly" ? "Profissional (Mensal)" :
    "Iniciante (Grátis)";

  /* ── render ── */
  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 bg-background transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* branding */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Route className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Bem-vindo ao SoloDrive
        </h1>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Sua central de comando como instrutor independente.
        </p>
        {plan !== "free" && (
          <span className="text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            Plano selecionado: {planLabel}
          </span>
        )}
      </div>

      {/* card */}
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-lg p-6 space-y-5">
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as "whatsapp" | "email");
            setOtpSent(false);
            setMagicSent(false);
            setOtp("");
            setCountdown(0);
          }}
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="whatsapp" className="gap-1.5">
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-1.5">
              <Mail className="w-4 h-4" />
              E-mail
            </TabsTrigger>
          </TabsList>

          {/* ── WhatsApp tab ── */}
          <TabsContent value="whatsapp" className="space-y-4 pt-2">
            {!otpSent ? (
              <>
                <label className="text-sm font-medium text-foreground">
                  Número de celular
                </label>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground shrink-0 select-none">
                    🇧🇷 +55
                  </span>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="flex-1"
                    inputMode="tel"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enviaremos um código de acesso rápido para o seu WhatsApp.
                </p>
                <Button
                  className="w-full"
                  disabled={!isPhoneValid(phone) || loadingWa}
                  onClick={handleSendOtp}
                >
                  {loadingWa ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  Receber Código via WhatsApp
                </Button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setOtpSent(false); setOtp(""); setCountdown(0); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Voltar
                </button>
                <p className="text-sm text-foreground">
                  Insira o código de 6 dígitos enviado para{" "}
                  <span className="font-semibold">+55 {phone}</span>
                </p>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  className="w-full"
                  disabled={otp.length !== 6 || loadingWa}
                  onClick={handleVerifyOtp}
                >
                  {loadingWa ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  Verificar e Entrar
                </Button>
                <button
                  onClick={handleResend}
                  disabled={countdown > 0}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                >
                  {countdown > 0
                    ? `Reenviar código em ${countdown}s`
                    : "Reenviar código"}
                </button>
              </>
            )}
          </TabsContent>

          {/* ── Email tab ── */}
          <TabsContent value="email" className="space-y-4 pt-2">
            {!magicSent ? (
              <>
                <label className="text-sm font-medium text-foreground">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="instrutor@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                />
                <p className="text-xs text-muted-foreground">
                  Você receberá um link de acesso na sua caixa de entrada.
                </p>
                <Button
                  className="w-full"
                  disabled={!isEmailValid(email) || loadingEmail}
                  onClick={handleMagicLink}
                >
                  {loadingEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Enviar Link Mágico
                </Button>
              </>
            ) : (
              <div className="text-center space-y-3 py-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Link enviado!
                </p>
                <p className="text-xs text-muted-foreground">
                  Verifique sua caixa de entrada em{" "}
                  <span className="font-semibold">{email}</span>
                </p>
                <button
                  onClick={handleResend}
                  disabled={countdown > 0}
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                >
                  {countdown > 0
                    ? `Reenviar em ${countdown}s`
                    : "Reenviar link"}
                </button>
                <button
                  onClick={() => { setMagicSent(false); setCountdown(0); }}
                  className="block mx-auto text-xs text-primary hover:underline"
                >
                  Usar outro e-mail
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* footer */}
      <div className="mt-6 text-center space-y-2 max-w-xs">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Ao entrar, você concorda com os novos termos da{" "}
          <span className="underline cursor-pointer">Lei de Autoescolas 2026</span>.
        </p>
        <p className="text-xs text-muted-foreground">
          Ainda não tem conta?{" "}
          <span className="text-primary font-medium cursor-pointer hover:underline">
            Comece seu teste grátis agora.
          </span>
        </p>
      </div>
    </div>
  );
}
