import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Activity, Download, Copy } from "lucide-react";
import { StatCard } from "../components/ui/stat-card";
import { PerformanceChart } from "../components/charts/PerformanceChart";
import { api } from "../lib/api";
import { toast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { CreateDepositModal } from "../components/modals/CreateDepositModal";
import { Plus } from "lucide-react";

const stats = [
  {
    title: "Total Deposits",
    value: "$847,293",
    change: "+12.5% from last month",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
  {
    title: "Withdrawals",
    value: "$423,891",
    change: "+8.2% from last month",
    changeType: "negative" as const,
    icon: TrendingDown,
  },
  {
    title: "Fees Collected",
    value: "$12,847",
    change: "+5.1% from last month",
    changeType: "positive" as const,
    icon: DollarSign,
  },
  {
    title: "Cash Flow",
    value: "$423,402",
    change: "+18.7% from last month",
    changeType: "positive" as const,
    icon: Activity,
  },
];

const overallStatsData = [
  { label: "Total Deposits", value: "$0.00", color: "text-green-400" },
  { label: "Total Withdrawals", value: "$0.00", color: "text-blue-400" },
  { label: "Fees Owed", value: "$0.00", color: "text-red-400" },
  { label: "Disputes/Refunds", value: "$0.00", color: "text-orange-400" },
  { label: "Cash Flow", value: "$0.00", color: "text-primary" },
];

export default function Dashboard() {
  const [startDate, setStartDate] = useState("2026-01-02");
  const [endDate, setEndDate] = useState("2026-02-07");
  const [balance, setBalance] = useState<number | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const { user } = useAuth();
  const isPlayer = user?.role === "PLAYER";

  useEffect(() => {
    api.get<{ success: boolean; balance: number }>("wallets/balance").then((r) => r.success && setBalance(r.balance)).catch(() => {});
  }, []);

  const handleCopyLink = () => {
    toast({ title: "Create a deposit in Deposits page to get a payment link" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Deposits Link Card */}
      <div className="glass rounded-lg p-4 sm:p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -z-10 group-hover:bg-primary/20 transition-colors" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Quick Deposit</h2>
              <p className="text-sm text-muted-foreground">Add funds to your wallet balance instantly</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-w-[140px]">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Available Balance</p>
              <p className="text-lg font-bold text-primary">{balance !== null ? `$${balance.toFixed(2)}` : "—"}</p>
            </div>
            <button 
              onClick={() => setIsDepositModalOpen(true)}
              className="neon-button-accent inline-flex items-center justify-center gap-2 px-6 h-12 text-sm font-bold shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              Deposit Now
            </button>
          </div>
        </div>
      </div>

      {/* Admin Stats Header - Only show for non-players */}
      {!isPlayer && (
        <div className="glass rounded-lg p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold">Overall Statistics</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Start Date:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 bg-card/60 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">End Date:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-card/60 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button className="neon-button px-5 py-2 text-sm font-semibold">
                Get Statistics
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {overallStatsData.map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <p className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-medium opacity-60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Stats Grid - Show simplified for players or full for admin */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {(!isPlayer ? stats : stats.slice(0, 2)).map((stat) => (
          (stat as any).changeType ? (
            <StatCard key={stat.title} {...stat} />
          ) : null
        ))}
      </div>

      {/* Chart */}
      <div className="glass p-1">
        <PerformanceChart />
      </div>

      {/* Recent Activity */}
      <div className="glass gradient-border rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: "Deposit received", user: "john_doe", amount: "+$5,200", time: "2 min ago" },
            { action: "Withdrawal processed", user: "jane_smith", amount: "-$1,800", time: "15 min ago" },
            { action: "New player registered", user: "mike_wilson", amount: "-", time: "1 hour ago" },
            { action: "KYC approved", user: "sarah_jones", amount: "-", time: "2 hours ago" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-semibold text-primary">
                    {activity.user.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{activity.action}</p>
                  <p className="text-xs text-muted-foreground truncate">@{activity.user}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className={`text-xs sm:text-sm font-semibold ${activity.amount.startsWith('+') ? 'text-green-400' : activity.amount.startsWith('-') ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {activity.amount}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateDepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
        onSuccess={() => {
          // Refresh balance
          api.get<{ success: boolean; balance: number }>("wallets/balance").then((r) => r.success && setBalance(r.balance)).catch(() => {});
        }}
      />
    </div>
  );
}
