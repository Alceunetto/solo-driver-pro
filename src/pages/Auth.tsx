import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Route, Mail, Loader2, ArrowLeft, ShieldCheck, LogIn, UserPlus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "free";
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    }
    // onAuthStateChange will redirect
  }, [email, password, toast]);

  const handleSignup = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Verifique seu e-mail",
        description: "Enviamos um link de confirmação para " + email.trim(),
      });
    }
  }, [email, password, fullName, toast]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;

  const planLabel =
    plan === "annual" ? "Empreendedor (Anual)" :
    plan === "monthly" ? "Profissional (Mensal)" :
    "Iniciante (Grátis)";

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
          onValueChange={(v) => setTab(v as "login" | "signup")}
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="login" className="gap-1.5">
              <LogIn className="w-4 h-4" />
              Entrar
            </TabsTrigger>
            <TabsTrigger value="signup" className="gap-1.5">
              <UserPlus className="w-4 h-4" />
              Criar conta
            </TabsTrigger>
          </TabsList>

          {/* ── Login tab ── */}
          <TabsContent value="login" className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <Input
                type="email"
                placeholder="instrutor@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              disabled={!isEmailValid || !isPasswordValid || loading}
              onClick={handleLogin}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              Entrar
            </Button>
          </TabsContent>

          {/* ── Signup tab ── */}
          <TabsContent value="signup" className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome completo</label>
              <Input
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <Input
                type="email"
                placeholder="instrutor@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              disabled={!isEmailValid || !isPasswordValid || !fullName.trim() || loading}
              onClick={handleSignup}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Criar conta
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Você receberá um e-mail de confirmação antes de acessar.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* footer */}
      <div className="mt-6 text-center space-y-2 max-w-xs">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Ao entrar, você concorda com os novos termos da{" "}
          <span className="underline cursor-pointer">Lei de Autoescolas 2026</span>.
        </p>
      </div>
    </div>
  );
}
