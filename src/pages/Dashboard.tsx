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
  Users,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Wallet2,
  History,
  Search,
  Link as LinkIcon,
  Edit3,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { PerformanceChart } from "../components/charts/PerformanceChart";
import { api } from "../lib/api";
import { toast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { CreateDepositModal } from "../components/modals/CreateDepositModal";
import { GenerateLinkModal } from "../components/modals/GenerateLinkModal";
import { StatCard } from "../components/ui/stat-card";
import { cn } from "../lib/utils";

interface DashboardStats {
  pendingDepositCount: any;
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
  gameUsername?: string | null;
  gameName?: string | null;
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

interface StaffLink {
  id: string;
  paymentLink: string;
  remark: string;
  customAmount?: boolean;
  createdAt: string;
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
  const isAdmin = user?.role === "ADMIN";
  const isMaster = isAdmin;
  const navigate = useNavigate();

  const [activitySearch, setActivitySearch] = useState("");
  const [customLinkModalOpen, setCustomLinkModalOpen] = useState(false);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [staffStats, setStaffStats] = useState<StaffStats | null>(null);
  const [primaryLink, setPrimaryLink] = useState<StaffLink | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [chartRange, setChartRange] = useState("30d");
  const [activityTab, setActivityTab] = useState<'SUCCESS' | 'ALL' | 'DEPOSIT' | 'WITHDRAWAL'>('SUCCESS');

  useEffect(() => {
    api.get<{ success: boolean; balance: number }>("wallets/balance").then((r) => r.success && setBalance(r.balance)).catch(() => { });
  }, []);

  useEffect(() => {
    setLoadingChart(true);
    api.get<{ success: boolean; chartData: any[] }>(`dashboard/chart?range=${chartRange}`)
      .then((r) => {
        if (r.success) setChartData(r.chartData);
      })
      .catch(() => { })
      .finally(() => setLoadingChart(false));
  }, [chartRange, isStaff]);

  useEffect(() => {
    if (isAgentOrStaff) {
      if (isStaff) {
        api.get<{ success: boolean; summary: StaffStats }>("dashboard/staff-links")
          .then((r) => {
            if (r.success) setStaffStats(r.summary);
          })
          .catch(() => { })
          .finally(() => setLoadingStats(false));

        api.get<{ success: boolean; activities: RecentActivity[] }>("dashboard/activity")
          .then((r) => {
            if (r.success) setRecentActivity(r.activities);
          })
          .catch(() => { });
      } else {
        api.get<{ success: boolean; stats: DashboardStats }>("dashboard/stats")
          .then((r) => {
            if (r.success) setDashboardStats(r.stats);
          })
          .catch(() => { })
          .finally(() => setLoadingStats(false));

        api.get<{ success: boolean; activities: RecentActivity[] }>("dashboard/activity")
          .then((r) => {
            if (r.success) setRecentActivity(r.activities);
          })
          .catch(() => { });
      }

      if (isAdmin) {
        const fetchLogs = () => {
          api.get<{ success: boolean; logs: WebhookLog[] }>("payments/webhooks/logs")
            .then((r) => {
              if (r.success) setWebhookLogs(r.logs);
            })
            .catch(() => { });
        };
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000);
        return () => clearInterval(interval);
      }
    } else {
      setLoadingStats(false);
    }
  }, [isAgentOrStaff, isAdmin, isStaff]);

  useEffect(() => {
    if (!isAgentOrStaff) {
      setPrimaryLink(null);
      return;
    }

    api.get<{ success: boolean; links: StaffLink[] }>("dashboard/staff-links")
      .then((r) => {
        if (!r.success || !Array.isArray(r.links)) {
          setPrimaryLink(null);
          return;
        }

        const links = r.links;
        if (!links.length) {
          setPrimaryLink(null);
          return;
        }

        const customLinks = links.filter((l) => l.customAmount);
        const latest = (customLinks[0] ?? links[0]);
        setPrimaryLink(latest);
      })
      .catch(() => {
        setPrimaryLink(null);
      });
  }, [isAgentOrStaff]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Link copied to your clipboard." });
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="animate-fade-in pb-12 pt-1 sm:pt-0 max-w-[1600px] mx-auto">

      {/* ━━━ HEADER ━━━ */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[13px] text-[#4f5d73] mb-1">{getGreeting()}</p>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.02em] text-white">{user?.name || "Dashboard"}</h1>
            {isAgentOrStaff && (
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider",
                isAdmin ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" :
                  isAgent ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              )}>
                {isAdmin ? "Master" : (isAgent ? "Agent" : "Staff")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isAgentOrStaff && (
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="h-10 px-5 text-[13px] font-semibold rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.97] transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Quick Deposit
            </button>
          )}
          {(isAgent || isMaster || isStaff) && (
            <button
              type="button"
              onClick={() => setCustomLinkModalOpen(true)}
              className="h-10 px-4 rounded-xl bg-[#12151a] border border-[#1e2330] text-[#8a95a8] text-[13px] font-medium hover:border-[#2a3040] hover:text-white transition-all flex items-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Custom Link
            </button>
          )}
        </div>
      </header>

      {/* ━━━ KPI CARDS ━━━ */}
      {isAgentOrStaff && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loadingStats ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[140px] rounded-2xl bg-[#12151a] border border-[#1e2330] animate-pulse">
                <div className="p-6 space-y-4">
                  <div className="h-3 w-20 bg-[#1e2330] rounded" />
                  <div className="h-8 w-28 bg-[#1e2330] rounded" />
                  <div className="h-3 w-24 bg-[#1e2330] rounded" />
                </div>
              </div>
            ))
          ) : (isStaff ? staffStats : dashboardStats) ? (
            <>
              {isStaff ? (
                <>
                  <StatCard title="Links Created" value={staffStats?.totalLinksCreated.toLocaleString() || "0"} icon={LinkIcon} change="Total" changeType="neutral" />
                  <StatCard title="Pending" value={`$${staffStats?.totalPendingAmount.toLocaleString() || "0"}`} icon={Clock} change="Awaiting" changeType="neutral" />
                  <StatCard title="Received" value={`$${staffStats?.totalReceivedAmount.toLocaleString() || "0"}`} icon={TrendingUp} change="Completed" changeType="positive" />
                  <StatCard title="Generated" value={`$${staffStats?.totalGeneratedAmount.toLocaleString() || "0"}`} icon={DollarSign} change="Total value" changeType="neutral" />
                </>
              ) : dashboardStats && (
                <>
                  <StatCard title="Deposits" value={`$${dashboardStats.totalDeposits.toLocaleString()}`} icon={TrendingUp} change="+12.5% this month" changeType="positive" description="Total amount received from player payments" />
                  {isAdmin && <StatCard title="Total Balance" value={balance !== null ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"} icon={Wallet} description="Your current wallet balance (use for payouts)" />}
                  {isAdmin && <StatCard title="Agents" value={dashboardStats.totalAgents?.toLocaleString() || "0"} icon={Users} description="Number of agent accounts" />}
                  {isAdmin && <StatCard title="Withdrawals" value={`$${dashboardStats.totalWithdrawals.toLocaleString()}`} icon={TrendingDown} change="-2.4% this month" changeType="negative" description="Total sent out via payout links" />}
                  {!isAdmin && (
                    <>
                      <StatCard title="Withdrawals" value={`$${dashboardStats.totalWithdrawals.toLocaleString()}`} icon={TrendingDown} />
                      <StatCard title="Pending Deposits" value={dashboardStats.pendingDepositCount.toLocaleString()} icon={Clock} change="Awaiting" changeType="neutral" />
                      <StatCard title="Net Volume" value={`$${(dashboardStats.totalDeposits - dashboardStats.totalWithdrawals).toLocaleString()}`} icon={Activity} change="↑ 8.2%" changeType="positive" />
                    </>
                  )}
                </>
              )}
            </>
          ) : null}
        </section>
      )}

      {(isAgent || isMaster || isStaff) && (
        <section className="mb-8">
          {primaryLink ? (
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-[#022c22] via-[#020617] to-[#022c22] shadow-[0_0_0_1px_rgba(16,185,129,0.35)] p-5 sm:p-6">
              <div className="absolute inset-y-0 right-[-40%] w-2/3 bg-emerald-500/10 blur-3xl pointer-events-none" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/30">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-semibold tracking-wide text-emerald-300/90">
                      Default payment link
                    </span>
                    {primaryLink.customAmount && (
                      <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-200/90">
                        Custom amount
                      </span>
                    )}
                  </div>
                  <h2 className="text-[15px] sm:text-[16px] font-semibold text-white">
                    Share this one link with all your players.
                  </h2>
                  <p className="text-[11px] text-emerald-100/80">
                    They open this link, enter their username, game and amount, and you get the payment in one place.
                  </p>
                </div>

                <div className="w-full sm:w-[320px] space-y-2">
                  <div className="flex items-center gap-2 rounded-xl bg-black/30 border border-emerald-500/40 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-emerald-200/80 font-semibold mb-0.5">
                        Your link
                      </p>
                      <p className="text-[11px] text-emerald-50/90 font-mono break-all">
                        {primaryLink.paymentLink}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(primaryLink.paymentLink)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-[13px] font-semibold text-white py-2.5 hover:bg-emerald-400 active:scale-[0.97] transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Copy className="w-4 h-4" />
                      Copy link
                    </button>
                    <a
                      href={primaryLink.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-transparent border border-emerald-500/40 text-emerald-200 text-[12px] font-semibold px-3 py-2 hover:bg-emerald-500/10 active:scale-[0.97] transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCustomLinkModalOpen(true)}
              className="w-full relative overflow-hidden rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors p-6 sm:p-8 text-left group"
            >
              <div className="absolute inset-y-0 right-[-30%] w-1/2 bg-emerald-500/10 blur-3xl pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <LinkIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-emerald-400/90 uppercase tracking-wider mb-1">Default payment link</p>
                  <h2 className="text-[15px] sm:text-[16px] font-semibold text-white mb-1">Create your custom payment link</h2>
                  <p className="text-[12px] text-[#8a95a8]">One link for all players — they enter amount, username & game. You get payments in one place.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-2.5 text-[13px] font-semibold text-emerald-300 group-hover:bg-emerald-500/30 transition-colors">
                  Create link
                  <Edit3 className="w-4 h-4" />
                </span>
              </div>
            </button>
          )}
        </section>
      )}

      {/* Quick generate with amount removed to keep flow simple */}

      {/* ━━━ MAIN CONTENT: Chart (70%) + Activity (30%) ━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5">
        {/* Left: Chart + Webhooks */}
        <div className="lg:col-span-7 space-y-5">
          {/* Chart Card */}
          <div className="bg-gradient-to-br from-[#12151a] to-[#0e1117] border border-[#1e2330] rounded-2xl p-5 sm:p-7">
            <PerformanceChart
              data={chartData}
              isLoading={loadingChart}
              range={chartRange}
              onRangeChange={setChartRange}
            />
          </div>

          {/* Webhook Monitor (Admin Only) */}
          {isAdmin && (
            <div className="bg-gradient-to-br from-[#12151a] to-[#0e1117] border border-[#1e2330] rounded-2xl overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-[#1e2330] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-white">Webhook Monitor</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[11px] text-[#4f5d73]">Live</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[400px]">
                  <tbody className="divide-y divide-[#1a1f2e]">
                    {webhookLogs.slice(0, 5).length > 0 ? (
                      webhookLogs.slice(0, 5).map((log, i) => (
                        <tr key={i} className="hover:bg-[#141820] transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[13px] font-medium text-white/80">{log.event}</span>
                              <span className="text-[10px] text-[#3a4558] font-mono">#{log.orderId.slice(-6).toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold",
                              log.processed
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            )}>
                              <div className="w-1 h-1 rounded-full bg-current" />
                              {log.processed ? "Processed" : "Failed"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <span className="text-[12px] text-[#3a4558] tabular-nums font-mono">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Activity className="w-5 h-5 text-[#1e2330]" />
                            <p className="text-[12px] text-[#3a4558]">No events yet</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 border-t border-[#1a1f2e]">
                <button
                  onClick={() => navigate('/logs')}
                  className="w-full py-2.5 rounded-xl hover:bg-[#141820] text-[12px] font-medium text-[#4a5568] hover:text-[#8a95a8] transition-all flex items-center justify-center gap-1.5"
                >
                  View all logs
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Activity Feed */}
        <div className="lg:col-span-3 space-y-5">
          {/* Player Balance Card */}
          {isPlayer && (
            <div className="relative overflow-hidden bg-gradient-to-br from-[#12151a] to-[#0e1117] border border-[#1e2330] rounded-2xl p-6 transition-all hover:border-[#2a3040]">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                  <Wallet2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#4f5d73] uppercase tracking-wider">Total Balance</p>
                  <h2 className="text-[26px] font-semibold tracking-tight text-white">
                    {balance !== null ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="w-full h-10 rounded-xl bg-emerald-500 text-white text-[13px] font-semibold hover:bg-emerald-400 active:scale-[0.97] transition-all shadow-lg shadow-emerald-500/15"
              >
                Fund Account
              </button>
            </div>
          )}

          {/* Activity Feed Card */}
          <div className="bg-gradient-to-br from-[#12151a] to-[#0e1117] border border-[#1e2330] rounded-2xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-[600px]">
            {/* Feed Header */}
            <div className="p-5 pb-4 border-b border-[#1a1f2e]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[15px] font-semibold text-white">Activity</h3>
                  <span className="text-[11px] text-[#3a4558] bg-[#1a1f2e] px-2 py-0.5 rounded-md font-medium">
                    {recentActivity.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    api.get<{ success: boolean; activities: RecentActivity[] }>("dashboard/activity")
                      .then((r) => {
                        if (r.success) setRecentActivity(r.activities);
                        toast({ title: "Refreshed", description: "Activity feed updated." });
                      })
                      .catch(() => { });
                  }}
                  className="p-2 hover:bg-[#1a1f2e] rounded-lg transition-colors text-[#3a4558] hover:text-[#8a95a8]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex p-1 bg-[#0a0d12] rounded-xl border border-[#1a1f2e] mb-3.5">
                {(['SUCCESS', 'ALL', 'DEPOSIT', 'WITHDRAWAL'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActivityTab(tab)}
                    className={cn(
                      "flex-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-all duration-200",
                      activityTab === tab
                        ? "bg-[#1e2330] text-white shadow-sm"
                        : "text-[#3a4558] hover:text-[#6b7a90]"
                    )}
                  >
                    {tab === 'ALL' ? 'All' : tab === 'SUCCESS' ? 'Paid' : tab === 'DEPOSIT' ? 'In' : 'Out'}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2a3040]" />
                <input
                  type="text"
                  placeholder="Search transactions…"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="w-full bg-[#0a0d12] border border-[#1a1f2e] rounded-xl py-2.5 pl-9 pr-3 text-[12px] font-medium text-white placeholder:text-[#2a3040] focus:outline-none focus:border-[#2a3040] transition-all"
                />
              </div>
            </div>

            {/* Feed Items */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
              {recentActivity.filter(a => {
                const matchesSearch = !activitySearch || a.id?.toLowerCase().includes(activitySearch.toLowerCase()) || a.user?.toLowerCase().includes(activitySearch.toLowerCase());
                const matchesTab = activityTab === 'ALL' || activityTab === 'SUCCESS'
                  ? (activityTab === 'SUCCESS' ? (a.status === 'SUCCESS' || a.status === 'APPROVED') : true)
                  : a.type === activityTab;
                return matchesSearch && matchesTab;
              }).length > 0 ? (
                recentActivity.filter(a => {
                  const matchesSearch = !activitySearch || a.id?.toLowerCase().includes(activitySearch.toLowerCase()) || a.user?.toLowerCase().includes(activitySearch.toLowerCase());
                  const matchesTab = activityTab === 'ALL' || activityTab === 'SUCCESS'
                    ? (activityTab === 'SUCCESS' ? a.status === 'SUCCESS' : true)
                    : a.type === activityTab;
                  return matchesSearch && matchesTab;
                }).map((activity, index) => (
                  <div key={activity.id || index} className="group p-3 rounded-xl hover:bg-[#141820] transition-all duration-150 cursor-default">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border",
                          activity.status === 'SUCCESS'
                            ? 'bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/10'
                            : activity.status === 'FAILED'
                              ? 'bg-red-500/[0.08] text-red-400 border-red-500/10'
                              : 'bg-blue-500/[0.08] text-blue-400 border-blue-500/10'
                        )}>
                          {activity.type === 'DEPOSIT' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-white/85 truncate">{activity.title}</p>
                          <p className="text-[11px] text-[#3a4558] truncate mt-0.5">
                            {activity.user || (activity.gameUsername || activity.gameName ? [activity.gameUsername, activity.gameName].filter(Boolean).join(' · ') : 'Pay Link')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 pl-2">
                        <p className={cn(
                          "text-[13px] font-semibold tabular-nums",
                          activity.type === 'DEPOSIT' ? "text-emerald-400" : "text-white/70"
                        )}>
                          {activity.amount > 0 ? `${activity.type === 'DEPOSIT' ? '+' : '-'}$${activity.amount.toLocaleString()}` : ''}
                        </p>
                        <p className="text-[10px] text-[#2a3040] mt-0.5 tabular-nums font-mono">
                          {new Date(activity.date).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-44 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#12151a] border border-[#1e2330] flex items-center justify-center">
                    <Search className="w-5 h-5 text-[#2a3040]" />
                  </div>
                  <div>
                    <p className="text-[13px] text-[#4a5568] font-medium">No transactions</p>
                    <p className="text-[11px] text-[#2a3040] mt-0.5">Try adjusting your filters</p>
                  </div>
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
          api.get<{ success: boolean; balance: number }>("wallets/balance").then((r) => r.success && setBalance(r.balance)).catch(() => { });
        }}
      />

      <GenerateLinkModal
        isOpen={customLinkModalOpen}
        onClose={() => {
          setCustomLinkModalOpen(false);
          if (isAgentOrStaff) {
            api.get<{ success: boolean; links: StaffLink[] }>("dashboard/staff-links")
              .then((r) => {
                if (r.success && Array.isArray(r.links) && r.links.length) {
                  const custom = r.links.filter((l) => l.customAmount);
                  setPrimaryLink(custom[0] ?? r.links[0]);
                }
              })
              .catch(() => { });
          }
        }}
        initialCustomAmount={true}
      />
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

// Loader2 spinner removed from dashboard (no longer needed for quick-create)
