import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText, Upload, CheckCircle2, Clock, AlertTriangle, Camera,
  ChevronRight, Search, User
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  studentName: string;
  type: "cnh" | "comprovante" | "laudo" | "taxa" | "contrato";
  status: "pendente" | "validado" | "expirado" | "aguardando";
  uploadDate?: string;
  expiryDate?: string;
}

const mockDocuments: Document[] = [
  { id: "1", name: "CNH do Aluno", studentName: "Maria Silva", type: "cnh", status: "validado", uploadDate: "01/03/2026", expiryDate: "15/08/2030" },
  { id: "2", name: "Comprovante de Residência", studentName: "Maria Silva", type: "comprovante", status: "validado", uploadDate: "01/03/2026" },
  { id: "3", name: "Laudo Médico", studentName: "Maria Silva", type: "laudo", status: "aguardando" },
  { id: "4", name: "Taxa Detran 2026 - DUDA", studentName: "Maria Silva", type: "taxa", status: "pendente" },
  { id: "5", name: "CNH do Aluno", studentName: "João Santos", type: "cnh", status: "validado", uploadDate: "28/02/2026", expiryDate: "20/11/2029" },
  { id: "6", name: "Contrato de Prestação", studentName: "João Santos", type: "contrato", status: "validado", uploadDate: "28/02/2026" },
  { id: "7", name: "Taxa Detran 2026 - DUDA", studentName: "João Santos", type: "taxa", status: "expirado" },
  { id: "8", name: "Laudo Médico", studentName: "Pedro Lima", type: "laudo", status: "pendente" },
  { id: "9", name: "CNH do Aluno", studentName: "Pedro Lima", type: "cnh", status: "pendente" },
];

const statusConfig = {
  pendente: { label: "Pendente", icon: Clock, color: "bg-accent/15 text-accent" },
  validado: { label: "Validado", icon: CheckCircle2, color: "bg-success/15 text-success" },
  expirado: { label: "Expirado", icon: AlertTriangle, color: "bg-destructive/15 text-destructive" },
  aguardando: { label: "Aguardando", icon: Clock, color: "bg-primary/15 text-primary" },
};

const taxas2026 = [
  { name: "DUDA - Doc. Único Digital do Aluno", required: true, status: "Nova em 2026" },
  { name: "Taxa de Agendamento Digital", required: true, status: "Obrigatória" },
  { name: "Seguro DPVAT Instrutor", required: true, status: "Atualizada" },
  { name: "Certificado Digital e-Instrutor", required: false, status: "Opcional" },
];

export default function Documentos() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("todos");

  const filtered = mockDocuments.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.studentName.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "todos" || d.status === filter;
    return matchSearch && matchFilter;
  });

  const grouped = filtered.reduce<Record<string, Document[]>>((acc, doc) => {
    acc[doc.studentName] = acc[doc.studentName] || [];
    acc[doc.studentName].push(doc);
    return acc;
  }, {});

  const stats = {
    total: mockDocuments.length,
    validados: mockDocuments.filter((d) => d.status === "validado").length,
    pendentes: mockDocuments.filter((d) => d.status === "pendente" || d.status === "aguardando").length,
    expirados: mockDocuments.filter((d) => d.status === "expirado").length,
  };

  return (
    <div className="container px-4 py-6 pb-24 space-y-6 max-w-3xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "OK", value: stats.validados, color: "text-success" },
          { label: "Pendente", value: stats.pendentes, color: "text-accent" },
          { label: "Expirado", value: stats.expirados, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar aluno ou documento..."
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["todos", "pendente", "validado", "expirado", "aguardando"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "todos" ? "Todos" : statusConfig[f as keyof typeof statusConfig]?.label || f}
          </button>
        ))}
      </div>

      {/* Documents by Student */}
      {Object.entries(grouped).map(([student, docs]) => (
        <Card key={student} className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {student}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {docs.map((doc) => {
              const cfg = statusConfig[doc.status];
              const StatusIcon = cfg.icon;
              return (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
                      {doc.uploadDate && (
                        <p className="text-xs text-muted-foreground">Enviado: {doc.uploadDate}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${cfg.color} border-0 text-[10px]`}>
                      <StatusIcon className="w-3 h-3 mr-0.5" />
                      {cfg.label}
                    </Badge>
                    {(doc.status === "pendente" || doc.status === "expirado") && (
                      <Button size="sm" variant="ghost" className="h-7 px-2">
                        <Upload className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Taxas 2026 */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent" />
            Novas Taxas Lei 2026
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {taxas2026.map((taxa) => (
            <div key={taxa.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium text-foreground">{taxa.name}</p>
                <Badge className={`${taxa.required ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"} border-0 text-[10px] mt-1`}>
                  {taxa.status}
                </Badge>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upload Button */}
      <Button className="w-full h-12 text-base font-semibold">
        <Camera className="w-5 h-5 mr-2" />
        Fotografar Documento
      </Button>
    </div>
  );
}
