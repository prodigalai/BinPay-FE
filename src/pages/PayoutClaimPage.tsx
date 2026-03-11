/**
 * Public page: anyone with link can enter PayPal email and receive payout.
 * Route: /payout/:code
 */
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Mail, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Landmark, Send } from "lucide-react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { toast } from "../hooks/use-toast";
import { cn } from "../lib/utils";

interface LinkDetails {
  code: string;
  amount: number;
  status: string;
  provider: "PAYPAL" | "DOTS";
  dotsLink?: string;
}

export default function PayoutClaimPage() {
  const { code } = useParams<{ code: string }>();
  const [details, setDetails] = useState<LinkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [payoutStatus, setPayoutStatus] = useState<"processing" | "completed" | "failed" | null>(null);
  const [payoutMessage, setPayoutMessage] = useState<string>("");
  const [statusReason, setStatusReason] = useState<string | null>(null); // UNCLAIMED, ONHOLD when processing
  const [paypalEmail, setPaypalEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [withdrawalMethod, setWithdrawalMethod] = useState<"Dots RTP" | "PayPal">("PayPal");
  const processingStartedAt = useRef<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      return;
    }
    api
      .publicGet<{ success: boolean; code?: string; amount?: number; status?: string; provider?: string; dotsLink?: string; message?: string }>(
        `payout/${encodeURIComponent(code.toUpperCase())}`
      )
      .then((res) => {
        if (res.success && res.code) {
          const provider = (res.provider || "PAYPAL").toUpperCase() === "DOTS" ? "DOTS" : "PAYPAL";
          setDetails({ code: res.code, amount: res.amount ?? 0, status: res.status ?? "unused", provider, dotsLink: res.dotsLink });
          setWithdrawalMethod(provider === "DOTS" ? "Dots RTP" : "PayPal");
        } else {
          setError((res as { message?: string }).message || "Invalid or expired link");
        }
      })
      .catch((err: Error) => {
        setError(err.message || "Failed to load link");
      })
      .finally(() => setLoading(false));
  }, [code]);

  // After submit, poll status until completed or failed
  useEffect(() => {
    if (!done || !code) return;
    const codeUpper = code.toUpperCase();
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const check = () => {
      if (cancelled) return;
      api
        .publicGet<{ success: boolean; status?: string; message?: string; statusReason?: string }>(
          `payout/${encodeURIComponent(codeUpper)}/status`
        )
        .then((res) => {
          if (cancelled) return;
          // Use status whenever present (success: false for processing/UNCLAIMED so we still show status + message)
          if (res.status) {
            const s = res.status as "processing" | "completed" | "failed";
            setPayoutStatus(s);
            setPayoutMessage(res.message || "");
            setStatusReason(res.statusReason ?? null);
            if ((s === "completed" || s === "failed") && intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        })
        .catch(() => {});
    };
    check();
    intervalId = setInterval(check, 4000);
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [done, code]);

  // Elapsed time while still waiting (processing or status not yet loaded)
  useEffect(() => {
    const stillWaiting = payoutStatus === "processing" || payoutStatus === null;
    if (!done || !stillWaiting) return;
    if (processingStartedAt.current === null) processingStartedAt.current = Date.now();
    const tick = () => {
      const start = processingStartedAt.current;
      if (start) setElapsedSec(Math.floor((Date.now() - start) / 1000));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [done, payoutStatus]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details || !code) return;
    if (details.provider === "DOTS") {
      // No submit for Dots payout-links; user should continue on the Dots-hosted page.
      if (details.dotsLink) {
        window.open(details.dotsLink, "_blank");
      }
      return;
    }
    const email = paypalEmail.trim();
    if (!email) {
      toast({ title: "Enter your PayPal email", variant: "destructive" });
      return;
    }
    if (!validateEmail(email)) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.publicPost<{ success: boolean; message?: string }>(
        `payout/${encodeURIComponent(code.toUpperCase())}/submit`,
        { paypal_email: email }
      );
      if (res.success) {
        processingStartedAt.current = Date.now();
        setElapsedSec(0);
        setDone(true);
        setPayoutStatus("processing");
        setPayoutMessage("Processing your payout...");
        toast({ title: "Payout submitted", description: "Checking status..." });
      } else {
        const msg = (res as { message?: string }).message || "Submission failed";
        toast({ title: "Submission failed", description: msg, variant: "destructive" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      toast({ title: "Submission failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d12] text-white p-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-lg font-black uppercase">Link invalid or used</h1>
          <p className="text-muted-foreground text-sm">{error || "This payout link is not valid or has already been used."}</p>
        </div>
      </div>
    );
  }

  const CHECKING_MAX_SEC = 10;

  // Dots payout-link UI: no email form or polling, just CTA to continue on Dots.
  if (details.provider === "DOTS") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d12] text-white p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1.5">
                NestaPay payout link
              </p>
              <h1 className="text-2xl font-black text-white tracking-tight">Claim your payout</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This payout will be completed using{" "}
                <span className="font-semibold text-white">Dots RTP</span>. You&apos;ll finish the process on a secure Dots page.
              </p>
              <div className="mt-4 rounded-xl bg-white/[0.04] border border-white/10 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    Amount
                  </p>
                  <p className="text-xl font-black text-white tabular-nums">
                    ${Number(details.amount || 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    Method
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-xs font-black uppercase tracking-widest">
                    <Landmark className="w-3.5 h-3.5" />
                    Dots RTP
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                When you continue, we&apos;ll open a{" "}
                <span className="font-semibold text-white">Dots</span> payout page where you can complete verification
                and choose how you want to receive the money.
              </p>
              <Button
                type="button"
                className="w-full min-h-[48px] font-black uppercase tracking-wider"
                onClick={() => {
                  if (details.dotsLink) {
                    window.open(details.dotsLink, "_blank");
                  } else {
                    toast({
                      title: "Link not ready",
                      description: "Please ask the sender to regenerate the payout link.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Continue to secure payout
              </Button>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                You may be asked for additional verification on Dots depending on your country and bank.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (done && details?.provider === "PAYPAL") {
    const isCompleted = payoutStatus === "completed";
    const isFailed = payoutStatus === "failed";
    const isProcessing = !isCompleted && !isFailed;
    const showCloseMessage = isProcessing && elapsedSec >= CHECKING_MAX_SEC;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d12] text-white p-4">
        <div className="text-center space-y-4 max-w-sm">
          {isProcessing && !showCloseMessage && (
            <>
              {statusReason === "UNCLAIMED" ? (
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7 text-amber-500" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                  <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
                </div>
              )}
              <h1 className="text-lg font-black uppercase">
                {statusReason === "UNCLAIMED" ? "Check your email" : "Checking status..."}
              </h1>
              <p className="text-muted-foreground text-sm">
                {payoutMessage || "Processing your payout..."}
              </p>
              {statusReason === "UNCLAIMED" && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-left">
                  <p className="text-xs font-semibold text-amber-200/90">
                    The email you entered may not have a PayPal account. Please use the correct PayPal email or ask the sender to create a new link with the right email.
                  </p>
                </div>
              )}
              {elapsedSec > 0 && (
                <p className="text-muted-foreground/80 text-xs">
                  {elapsedSec < 60
                    ? `Checking for ${elapsedSec} sec...`
                    : `Checking for ${Math.floor(elapsedSec / 60)} min...`}
                </p>
              )}
              {false && elapsedSec >= 120 && (
                <div className="pt-2 space-y-2 border-t border-white/10 mt-2">
                  <p className="text-muted-foreground text-xs">
                    Payouts can take 5–10 minutes. If it’s been a while, refresh this page to see the latest status.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 border-white/20 text-white hover:bg-white/10"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh page
                  </Button>
                </div>
              )}
            </>
          )}
          {isProcessing && showCloseMessage && (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h1 className="text-lg font-black uppercase">Request received</h1>
              <p className="text-muted-foreground text-sm">
                Your payout is being processed. You can close this page — we'll send the money to your PayPal account shortly.
              </p>
              <Button
                type="button"
                className="w-full gap-2 mt-2"
                onClick={() => window.close()}
              >
                Close
              </Button>
              <p className="text-[10px] text-muted-foreground">If this tab doesn't close, you can close it manually.</p>
            </>
          )}
          {isCompleted && (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h1 className="text-lg font-black uppercase">Payout completed</h1>
              <p className="text-muted-foreground text-sm">
                {payoutMessage || "Funds have been sent to your PayPal account."}
              </p>
            </>
          )}
          {isFailed && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7 text-red-500" />
              </div>
              <h1 className="text-lg font-black uppercase">Payout failed</h1>
              <p className="text-muted-foreground text-sm">
                {payoutMessage || "This payout could not be completed. Please contact the sender."}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // For Dots payout-links we don't submit anything from this page; we just show the Dots CTA.

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 py-8 relative overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] sm:w-[50%] h-[40%] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] sm:w-[50%] h-[40%] bg-accent/8 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
              <ShieldCheck className="w-2.5 h-2.5 text-primary" />
              <span className="text-[8px] font-black uppercase tracking-widest text-primary">Receive Payout</span>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Amount you will receive</p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-primary/50">$</span>
              <span className="text-3xl font-black text-white tracking-tight">
                {details.amount.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-muted-foreground ml-1">USD</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5">
                Withdrawal method
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={cn(
                    "flex items-center gap-2 h-9 rounded-xl border px-3 text-[10px] font-black uppercase tracking-widest",
                    "bg-primary/20 border-primary text-primary"
                  )}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>PayPal</span>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 h-9 rounded-xl border px-3 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
                  onClick={() =>
                    toast({
                      title: "PayPal only",
                      description: "This payout link only supports PayPal. Use a withdrawal request link for Dots RTP.",
                    })
                  }
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Dots RTP</span>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground border-l-2 border-primary/40 pl-3 py-1">
              We don’t have your account details. Enter <strong className="text-white">your</strong> PayPal email below so we can send the money to you.
            </p>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Your PayPal email (where you want to receive)
              </label>
              <input
                type="email"
                placeholder="your@paypal.email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
                autoComplete="email"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] font-black uppercase tracking-wider"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Receive payout"
              )}
            </Button>
          </form>
        </div>
        <p className="text-[8px] text-center text-muted-foreground/50 mt-4">
          We store your PayPal email only for this payout and audit logs; it will not be reused for marketing.
        </p>
      </div>
    </div>
  );
}
