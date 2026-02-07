import { cn } from "../../lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn(
      "glass p-5 hover:bg-white/[0.02] transition-colors relative overflow-hidden group",
      className
    )}>
      
      <div className="relative flex justify-between items-start">
        <div className="space-y-1">
          {/* MAIN VALUE - Big & Clean */}
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {value}
          </h3>
          
          {/* LABEL - Small & Muted */}
          <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wide opacity-60">
            {title}
          </p>

          {/* DELTA - Tiny & Colored */}
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] sm:text-xs font-semibold mt-2",
              changeType === "positive" && "text-emerald-400",
              changeType === "negative" && "text-red-400",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              <span className={cn(
                "px-1.5 py-0.5 rounded-full bg-white/5",
                changeType === "positive" && "bg-emerald-500/10 text-emerald-400",
                changeType === "negative" && "bg-red-500/10 text-red-400"
              )}>
                {changeType === "positive" && "+"}
                {changeType === "negative" && "-"}
                {change.split(' ')[0]}
              </span>
              <span className="opacity-60">{change.split(' ').slice(1).join(' ')}</span>
            </div>
          )}
        </div>

        {/* ICON - Simple Muted */}
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
