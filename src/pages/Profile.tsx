import { useState } from "react";
import { User, Mail, Shield, Calendar, Edit2, Camera } from "lucide-react";
import { StatusBadge } from "../components/ui/status-badge";
import { useAuth } from "../contexts/AuthContext";
import { EditProfileModal } from "../components/modals/EditProfileModal";

export default function Profile() {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const roleLabels: Record<string, string> = { ADMIN: "Admin", STAFF: "Staff", SUPPORT: "Support", PLAYER: "Player" };
  const roleStatus = user?.role === "ADMIN" ? "admin" : user?.role === "STAFF" ? "manager" : user?.role === "SUPPORT" ? "support" : "pending";
  const roleName = roleLabels[user?.role ?? ""] ?? user?.role ?? "User";

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">Manage your account information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass gradient-border rounded-lg p-4 sm:p-6 text-center">
            <div className="relative inline-block">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto glow-primary">
                <span className="text-white text-2xl sm:text-3xl font-bold">{user?.name?.charAt(0) || "U"}</span>
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </button>
            </div>
            
            <h2 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4">{user?.name || "User"}</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">{user?.email}</p>
            
            <div className="mt-3 sm:mt-4">
              <StatusBadge status={roleStatus}>{roleName}</StatusBadge>
            </div>

            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="mt-4 sm:mt-6 w-full h-9 sm:h-10 glass rounded-lg border border-white/10 text-xs sm:text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div className="glass gradient-border rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Personal Information</h3>
            
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</label>
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 glass rounded-lg">
                  <User className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{user?.name || "User"}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 glass rounded-lg">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{user?.email}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Role</label>
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 glass rounded-lg">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{roleName}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Member Since</label>
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 glass rounded-lg">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm">January 15, 2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="glass gradient-border rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Activity</h3>
            
            <div className="space-y-2 sm:space-y-3">
              {[
                { action: "Approved withdrawal #1234", time: "2 hours ago" },
                { action: "Added new staff member", time: "5 hours ago" },
                { action: "Updated deposit settings", time: "1 day ago" },
                { action: "Resolved dispute #5678", time: "2 days ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 glass rounded-lg">
                  <span className="text-xs sm:text-sm truncate mr-2">{item.action}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  );
}
