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
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Profile</h1>
        <p className="text-sm text-muted-foreground mt-2 font-medium">Manage your personal account details</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center">
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
          {/* Personal Information */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white uppercase italic tracking-tight mb-6">Personal Information</h3>
            
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Full Name</label>
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <User className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-bold text-white truncate">{user?.name || "User"}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Email</label>
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-bold text-white truncate">{user?.email}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Role</label>
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-bold text-white">{roleName}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Member Since</label>
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-bold text-white">January 15, 2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity */}
          {/* Activity */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white uppercase italic tracking-tight mb-6">Recent Activity</h3>
            
            <div className="space-y-3">
              {[
                { action: "Approved withdrawal #1234", time: "2 hours ago" },
                { action: "Added new staff member", time: "5 hours ago" },
                { action: "Updated deposit settings", time: "1 day ago" },
                { action: "Resolved dispute #5678", time: "2 days ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-colors">
                  <span className="text-xs sm:text-sm font-medium text-white/90 truncate mr-2">{item.action}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">{item.time}</span>
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
