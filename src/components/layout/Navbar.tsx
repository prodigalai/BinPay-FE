import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  UserCog, 
  AlertTriangle,
  ChevronDown,
  Bell,
  LogOut,
  Link as LinkIcon,
  ArrowUpRight
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { api, NotificationsResponse } from "../../lib/api";
import { LogoutConfirmModal } from "../modals/LogoutConfirmModal";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Deposits", path: "/deposits", icon: Wallet, roles: ["ADMIN", "AGENT", "PLAYER"] },
  { name: "Generated", path: "/generated-links", icon: LinkIcon, roles: ["STAFF", "SUPPORT"] },
  { name: "Staff", path: "/staff", icon: UserCog, roles: ["ADMIN", "AGENT"] },
  { name: "Withdrawals", path: "/withdrawals", icon: ArrowUpRight, roles: ["ADMIN", "AGENT", "PLAYER"] },
  { name: "Disputes", path: "/disputes", icon: AlertTriangle, roles: ["ADMIN", "AGENT", "SUPPORT"] },
];

export function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      api.get<NotificationsResponse>("notifications")
        .then(r => {
          if (r.success) {
            setUnreadCount(r.notifications.filter(n => !n.read).length);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]); 

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsLogoutModalOpen(false);
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="h-10 sm:h-10 flex items-center justify-center overflow-hidden">
                <img src="/navlogo.png" alt="Pay4Edge" className="h-full w-auto object-contain hover:opacity-80 transition-opacity" />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                      isActive
                        ? "bg-primary text-black shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notifications */}
              <NavLink 
                to="/notifications" 
                className="relative p-1.5 sm:p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-pulse" />
                )}
              </NavLink>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium truncate max-w-[120px]">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">{user?.email}</p>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform hidden sm:block",
                    isProfileOpen && "rotate-180"
                  )} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                    <NavLink 
                      to="/profile" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-white/5 transition-colors"
                    >
                      Profile
                    </NavLink>
                    <NavLink 
                      to="/settings" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-white/5 transition-colors"
                    >
                      Settings
                    </NavLink>
                    <hr className="my-1.5 border-white/10" />
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-destructive hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
