import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, Filter, AlertTriangle, UserPlus, DollarSign, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "../hooks/use-toast";
import { cn } from "../lib/utils";
import { GlassSelect } from "../components/ui/glass-select";
import { api, type Notification, type NotificationsResponse } from "../lib/api";

const filterOptions = [
  { value: "all", label: "All Notifications" },
  { value: "unread", label: "Unread" },
  { value: "DEPOSIT", label: "Deposits" },
  { value: "ALERT", label: "Alerts" },
  { value: "USER", label: "Users" },
  { value: "SECURITY", label: "Security" },
];

const typeIcons: Record<string, React.ElementType> = {
  DEPOSIT: DollarSign,
  ALERT: AlertTriangle,
  USER: UserPlus,
  SECURITY: Shield,
};

const typeColors: Record<string, string> = {
  DEPOSIT: "from-primary to-accent",
  ALERT: "from-yellow-500 to-orange-500",
  USER: "from-blue-500 to-cyan-500",
  SECURITY: "from-red-500 to-pink-500",
};

function formatTime(d: string) {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = async () => {
    try {
      const res = await api.get<NotificationsResponse>("notifications");
      if (res.success) setNotifications(res.notifications);
    } catch {
      toast({ title: "Failed to load notifications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      toast({ title: "Marked as read" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast({ title: "All marked as read" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast({ title: "Notification deleted", variant: "destructive" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete("notifications/all");
      setNotifications([]);
      toast({ title: "All cleared", variant: "destructive" });
    } catch {
      toast({ title: "Failed to clear", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            You have <span className="text-white font-bold">{unreadCount}</span> unread notification{unreadCount !== 1 ? "s" : ""}
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
        {loading ? (
          <p className="py-10 text-center text-muted-foreground animate-pulse">Loading alerts...</p>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase italic tracking-tight mb-2">No Notifications</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {filter === "all"
                ? "You're all caught up! No notifications to display."
                : "No notifications match the selected filter."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            return (
              <div
                key={notification._id}
                className={cn(
                  "bg-white/[0.02] border border-white/5 rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10 group",
                  !notification.read && "border-l-2 border-l-primary bg-white/[0.04]"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                      typeColors[notification.type] || "bg-primary"
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
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification._id)}
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
