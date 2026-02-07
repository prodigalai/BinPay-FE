import { useState, useEffect } from "react";
import { Activity, Plus, Search, Filter, Loader2, ExternalLink, Wallet, TrendingUp, History } from "lucide-react";
import { api, type Order, type OrdersResponse, type WalletBalance } from "../lib/api";
import { StatusBadge } from "../components/ui/status-badge";
import { CreateDepositModal } from "../components/modals/CreateDepositModal";
import { Button } from "../components/ui/button";

const filterOptions = [
  { value: "all", label: "All Status" },
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const filtered = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.amount?.toString().includes(searchQuery) ?? false)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Deposits</h1>
          <p className="text-muted-foreground text-sm mt-1">Add funds and track your transaction history</p>
        </div>
        <button 
          onClick={() => setIsDepositModalOpen(true)}
          className="neon-button-accent inline-flex items-center justify-center gap-2 px-6 h-12 text-sm font-bold shadow-xl shadow-accent/20 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Make a Deposit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Balance</span>
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {balance !== null ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" />
              <span>Available to use</span>
            </div>
          </div>

          <div className="glass p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-accent" />
              Deposit Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Transactions</span>
                <span className="text-sm font-mono font-bold">{total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Filtered Results</span>
                <span className="text-sm font-mono font-bold">{filtered.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="lg:col-span-3 glass flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Transaction History</h2>
            
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  placeholder="Search transactions..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-64"
                />
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2">
                <Filter className="w-4 h-4 text-muted-foreground ml-1" />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-transparent py-2 text-sm focus:outline-none cursor-pointer pr-2"
                >
                  {filterOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#0b0414]">{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="text-left py-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Transaction ID</th>
                  <th className="text-left py-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount</th>
                  <th className="text-left py-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gateway</th>
                  <th className="text-left py-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="text-left py-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                  <th className="text-right py-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-sm font-medium animate-pulse">Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Activity className="w-8 h-8 opacity-20" />
                        <span className="text-sm">No transactions found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o._id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-muted-foreground group-hover:text-white transition-colors">#{o._id.slice(-8).toUpperCase()}</code>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-white">
                        ${(o.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs px-2 py-1 rounded bg-white/5 border border-white/5">{o.gateway || "OBLIQPAY"}</span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={statusToBadge(o.status)} />
                      </td>
                      <td className="py-4 px-6 text-xs text-muted-foreground">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "—"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {o.status === "PENDING" && o.paymentLink && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 hover:bg-primary/20 hover:text-primary transition-all"
                            onClick={() => window.open(o.paymentLink!, "_blank", "noopener,noreferrer")}
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                            Pay Now
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
              Secure payments powered by 256-bit encryption
            </p>
          </div>
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
