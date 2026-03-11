/**
 * Public page: anyone with withdrawal-request link can submit a payout request (amount, PayPal email, name).
 * Route: /withdraw-request/:token
 */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Mail, DollarSign, User, AlertTriangle, CheckCircle2, Phone, Landmark, Send } from "lucide-react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { toast } from "../hooks/use-toast";
import { cn } from "../lib/utils";

const COUNTRY_OPTIONS = [
  { value: "+1", label: "United States / Canada", flag: "🇺🇸" },
  { value: "+44", label: "United Kingdom", flag: "🇬🇧" },
  { value: "+91", label: "India", flag: "🇮🇳" },
  { value: "+971", label: "United Arab Emirates", flag: "🇦🇪" },
  { value: "+61", label: "Australia", flag: "🇦🇺" },
  { value: "+49", label: "Germany", flag: "🇩🇪" },
  { value: "+33", label: "France", flag: "🇫🇷" },
  { value: "+39", label: "Italy", flag: "🇮🇹" },
  { value: "+34", label: "Spain", flag: "🇪🇸" },
  { value: "+81", label: "Japan", flag: "🇯🇵" },
  { value: "+82", label: "South Korea", flag: "🇰🇷" },
  { value: "+65", label: "Singapore", flag: "🇸🇬" },
  { value: "+62", label: "Indonesia", flag: "🇮🇩" },
  { value: "+60", label: "Malaysia", flag: "🇲🇾" },
  { value: "+63", label: "Philippines", flag: "🇵🇭" },
  { value: "+92", label: "Pakistan", flag: "🇵🇰" },
  { value: "+880", label: "Bangladesh", flag: "🇧🇩" },
  { value: "+234", label: "Nigeria", flag: "🇳🇬" },
  { value: "+254", label: "Kenya", flag: "🇰🇪" },
  { value: "+27", label: "South Africa", flag: "🇿🇦" },
  { value: "+55", label: "Brazil", flag: "🇧🇷" },
  { value: "+52", label: "Mexico", flag: "🇲🇽" },
  { value: "+57", label: "Colombia", flag: "🇨🇴" },
  { value: "+54", label: "Argentina", flag: "🇦🇷" },
  { value: "+90", label: "Turkey", flag: "🇹🇷" },
  { value: "+966", label: "Saudi Arabia", flag: "🇸🇦" },
  { value: "+974", label: "Qatar", flag: "🇶🇦" },
  { value: "+968", label: "Oman", flag: "🇴🇲" },
  { value: "+852", label: "Hong Kong", flag: "🇭🇰" },
  { value: "+853", label: "Macau", flag: "🇲🇴" },
  { value: "+86", label: "China", flag: "🇨🇳" },
  { value: "+41", label: "Switzerland", flag: "🇨🇭" },
  { value: "+31", label: "Netherlands", flag: "🇳🇱" },
  { value: "+46", label: "Sweden", flag: "🇸🇪" },
  { value: "+47", label: "Norway", flag: "🇳🇴" },
  { value: "+48", label: "Poland", flag: "🇵🇱" },
  { value: "+420", label: "Czech Republic", flag: "🇨🇿" },
  { value: "+351", label: "Portugal", flag: "🇵🇹" },
];

export default function WithdrawRequestPage() {
  const { token } = useParams<{ token: string }>();
  const [valid, setValid] = useState<boolean | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [amount, setAmount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [withdrawalMethod, setWithdrawalMethod] = useState<"Dots RTP" | "PayPal">("Dots RTP");
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
    const methodVal = withdrawalMethod === "PayPal" ? "paypal" : "dots";
    const email = paypalEmail.trim();
    const phoneTrimmed = localPhone.trim();
    if (withdrawalMethod === "PayPal") {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({ title: "Enter a valid PayPal email", variant: "destructive" });
        return;
      }
    } else {
      const digits = (countryCode + phoneTrimmed).replace(/\D/g, "");
      if (!digits || digits.length < 8) {
        toast({ title: "Enter a valid phone (country code + number)", variant: "destructive" });
        return;
      }
    }
    setSubmitting(true);
    try {
      const payload: any = {
        amount: amt,
        name: name.trim() || "Requestor",
        withdrawalMethod: methodVal,
      };
      if (withdrawalMethod === "PayPal") {
        payload.paypalEmail = email;
      } else {
        payload.phone = `${countryCode}${phoneTrimmed}`;
      }
      const res = await api.publicPost<{ success: boolean; message?: string }>(
        `withdraw-request/${encodeURIComponent(token!.toUpperCase())}`,
        payload
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
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Withdrawal method
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "Dots RTP" as const, icon: Landmark, label: "Dots RTP (default)" },
                  { id: "PayPal" as const, icon: Send, label: "PayPal" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setWithdrawalMethod(m.id)}
                    className={cn(
                      "flex items-center gap-2 h-10 rounded-xl border px-3 text-[11px] font-bold uppercase tracking-wider transition-all",
                      withdrawalMethod === m.id
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                    )}
                  >
                    <m.icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
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
            {withdrawalMethod === "PayPal" ? (
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
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Phone className="w-3.5 h-3.5" /> Country code
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-40 min-h-[44px] px-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.flag} {c.value} ({c.label})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="5551234567"
                      value={localPhone}
                      onChange={(e) => setLocalPhone(e.target.value)}
                      className="flex-1 min-h-[44px] px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
              </div>
            )}
            <Button type="submit" disabled={submitting} className="w-full min-h-[48px]">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit request"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
