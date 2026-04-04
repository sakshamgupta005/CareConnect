import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white hover:bg-primary/90",
      secondary: "bg-secondary text-white hover:bg-secondary/90",
      outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-5 text-base",
    };

    const hoverByVariant = {
      primary: { y: -1.5, scale: 1.01, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.16)" },
      secondary: { y: -1.5, scale: 1.01, boxShadow: "0 10px 24px rgba(0, 106, 97, 0.2)" },
      outline: { y: -1.5, scale: 1.005 },
      ghost: { y: -1, scale: 1.005 },
    } as const;

    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={hoverByVariant[variant]}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 360, damping: 22, mass: 0.8 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
