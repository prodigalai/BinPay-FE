import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Search } from "lucide-react";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  showSearchIcon?: boolean;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, icon, showSearchIcon = true, ...props }, ref) => {
    return (
      <div className="relative">
        {(icon || showSearchIcon) && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon || <Search className="w-4 h-4" />}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-12 glass rounded-xl border border-white/10 bg-card/60 backdrop-blur-xl",
            "px-4 text-sm placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
            "transition-all duration-300",
            (icon || showSearchIcon) && "pl-11",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";
