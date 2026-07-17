import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  variant?: "default" | "transparent" | "glass" | "glass-strong";
  withScanline?: boolean;
  /** When true, the inner content wrapper uses overflow-hidden instead of overflow-auto.
   *  Required for map panels where overflow-auto intercepts MapLibre drag events. */
  noScrollWrapper?: boolean;
  /** Optional actions/controls to render in the panel header right side */
  headerActions?: ReactNode;
  /** Optional accent color for the panel top border */
  accent?: 'cyan' | 'red' | 'amber' | 'green' | 'purple' | 'none';
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      className,
      children,
      title,
      subtitle,
      variant = "default",
      withScanline = false,
      noScrollWrapper = false,
      headerActions,
      accent = 'none',
      ...props
    },
    ref
  ) => {
    const accentBorder: Record<string, string> = {
      cyan:   'border-t border-t-accent-cyan/40',
      red:    'border-t border-t-accent-red/40',
      amber:  'border-t border-t-accent-amber/40',
      green:  'border-t border-t-accent-green/40',
      purple: 'border-t border-t-accent-purple/40',
      none:   '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col overflow-hidden rounded-sm",
          variant === "default" && "bg-tactical-800 border border-tactical-700/60 shadow-lg",
          variant === "glass" && "glass-panel",
          variant === "glass-strong" && "glass-panel-strong",
          variant === "transparent" && "bg-transparent border-transparent",
          withScanline && "tactical-panel",
          accent !== 'none' && accentBorder[accent],
          className
        )}
        {...props}
      >
        {title && (
          <div className="flex-none flex items-center justify-between px-3 py-2 border-b border-tactical-700/50 bg-tactical-900/30">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h3 className="text-xxs font-mono tracking-widest uppercase text-tactical-400 leading-none">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[9px] font-mono text-tactical-600 truncate">{subtitle}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        )}
        <div className={cn("flex-1 min-h-0", noScrollWrapper ? "overflow-hidden" : "overflow-auto")}>
          {children}
        </div>
      </div>
    );
  }
);

Panel.displayName = "Panel";
