import { cn } from "../../lib/utils";

type StatusType = "pending" | "verified" | "blocked" | "admin" | "manager" | "support" | "completed" | "failed";

interface StatusBadgeProps {
  status: StatusType;
  children?: React.ReactNode;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  verified: "bg-green-500/20 text-green-400 border border-green-500/30",
  blocked: "bg-red-500/20 text-red-400 border border-red-500/30",
  admin: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  manager: "bg-primary/20 text-primary border border-primary/30",
  support: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const statusLabels: Record<StatusType, string> = {
  pending: "Pending",
  verified: "Verified",
  blocked: "Blocked",
  admin: "Admin",
  manager: "Manager",
  support: "Support",
  completed: "Completed",
  failed: "Failed",
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {children || statusLabels[status]}
    </span>
  );
}
