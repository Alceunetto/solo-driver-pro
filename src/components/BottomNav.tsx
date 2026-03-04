import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, GraduationCap, ClipboardCheck, Wallet, FileText } from "lucide-react";

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="container flex items-center justify-around py-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
