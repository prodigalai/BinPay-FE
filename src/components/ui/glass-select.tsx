import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full h-12 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xl text-white",
            "px-4 pr-10 text-sm appearance-none cursor-pointer placeholder:text-muted-foreground/50",
            "focus:outline-none focus:border-primary/50 focus:bg-white/10 hover:bg-white/10",
            "transition-all duration-300",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-card text-foreground">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    );
  }
);

GlassSelect.displayName = "GlassSelect";
