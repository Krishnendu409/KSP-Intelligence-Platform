import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2 py-0.5 text-xxs font-mono font-medium uppercase tracking-wider rounded border",
          variant === "default" && "bg-tactical-700 text-tactical-100 border-tactical-600",
          variant === "success" && "bg-accent-green/10 text-accent-green border-accent-green/20",
          variant === "warning" && "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
          variant === "danger" && "bg-accent-red/10 text-accent-red border-accent-red/20",
          variant === "info" && "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
          variant === "outline" && "bg-transparent text-tactical-400 border-tactical-500",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
