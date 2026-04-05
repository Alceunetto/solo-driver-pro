import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign, TrendingUp, TrendingDown, Fuel, PlusCircle, QrCode,
  ArrowUpRight, ArrowDownRight, Calculator, Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/shared/PageTransition";
import { ShimmerSkeleton } from "@/components/shared/ShimmerSkeleton";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "entrada" | "saida";
  category: string;
}

const initialTransactions: Transaction[] = [
  { id: "1", date: "04/03", description: "Aula Maria Silva", amount: 120, type: "entrada", category: "Aula Prática" },
  { id: "2", date: "04/03", description: "Aula João Santos", amount: 120, type: "entrada", category: "Aula Prática" },
  { id: "3", date: "04/03", description: "Aula Pedro Lima", amount: 140, type: "entrada", category: "Simulado" },
  { id: "4", date: "03/03", description: "Gasolina - 40L", amount: 280, type: "saida", category: "Combustível" },
  { id: "5", date: "02/03", description: "Taxa Detran 2026", amount: 150, type: "saida", category: "Taxas" },
  { id: "6", date: "01/03", description: "Seguro mensal", amount: 320, type: "saida", category: "Seguro" },
  { id: "7", date: "03/03", description: "Aula Ana Costa", amount: 120, type: "entrada", category: "Aula Prática" },
  { id: "8", date: "02/03", description: "Aula Carlos Dias", amount: 120, type: "entrada", category: "Aula Prática" },
];

export default function Financeiro() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTx, setNewTx] = useState<{ description: string; amount: string; type: "entrada" | "saida"; category: string }>({ description: "", amount: "", type: "entrada", category: "" });
  const { toast } = useToast();

  const totalEntradas = transactions.filter((t) => t.type === "entrada").reduce((s, t) => s + t.amount, 0);
  const totalSaidas = transactions.filter((t) => t.type === "saida").reduce((s, t) => s + t.amount, 0);
  const lucroLiquido = totalEntradas - totalSaidas;
  const horasTrabalhadas = transactions.filter((t) => t.type === "entrada").length;
  const roiPorHora = horasTrabalhadas > 0 ? lucroLiquido / horasTrabalhadas : 0;

  const addTransaction = () => {
    if (!newTx.description || !newTx.amount || !newTx.category) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      description: newTx.description,
      amount: parseFloat(newTx.amount),
      type: newTx.type,
      category: newTx.category,
    };
    setTransactions((prev) => [tx, ...prev]);
    setNewTx({ description: "", amount: "", type: "entrada", category: "" });
    setDialogOpen(false);
  };

  const generatePixLink = () => {
    toast({
      title: "Link Pix copiado!",
      description: "Envie ao aluno para receber o pagamento.",
    });
  };

  return (
    <PageTransition className="container px-4 py-6 pb-24 space-y-6 max-w-3xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 rounded-lg bg-success/10">
              <ArrowUpRight className="w-4 h-4 text-success" />
            </div>
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Entradas</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-success tracking-tight">R$ {totalEntradas.toLocaleString()}</p>
        </motion.div>
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 rounded-lg bg-destructive/10">
              <ArrowDownRight className="w-4 h-4 text-destructive" />
            </div>
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Saídas</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-destructive tracking-tight">R$ {totalSaidas.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* ROI Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="glass-card border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-lg bg-primary/10">
                    <Calculator className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">ROI por Hora</span>
                </div>
                <p className={`text-3xl font-extrabold ${roiPorHora >= 0 ? "text-success" : "text-destructive"} tracking-tight`}>
                  R$ {roiPorHora.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Lucro líquido após todos os custos
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1 justify-end">
                  <div className="p-1 rounded-lg bg-accent/10">
                    <Clock className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Lucro</span>
                </div>
                <p className={`text-2xl font-extrabold ${lucroLiquido >= 0 ? "text-success" : "text-destructive"} tracking-tight`}>
                  R$ {lucroLiquido.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 text-sm font-bold rounded-xl fab-shadow">
              <PlusCircle className="w-4 h-4 mr-1.5" /> Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Novo Lançamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={newTx.type} onValueChange={(v) => setNewTx({ ...newTx, type: v as "entrada" | "saida" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">💰 Entrada</SelectItem>
                    <SelectItem value="saida">💸 Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  placeholder="Ex: Aula Maria Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  placeholder="120"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={newTx.category} onValueChange={(v) => setNewTx({ ...newTx, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aula Prática">Aula Prática</SelectItem>
                    <SelectItem value="Simulado">Simulado</SelectItem>
                    <SelectItem value="Combustível">Combustível</SelectItem>
                    <SelectItem value="Taxas">Taxas Detran</SelectItem>
                    <SelectItem value="Seguro">Seguro</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addTransaction} className="w-full h-12 font-bold rounded-xl">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button onClick={generatePixLink} variant="outline" className="h-12 text-sm font-bold rounded-xl">
          <QrCode className="w-4 h-4 mr-1.5" /> Cobrar via Pix
        </Button>
      </div>

      {/* Transactions */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-1 rounded-lg bg-primary/10">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            Fluxo de Caixa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/20"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-2 rounded-xl ${tx.type === "entrada" ? "bg-success/10" : "bg-destructive/10"}`}>
                  {tx.type === "entrada" ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.date} · {tx.category}</p>
                </div>
              </div>
              <p className={`text-sm font-bold ${tx.type === "entrada" ? "text-success" : "text-destructive"}`}>
                {tx.type === "entrada" ? "+" : "-"}R$ {tx.amount}
              </p>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </PageTransition>
  );
}
