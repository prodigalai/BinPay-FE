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
  History,
  Search,
  Link as LinkIcon
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
  totalStaff?: number;
  totalAgents?: number;
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

interface StaffStats {
  totalLinksCreated: number;
  totalGeneratedAmount: number;
  totalReceivedAmount: number;
  totalPendingAmount: number;
}

import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const { user } = useAuth();
  const isPlayer = user?.role === "PLAYER";
  const isAgentOrStaff = ["AGENT", "STAFF", "SUPPORT", "ADMIN"].includes(user?.role || "");
  const isStaff = user?.role === "STAFF" || user?.role === "SUPPORT";
  const isAgent = user?.role === "AGENT";
  const isAdmin = user?.role === "ADMIN"; // This is the 'Master' role
  const isMaster = isAdmin; // Master role mapping
  const navigate = useNavigate();

  const [paymentAmount, setPaymentAmount] = useState("");
  const [activitySearch, setActivitySearch] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [staffStats, setStaffStats] = useState<StaffStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [chartRange, setChartRange] = useState("30d");
  const [activityTab, setActivityTab] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL');

  useEffect(() => {
    api.get<{ success: boolean; balance: number }>("wallets/balance").then((r) => r.success && setBalance(r.balance)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingChart(true);

    if (isStaff) {
      // Fetch Chart Data for Staff (if endpoint supports filtering, otherwise skip for now or use generic)
      // Assuming generic chart endpoint handles filtering by role
    }

    api.get<{ success: boolean; chartData: any[] }>(`dashboard/chart?range=${chartRange}`)
      .then((r) => {
        if (r.success) setChartData(r.chartData);
      })
      .catch(() => {})
      .finally(() => setLoadingChart(false));
  }, [chartRange, isStaff]);

  useEffect(() => {
    // Fetch Dashboard Stats
    if (isAgentOrStaff) {
      if (isStaff) {
         api.get<{ success: boolean; summary: StaffStats }>("dashboard/staff-links")
          .then((r) => {
             if (r.success) setStaffStats(r.summary);
          })
          .catch(() => {})
          .finally(() => setLoadingStats(false));

          // Also fetch activity for staff (generic activity endpoint already filters by generatedBy)
          api.get<{ success: boolean; activities: RecentActivity[] }>("dashboard/activity")
            .then((r) => {
              if (r.success) setRecentActivity(r.activities);
            })
            .catch(() => {});

      } else {
        // AGENT / ADMIN
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
      }

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
  }, [isAgentOrStaff, isAdmin, isStaff]);

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
    <div className="space-y-8 animate-fade-in pb-10 pt-2 sm:pt-0">
      {/* Header Section — extra top space so title/chip don't feel cramped under navbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Dashboard</h1>
            {isAgentOrStaff && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-black uppercase tracking-widest text-primary w-fit">
                <MapPin className="w-3 h-3 shrink-0" />
                {isAdmin ? "Master Ecosystem" : (isAgent ? "Agent Node" : (isStaff ? "Staff View" : (user?.location || "Main Office")))}
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {loadingStats ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
            ))
          ) : (isStaff ? staffStats : dashboardStats) ? (
            <>
              {isStaff ? (
                  // STAFF SPECIFIC STATS
                  <>
                      <StatCard 
                          title="Total Links" 
                          value={staffStats?.totalLinksCreated.toLocaleString() || "0"} 
                          icon={LinkIcon}
                          change="Created"
                          changeType="neutral"
                      />
                      <StatCard 
                          title="Pending Amount" 
                          value={`$${staffStats?.totalPendingAmount.toLocaleString() || "0"}`} 
                          icon={Activity}
                          change="Awaiting Payment"
                          changeType="neutral"
                      />
                      <StatCard 
                          title="Received Amount" 
                          value={`$${staffStats?.totalReceivedAmount.toLocaleString() || "0"}`} 
                          icon={TrendingUp}
                          change="Successful Payments"
                          changeType="positive"
                      />
                      <StatCard 
                          title="Generated Amount" 
                          value={`$${staffStats?.totalGeneratedAmount.toLocaleString() || "0"}`} 
                          icon={DollarSign}
                          change="Total Value"
                          changeType="neutral"
                      />
                  </>
              ) : dashboardStats && (
                  // AGENT / ADMIN STATS
                  <>
                    <StatCard 
                        title="Total Deposits" 
                        value={`$${dashboardStats.totalDeposits.toLocaleString()}`} 
                        icon={TrendingUp}
                        change="+12.5% this month"
                        changeType="positive"
                    />

                    {(isAdmin || isAgent) && (
                        <StatCard 
                        title="Total Staff" 
                        value={dashboardStats.totalStaff?.toLocaleString() || "0"} 
                        icon={Users}
                        />
                    )}

                    {isAdmin && (
                        <StatCard 
                        title="Total Agents" 
                        value={dashboardStats.totalAgents?.toLocaleString() || "0"} 
                        icon={Users}
                        />
                    )}

                    <StatCard 
                        title={isAdmin ? "Total Withdrawals" : "Active Players"} 
                        value={isAdmin ? `$${dashboardStats.totalWithdrawals.toLocaleString()}` : dashboardStats.activePlayers.toLocaleString()} 
                        icon={isAdmin ? TrendingDown : Users}
                        change={isAdmin ? "-2.4% this month" : "+5 new today"}
                        changeType={isAdmin ? "negative" : "positive"}
                    />

                    {isAdmin ? (
                        null 
                    ) : (
                        <>
                        <StatCard 
                            title="Total Withdrawals" 
                            value={`$${dashboardStats.totalWithdrawals.toLocaleString()}`} 
                            icon={TrendingDown}
                        />
                        <StatCard 
                            title="Net Volume" 
                            value={`$${(dashboardStats.totalDeposits - dashboardStats.totalWithdrawals).toLocaleString()}`} 
                            icon={Activity}
                            change="&uarr; 8.2%"
                            changeType="positive"
                        />
                        </>
                    )}
                  </>
              )}
            </>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Generator & Info */}
        <div className="lg:col-span-2 space-y-8">
            {/* Payment Generator Card */}
            {(isAgent || isMaster || isStaff) && (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 relative overflow-hidden hover:border-white/10 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-black tracking-tight text-white uppercase italic">Generate Payment</h2>
                                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                                    <ShieldCheckIcon />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Secure</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">Create secure, one-time funding links for players</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 group/input min-w-0">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-lg group-focus-within:text-primary transition-colors">$</span>
                            <input 
                                autoFocus
                                type="number" 
                                placeholder="0.00" 
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-full h-14 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 text-lg font-bold text-white placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            />
                        </div>
                        <button 
                            onClick={handleGenerateLink}
                            disabled={generating}
                            className="h-14 w-full sm:w-auto sm:min-w-[140px] px-8 rounded-xl bg-primary text-black text-sm font-black uppercase tracking-widest hover:bg-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {generating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Create Link</span>
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                    {(generatedLink || generatedQR) && (
                        <div className="mt-6 sm:mt-8 animate-in slide-in-from-top-4 fade-in duration-500 border-t border-white/5 pt-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4">Ready to share</p>
                            {/* Mobile: QR first, then link + actions. Desktop: side by side */}
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* QR — larger on mobile for easy scanning */}
                                {generatedQR && (
                                    <div className="flex flex-col items-center gap-2 order-first md:order-2">
                                        <div className="flex items-center justify-center bg-white p-3 rounded-2xl shadow-lg">
                                            <img src={generatedQR} alt="Scan to pay" className="w-[200px] h-[200px] sm:w-28 sm:h-28 md:w-24 md:h-24 object-contain" />
                                        </div>
                                        <a
                                            href={generatedQR}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-muted-foreground hover:text-white transition-colors"
                                        >
                                            Save QR
                                        </a>
                                    </div>
                                )}
                                <div className="flex-1 space-y-3 order-2 md:order-1 min-w-0">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Checkout Link</span>
                                    <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white/80 break-all">
                                        {generatedLink}
                                    </div>
                                    {/* Copy + Share — mobile: native share sheet / desktop: WhatsApp Web */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button 
                                            onClick={() => copyToClipboard(generatedLink!)} 
                                            className="h-12 flex-1 rounded-xl bg-primary text-black text-sm font-black uppercase tracking-widest hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[48px]"
                                        >
                                            <Copy className="w-5 h-5 shrink-0" />
                                            Copy Link
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (!generatedLink) return;
                                                if (typeof navigator !== 'undefined' && navigator.share) {
                                                    navigator.share({ title: 'Pay4Edge Payment', url: generatedLink, text: 'Pay with this link: ' })
                                                        .then(() => toast({ title: 'Shared', description: 'Link shared successfully.' }))
                                                        .catch((e) => { if (e?.name !== 'AbortError') copyToClipboard(generatedLink); });
                                                } else {
                                                    copyToClipboard(generatedLink);
                                                    const waUrl = `https://wa.me/?text=${encodeURIComponent('Pay with this link: ' + generatedLink)}`;
                                                    window.open(waUrl, '_blank', 'noopener,noreferrer');
                                                    toast({ title: 'Link copied', description: 'WhatsApp Web opened — send to share.' });
                                                }
                                            }}
                                            className="h-12 flex-1 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 text-sm font-black uppercase tracking-widest hover:bg-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[48px]"
                                        >
                                            <Share2 className="w-5 h-5 shrink-0" />
                                            Share (WhatsApp / Apps)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Performance Chart */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8">
                <PerformanceChart 
                    data={chartData} 
                    isLoading={loadingChart} 
                    range={chartRange}
                    onRangeChange={setChartRange}
                />
            </div>

            {/* Webhook Monitor Section (Admin Only) */}
            {isAdmin && (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden animate-fade-in hover:border-white/10 transition-all">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-md font-bold text-white uppercase tracking-tight">Webhook Monitor</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Listening for events</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-white/5 text-xs">
                                {webhookLogs.slice(0, 5).length > 0 ? (
                                    webhookLogs.slice(0, 5).map((log, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-white text-[11px]">{log.event}</span>
                                                    <span className="text-[9px] text-muted-foreground font-mono">ID: {log.orderId.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                                                    log.processed ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {log.processed ? (
                                                        <>
                                                            <div className="w-1 h-1 rounded-full bg-current" />
                                                            Success
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-1 h-1 rounded-full bg-current" />
                                                            Failed
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="py-10 text-center opacity-30 italic text-[10px]">
                                            No recent activity.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-2 border-t border-white/5 bg-white/[0.01]">
                        <button 
                            onClick={() => navigate('/logs')}
                            className="w-full py-3 rounded-xl hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            View All Logs
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Right Column: Activity Feed */}
        <div className="space-y-8">
            {/* Player Balance Card (Only for Players) */}
            {isPlayer && (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-white/10 transition-colors">
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
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[calc(100%-100px)] min-h-[500px]">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white tracking-tight">Activity Feed</h3>
                        <button 
                            onClick={() => {
                                api.get<{ success: boolean; activities: RecentActivity[] }>("dashboard/activity")
                                    .then((r) => {
                                        if (r.success) setRecentActivity(r.activities);
                                        toast({ title: "Refreshed", description: "Activity feed updated." });
                                    })
                                    .catch(() => {});
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
                        >
                            <History className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex p-1 bg-black/20 rounded-xl mb-4">
                        {(['ALL', 'DEPOSIT', 'WITHDRAWAL'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActivityTab(tab)}
                                className={cn(
                                    "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                                    activityTab === tab ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white/70"
                                )}
                            >
                                {tab === 'ALL' ? 'All' : tab + 's'}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input 
                            type="text"
                            placeholder="Search transactions..."
                            value={activitySearch}
                            onChange={(e) => setActivitySearch(e.target.value)}
                            className="w-full bg-black/20 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/10 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {recentActivity.filter(a => 
                        (!activitySearch || 
                        a.id?.toLowerCase().includes(activitySearch.toLowerCase()) || 
                        a.user?.toLowerCase().includes(activitySearch.toLowerCase())) &&
                        (activityTab === 'ALL' || a.type === activityTab)
                    ).length > 0 ? (
                        recentActivity.filter(a => 
                            (!activitySearch || 
                            a.id?.toLowerCase().includes(activitySearch.toLowerCase()) || 
                            a.user?.toLowerCase().includes(activitySearch.toLowerCase())) &&
                            (activityTab === 'ALL' || a.type === activityTab)
                        ).map((activity, index) => (
                            <div key={activity.id || index} className="group p-3 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={cn(
                                            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border",
                                            activity.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' :
                                            activity.status === 'FAILED' ? 'bg-red-500/10 text-red-500 border-red-500/10' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/10'
                                        )}>
                                            {activity.type === 'DEPOSIT' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-white/90 truncate">{activity.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-muted-foreground truncate">{activity.user}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs font-bold text-white">
                                            {activity.amount > 0 ? `$${activity.amount.toLocaleString()}` : ''}
                                        </p>
                                        <p className="text-[9px] font-medium text-muted-foreground opacity-60 mt-0.5">
                                            {new Date(activity.date).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                <Search className="w-5 h-5 text-muted-foreground/50" />
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">No results found</p>
                        </div>
                    )}
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
