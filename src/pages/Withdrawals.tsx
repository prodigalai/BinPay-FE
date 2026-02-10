import { useState, useEffect } from "react";
import { Wallet, ArrowUpRight, MapPin } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import type { WithdrawRequest, WithdrawRequestsResponse, WalletBalance } from "../lib/api";
import { toast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { GlassInput } from "../components/ui/glass-input";
import { StatusBadge } from "../components/ui/status-badge";

export default function Withdrawals() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isStaff = user?.role === "ADMIN" || user?.role === "STAFF" || user?.role === "SUPPORT";
  const isAgentOrStaff = ["AGENT", "STAFF", "SUPPORT", "ADMIN"].includes(user?.role || "");
  const canApprove = user?.role === "ADMIN" || user?.role === "STAFF";

  useEffect(() => {
    Promise.all([
      api.get<WithdrawRequestsResponse>(isStaff ? "withdrawals/all" : "withdrawals/my-requests"),
      api.get<WalletBalance>("wallets/balance"),
    ]).then(([reqRes, balRes]) => {
      if (reqRes.success) setRequests(reqRes.requests ?? []);
      if (balRes.success) setBalance(balRes.balance ?? 0);
    }).catch(() => toast({ title: "Failed to load", variant: "destructive" })).finally(() => setLoading(false));
  }, [isStaff]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("withdrawals/request", { amount: val, payoutMethod: "BANK_TRANSFER", payoutDetail: {} });
      toast({ title: "Request sent" });
      setAmount("");
      const res = await api.get<WithdrawRequestsResponse>("withdrawals/my-requests");
      if (res.success) setRequests(res.requests ?? []);
      const bal = await api.get<WalletBalance>("wallets/balance");
      if (bal.success) setBalance(bal.balance ?? 0);
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Request failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await api.put(`withdrawals/${id}`, { status, reviewNote: `By ${user?.name}` });
      toast({ title: status === "APPROVED" ? "Approved" : "Rejected" });
      const res = await api.get<WithdrawRequestsResponse>(isStaff ? "withdrawals/all" : "withdrawals/my-requests");
      if (res.success) setRequests(res.requests ?? []);
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Withdrawals</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Manage payouts and withdrawal requests</p>
        </div>
        {isAgentOrStaff && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-black uppercase tracking-widest text-primary">
            <MapPin className="w-3 h-3" />
            {user?.role === "ADMIN" ? "Master Ecosystem" : (user?.role === "AGENT" ? "Agent Node" : (user?.role === "STAFF" ? "Staff View" : (user?.location || "Main Office")))}
          </div>
        )}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Available Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tighter">${balance.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {!isStaff && (
          <form onSubmit={handleRequest} className="flex flex-1 md:max-w-md gap-3 items-stretch">
            <div className="relative flex-1 group/input">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-lg group-focus-within:text-primary transition-colors">$</span>
              <input 
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 text-sm font-bold text-white placeholder:text-muted-foreground/30 focus:border-white/20 outline-none transition-all"
              />
            </div>
            <Button type="submit" disabled={submitting} className="h-12 px-6 neon-button text-xs font-black uppercase tracking-widest">
              {submitting ? "Processing..." : "Request Payout"}
            </Button>
          </form>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading…</p>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-bold text-white tracking-tight">Request History</h3>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Amount</th>
                  <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Status</th>
                  {isStaff && <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">User</th>}
                  <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Date</th>
                  {canApprove && <th className="text-right py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Action</th>}
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-muted-foreground text-xs font-medium italic">No withdrawal requests found.</td></tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="py-5 px-6 font-black text-white text-sm tracking-tight">${r.amount?.toFixed(2) ?? "0.00"}</td>
                      <td className="py-5 px-6 whitespace-nowrap"><StatusBadge status={r.status === "APPROVED" ? "completed" : r.status === "REJECTED" ? "failed" : "pending"}>{r.status}</StatusBadge></td>
                      {isStaff && <td className="py-5 px-6 text-xs font-bold text-white/80 whitespace-nowrap">{typeof r.user === "object" ? r.user?.name ?? "—" : "—"}</td>}
                      <td className="py-5 px-6 text-xs text-muted-foreground font-medium whitespace-nowrap">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
                      {canApprove && (
                        <td className="py-5 px-6 text-right whitespace-nowrap">
                          {r.status === "PENDING" ? (
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-8 hover:bg-emerald-500/20 hover:text-emerald-500 text-xs font-bold uppercase tracking-wider" onClick={() => handleStatus(r._id, "APPROVED")}>Approve</Button>
                              <Button variant="ghost" size="sm" className="h-8 hover:bg-red-500/20 hover:text-red-500 text-xs font-bold uppercase tracking-wider" onClick={() => handleStatus(r._id, "REJECTED")}>Reject</Button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Processed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
