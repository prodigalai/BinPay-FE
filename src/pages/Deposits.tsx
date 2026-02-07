import { useState, useEffect } from "react";
import { Wallet, Copy, ExternalLink, Loader2 } from "lucide-react";
import { GlassInput } from "../components/ui/glass-input";
import { GlassSelect } from "../components/ui/glass-select";
import { Button } from "../components/ui/button";
import { toast } from "../hooks/use-toast";
import { StatusBadge } from "../components/ui/status-badge";
import { api } from "../lib/api";
import type { Order, OrdersResponse, WalletBalance, CreateOrderResponse, FeeConfigResponse } from "../lib/api";

const filterOptions = [
  { value: "all", label: "All" },
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
  const [createAmount, setCreateAmount] = useState("");
  const [creating, setCreating] = useState(false);
  const [feePercent, setFeePercent] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api.get<FeeConfigResponse>("payments/fee-config").then((r) => setFeePercent(r.feePercent ?? 0)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.get<OrdersResponse>("payments", { params: filter !== "all" ? { status: filter } : {} }).catch(() => ({ success: false, orders: [], total: 0 })),
      api.get<WalletBalance>("wallets/balance").catch(() => ({ success: false, balance: 0 })),
    ]).then(([ordersRes, balanceRes]) => {
      if (!cancelled && ordersRes.success) {
        setOrders(ordersRes.orders);
        setTotal(ordersRes.total);
      }
      if (!cancelled && balanceRes.success) setBalance(balanceRes.balance);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [filter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(createAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const res = await api.post<CreateOrderResponse>("payments/create", { amount, gateway: "OBLIQPAY" });
      if (res.success && res.order) {
        setOrders((prev) => [res.order!, ...prev]);
        setTotal((t) => t + 1);
        const desc = res.amountCharged != null ? `Pay $${res.amountCharged.toFixed(2)} to receive $${(res.amountCredited ?? amount).toFixed(2)}` : "Deposit created.";
        toast({ title: "Deposit created", description: desc });
        if (res.order.paymentLink) window.open(res.order.paymentLink, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Could not create deposit", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const filtered = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.amount?.toString().includes(searchQuery) ?? false)
  );

  const amountNum = parseFloat(createAmount) || 0;
  const feeAmount = feePercent && amountNum > 0 ? Math.round(amountNum * (feePercent / 100) * 100) / 100 : 0;
  const totalToPay = amountNum + feeAmount;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold">Deposits</h1>

      <div className="glass rounded-lg p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold">Create deposit</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="text-sm text-muted-foreground block mb-1">Amount to receive ($)</label>
            <GlassInput type="number" step="0.01" placeholder="100" value={createAmount} onChange={(e) => setCreateAmount(e.target.value)} />
          </div>
          {feePercent > 0 && amountNum > 0 && (
            <div className="text-sm text-muted-foreground">
              Fee {feePercent}%: ${feeAmount.toFixed(2)} → You pay ${totalToPay.toFixed(2)}
            </div>
          )}
          <Button type="submit" disabled={creating} className="neon-button">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create & pay"}
          </Button>
        </form>
      </div>

      <div className="glass rounded-lg p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Orders</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Balance:</span>
            <span className="font-semibold text-primary">{balance !== null ? `$${balance.toFixed(2)}` : "—"}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <GlassInput placeholder="Search…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-xs" />
          <GlassSelect options={filterOptions} value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">ID</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Gateway</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Date</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">No deposits.</td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-2 font-mono text-xs truncate max-w-[100px]">{o._id}</td>
                    <td className="py-3 px-2 font-semibold text-primary">${(o.amount ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-2 text-sm">{o.gateway ?? "—"}</td>
                    <td className="py-3 px-2"><StatusBadge status={statusToBadge(o.status)} /></td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}</td>
                    <td className="py-3 px-2 text-right">
                      {o.status === "PENDING" && o.paymentLink && (
                        <Button variant="ghost" size="sm" onClick={() => window.open(o.paymentLink!, "_blank", "noopener,noreferrer")}>
                          <ExternalLink className="w-3 h-3 mr-1" /> Pay
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Showing {filtered.length} of {total}</p>
      </div>
    </div>
  );
}
