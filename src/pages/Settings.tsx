import { useState } from "react";
import { 
  Globe, 
  Bell, 
  Lock, 
  Palette, 
  Shield, 
  CreditCard,
  ChevronRight,
  Moon,
  Sun,
  Eye,
  EyeOff,
  X,
  Save
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";

interface SettingsSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ icon: Icon, title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 hover:border-white/10 transition-colors">
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="flex-1 w-full">
          <h3 className="text-lg sm:text-xl font-bold text-white uppercase italic tracking-tight">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-4">{description}</p>
          <div className="mt-2 text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        "w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-colors duration-200 relative flex-shrink-0",
        enabled ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white transition-transform duration-200",
          enabled && "translate-x-5"
        )}
      />
    </button>
  );
}

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    desktop: true,
  });
  
  const [darkMode, setDarkMode] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [saving, setSaving] = useState(false);

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // In a real app, you'd save to backend
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({ title: "Notifications updated", description: "Your preferences have been saved." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save preferences", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ password: passwordForm.newPassword });
      toast({ title: "Success", description: "Password changed successfully" });
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to change password", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Settings</h1>

      <div className="grid gap-6 w-full lg:grid-cols-2">
        {/* Notifications */}
        <SettingsSection
          icon={Bell}
          title="Notifications"
          description="Choose how you want to be notified"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground truncate">Receive updates via email</p>
              </div>
              <Toggle 
                enabled={notifications.email} 
                onChange={(v) => setNotifications({ ...notifications, email: v })} 
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium">Push Notifications</p>
                <p className="text-xs text-muted-foreground truncate">Receive push notifications</p>
              </div>
              <Toggle 
                enabled={notifications.push} 
                onChange={(v) => setNotifications({ ...notifications, push: v })} 
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium">Desktop Notifications</p>
                <p className="text-xs text-muted-foreground truncate">Show desktop alerts</p>
              </div>
              <Toggle 
                enabled={notifications.desktop} 
                onChange={(v) => setNotifications({ ...notifications, desktop: v })} 
              />
            </div>
            <button 
              onClick={handleSaveNotifications}
              disabled={saving}
              className="neon-button w-full mt-3 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection
          icon={Palette}
          title="Appearance"
          description="Customize the look and feel"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {darkMode ? <Moon className="w-4 h-4 text-primary flex-shrink-0" /> : <Sun className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground truncate">Use dark theme</p>
              </div>
            </div>
            <Toggle enabled={darkMode} onChange={setDarkMode} />
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection
          icon={Shield}
          title="Security"
          description="Protect your account"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground truncate">Add an extra layer of security</p>
              </div>
              <Toggle enabled={twoFactor} onChange={setTwoFactor} />
            </div>
            
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full flex items-center justify-between p-2.5 sm:p-3 glass rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm">Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </SettingsSection>

        {/* Account Info */}
        <SettingsSection
          icon={Globe}
          title="Account Information"
          description="Your account details"
        >
          <div className="space-y-3">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Name</p>
              <p className="text-sm font-bold text-white">{user?.name || "—"}</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Email</p>
              <p className="text-sm font-bold text-white">{user?.email || "—"}</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Role</p>
              <p className="text-sm font-bold text-white">{user?.role || "—"}</p>
            </div>
            {user?.location && (
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Location</p>
                <p className="text-sm font-bold text-white">{user.location}</p>
              </div>
            )}
          </div>
        </SettingsSection>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Change Password</h2>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-sm font-medium mb-2 block">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 pr-12 text-sm focus:border-primary/50 outline-none transition-all"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-sm font-medium mb-2 block">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 pr-12 text-sm focus:border-primary/50 outline-none transition-all"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium mb-2 block">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 pr-12 text-sm focus:border-primary/50 outline-none transition-all"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 h-11 glass rounded-xl font-semibold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 neon-button font-semibold"
                >
                  {saving ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
