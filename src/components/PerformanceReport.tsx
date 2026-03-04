import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import {
  Car, Calendar, Clock, Route as RouteIcon, MessageCircle,
  Image as ImageIcon, Share2, Eye, EyeOff, X, Loader2, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Skill {
  name: string;
  value: number;
}

interface ReportData {
  studentName: string;
  instructorName: string;
  date: string;
  duration: number;
  km?: number;
  skills: Skill[];
  averageProgress: number;
  evolution: number;
  lessonValue?: number;
}

interface PerformanceReportProps {
  data: ReportData;
  open: boolean;
  onClose: () => void;
}

function SkillBar({ name, value }: Skill) {
  const color =
    value >= 75
      ? "bg-success"
      : value >= 50
      ? "bg-accent"
      : "bg-destructive";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: "#64748b" }}>{name}</span>
        <span style={{ fontWeight: 700, color: "#0f172a" }}>{value}%</span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          backgroundColor: "#e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          className={color}
          style={{
            width: `${value}%`,
            height: "100%",
            borderRadius: 999,
            transition: "width 0.4s",
          }}
        />
      </div>
    </div>
  );
}

export function PerformanceReport({ data, open, onClose }: PerformanceReportProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState(
    "Continue praticando os pontos que precisam de atenção. Você está evoluindo muito bem!"
  );
  const [showValue, setShowValue] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const topSkills = [...data.skills]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  /* ── WhatsApp text share ── */
  const shareWhatsApp = useCallback(() => {
    const skillsList = topSkills.map((s) => `  • ${s.name}: ${s.value}%`).join("\n");
    const valueLine = showValue && data.lessonValue
      ? `\n💰 Valor da aula: R$ ${data.lessonValue.toFixed(2)}`
      : "";

    const msg = `🚗 *Relatório de Evolução - SoloDrive* 🚗\n\nOlá, ${data.studentName}! Veja seu desempenho na aula de hoje:\n\n✅ *Habilidades Treinadas:*\n${skillsList}\n\n📈 Nível de Evolução: ${data.averageProgress}% (+${data.evolution}%)\n⏱️ Duração: ${data.duration} min${data.km ? `\n🛣️ KM rodado: ${data.km}` : ""}${valueLine}\n\n💡 *Dica do Instrutor:*\n${feedback}\n\nContinue focado! Sua aprovação está próxima. 🏁\n\n_Treinado por ${data.instructorName} — O padrão ouro em instrução independente._`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  }, [data, feedback, showValue, topSkills]);

  /* ── Image export ── */
  const exportImage = useCallback(async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Try native share if available (mobile)
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File(
          [blob],
          `solodrive-${data.studentName.replace(/\s/g, "-").toLowerCase()}.png`,
          { type: "image/png" }
        );
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Relatório - ${data.studentName}`,
            files: [file],
          });
          setExporting(false);
          return;
        }
      }

      // Fallback: download
      const link = document.createElement("a");
      link.download = `solodrive-${data.studentName.replace(/\s/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Imagem salva!", description: "Envie pelo WhatsApp como foto." });
    } catch {
      toast({ title: "Erro ao gerar imagem", description: "Tente novamente.", variant: "destructive" });
    }
    setExporting(false);
  }, [data.studentName, toast]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-foreground/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 pt-8 pb-20">
      <div className="w-full max-w-md space-y-4 animate-in slide-in-from-bottom-4 duration-300">
        {/* close */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-card hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* ── Exportable Card ── */}
        <div
          ref={cardRef}
          style={{
            background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
            borderRadius: 16,
            padding: 24,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "#e0f2fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Car style={{ width: 20, height: 20, color: "#0369a1" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                SoloDrive
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                Relatório de Evolução
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar style={{ width: 12, height: 12 }} /> {data.date}
              </div>
            </div>
          </div>

          {/* student + meta */}
          <div
            style={{
              background: "#f1f5f9",
              borderRadius: 12,
              padding: 14,
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
              {data.studentName}
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
                <Clock style={{ width: 13, height: 13 }} /> {data.duration} min
              </div>
              {data.km && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
                  <RouteIcon style={{ width: 13, height: 13 }} /> {data.km} km
                </div>
              )}
            </div>
          </div>

          {/* progress ring */}
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: data.averageProgress >= 70 ? "#16a34a" : data.averageProgress >= 50 ? "#f59e0b" : "#ef4444",
                  lineHeight: 1,
                }}
              >
                {data.averageProgress}%
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Progresso Geral{" "}
                <span style={{ color: "#16a34a", fontWeight: 600 }}>+{data.evolution}%</span>
              </div>
            </div>
          </div>

          {/* skills */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>
              Habilidades Avaliadas
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.skills.map((s) => (
                <SkillBar key={s.name} {...s} />
              ))}
            </div>
          </div>

          {/* feedback */}
          <div
            style={{
              background: "#f0fdf4",
              borderRadius: 10,
              padding: 12,
              borderLeft: "3px solid #16a34a",
              marginBottom: showValue && data.lessonValue ? 14 : 0,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", marginBottom: 4 }}>
              💡 Dica do Instrutor
            </div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
              {feedback}
            </div>
          </div>

          {/* value (optional) */}
          {showValue && data.lessonValue && (
            <div
              style={{
                background: "#fefce8",
                borderRadius: 10,
                padding: 10,
                textAlign: "center",
                fontSize: 13,
                color: "#92400e",
                fontWeight: 600,
              }}
            >
              💰 Valor da aula: R$ {data.lessonValue.toFixed(2)}
            </div>
          )}

          {/* footer branding */}
          <div
            style={{
              textAlign: "center",
              marginTop: 18,
              paddingTop: 14,
              borderTop: "1px solid #e2e8f0",
              fontSize: 10,
              color: "#94a3b8",
            }}
          >
            Treinado por <span style={{ fontWeight: 600 }}>{data.instructorName}</span> —
            O padrão ouro em instrução independente.
          </div>
        </div>

        {/* ── Controls (outside exportable area) ── */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
          {/* feedback input */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Feedback do Instrutor</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={2}
              className="resize-none text-sm"
              placeholder="Escreva o feedback para o aluno..."
            />
          </div>

          {/* privacy toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showValue ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              <Label className="text-sm">Incluir valor da aula</Label>
            </div>
            <Switch checked={showValue} onCheckedChange={setShowValue} />
          </div>

          {/* actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={exportImage}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              Salvar Imagem
            </Button>
            <Button
              className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
              onClick={shareWhatsApp}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
