import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Wallet, UserCog, AlertTriangle, ArrowUpRight, Link as LinkIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { name: "Home", path: "/dashboard", icon: LayoutDashboard },
  { name: "Players", path: "/players", icon: Users, roles: ["ADMIN", "STAFF"] },
  { name: "Deposits", path: "/deposits", icon: Wallet, roles: ["ADMIN", "AGENT", "PLAYER"] },
  { name: "Generated", path: "/generated-links", icon: LinkIcon, roles: ["STAFF", "SUPPORT"] },
  { name: "Staff", path: "/staff", icon: UserCog, roles: ["ADMIN", "AGENT"] },
  { name: "Withdrawals", path: "/withdrawals", icon: ArrowUpRight, roles: ["ADMIN", "AGENT", "PLAYER"] },
  { name: "Disputes", path: "/disputes", icon: AlertTriangle, roles: ["ADMIN", "AGENT", "PLAYER", "SUPPORT"] },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/90 backdrop-blur-xl border-t border-white/5 safe-area-bottom pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 min-w-[60px]",
                isActive
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                isActive ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "bg-transparent"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isActive ? "text-white" : "text-muted-foreground"
              )}>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
