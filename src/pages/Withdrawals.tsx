import { useState, useEffect } from "react";
import { Wallet, Link as LinkIcon, Copy, Plus, Loader2, RefreshCw, History, CheckCircle2, Clock, XCircle, ShieldCheck, UserPlus, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { toast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

interface PayoutLinkItem {
  id: string;
  code: string;
  amount: number;
  status: string;
  link: string;
  createdAt: string;
}

interface PayoutHistoryItem {
  id: string;
  linkCode: string;
  amount: number;
  status: string;
  paypalMasked: string;
  createdAt: string;
}

interface ManualRequestItem {
  id: string;
  amount: number;
  status: string;
  payoutMethod?: string;
  requesterName?: string;
  requesterEmail?: string;
  tokenSent?: boolean;
  fromLink?: boolean;
  payoutBatchId?: string | null;
  createdAt: string;
  user?: { name?: string; email?: string };
  payoutDetail?: { paypalEmail?: string };
}

export default function Withdrawals() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [links, setLinks] = useState<PayoutLinkItem[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [amount, setAmount] = useState("");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'links' | 'manual' | 'approve'>('manual');
  const [verifyingCode, setVerifyingCode] = useState<string | null>(null);
  const [manualRequests, setManualRequests] = useState<ManualRequestItem[]>([]);
  const [withdrawalLink, setWithdrawalLink] = useState<string | null>(null);
  const [withdrawalLinkExpiresAt, setWithdrawalLinkExpiresAt] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [confirmTokenSent, setConfirmTokenSent] = useState<{ id: string; name: string; amount: string; checked: boolean } | null>(null);
  const [tokenSentUpdatingId, setTokenSentUpdatingId] = useState<string | null>(null);
  const [sendingPayoutId, setSendingPayoutId] = useState<string | null>(null);
  const [verifyingRequestId, setVerifyingRequestId] = useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN";
  const canManageRequests = user?.role === "ADMIN" || user?.role === "AGENT";

  const fetchManualRequests = () => {
    if (!canManageRequests) return;
    api.get<{ success: boolean; requests: ManualRequestItem[] }>("withdrawals/all", { params: { source: "link" } }).then((r) => {
      if (r.success) setManualRequests(r.requests || []);
    }).catch(() => setManualRequests([]));
  };

  const handleGenerateWithdrawalLink = async () => {
    setGeneratingLink(true);
    setWithdrawalLink(null);
    setWithdrawalLinkExpiresAt(null);
    try {
      const res = await api.post<{ success: boolean; link?: string; expiresAt?: string; message?: string }>("admin/withdrawal-link", {});
      if (res.success && res.link) {
        setWithdrawalLink(res.link);
        if (res.expiresAt) setWithdrawalLinkExpiresAt(res.expiresAt);
        toast({ title: "Link created", description: "Link valid for 1 hour. Share with users to request payouts." });
      }
    } catch (err) {
      toast({ title: "Failed to create link", variant: "destructive" });
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleApproveRequest = async (id: string) => {
    setApprovingId(id);
    try {
      const res = await api.put<{ success: boolean }>(`withdrawals/${id}`, { status: "APPROVED", confirmApproval: true });
      if (res.success) {
        toast({ title: "Approved", description: "Payout request approved." });
        setConfirmApproveId(null);
        fetchManualRequests();
      }
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Approve failed", variant: "destructive" });
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectRequest = async (id: string) => {
    setRejectingId(id);
    try {
      await api.put(`withdrawals/${id}`, { status: "REJECTED", reviewNote: "Rejected from Manual Payout" });
      toast({ title: "Rejected" });
      fetchManualRequests();
    } catch (err) {
      toast({ title: "Reject failed", variant: "destructive" });
    } finally {
      setRejectingId(null);
    }
  };

  const handleTokenSent = async (id: string, checked: boolean) => {
    setTokenSentUpdatingId(id);
    setConfirmTokenSent(null);
    try {
      await api.patch(`withdrawals/${id}/token-sent`, { tokenSent: checked });
      toast({ title: checked ? "Marked as token sent" : "Token sent unmarked" });
      fetchManualRequests();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setTokenSentUpdatingId(null);
    }
  };

  /** Send PayPal payout (COMPLETED with no batch yet, or FAILED retry). Backend verifies batch status and allows retry if failed. */
  const handleSendPayout = async (id: string) => {
    setSendingPayoutId(id);
    try {
      const res = await api.post<{ success: boolean; message?: string; batchId?: string }>(`withdrawals/${id}/send-payout`, {});
      if (res.success) {
        toast({ title: "Payout sent", description: res.message || "Money sent via PayPal." });
        fetchManualRequests();
      }
    } catch (err) {
      toast({ title: "Send payout failed", description: err instanceof Error ? err.message : "Could not send", variant: "destructive" });
    } finally {
      setSendingPayoutId(null);
    }
  };

  /** Verify withdrawal request payout status from PayPal; if failed, request becomes FAILED and Send payout shows. */
  const handleVerifyRequestPayout = async (id: string) => {
    setVerifyingRequestId(id);
    try {
      const res = await api.post<{ success: boolean; status?: string; message?: string }>(`withdrawals/${id}/verify-payout`, {});
      if (res.success) {
        toast({ title: res.status === "completed" ? "Verified: Sent" : res.status === "failed" ? "Verified: Failed" : "Status checked", description: res.message });
        fetchManualRequests();
      }
    } catch (err) {
      toast({ title: "Verify failed", description: err instanceof Error ? err.message : "Could not verify", variant: "destructive" });
    } finally {
      setVerifyingRequestId(null);
    }
  };

  const handleVerifyPayout = async (linkCode: string) => {
    setVerifyingCode(linkCode);
    try {
      const res = await api.post<{ success: boolean; status?: string; message?: string }>("admin/payout-verify", { linkCode });
      if (res.success) {
        toast({ title: res.status === "completed" ? "Verified: Completed" : res.status === "failed" ? "Verified: Failed" : "Status checked", description: res.message });
        fetchPayoutHistory();
      } else {
        toast({ title: "Verify failed", description: (res as { message?: string }).message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Verify failed", description: err instanceof Error ? err.message : "Could not verify from PayPal", variant: "destructive" });
    } finally {
      setVerifyingCode(null);
    }
  };

  const fetchBalance = () => {
    if (!isAdmin) return;
    api.get<{ success: boolean; balance: number }>("admin/payout-balance").then((r) => {
      if (r.success) setBalance(r.balance);
    }).catch(() => setBalance(0));
  };

  const fetchLinks = () => {
    if (!isAdmin) return;
    api.get<{ success: boolean; links: PayoutLinkItem[] }>("admin/payout-links").then((r) => {
      if (r.success) setLinks(r.links || []);
    }).catch(() => setLinks([]));
  };

  const fetchPayoutHistory = () => {
    if (!isAdmin) return;
    api.get<{ success: boolean; history: PayoutHistoryItem[] }>("admin/payout-history").then((r) => {
      if (r.success) setPayoutHistory(r.history || []);
    }).catch(() => setPayoutHistory([]));
  };

  useEffect(() => {
    setLoading(true);
    if (isAdmin) {
      Promise.all([
        api.get<{ success: boolean; balance: number }>("admin/payout-balance"),
        api.get<{ success: boolean; links: PayoutLinkItem[] }>("admin/payout-links"),
        api.get<{ success: boolean; history: PayoutHistoryItem[] }>("admin/payout-history"),
      ])
        .then(([balanceRes, linksRes, historyRes]) => {
          if (balanceRes.success) setBalance(balanceRes.balance);
          if (linksRes.success) setLinks(linksRes.links || []);
          if (historyRes.success) setPayoutHistory(historyRes.history || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (canManageRequests && (activeTab === 'approve' || activeTab === 'manual')) fetchManualRequests();
  }, [isAdmin, activeTab]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0.01) {
      toast({ title: "Enter amount (min $0.01)", variant: "destructive" });
      return;
    }
    const bal = balance ?? 0;
    if (num > bal) {
      toast({ title: `Insufficient balance ($${bal.toFixed(2)} available)`, variant: "destructive" });
      return;
    }
    setCreating(true);
    setCreatedLink(null);
    try {
      const res = await api.post<{ success: boolean; link?: string; code?: string; amount?: number; message?: string }>(
        "admin/create-link",
        { amount: num }
      );
      if (res.success && res.link) {
        setCreatedLink(res.link);
        setAmount("");
        fetchLinks();
        fetchBalance();
        toast({ title: "Payout link created", description: "Share the link with the recipient." });
      } else {
        toast({ title: (res as { message?: string }).message || "Failed to create link", variant: "destructive" });
      }
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to create link", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Link copied to clipboard" });
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "text-emerald-500";
    if (s === "failed") return "text-red-500";
    if (s === "processing") return "text-amber-500";
    return "text-muted-foreground";
  };

  const historyStatusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    if (s === "failed") return <XCircle className="w-3.5 h-3.5 text-red-500" />;
    return <Clock className="w-3.5 h-3.5 text-amber-500" />;
  };

  const inputClass =
    "w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl px-4 text-sm font-semibold text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all";

  if (!isAdmin) {
    return (
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Withdrawals</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Create payout links and send money via link.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
            <LinkIcon className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Admin only</h3>
          <p className="text-sm text-muted-foreground">Only Master/Admin can create payout links here. Contact your admin.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Withdrawals</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Create payout links. Send the link — user opens it and enters their PayPal email.</p>
        </div>
        <button
          type="button"
          onClick={() => { fetchBalance(); fetchLinks(); fetchPayoutHistory(); }}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white self-start sm:self-auto"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Balance */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Balance</span>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">${(balance ?? 0).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">USD</span></p>
        <p className="text-[10px] text-muted-foreground mt-1">Total Balance. Deducted only when payout is sent to the receiver; refunded if payout fails.</p>
      </div>

      {/* Withdrawal request link — above tabs so it's always visible */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Withdrawal request link</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Generate a time-limited link (1 hour). Multiple users can submit payout requests via this link before it expires. After expiry, generate a new link.</p>
        <Button type="button" onClick={handleGenerateWithdrawalLink} disabled={generatingLink} className="gap-2">
          {generatingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Generate link
        </Button>
        {withdrawalLink && (
          <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Share this link</p>
            {withdrawalLinkExpiresAt && (
              <p className="text-xs text-amber-200/90">Expires at {new Date(withdrawalLinkExpiresAt).toLocaleString()}. New link can be generated after expiry.</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <input readOnly value={withdrawalLink} className="flex-1 min-w-0 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white truncate" />
              <Button type="button" variant="outline" size="sm" onClick={() => copyLink(withdrawalLink)}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-1 p-1 bg-white/[0.02] border border-white/10 rounded-xl mb-2">
        <button
          onClick={() => setActiveTab('manual')}
          className={cn(
            "flex-1 min-w-[90px] py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200",
            activeTab === 'manual'
              ? "bg-primary/20 text-primary shadow-sm"
              : "text-muted-foreground hover:text-white"
          )}
        >
          Manual Payout
        </button>
        <button
          onClick={() => setActiveTab('approve')}
          className={cn(
            "flex-1 min-w-[90px] py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200",
            activeTab === 'approve'
              ? "bg-primary/20 text-primary shadow-sm"
              : "text-muted-foreground hover:text-white"
          )}
        >
          Approve Requests
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 min-w-[90px] py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200",
            activeTab === 'history'
              ? "bg-primary/20 text-primary shadow-sm"
              : "text-muted-foreground hover:text-white"
          )}
        >
          Payout History
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={cn(
            "flex-1 min-w-[90px] py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200",
            activeTab === 'links'
              ? "bg-primary/20 text-primary shadow-sm"
              : "text-muted-foreground hover:text-white"
          )}
        >
          Your Links
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'manual' ? (
        <div className="space-y-6">
          {/* Create payout link — inside Manual Payout tab */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Create payout link</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Share the link — user opens it and enters their own PayPal email.</p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
              <div className="min-w-[160px] flex-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputClass}
                />
              </div>
              <Button type="submit" disabled={creating || (balance ?? 0) < 0.01} className="h-12 px-6">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Create link</>}
              </Button>
            </form>
            {createdLink && (
              <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Share this link</p>
                <p className="text-xs text-muted-foreground">Copy and send to user via WhatsApp, Email or SMS. User opens the link in browser and enters their PayPal email.</p>
                <div className="flex flex-wrap items-center gap-3">
                  <input readOnly value={createdLink} className="flex-1 min-w-0 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white truncate" />
                  <Button type="button" variant="outline" size="sm" onClick={() => copyLink(createdLink)}>
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'approve' ? (
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Approve Requests</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Payout requests from the withdrawal link. Approve, reject, or mark token sent.</p>
              </div>
            </div>
          </div>
          {manualRequests.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No requests yet</p>
              <p className="text-xs text-muted-foreground mt-1">Share the withdrawal request link above. Requests will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-white/[0.04] border-b border-white/10">
                    <th className="py-3.5 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</th>
                    <th className="py-3.5 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Name</th>
                    <th className="py-3.5 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">PayPal</th>
                    <th className="py-3.5 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount</th>
                    <th className="py-3.5 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="py-3.5 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Token sent</th>
                    <th className="py-3.5 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manualRequests.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-sm font-medium text-white">{r.requesterName || (r.user as any)?.name || "—"}</td>
                      <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">{(r.requesterEmail || (r.payoutDetail as any)?.paypalEmail || "").slice(0, 3)}***</td>
                      <td className="py-3.5 px-4 text-sm font-bold text-white">${Number(r.amount).toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                          r.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400" : r.status === "REJECTED" || r.status === "FAILED" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"
                        )}>{r.status}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {r.status === "PENDING" || r.status === "COMPLETED" ? (
                          <button
                            type="button"
                            onClick={() => setConfirmTokenSent({
                              id: r.id,
                              name: r.requesterName || (r.user as any)?.name || "—",
                              amount: `$${Number(r.amount).toFixed(2)}`,
                              checked: !r.tokenSent,
                            })}
                            disabled={tokenSentUpdatingId === r.id}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 focus:ring-offset-transparent disabled:opacity-50",
                              r.tokenSent
                                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                : "border-white/20 bg-white/5 text-muted-foreground hover:border-white/30 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            {tokenSentUpdatingId === r.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : r.tokenSent ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            {r.tokenSent ? "Sent" : "Mark sent"}
                          </button>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {r.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                              disabled={approvingId === r.id}
                              onClick={() => setConfirmApproveId(r.id)}
                            >
                              {approvingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Approve"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] font-bold uppercase border-red-500/30 text-red-400 hover:bg-red-500/10"
                              disabled={rejectingId === r.id}
                              onClick={() => handleRejectRequest(r.id)}
                            >
                              {rejectingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Reject"}
                            </Button>
                          </div>
                        )}
                        {(r.status === "COMPLETED" || r.status === "FAILED") && (r.payoutMethod || "").toUpperCase() === "PAYPAL" && (
                          <div className="flex items-center justify-end gap-2">
                            {r.status === "COMPLETED" && r.payoutBatchId && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] font-bold uppercase"
                                disabled={verifyingRequestId === r.id}
                                onClick={() => handleVerifyRequestPayout(r.id)}
                              >
                                {verifyingRequestId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verify</>}
                              </Button>
                            )}
                            {((r.status === "COMPLETED" && !r.payoutBatchId) || r.status === "FAILED") && (
                              <Button
                                type="button"
                                size="sm"
                                className="h-8 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                                disabled={sendingPayoutId === r.id}
                                onClick={() => handleSendPayout(r.id)}
                              >
                                {sendingPayoutId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send payout"}
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'history' ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-white/5 flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <span className="text-sm font-black uppercase tracking-wider text-white">Payout history</span>
        </div>
        {payoutHistory.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No payout history yet. When someone uses a link and gets paid, it will show here.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/10">
                  <th className="py-3 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</th>
                  <th className="py-3 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Link</th>
                  <th className="py-3 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount</th>
                  <th className="py-3 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">PayPal</th>
                  <th className="py-3 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="py-3 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((h) => (
                  <tr key={h.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{new Date(h.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs font-mono text-white">{h.linkCode}</td>
                    <td className="py-3 px-4 text-sm font-bold text-white">${h.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground font-mono">{h.paypalMasked}</td>
                    <td className="py-3 px-4">
                      <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-black uppercase", statusColor(h.status))}>
                        {historyStatusIcon(h.status)} {h.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 h-8 text-[10px] font-bold uppercase"
                        disabled={verifyingCode === h.linkCode || h.status === "completed" || h.status === "failed"}
                        onClick={() => handleVerifyPayout(h.linkCode)}
                      >
                        {verifyingCode === h.linkCode ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        Verify
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-white/5 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-black uppercase tracking-wider text-white">Your payout links</span>
        </div>
        {links.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No payout links yet. Create one above.</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {links.map((l) => (
              <li key={l.id} className="p-4 sm:p-6 flex flex-wrap items-center gap-3 hover:bg-white/[0.02]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground">{l.code}</span>
                  <span className={cn("text-[10px] font-black uppercase", statusColor(l.status))}>{l.status}</span>
                </div>
                <span className="text-sm font-bold text-white">${l.amount.toFixed(2)}</span>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <input readOnly value={l.link} className="flex-1 min-w-0 max-w-[200px] sm:max-w-none bg-black/20 border border-white/5 rounded-lg px-2 py-1.5 text-xs font-mono text-muted-foreground truncate" />
                  <button type="button" onClick={() => copyLink(l.link)} className="p-1.5 hover:bg-white/10 rounded text-muted-foreground hover:text-white">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
        </div>
      )}

      {/* Confirm approval modal (for Approve Requests tab) */}
      {confirmApproveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmApproveId(null)}>
          <div className="rounded-2xl border border-white/10 bg-[#0a0d12] p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-white">Confirm approval</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Verify payout details, then approve. Mark &quot;Token sent&quot; after you send the payment.</p>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => confirmApproveId && handleApproveRequest(confirmApproveId)} disabled={approvingId === confirmApproveId}>
                {approvingId === confirmApproveId ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, approve"}
              </Button>
              <Button variant="outline" onClick={() => setConfirmApproveId(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm token sent modal */}
      {confirmTokenSent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmTokenSent(null)}>
          <div className="rounded-2xl border border-white/10 bg-[#0a0d12] p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-white">
                {confirmTokenSent.checked ? "Mark token sent?" : "Unmark token sent?"}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {confirmTokenSent.checked
                ? "Confirm that you have sent the payout for this request."
                : "This will unmark token sent for this request."}
            </p>
            <p className="text-xs text-muted-foreground/80 mb-4">
              {confirmTokenSent.name} · {confirmTokenSent.amount}
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => confirmTokenSent && handleTokenSent(confirmTokenSent.id, confirmTokenSent.checked)}
              >
                {confirmTokenSent.checked ? "Yes, marked sent" : "Yes, unmark"}
              </Button>
              <Button variant="outline" onClick={() => setConfirmTokenSent(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
