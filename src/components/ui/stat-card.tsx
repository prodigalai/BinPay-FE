import { cn } from "../../lib/utils";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

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
      "group relative overflow-hidden",
      "bg-gradient-to-br from-[#12151a] to-[#0e1117]",
      "border border-[#1e2330]",
      "rounded-2xl",
      "p-6",
      "transition-all duration-300 ease-out",
      "hover:-translate-y-1 hover:border-[#2a3040]",
      "hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]",
      className
    )}>
      {/* Subtle top accent line */}
      <div className={cn(
        "absolute top-0 left-6 right-6 h-[1px]",
        changeType === "positive" && "bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent",
        changeType === "negative" && "bg-gradient-to-r from-transparent via-red-500/40 to-transparent",
        changeType === "neutral" && "bg-gradient-to-r from-transparent via-white/10 to-transparent",
      )} />

      {/* Hover glow — very subtle */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={cn(
          "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl",
          changeType === "positive" && "bg-emerald-500/[0.04]",
          changeType === "negative" && "bg-red-500/[0.04]",
          changeType === "neutral" && "bg-blue-500/[0.03]",
        )} />
      </div>

      <div className="relative">
        {/* Header: Icon + Label */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              changeType === "positive" && "bg-emerald-500/[0.08] text-emerald-400",
              changeType === "negative" && "bg-red-500/[0.08] text-red-400",
              changeType === "neutral" && "bg-[#1a1f2e] text-[#5a6680]",
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-[13px] font-medium text-[#6b7a90]">
              {title}
            </p>
          </div>
        </div>

        {/* Value */}
        <h3 className="text-[30px] font-semibold text-white tracking-[-0.02em] leading-none mb-3">
          {value}
        </h3>
        
        {/* Change indicator */}
        {change && (
          <div className={cn(
            "inline-flex items-center gap-1 text-[12px] font-medium",
            changeType === "positive" && "text-emerald-400",
            changeType === "negative" && "text-red-400",
            changeType === "neutral" && "text-[#4a5568]"
          )}>
            {changeType === "positive" && <ArrowUpRight className="w-3.5 h-3.5" />}
            {changeType === "negative" && <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
