/**
 * Admin: view balance, create payout links, list links.
 * Route: /payout-links (ADMIN only)
 */
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Copy, Plus, DollarSign, Link as LinkIcon, Loader2, RefreshCw } from "lucide-react";
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

export default function PayoutLinksAdmin() {
  const [balance, setBalance] = useState<number | null>(null);
  const [links, setLinks] = useState<PayoutLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [amount, setAmount] = useState("");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [addingBalance, setAddingBalance] = useState(false);

  const fetchBalance = () => {
    api.get<{ success: boolean; balance: number }>("admin/payout-balance").then((r) => {
      if (r.success) setBalance(r.balance);
    }).catch(() => setBalance(0));
  };

  const fetchLinks = () => {
    api.get<{ success: boolean; links: PayoutLinkItem[] }>("admin/payout-links").then((r) => {
      if (r.success) setLinks(r.links || []);
    }).catch(() => setLinks([]));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<{ success: boolean; balance: number }>("admin/payout-balance"),
      api.get<{ success: boolean; links: PayoutLinkItem[] }>("admin/payout-links"),
    ])
      .then(([balanceRes, linksRes]) => {
        if (balanceRes.success) setBalance(balanceRes.balance);
        if (linksRes.success) setLinks(linksRes.links || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        fetchBalance();
        fetchLinks();
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

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(topUpAmount);
    if (isNaN(num) || num <= 0) {
      toast({ title: "Enter a positive amount", variant: "destructive" });
      return;
    }
    setAddingBalance(true);
    try {
      const res = await api.post<{ success: boolean; balance?: number; message?: string }>("admin/add-payout-balance", { amount: num });
      if (res.success) {
        setBalance(res.balance ?? (balance ?? 0));
        setTopUpAmount("");
        toast({ title: "Balance updated" });
      } else {
        toast({ title: (res as { message?: string }).message || "Failed", variant: "destructive" });
      }
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed", variant: "destructive" });
    } finally {
      setAddingBalance(false);
    }
  };

  const copyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "text-emerald-500";
    if (s === "failed") return "text-red-500";
    if (s === "processing") return "text-amber-500";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Payout Links</h1>
          <p className="text-muted-foreground mt-1">Create fixed-amount links. Send the link — the user opens it and enters their own PayPal email. No need to collect their details in advance.</p>
        </div>
        <button
          type="button"
          onClick={() => { fetchBalance(); fetchLinks(); }}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white self-start sm:self-auto"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Balance */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Available balance</span>
        </div>
        <p className="text-2xl font-black text-white">
          ${(balance ?? 0).toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground ml-2">USD</span>
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">This balance is deducted when you create a payout link. Refunded if payout fails.</p>
        <form onSubmit={handleAddBalance} className="flex flex-wrap items-center gap-2 mt-3">
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Amount to add"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            className="w-28 h-9 px-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-muted-foreground/50"
          />
          <Button type="submit" size="sm" disabled={addingBalance}>
            {addingBalance ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add balance"}
          </Button>
        </form>
      </div>

      {/* Create link */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-white mb-4">Create payout link</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Amount (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Button type="submit" disabled={creating} className="min-h-[44px]">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Create link</>}
          </Button>
        </form>
        {createdLink && (
          <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">User link kahan open karega?</p>
            <p className="text-xs text-muted-foreground">Copy karke user ko WhatsApp, Email ya SMS se bhejo. User wahi link browser mein open karega.</p>
            <div className="flex items-center gap-2">
              <input readOnly value={createdLink} className="flex-1 min-w-0 bg-transparent text-sm text-white font-mono truncate" />
              <Button type="button" variant="outline" size="sm" onClick={() => copyLink(createdLink)}>
                <Copy className="w-4 h-4" /> Copy
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-black uppercase tracking-wider text-white">Your payout links</span>
        </div>
        {links.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No payout links yet. Create one above.</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {links.map((l) => (
              <li key={l.id} className="p-4 flex flex-wrap items-center gap-3 hover:bg-white/[0.02]">
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
    </div>
  );
}
