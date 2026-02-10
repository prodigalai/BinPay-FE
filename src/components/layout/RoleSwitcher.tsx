import { Shield, UserCog, Headphones, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth, UserRole } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";

const roles: { id: UserRole; name: string; icon: React.ElementType }[] = [
  { id: "admin", name: "Admin", icon: Shield },
  { id: "manager", name: "Manager", icon: UserCog },
  { id: "support", name: "Support", icon: Headphones },
];

export function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, switchRole } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRole = roles.find((r) => r.id === user?.role) || roles[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 hover:border-primary/50 transition-colors"
      >
        <currentRole.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
        <span className="text-xs sm:text-sm font-medium hidden sm:inline">{currentRole.name}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0f] rounded-2xl border border-white/10 py-2 animate-in fade-in slide-in-from-top-2 z-50 shadow-2xl">
          <div className="px-4 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-wider opacity-50">
            Switch Role
          </div>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleChange(role.id)}
              className={cn(
                "w-full flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2 text-xs sm:text-sm hover:bg-white/5 transition-colors",
                user?.role === role.id && "text-primary bg-primary/10"
              )}
            >
              <role.icon className="w-4 h-4" />
              {role.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
