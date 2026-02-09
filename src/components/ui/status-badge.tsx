import { cn } from "../../lib/utils";

type StatusType = "pending" | "verified" | "blocked" | "admin" | "manager" | "support" | "completed" | "failed";

interface StatusBadgeProps {
  status: StatusType;
  children?: React.ReactNode;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]",
  verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]",
  blocked: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]",
  admin: "bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-[0_0_15px_-5px_rgba(168,85,247,0.3)]",
  manager: "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_-5px_rgba(var(--primary),0.3)]",
  support: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]",
  failed: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]",
};

const statusLabels: Record<StatusType, string> = {
  pending: "Pending",
  verified: "Verified",
  blocked: "Blocked",
  admin: "Admin",
  manager: "Manager",
  support: "Support",
  completed: "Success",
  failed: "Failed",
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105",
        statusStyles[status],
        className
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full mr-2",
        status === "pending" && "bg-amber-500 animate-pulse",
        (status === "completed" || status === "verified") && "bg-emerald-500",
        (status === "failed" || status === "blocked") && "bg-red-500",
        status === "admin" && "bg-purple-500",
        status === "support" && "bg-blue-500",
        status === "manager" && "bg-primary",
      )} />
      {children || statusLabels[status]}
    </span>
  );
}
