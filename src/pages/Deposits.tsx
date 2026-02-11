import { useState, useEffect } from "react";
import { 
  Activity, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  ExternalLink, 
  Wallet, 
  TrendingUp, 
  History, 
  MapPin,
  ChevronRight,
  Copy,
  Info
} from "lucide-react";
import { api, type Order, type OrdersResponse, type WalletBalance } from "../lib/api";
import { StatusBadge } from "../components/ui/status-badge";
import { CreateDepositModal } from "../components/modals/CreateDepositModal";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "../hooks/use-toast";
import { cn } from "../lib/utils";

const filterOptions = [
  { value: "all", label: "All Transactions" },
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

function statusToBadge(s: string): "pending" | "completed" | "failed" {
  if (s === "SUCCESS") return "completed";
  if (s === "FAILED") return "failed";
  return "pending";
}

export default function Deposits() {
  const { user } = useAuth();
  const isPlayer = user?.role === "PLAYER";
  const isAgentOrStaff = ["AGENT", "STAFF", "SUPPORT", "ADMIN"].includes(user?.role || "");
  const isStaff = user?.role === "STAFF" || user?.role === "SUPPORT";
  const isAgent = user?.role === "AGENT";
  const isAdmin = user?.role === "ADMIN";
  const isMaster = isAdmin;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ordersRes, balanceRes] = await Promise.all([
        api.get<OrdersResponse>("payments", { params: filter !== "all" ? { status: filter } : {} }).catch(() => ({ success: false, orders: [], total: 0 })),
        api.get<WalletBalance>("wallets/balance").catch(() => ({ success: false, balance: 0 })),
      ]);
      
      if (ordersRes.success) {
        setOrders(ordersRes.orders);
        setTotal(ordersRes.total);
      }
      if (balanceRes.success) setBalance(balanceRes.balance);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  useEffect(() => {
    const hasPending = orders.some(o => o.status === "PENDING");
    if (hasPending) {
        const interval = setInterval(() => {
            // Only fetch if tab is active to save resources
            if (document.visibilityState === 'visible') {
                fetchData(true);
            }
        }, 10000);
        return () => clearInterval(interval);
    }
  }, [orders.length, orders.filter(o => o.status === "PENDING").length]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "ID Copied", description: "Transaction ID copied to clipboard." });
  };

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      const res = await api.get<{ success: boolean; order: Order }>(`payments/${id}/verify`);
      if (res.success) {
        if (res.order.status === "SUCCESS") {
          toast({ title: "Payment Verified!", description: "Funds have been added to your wallet.", variant: "default" });
        } else if (res.order.status === "FAILED") {
          toast({ title: "Payment Failed", description: "The gateway reported a failed transaction.", variant: "destructive" });
        } else {
          toast({ title: "Still Pending", description: "Gateway hasn't confirmed the payment yet. Please wait a moment.", variant: "default" });
        }
        await fetchData();
      }
    } catch (err: any) {
      toast({ title: "Verification Error", description: err.message, variant: "destructive" });
    } finally {
      setVerifyingId(null);
    }
  };

  const filtered = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.amount?.toString().includes(searchQuery) ?? false) ||
      ((o.user as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Deposit</h1>

            {isAgentOrStaff && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                <MapPin className="w-3 h-3" />
                {isAdmin ? "Master Access" : (isAgent ? "Agent Node" : (isStaff ? "Staff Processing" : (user?.location || "Main Branch")))}
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mt-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary/60" />
            Manage your wallet and track all funding activities
          </p>
        </div>

        <button 
          onClick={() => setIsDepositModalOpen(true)}
          className="neon-button-accent min-h-[52px] px-8 text-sm font-black shadow-2xl shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group"
        >
          <div className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          Create Deposit
        </button>
      </div>

      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 group relative overflow-hidden transition-all hover:border-white/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] -z-10 group-hover:bg-primary/20 transition-all duration-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-tighter text-emerald-500">Live Balance</div>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Balance</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black tracking-tighter">
              {balance !== null ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
            </span>
            <span className="text-sm font-bold text-muted-foreground">USD</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 group relative overflow-hidden transition-all hover:border-white/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[80px] -z-10 group-hover:bg-accent/20 transition-all duration-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground italic">Lifetime</div>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Volume</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black tracking-tighter">${total.toLocaleString()}</span>
            <span className="text-sm font-bold text-muted-foreground">USD</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 group relative overflow-hidden transition-all hover:border-white/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[80px] -z-10 group-hover:bg-white/10 transition-all duration-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <History className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Requests</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black tracking-tighter">{total}</span>
            <span className="text-sm font-bold text-muted-foreground">Entries</span>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col min-h-[600px] overflow-hidden">
        {/* Table Header Filter Bar */}
        <div className="p-6 border-b border-white/5 bg-white/[0.01] flex flex-col lg:row sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-black tracking-tight">Transaction History</h2>
            <p className="text-xs text-muted-foreground mt-1">Showing {filtered.length} of {total} total transactions</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="Search ID, Amount or User..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-[#0b0414] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all w-full sm:w-72"
              />
            </div>
            <div className="flex items-center gap-2 bg-[#0b0414] border border-white/10 rounded-xl px-3 group focus-within:ring-2 focus-within:ring-primary/40 transition-all">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent py-2.5 text-sm focus:outline-none cursor-pointer pr-2 font-medium"
              >
                {filterOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#0b0414]">{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="text-left py-5 px-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Order Info</th>
                {isAgentOrStaff && (
                  <>
                    <th className="text-left py-5 px-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">User / Location</th>
                    <th className="text-left py-5 px-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Processed By</th>
                  </>
                )}
                <th className="text-left py-5 px-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Amount</th>
                <th className="text-left py-5 px-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Status</th>
                <th className="text-left py-5 px-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Date & Time</th>
                <th className="text-right py-5 px-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={isAgentOrStaff ? 7 : 5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin" />
                        <Loader2 className="w-6 h-6 animate-pulse text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <span className="text-sm font-bold tracking-widest uppercase text-primary animate-pulse">Synchronizing Data...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAgentOrStaff ? 7 : 5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-2">
                        <Activity className="w-10 h-10 opacity-20" />
                      </div>
                      <h4 className="text-lg font-bold">No Records Found</h4>
                      <p className="text-sm text-muted-foreground">Adjust your filters or try searching for a different term.</p>
                      <Button variant="outline" size="sm" onClick={() => {setFilter("all"); setSearchQuery("");}} className="mt-4">Reset Filters</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o._id} className="hover:bg-primary/[0.03] transition-all group">
                    <td className="py-6 px-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black tracking-tighter text-white/90">ORD-{o._id.slice(-6).toUpperCase()}</span>
                          <button onClick={() => copyToClipboard(o._id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all">
                            <Copy className="w-3 h-3 text-muted-foreground hover:text-primary" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-muted-foreground uppercase">{o.gateway || "GATEWAY"}</div>
                          {o.webhookLogs && o.webhookLogs.length > 0 && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 animate-pulse-subtle">
                                <Activity className="w-2 h-2" />
                                LIVE HOOK
                            </div>
                          )}
                          {o.gatewayOrderId && (
                            <span className="text-[9px] text-muted-foreground italic truncate max-w-[80px]">#{o.gatewayOrderId.slice(-6).toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {isAgentOrStaff && (
                      <>
                        <td className="py-6 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs font-bold shadow-inner">
                              {(o.user as any)?.name?.charAt(0).toUpperCase() || "P"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-white group-hover:text-primary transition-colors">{(o.user as any)?.name || "Anonymous Player"}</span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium italic mt-0.5">
                                <MapPin className="w-2 h-2 text-primary" />
                                {o.location || (o.user as any)?.location || "External Location"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-white/80">{o.generatedBy?.name || "System Base"}</span>
                            </div>
                            <div className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full w-fit",
                              o.generatedBy?.role === "ADMIN" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                              o.generatedBy?.role === "AGENT" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                              o.generatedBy?.role === "STAFF" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                              "bg-white/10 text-muted-foreground border border-white/10"
                            )}>
                              {o.generatedBy?.role || "AUTOMATED"}
                            </div>
                          </div>
                        </td>
                      </>
                    )}

                    <td className="py-6 px-6">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 font-black text-lg tracking-tighter text-white">
                          <span className="text-primary/60 text-xs">$</span>
                          {o.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        {o.feePercent > 0 && (
                          <span className="text-[9px] text-emerald-500 font-bold">Fee Incl. {o.feePercent}%</span>
                        )}
                      </div>
                    </td>

                    <td className="py-6 px-6">
                      <StatusBadge status={statusToBadge(o.status)} />
                    </td>

                    <td className="py-6 px-6">
                      <div className="flex flex-col text-[11px] font-medium">
                        <span className="text-white/80">{o.createdAt ? new Date(o.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}</span>
                        <span className="text-muted-foreground mt-0.5 text-[10px]">{o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ""}</span>
                      </div>
                    </td>

                    <td className="py-6 px-6 text-right">
                      {o.status === "PENDING" || o.status === "SUCCESS" ? (
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 ml-auto">
                           {o.status === "PENDING" && o.paymentLink && (
                            <button 
                              onClick={() => window.open(o.paymentLink!, "_blank", "noopener,noreferrer")}
                              className="px-3 h-8 rounded-lg bg-primary text-black hover:bg-primary-foreground transition-all flex items-center gap-2 group/btn whitespace-nowrap"
                            >
                              <span className="text-[10px] font-black uppercase tracking-widest">Pay Now</span>
                              <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>
                           )}
                           <button 
                            onClick={() => handleVerify(o._id)}
                            disabled={verifyingId === o._id}
                            className="px-3 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                          >
                            {verifyingId === o._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {o.status === "SUCCESS" ? "Re-sync" : "Verify"}
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 text-muted-foreground opacity-40 italic text-[10px]">
                          <Check className="w-3 h-3" />
                          Settled
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info bar */}
        <div className="px-6 py-4 border-t border-white/5 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gateway Online</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50 animate-pulse" />
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Real-time Feed</span>
             </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
            Secure Payment Architecture Powered by <span className="text-primary italic">Pay4Edge Shield</span>
          </p>
        </div>
      </div>

      <CreateDepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
        onSuccess={fetchData}
      />
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
