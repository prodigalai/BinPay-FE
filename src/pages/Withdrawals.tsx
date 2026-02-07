import { useState, useEffect } from "react";
import { Wallet, ArrowUpRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import type { WithdrawRequest, WithdrawRequestsResponse, WalletBalance } from "../lib/api";
import { toast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { GlassInput } from "../components/ui/glass-input";

export default function Withdrawals() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isStaff = user?.role === "ADMIN" || user?.role === "STAFF" || user?.role === "SUPPORT";
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
      <h1 className="text-xl sm:text-2xl font-bold">Withdrawals</h1>

      <div className="glass rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          <span className="font-semibold text-primary">${balance.toFixed(2)}</span>
          <span className="text-muted-foreground text-sm">balance</span>
        </div>
        {!isStaff && (
          <form onSubmit={handleRequest} className="flex gap-2 items-center">
            <GlassInput type="number" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Request"}</Button>
          </form>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading…</p>
      ) : (
        <div className="glass rounded-lg overflow-hidden">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                {isStaff && <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">User</th>}
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                {canApprove && <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Action</th>}
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No requests.</td></tr>
              ) : (
                requests.map((r) => (
                  <tr key={r._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-semibold">${r.amount?.toFixed(2) ?? "0.00"}</td>
                    <td className="py-3 px-4 text-sm">{r.status}</td>
                    {isStaff && <td className="py-3 px-4 text-sm">{typeof r.user === "object" ? r.user?.name ?? "—" : "—"}</td>}
                    <td className="py-3 px-4 text-sm text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
                    {canApprove && (
                      <td className="py-3 px-4 text-right">
                        {r.status === "PENDING" && (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-400" onClick={() => handleStatus(r._id, "APPROVED")}>Approve</Button>
                            <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleStatus(r._id, "REJECTED")}>Reject</Button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
