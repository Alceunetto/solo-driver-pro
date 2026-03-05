import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, X, Rocket, Users, BarChart3, MapPin, FileText } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const FREE_FEATURES = [
  { label: "Limite de 3 alunos", included: true },
  { label: "Relatórios básicos", included: true },
  { label: "Gestão Financeira", included: false },
  { label: "Logística de Mapas", included: false },
];

const PRO_FEATURES = [
  { label: "Alunos Ilimitados", icon: Users },
  { label: "Gestão Financeira", icon: BarChart3 },
  { label: "Logística de Mapas", icon: MapPin },
  { label: "Relatórios VIP", icon: FileText },
];

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-primary/20">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-6 pb-4 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/15 flex items-center justify-center">
            <Rocket className="w-7 h-7 text-accent" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold">
              Você está crescendo! 🚀
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Você atingiu o limite de 3 alunos do plano gratuito. Para continuar
              profissionalizando sua frota e gerenciar alunos ilimitados, escolha
              o plano ideal para você.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Comparison */}
        <div className="p-6 space-y-5">
          {/* Free column */}
          <div className="p-3 rounded-xl bg-muted/50 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Plano Free (atual)
            </p>
            <ul className="space-y-1.5">
              {FREE_FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-sm">
                  {f.included ? (
                    <CheckCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-destructive/60 shrink-0" />
                  )}
                  <span className={f.included ? "text-foreground" : "text-muted-foreground line-through"}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro column */}
          <div className="p-4 rounded-xl border-2 border-primary/30 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-accent" />
                <p className="text-sm font-bold text-foreground">Plano Empreendedor</p>
              </div>
              <Badge className="bg-success/15 text-success border-success/30 text-[10px]">
                Economize 33%
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-foreground">R$ 39,90</span>
              <span className="text-xs text-muted-foreground">/mês</span>
            </div>
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-sm">
                  <f.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">{f.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-2">
            <Button
              className="w-full h-11 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              onClick={() => {
                // TODO: redirect to checkout/Stripe
                window.location.href = "/landing";
              }}
            >
              <Crown className="w-4 h-4 mr-2" />
              Quero Alunos Ilimitados agora
            </Button>
            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              Talvez mais tarde
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
