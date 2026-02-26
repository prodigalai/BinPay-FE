/**
 * Public page: anyone with withdrawal-request link can submit a payout request (amount, PayPal email, name).
 * Route: /withdraw-request/:token
 */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Mail, DollarSign, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { toast } from "../hooks/use-toast";

export default function WithdrawRequestPage() {
  const { token } = useParams<{ token: string }>();
  const [valid, setValid] = useState<boolean | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [amount, setAmount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!token) {
      setValid(false);
      setLoading(false);
      return;
    }
    api
      .publicGet<{ success: boolean; valid?: boolean; expiresAt?: string; message?: string }>(
        `withdraw-request/${encodeURIComponent(token.toUpperCase())}`
      )
      .then((res) => {
        setValid(res.valid ?? false);
        if (res.expiresAt) setExpiresAt(res.expiresAt);
      })
      .catch(() => setValid(false))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !valid) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0.01) {
      toast({ title: "Enter a valid amount (min $0.01)", variant: "destructive" });
      return;
    }
    const email = paypalEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Enter a valid PayPal email", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.publicPost<{ success: boolean; message?: string }>(
        `withdraw-request/${encodeURIComponent(token!.toUpperCase())}`,
        { amount: amt, paypalEmail: email, name: name.trim() || "Requestor" }
      );
      if (res.success) {
        setSubmitted(true);
        toast({ title: "Request submitted", description: res.message });
      } else {
        toast({ title: "Request failed", description: (res as { message?: string }).message, variant: "destructive" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      toast({ title: "Request failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d12] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (valid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d12] text-white p-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-lg font-black uppercase">Link invalid or expired</h1>
          <p className="text-muted-foreground text-sm">This withdrawal request link is not valid or has expired. Please ask for a new link.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d12] text-white p-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <h1 className="text-lg font-black uppercase">Request submitted</h1>
          <p className="text-muted-foreground text-sm">Your payout request has been sent. You will be notified when it is processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h1 className="text-xl font-bold text-white">Request payout</h1>
            {expiresAt && (
              <p className="text-xs text-muted-foreground mt-1">
                This link expires at {new Date(expiresAt).toLocaleString()}. A new link can be generated after expiry.
              </p>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5" /> Your name (optional)
              </label>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5" /> PayPal email (where you want to receive)
              </label>
              <input
                type="email"
                placeholder="your@paypal.email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full min-h-[48px]">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit request"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
