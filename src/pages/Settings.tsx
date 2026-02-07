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
  Check
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "../hooks/use-toast";

interface SettingsSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ icon: Icon, title, description, children }: SettingsSectionProps) {
  return (
    <div className="glass rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="flex-1 w-full">
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>
          <div className="mt-3 sm:mt-4">{children}</div>
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
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    desktop: true,
  });
  
  const [darkMode, setDarkMode] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>



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
            
            <button className="w-full flex items-center justify-between p-2.5 sm:p-3 glass rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm">Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </SettingsSection>

        {/* Billing */}
        <SettingsSection
          icon={CreditCard}
          title="Billing"
          description="Manage your subscription"
        >
          <div className="space-y-3">
            <div className="p-2.5 sm:p-3 glass rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium">Current Plan</p>
                  <p className="text-xs text-muted-foreground">Enterprise</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium flex-shrink-0">Active</span>
              </div>
            </div>
            
            <button className="w-full flex items-center justify-between p-2.5 sm:p-3 glass rounded-lg hover:bg-white/5 transition-colors">
              <span className="text-xs sm:text-sm">View Billing History</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </SettingsSection>

        {/* Language */}
        <SettingsSection
          icon={Globe}
          title="Language & Region"
          description="Set your preferred language"
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="p-2.5 sm:p-3 glass rounded-lg">
              <p className="text-xs text-muted-foreground mb-0.5">Language</p>
              <p className="text-xs sm:text-sm font-medium">English (US)</p>
            </div>
            <div className="p-2.5 sm:p-3 glass rounded-lg">
              <p className="text-xs text-muted-foreground mb-0.5">Timezone</p>
              <p className="text-xs sm:text-sm font-medium">UTC-05:00</p>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
