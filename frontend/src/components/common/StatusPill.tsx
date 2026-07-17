import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  status: "active" | "inactive" | "pending" | "error" | "warning";
  label?: string;
  pulsing?: boolean;
}

export const StatusPill = forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ className, status, label, pulsing = false, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tactical-800/80 border border-tactical-600 text-xxs font-mono tracking-wider uppercase",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            status === "active" && "bg-accent-green",
            status === "inactive" && "bg-tactical-500",
            status === "pending" && "bg-accent-blue",
            status === "error" && "bg-accent-red",
            status === "warning" && "bg-accent-amber",
            pulsing && "animate-pulse"
          )}
        />
        {label && <span className="text-tactical-300">{label}</span>}
      </span>
    );
  }
);

StatusPill.displayName = "StatusPill";
