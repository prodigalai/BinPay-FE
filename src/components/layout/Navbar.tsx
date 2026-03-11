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
  ArrowUpRight,
  Menu,
  X,
  FileText,
  CreditCard,
  Settings,
  User
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { api, NotificationsResponse } from "../../lib/api";
import { LogoutConfirmModal } from "../modals/LogoutConfirmModal";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Deposits", path: "/deposits", icon: Wallet, roles: ["ADMIN", "AGENT", "PLAYER"] },
  { name: "Staff", path: "/staff", icon: UserCog, roles: ["ADMIN", "AGENT"] },
  { name: "Withdrawals", path: "/withdrawals", icon: ArrowUpRight, roles: ["ADMIN", "PLAYER", "AGENT"] },
  { name: "Disputes", path: "/disputes", icon: AlertTriangle, roles: ["ADMIN", "AGENT", "SUPPORT"] },
];

const mobileExtraItems = [
  { name: "Generated Links", path: "/generated-links", icon: LinkIcon, roles: ["ADMIN", "AGENT", "STAFF", "SUPPORT"] },
  { name: "Payout Links", path: "/payout-links", icon: CreditCard, roles: ["ADMIN"] },
  { name: "Logs", path: "/logs", icon: FileText, roles: ["ADMIN"] },
];

export function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

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
    navigate("/login", { replace: true });
    setIsLogoutModalOpen(false);
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!user?.role || !item.roles.includes(user.role)) return false;
    if (item.path === "/withdrawals" && (user?.email || "").toLowerCase() === "payments@pay4edge.com") return false;
    return true;
  });

  const filteredMobileExtra = mobileExtraItems.filter((item) => 
    item.roles && user?.role && item.roles.includes(user.role)
  );

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-black/60 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Mobile: Menu (All) + Logo */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              <div 
                className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" 
                onClick={() => { navigate("/dashboard"); closeMenus(); }}
              >
                <div className="h-6 sm:h-7 lg:h-8 flex items-center justify-center">
                  <img
                    src="/navlogo.png"
                    alt="Pay4Edge"
                    className="h-full w-auto object-contain hover:opacity-80 transition-opacity"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase tracking-widest transition-colors duration-200 border-b-2 border-transparent",
                      isActive
                        ? "text-primary border-primary"
                        : "text-muted-foreground hover:text-white hover:border-white/30"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-3">
              <NavLink 
                to="/notifications" 
                onClick={closeMenus}
                className="relative p-2 sm:p-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
                )}
              </NavLink>
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-white/5 transition-colors min-w-0"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 ring-2 ring-primary/30">
                    <span className="text-white text-sm font-bold">{user?.name?.charAt(0) || "U"}</span>
                  </div>
                  <div className="hidden lg:block text-left min-w-0">
                    <p className="text-sm font-medium truncate max-w-[120px]">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">{user?.email}</p>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform hidden sm:block shrink-0", isProfileOpen && "rotate-180")} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 z-[60]">
                    <NavLink to="/profile" onClick={closeMenus} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5">
                      <User className="w-4 h-4 text-primary shrink-0" /> Profile
                    </NavLink>
                    <NavLink to="/settings" onClick={closeMenus} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5">
                      <Settings className="w-4 h-4 shrink-0" /> Settings
                    </NavLink>
                    {user?.role && ["ADMIN", "STAFF"].includes(user.role) && (
                      <NavLink to="/players" onClick={closeMenus} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5">
                        <Users className="w-4 h-4 text-primary shrink-0" /> Players
                      </NavLink>
                    )}
                    {user?.role && ["ADMIN", "AGENT", "SUPPORT", "PLAYER"].includes(user.role) && (
                      <NavLink to="/disputes" onClick={closeMenus} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> Disputes
                      </NavLink>
                    )}
                    <hr className="my-1.5 border-white/10" />
                    <button onClick={() => { setIsProfileOpen(false); setIsLogoutModalOpen(true); }} className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-white/5 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out: All + Profile */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[55] md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />
          <div className="fixed top-0 left-0 bottom-0 w-[min(280px,85vw)] max-w-[280px] z-[56] md:hidden bg-[#0a0a0f] border-r border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-left-2 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-white/10" aria-label="Close menu"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center ring-2 ring-primary/30 shrink-0">
                  <span className="text-white text-lg font-bold">{user?.name?.charAt(0) || "U"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <NavLink to="/profile" onClick={closeMenus} className="text-xs text-primary font-medium mt-1 inline-block">View profile →</NavLink>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <p className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">All</p>
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink key={item.path} to={item.path} onClick={closeMenus} className={cn("flex items-center gap-3 px-4 py-3 text-sm", isActive ? "bg-primary/15 text-primary border-l-2 border-primary" : "hover:bg-white/5")}>
                    <item.icon className="w-5 h-5 shrink-0" /> {item.name}
                  </NavLink>
                );
              })}
              {filteredMobileExtra.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink key={item.path} to={item.path} onClick={closeMenus} className={cn("flex items-center gap-3 px-4 py-3 text-sm", isActive ? "bg-primary/15 text-primary border-l-2 border-primary" : "hover:bg-white/5")}>
                    <item.icon className="w-5 h-5 shrink-0" /> {item.name}
                  </NavLink>
                );
              })}
              <p className="px-4 py-1.5 mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account</p>
              <NavLink to="/profile" onClick={closeMenus} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5"><User className="w-5 h-5 shrink-0" /> Profile</NavLink>
              <NavLink to="/settings" onClick={closeMenus} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5"><Settings className="w-5 h-5 shrink-0" /> Settings</NavLink>
              <NavLink to="/notifications" onClick={closeMenus} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5">
                <Bell className="w-5 h-5 shrink-0" /> Notifications {unreadCount > 0 && <span className="ml-auto w-2 h-2 bg-accent rounded-full animate-pulse" />}
              </NavLink>
            </div>
            <div className="p-2 border-t border-white/10">
              <button onClick={() => { closeMenus(); setIsLogoutModalOpen(true); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-destructive hover:bg-white/5 rounded-xl">
                <LogOut className="w-5 h-5 shrink-0" /> Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
