import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { type ThemeMode } from "../../lib/theme";
import { cn } from "../../lib/utils";

type ThemeToggleProps = {
  mode: ThemeMode;
  onToggle: () => void;
  compact?: boolean;
  className?: string;
};

export function ThemeToggle({ mode, onToggle, compact = false, className }: ThemeToggleProps) {
  const isDark = mode === "dark";
  const sizeClasses = compact
    ? {
        shell: "h-10 w-[100px]",
        rowPadding: "px-1.5",
        rowText: "text-[10px]",
        icon: "h-3 w-3",
        knob: "h-7 w-7",
        darkShift: "translate-x-[64px]",
      }
    : {
        shell: "h-11 w-[112px]",
        rowPadding: "px-2",
        rowText: "text-[11px]",
        icon: "h-3.5 w-3.5",
        knob: "h-8 w-8",
        darkShift: "translate-x-[72px]",
      };

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      className={cn(
        "theme-toggle group relative inline-flex items-center overflow-hidden rounded-full border border-slate-300/80 bg-white/90 px-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.14)] backdrop-blur",
        sizeClasses.shell,
        className,
      )}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      title={isDark ? "Switch to day mode" : "Switch to night mode"}
    >
      <div className={cn("pointer-events-none z-10 flex w-full items-center justify-between font-semibold leading-none text-slate-600", sizeClasses.rowPadding, sizeClasses.rowText)}>
        <span className={`inline-flex items-center gap-0.5 transition-colors duration-300 ${!isDark ? "text-amber-600" : ""}`}>
          <Sun className={sizeClasses.icon} />
          Day
        </span>
        <span className={`inline-flex items-center gap-0.5 transition-colors duration-300 ${isDark ? "text-teal-200" : ""}`}>
          <Moon className={sizeClasses.icon} />
          Night
        </span>
      </div>
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 360, damping: 24 }}
        className={`absolute left-1.5 top-1.5 rounded-full shadow-[0_7px_16px_rgba(15,23,42,0.24)] ${sizeClasses.knob} ${
          isDark
            ? `${sizeClasses.darkShift} bg-gradient-to-br from-emerald-400 to-teal-900`
            : "translate-x-0 bg-gradient-to-br from-amber-300 to-orange-500"
        }`}
      />
    </motion.button>
  );
}
