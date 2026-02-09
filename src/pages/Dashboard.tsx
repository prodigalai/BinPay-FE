import { useState, useEffect } from "react";
import { 
  Download, 
  Copy, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Plus, 
  Share2, 
  Users, 
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Wallet,
  Wallet2,
  History
} from "lucide-react";
import { PerformanceChart } from "../components/charts/PerformanceChart";
import { api } from "../lib/api";
import { toast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { CreateDepositModal } from "../components/modals/CreateDepositModal";
import { StatCard } from "../components/ui/stat-card";
import { cn } from "../lib/utils";

interface DashboardStats {
  totalDeposits: number;
  activePlayers: number;
  totalWithdrawals: number;
  pendingDisputes: number;
}

interface RecentActivity {
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'USER';
  title: string;
  amount: number;
  currency: string;
  date: string;
  user: string;
  status: string;
  id: string;
  location?: string;
  generatedBy?: { name: string; role: string };
}

interface WebhookLog {
  event: string;
  orderId: string;
  userName: string;
  gateway: string;
  timestamp: string;
  processed: boolean;
  reason?: string;
}

export default function Dashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const { user } = useAuth();
  const isPlayer = user?.role === "PLAYER";
  const isAgentOrStaff = ["AGENT", "STAFF", "SUPPORT", "ADMIN"].includes(user?.role || "");
  const isAgent = user?.role === "AGENT" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  const [paymentAmount, setPaymentAmount] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api.get<{ success: boolean; balance: number }>("wallets/balance").then((r) => r.success && setBalance(r.balance)).catch(() => {});
    
    // Fetch Dashboard Stats
    if (isAgentOrStaff) {
      api.get<{ success: boolean; stats: DashboardStats }>("dashboard/stats")
        .then((r) => {
          if (r.success) setDashboardStats(r.stats);
        })
        .catch(() => {})
        .finally(() => setLoadingStats(false));
      
      // Fetch Recent Activity
      api.get<{ success: boolean; activities: RecentActivity[] }>("dashboard/activity")
        .then((r) => {
          if (r.success) setRecentActivity(r.activities);
        })
        .catch(() => {});

      if (isAdmin) {
        const fetchLogs = () => {
          api.get<{ success: boolean; logs: WebhookLog[] }>("payments/webhooks/logs")
            .then((r) => {
              if (r.success) setWebhookLogs(r.logs);
            })
            .catch(() => {});
        };
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000); // Poll every 10s
        return () => clearInterval(interval);
      }
    } else {
        setLoadingStats(false);
    }
  }, [isAgentOrStaff, isAdmin]);

  const handleGenerateLink = async () => {
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
        toast({ title: "Invalid amount", description: "Please enter a valid amount greater than 0.", variant: "destructive" });
        return;
    }
    setGenerating(true);
    try {
        const res = await api.post<{ success: boolean; paymentLink: string; qrCodeUrl: string }>("agent/payment-link", {
            amount: Number(paymentAmount),
            currency: "USD",
            description: "Payment Link generated from Agent Dashboard"
        });
        if (res.success) {
            setGeneratedLink(res.paymentLink);
            setGeneratedQR(res.qrCodeUrl);
            toast({ title: "Link Ready!", description: "Payment link has been generated successfully." });
        }
    } catch (e) {
        toast({ title: "Failed", description: e instanceof Error ? e.message : "Error generating link", variant: "destructive" });
    } finally {
        setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Link copied to your clipboard." });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Dashboard</h1>
            {isAgentOrStaff && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-black uppercase tracking-widest text-primary">
                <MapPin className="w-3 h-3" />
                {user?.role === "ADMIN" ? "Global Overview" : user?.location || "Main Office"}
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Welcome back, <span className="text-white font-bold">{user?.name}</span>! Ready for today's operations?
          </p>
        </div>

        {!isAgentOrStaff && (
            <button 
                onClick={() => setIsDepositModalOpen(true)}
                className="neon-button-accent h-14 px-8 text-sm font-black shadow-2xl shadow-accent/30 hover:scale-105 transition-all flex items-center gap-3"
            >
                <Plus className="w-5 h-5 bg-black/20 rounded-lg p-0.5" />
                Quick Deposit
            </button>
        )}
      </div>

      {/* Main Stats Grid */}
      {isAgentOrStaff && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingStats ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 h-32 animate-pulse flex flex-col justify-between">
                <div className="h-4 bg-white/5 rounded w-1/2" />
                <div className="h-8 bg-white/5 rounded w-3/4" />
              </div>
            ))
          ) : dashboardStats ? (
            <>
              <div className="glass group p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[60px] -z-10 group-hover:bg-primary/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-emerald-500 opacity-60" />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Deposits</p>
                <h3 className="text-2xl font-black tracking-tighter text-white">
                    ${dashboardStats.totalDeposits.toLocaleString()}
                </h3>
              </div>

              <div className="glass group p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[60px] -z-10 group-hover:bg-blue-500/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <Users className="w-4 h-4 text-blue-400/60" />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active Players</p>
                <h3 className="text-2xl font-black tracking-tighter text-white">
                    {dashboardStats.activePlayers.toLocaleString()}
                </h3>
              </div>

              <div className="glass group p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-[60px] -z-10 group-hover:bg-red-500/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  </div>
                  <ArrowDownRight className="w-4 h-4 text-red-500/60" />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Withdrawals</p>
                <h3 className="text-2xl font-black tracking-tighter text-white">
                    ${dashboardStats.totalWithdrawals.toLocaleString()}
                </h3>
              </div>

              <div className="glass group p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 blur-[60px] -z-10 group-hover:bg-accent/20 transition-all" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                    <DollarSign className="w-5 h-5 text-accent" />
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-accent/20 text-[8px] font-black text-accent border border-accent/30 uppercase tracking-tighter">Profit</div>
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Net Revenue</p>
                <h3 className="text-2xl font-black tracking-tighter text-white">
                    ${(dashboardStats.totalDeposits - dashboardStats.totalWithdrawals).toLocaleString()}
                </h3>
              </div>
            </>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Generator & Info */}
        <div className="lg:col-span-2 space-y-8">
            {/* Payment Generator Card */}
            {isAgent && (
                <div className="glass rounded-3xl p-8 relative overflow-hidden group border border-white/10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent -z-10" />
                    <div className="flex flex-col md:row sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30">
                                <Plus className="w-7 h-7 text-black" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-white capitalize">Generate Payment</h2>
                                <p className="text-xs text-muted-foreground mt-1">Create secure funding links for your players</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                            <ShieldCheckIcon />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Secure Protocol</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                        <div className="relative flex-1 group/input">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black text-xl">$</span>
                            <input 
                                type="number" 
                                placeholder="Enter Amount (USD)" 
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-full h-16 bg-[#0b0414] border border-white/10 rounded-2xl pl-12 pr-6 text-lg font-black focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30"
                            />
                        </div>
                        <button 
                            onClick={handleGenerateLink}
                            disabled={generating}
                            className="neon-button h-16 px-10 text-base font-black uppercase tracking-widest disabled:opacity-50 min-w-[200px]"
                        >
                            {generating ? (
                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            ) : "Generate Link"}
                        </button>
                    </div>

                    {(generatedLink || generatedQR) && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in">
                            <div className="md:col-span-2 space-y-4">
                                <div className="p-5 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Checkout Link</span>
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-[9px] font-black text-emerald-500 uppercase">Active</span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-black/60 p-4 rounded-2xl border border-white/10 min-h-[64px]">
                                        <div className="flex-1 min-w-0">
                                            {generatedLink ? (
                                                <p className="text-[13px] font-mono break-all text-white/90 select-all leading-relaxed">
                                                    {generatedLink}
                                                </p>
                                            ) : (
                                                <div className="flex items-center gap-2 text-red-400">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Generating Secure URL...</span>
                                                </div>
                                            )}
                                        </div>
                                        {generatedLink && (
                                            <button 
                                                onClick={() => copyToClipboard(generatedLink)} 
                                                className="p-3 h-11 w-11 flex-shrink-0 flex items-center justify-center bg-primary hover:bg-primary-foreground text-black rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
                                                title="Copy Link"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => {
                                            if (generatedLink) {
                                                if (navigator.share) {
                                                    navigator.share({ title: 'Binpay Payment', url: generatedLink });
                                                } else {
                                                    copyToClipboard(generatedLink);
                                                }
                                            }
                                        }}
                                        className="flex-1 h-12 glass rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Share Link
                                    </button>
                                    <button 
                                        onClick={() => setGeneratedLink(null)}
                                        className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                                    >
                                        <Copy className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-2 p-5 bg-white rounded-3xl group/qr transition-all hover:scale-105 cursor-pointer">
                                <img src={generatedQR!} alt="QR Code" className="w-full h-auto aspect-square" />
                                <span className="text-[9px] font-black text-black tracking-[0.2em] opacity-80 mt-1">SCAN & PAY</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Performance Chart */}
            <div className="glass p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Performance Analytics</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Growth metrics over the last 30 days</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-2 h-2 rounded-full bg-accent opacity-50" />
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <PerformanceChart />
                </div>
            </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="space-y-8">
            {/* Player Balance Card (Only for Players) */}
            {isPlayer && (
                <div className="glass p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[80px] -z-10" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                            <Wallet2  className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Wallet Balance</p>
                            <h2 className="text-3xl font-black tracking-tighter text-white">
                                {balance !== null ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                            </h2>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsDepositModalOpen(true)}
                        className="w-full h-14 neon-button-accent text-sm font-black uppercase tracking-widest shadow-xl shadow-accent/20"
                    >
                        Fund Account
                    </button>
                </div>
            )}

            {/* Recent Activity Feed */}
            <div className="glass rounded-3xl overflow-hidden flex flex-col h-[calc(100%-100px)] min-h-[500px]">
                <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Live Events</h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Real-time Operations</p>
                    </div>
                    <button 
                        onClick={() => {
                            api.get<{ success: boolean; activities: RecentActivity[] }>("dashboard/activity")
                                .then((r) => {
                                    if (r.success) setRecentActivity(r.activities);
                                    toast({ title: "Feed Updated", description: "Activity feed is now current." });
                                })
                                .catch(() => {});
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-primary group"
                        title="Refresh Feed"
                    >
                        <History className="w-4 h-4 group-active:rotate-180 transition-transform" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                            <div key={activity.id || index} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={cn(
                                            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs shadow-inner",
                                            activity.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            activity.type === 'WITHDRAWAL' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        )}>
                                            {activity.user.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-black text-white/90 truncate uppercase tracking-tighter">{activity.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-muted-foreground tracking-tight underline hover:text-primary transition-colors cursor-pointer">{activity.user}</span>
                                                {activity.location && (
                                                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 opacity-60">
                                                        <MapPin className="w-2 h-2" />
                                                        {activity.location}
                                                    </span>
                                                )}
                                            </div>
                                            {activity.generatedBy && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="px-1.5 py-0.5 rounded bg-primary/20 text-[8px] font-black text-primary uppercase tracking-tighter shadow-sm">
                                                        BY: {activity.generatedBy.name.toUpperCase()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className={cn(
                                            "text-sm font-black tracking-tighter",
                                            activity.type === 'DEPOSIT' ? 'text-emerald-400' :
                                            activity.type === 'WITHDRAWAL' ? 'text-red-400' :
                                            'text-white'
                                        )}>
                                            {activity.amount > 0 ? `${activity.type === 'DEPOSIT' ? '+' : '-'}$${activity.amount.toLocaleString()}` : ''}
                                        </p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50 mt-1">
                                            {new Date(activity.date).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4 animate-pulse">
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                                <Activity className="w-10 h-10 opacity-20 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60">No Active Events</p>
                                <p className="text-[10px] text-muted-foreground mt-2 font-medium">Monitoring payment infrastructure...</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-black/40 border-t border-white/5">
                    <button className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-2">
                        View Full Logs
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
      </div>

      <CreateDepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
        onSuccess={() => {
          api.get<{ success: boolean; balance: number }>("wallets/balance").then((r) => r.success && setBalance(r.balance)).catch(() => {});
        }}
      />
      {/* Webhook Monitor Section (Admin Only) */}
      {isAdmin && (
        <div className="glass rounded-3xl overflow-hidden animate-fade-in border-white/10">
          <div className="p-8 border-b border-white/10 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Webhook Monitor</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3 text-primary animate-pulse" />
                Live Payment Gateway Events
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-black/40 border border-white/5 text-[10px] font-black text-primary animate-pulse">
                LISTENING...
            </div>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/5">Event</th>
                  <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/5">User / Order</th>
                  <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/5">Gateway</th>
                  <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/5">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {webhookLogs.length > 0 ? (
                  webhookLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-black text-white uppercase">{log.event.replace(/\./g, ' ')}</span>
                          <span className="text-[9px] text-muted-foreground font-mono">ID: {log.orderId.slice(-8).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white/80">{log.userName || "Unknown"}</span>
                          <span className="text-[9px] text-muted-foreground/60 italic">Payment Order Reference</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-muted-foreground uppercase">
                           {log.gateway}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full shadow-[0_0_8px]",
                            log.processed ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50"
                          )} />
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-tighter",
                            log.processed ? "text-emerald-500" : "text-red-500"
                          )}>
                            {log.processed ? "PROCESSED" : "FAILED"}
                          </span>
                          {log.reason && (
                            <span className="text-[9px] text-muted-foreground italic truncate max-w-[100px]">— {log.reason}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center opacity-30 italic text-sm">
                      No webhook activity recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Webhook Endpoint Active</span>
               </div>
             </div>
             <p className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase italic">
                Logs represent the final handshake between Binpay and Payment Providers
             </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ShieldCheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
        </svg>
    )
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={cn("animate-spin", className)}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
    )
}
