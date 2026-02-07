import { useState } from "react";
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
  ArrowUpRight
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { LogoutConfirmModal } from "../modals/LogoutConfirmModal";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Players", path: "/players", icon: Users, roles: ["ADMIN", "STAFF"] },
  { name: "Deposits", path: "/deposits", icon: Wallet },
  { name: "Staff", path: "/staff", icon: UserCog, roles: ["ADMIN"] },
  { name: "Withdrawals", path: "/withdrawals", icon: ArrowUpRight },
  { name: "Disputes", path: "/disputes", icon: AlertTriangle },
];

export function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-primary/25">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center p-0.5">
                <img src="/logo.png" alt="Binpay" className="w-full h-full object-contain rounded-md" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white hidden sm:block">Binpay</span>
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
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-primary/15 text-white border border-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
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
                <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-pulse" />
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
                  <div className="absolute right-0 mt-2 w-44 sm:w-48 glass-strong rounded-lg border border-white/10 py-1.5 animate-fade-in">
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
