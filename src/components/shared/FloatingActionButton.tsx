import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, UserPlus, CalendarPlus, X } from "lucide-react";

interface FABAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  colorClass?: string;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
}

function triggerHaptic(duration = 10) {
  if (navigator.vibrate) navigator.vibrate(duration);
}

export function FloatingActionButton({ actions }: FloatingActionButtonProps) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    triggerHaptic(15);
    setOpen(!open);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse items-end gap-3">
        {/* Sub-actions */}
        <AnimatePresence>
          {open &&
            actions.map((action, i) => (
              <motion.button
                key={action.label}
                className="flex items-center gap-3 pr-4 pl-3 py-2.5 rounded-2xl glass-card hover:scale-105 transition-transform active:scale-95"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => {
                  triggerHaptic(10);
                  action.onClick();
                  setOpen(false);
                }}
              >
                <div className={`p-2 rounded-xl ${action.colorClass ?? "bg-primary/15"}`}>
                  <action.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                  {action.label}
                </span>
              </motion.button>
            ))}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center fab-shadow active:scale-90 transition-transform"
          onClick={toggle}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.button>
      </div>
    </>
  );
}

export { triggerHaptic };
