import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Filter, ArrowDown, ArrowUp, AlertTriangle, UserPlus, DollarSign, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "../hooks/use-toast";
import { cn } from "../lib/utils";
import { GlassSelect } from "../components/ui/glass-select";

type NotificationType = "deposit" | "alert" | "user" | "security";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const dummyNotifications: Notification[] = [
  {
    id: "1",
    type: "deposit",
    title: "New Deposit Received",
    message: "User alex_gamer deposited $500.00 via Credit Card",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "alert",
    title: "Dispute Opened",
    message: "A new dispute has been filed for transaction DEP005",
    time: "15 minutes ago",
    read: false,
  },
  {
    id: "3",
    type: "user",
    title: "New Player Registered",
    message: "john_lucky has created a new account and verified their email",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "4",
    type: "security",
    title: "Security Alert",
    message: "Multiple failed login attempts detected from IP 192.168.1.100",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "deposit",
    title: "Large Deposit Processed",
    message: "VIP user emma_vip deposited $5,000.00 via Bank Transfer",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "6",
    type: "alert",
    title: "Withdrawal Pending Approval",
    message: "User mike_pro requested withdrawal of $2,500.00",
    time: "4 hours ago",
    read: true,
  },
  {
    id: "7",
    type: "user",
    title: "KYC Verification Complete",
    message: "User sarah_bet has completed KYC verification successfully",
    time: "5 hours ago",
    read: true,
  },
  {
    id: "8",
    type: "security",
    title: "Password Changed",
    message: "Staff member John updated their password",
    time: "1 day ago",
    read: true,
  },
];

const filterOptions = [
  { value: "all", label: "All Notifications" },
  { value: "unread", label: "Unread" },
  { value: "deposit", label: "Deposits" },
  { value: "alert", label: "Alerts" },
  { value: "user", label: "Users" },
  { value: "security", label: "Security" },
];

const typeIcons: Record<NotificationType, React.ElementType> = {
  deposit: DollarSign,
  alert: AlertTriangle,
  user: UserPlus,
  security: Shield,
};

const typeColors: Record<NotificationType, string> = {
  deposit: "from-primary to-accent",
  alert: "from-yellow-500 to-orange-500",
  user: "from-blue-500 to-cyan-500",
  security: "from-red-500 to-pink-500",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);
  const [filter, setFilter] = useState("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast({
      title: "Marked as read",
      description: "Notification has been marked as read.",
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({
      title: "All marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast({
      title: "Notification deleted",
      description: "Notification has been removed.",
      variant: "destructive",
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast({
      title: "All cleared",
      description: "All notifications have been removed.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="border-white/10 gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="border-white/10 gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="w-full sm:w-56">
        <GlassSelect
          options={filterOptions}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="glass gradient-border rounded-lg p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground text-sm">
              {filter === "all"
                ? "You're all caught up! No notifications to display."
                : "No notifications match the selected filter."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = typeIcons[notification.type];
            return (
              <div
                key={notification.id}
                className={cn(
                  "glass gradient-border rounded-lg p-4 transition-all duration-300 hover:bg-white/5",
                  !notification.read && "border-l-2 border-l-primary"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                      typeColors[notification.type]
                    )}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className={cn(
                            "font-medium text-sm sm:text-base",
                            !notification.read && "text-foreground",
                            notification.read && "text-muted-foreground"
                          )}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {notification.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
