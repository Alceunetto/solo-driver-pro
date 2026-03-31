import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, GraduationCap, ClipboardCheck, Wallet, FileText } from "lucide-react";
import { triggerHaptic } from "./shared/FloatingActionButton";

const navItems = [
  { path: "/", label: "Agenda", icon: CalendarDays },
  { path: "/prontuario", label: "Aluno", icon: GraduationCap },
  { path: "/simulado", label: "Simulado", icon: ClipboardCheck },
  { path: "/financeiro", label: "Financeiro", icon: Wallet },
  { path: "/documentos", label: "Docs", icon: FileText },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/auth" || location.pathname === "/onboarding") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-header bg-card/80 backdrop-blur-2xl safe-area-bottom">
      <div className="container flex items-center justify-around py-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => {
                triggerHaptic(8);
                navigate(path);
              }}
              className="relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] font-semibold relative z-10 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
