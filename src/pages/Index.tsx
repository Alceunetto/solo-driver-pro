import { useState, useEffect } from "react";
import { TimelineLogistica } from "@/components/TimelineLogistica";
import { PerformanceCards } from "@/components/PerformanceCards";
import { Car, Sun, Moon } from "lucide-react";

const Index = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">SoloDrive</h1>
              <p className="text-xs text-muted-foreground">Gestão Logística & Financeira</p>
            </div>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="container py-6 space-y-6">
        <PerformanceCards
          totalRevenue={1260}
          totalCosts={180}
          totalHours={9}
          fuelCost={85}
        />

        <TimelineLogistica />
      </main>
    </div>
  );
};

export default Index;
