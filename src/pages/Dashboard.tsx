import { useState, useEffect } from "react";
import { Download, Copy, HelpCircle, TrendingUp, TrendingDown, DollarSign, Activity, Plus, Share2, Users, MapPin } from "lucide-react";
import { PerformanceChart } from "../components/charts/PerformanceChart";
import { api } from "../lib/api";
import { toast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { CreateDepositModal } from "../components/modals/CreateDepositModal";
import { StatCard } from "../components/ui/stat-card";

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

export default function Dashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const { user } = useAuth();
  const isPlayer = user?.role === "PLAYER";
  const isAgentOrStaff = ["AGENT", "STAFF", "SUPPORT", "ADMIN"].includes(user?.role || "");
  const isAgent = user?.role === "AGENT" || user?.role === "ADMIN";

  const [paymentAmount, setPaymentAmount] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
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
    }
  }, [isAgentOrStaff]);

  const handleGenerateLink = async () => {
    if (!paymentAmount || isNaN(Number(paymentAmount))) {
        toast({ title: "Invalid amount", variant: "destructive" });
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
            toast({ title: "Payment Link Generated!" });
        }
    } catch (e) {
        toast({ title: "Generation failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
        setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const handleShare = async () => {
      if (generatedLink) {
          if (navigator.share) {
              try {
                  await navigator.share({
                      title: 'Binpay Payment Link',
                      text: `Pay $${paymentAmount} securely via Binpay`,
                      url: generatedLink,
                  });
              } catch (err) {
                  console.error("Share failed:", err);
              }
          } else {
              copyToClipboard(generatedLink);
          }
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            {isAgentOrStaff && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                <MapPin className="w-3 h-3" />
                {user?.role === "ADMIN" ? "All Locations" : user?.location || "No Location"}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">Welcome back, {user?.name}! Here's your {user?.role.toLowerCase()} overview.</p>
        </div>
        {!isAgentOrStaff && (
            <button 
                onClick={() => setIsDepositModalOpen(true)}
                className="neon-button-accent flex items-center gap-2 px-6 h-12 text-sm font-bold shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
            >
                <Plus className="w-5 h-5" />
                Quick Deposit
            </button>
        )}
      </div>

      {/* Agents/Admin Payment Link Card - Only for AGENT and ADMIN */}
      {isAgent && (
        <div className="glass rounded-lg border-primary/20 bg-primary/5 p-4 sm:p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Generate Payment Link</h2>
                            <p className="text-xs text-muted-foreground">Create a one-time link or QR for your players</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <input 
                                type="number" 
                                placeholder="Amount" 
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-7 pr-4 text-sm focus:border-primary/50 outline-none transition-all"
                            />
                        </div>
                        <button 
                            onClick={handleGenerateLink}
                            disabled={generating}
                            className="neon-button px-6 font-semibold"
                        >
                            {generating ? "..." : "Generate"}
                        </button>
                    </div>
                    {generatedLink && (
                        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10 animate-fade-in">
                            <p className="text-xs truncate flex-1 text-muted-foreground font-mono">{generatedLink}</p>
                            <button onClick={() => copyToClipboard(generatedLink)} className="p-2 hover:bg-white/10 rounded-lg text-primary" title="Copy Link">
                                <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-lg text-accent" title="Share Link">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {generatedQR && (
                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl animate-scale-in">
                        <img src={generatedQR} alt="QR Code" className="w-32 h-32" />
                        <p className="text-[10px] text-black font-bold mt-2">SCAN TO PAY</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Deposits Link Card (For Players) */}
      {isPlayer && (
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
      )}

      {/* Tutorial / Help Section (For Agents/Staff) */}
      {isAgentOrStaff && (
        <div className="glass rounded-lg p-4 sm:p-6 mb-6 border-accent/20">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-accent" />
            <h3 className="font-bold">Agent Guide: Getting Started</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "01", title: "Add Player", desc: "Go to Players page and add a new player to your location." },
              { step: "02", title: "Generate Link", desc: "Use the card above to create a payment link for the player." },
              { step: "03", title: "Collect Payment", desc: "Share the link or QR code. UPI, Cards & Crypto supported." }
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
                <span className="absolute -top-2 -right-2 text-4xl font-black opacity-5 pointer-events-none">{s.step}</span>
                <p className="font-bold text-sm mb-1">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Stats Grid - Real Data from API */}
      {isAgentOrStaff && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {loadingStats ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass rounded-2xl p-4 sm:p-6 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-24 mb-4"></div>
                  <div className="h-8 bg-white/10 rounded w-32"></div>
                </div>
              ))}
            </>
          ) : dashboardStats ? (
            <>
              <StatCard
                title="Total Deposits"
                value={`$${dashboardStats.totalDeposits.toLocaleString()}`}
                change={user?.role === "ADMIN" ? "All locations" : "Your location"}
                changeType="positive"
                icon={TrendingUp}
              />
              <StatCard
                title="Active Players"
                value={dashboardStats.activePlayers.toString()}
                change={user?.role === "ADMIN" ? "All locations" : "Your location"}
                changeType="positive"
                icon={Users}
              />
              <StatCard
                title="Total Withdrawals"
                value={`$${dashboardStats.totalWithdrawals.toLocaleString()}`}
                change={user?.role === "ADMIN" ? "All locations" : "Your location"}
                changeType="negative"
                icon={TrendingDown}
              />
              <StatCard
                title="Net Revenue"
                value={`$${(dashboardStats.totalDeposits - dashboardStats.totalWithdrawals).toLocaleString()}`}
                change={user?.role === "ADMIN" ? "All locations" : "Your location"}
                changeType="positive"
                icon={DollarSign}
              />
            </>
          ) : null}
        </div>
      )}

      {/* Chart */}
      <div className="glass p-1">
        <PerformanceChart />
      </div>

      {/* Recent Activity - Real Data from API */}
      {isAgentOrStaff && (
        <div className="glass gradient-border rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'DEPOSIT' ? 'bg-green-500/20' :
                      activity.type === 'WITHDRAWAL' ? 'bg-red-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <span className={`text-xs sm:text-sm font-semibold ${
                        activity.type === 'DEPOSIT' ? 'text-green-400' :
                        activity.type === 'WITHDRAWAL' ? 'text-red-400' :
                        'text-blue-400'
                      }`}>
                        {activity.user.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium truncate">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-muted-foreground truncate">{activity.user}</p>
                        {activity.location && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 opacity-70">
                            <MapPin className="w-2 h-2" />
                            {activity.location}
                          </span>
                        )}
                      </div>
                      {activity.generatedBy && (
                        <p className="text-[9px] text-primary/70 font-bold mt-0.5">
                          Managed by: {activity.generatedBy.name} ({activity.generatedBy.role})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={`text-xs sm:text-sm font-semibold ${
                      activity.type === 'DEPOSIT' ? 'text-green-400' :
                      activity.type === 'WITHDRAWAL' ? 'text-red-400' :
                      'text-muted-foreground'
                    }`}>
                      {activity.amount > 0 ? `${activity.type === 'DEPOSIT' ? '+' : '-'}$${activity.amount.toLocaleString()}` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      )}

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
