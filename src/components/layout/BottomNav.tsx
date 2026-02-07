import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Wallet, UserCog, AlertTriangle, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { name: "Home", path: "/", icon: LayoutDashboard },
  { name: "Players", path: "/players", icon: Users, roles: ["ADMIN", "STAFF"] },
  { name: "Deposits", path: "/deposits", icon: Wallet },
  { name: "Staff", path: "/staff", icon: UserCog, roles: ["ADMIN"] },
  { name: "Withdrawals", path: "/withdrawals", icon: ArrowUpRight },
  { name: "Disputes", path: "/disputes", icon: AlertTriangle },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                isActive && "bg-primary/20 glow-primary"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
