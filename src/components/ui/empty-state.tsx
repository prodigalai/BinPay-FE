import { cn } from "../../lib/utils";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon, title, description, className, children }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-10 sm:py-16 px-4",
      className
    )}>
      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 sm:mb-6 animate-float">
        {icon || <Inbox className="w-7 h-7 sm:w-10 sm:h-10 text-muted-foreground" />}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 sm:mb-2">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-sm">{description}</p>
      )}
      {children}
    </div>
  );
}
