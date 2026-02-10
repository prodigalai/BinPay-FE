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
      "bg-white/[0.02] border border-white/5 p-6 rounded-2xl relative overflow-hidden transition-all hover:border-white/10 hover:bg-white/[0.04]",
      className
    )}>
      
      <div className="relative flex justify-between items-start">
        <div className="space-y-2">
          {/* LABEL */}
          <p className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest">
            {title}
          </p>

          {/* MAIN VALUE */}
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {value}
          </h3>
          
          {/* DELTA */}
          {change && (
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-bold mt-1",
              changeType === "positive" && "text-emerald-500",
              changeType === "negative" && "text-red-500",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                changeType === "positive" && "bg-emerald-500",
                changeType === "negative" && "bg-red-500",
                changeType === "neutral" && "bg-gray-500"
              )} />
              <span>{change}</span>
            </div>
          )}
        </div>

        {/* ICON - More subtle */}
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground/70" />
        </div>
      </div>
    </div>
  );
}
