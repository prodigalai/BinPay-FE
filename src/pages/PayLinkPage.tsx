import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, ShieldCheck, ArrowRight, User as UserIcon, Gamepad2, AlertTriangle, DollarSign, Clock, Lock } from "lucide-react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { toast } from "../hooks/use-toast";

interface LinkDetails {
  amount: number;
  amountCharged: number;
  feePercent: number;
  remark: string;
  currency: string;
  agentName: string;
}

export default function PayLinkPage() {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<LinkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [gameUsername, setGameUsername] = useState("");
  const [gameName, setGameName] = useState("");
  const [gateway] = useState("PAYPAL");
  const [errors, setErrors] = useState<{ gameUsername?: string; gameName?: string }>({});

  useEffect(() => {
    if (id) {
      api.get<{ success: boolean } & LinkDetails>(`payments/link/${id}`)
        .then((res) => {
          if (res.success) setDetails(res);
          else toast({ title: "Invalid Link", variant: "destructive" });
        })
        .catch(() => toast({ title: "Error loading link", variant: "destructive" }))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const validate = (): boolean => {
    const e: { gameUsername?: string; gameName?: string } = {};
    if (!gameUsername.trim()) e.gameUsername = "Required";
    else if (gameUsername.trim().length > 100) e.gameUsername = "Max 100 chars";
    if (!gameName.trim()) e.gameName = "Required";
    else if (gameName.trim().length > 100) e.gameName = "Max 100 chars";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setPaying(true);
    try {
      const res = await api.post<{ success: boolean; paymentLink: string }>(`payments/link/${id}/pay`, {
        gameUsername: gameUsername.trim(),
        gameName: gameName.trim(),
        gateway
      });
      if (res.success && res.paymentLink) {
        window.location.href = res.paymentLink;
      } else {
        toast({ title: "Failed to create payment", variant: "destructive" });
        setPaying(false);
      }
    } catch (err: any) {
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
      setPaying(false);
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

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white p-4">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-lg font-black uppercase italic">Access Restricted</h1>
          <p className="text-muted-foreground text-xs max-w-xs mx-auto">This payment link is invalid or expired.</p>
        </div>
      </div>
    );
  }

  const feeAmount = details.feePercent > 0 ? (details.amount * details.feePercent / 100) : 0;
  const totalToPay = details.amountCharged || (details.amount + feeAmount);

  return (
    <div className="min-h-[90vh] h-[90vh] text-white flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/8 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-[960px] animate-in fade-in zoom-in-95 duration-500 relative z-10">
        <div className="glass-strong rounded-2xl lg:rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
          
          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-0">
            
            {/* LEFT — Payment Info */}
            <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              
              <div className="relative">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3 sm:mb-4">
                  <ShieldCheck className="w-2.5 h-2.5 text-primary" />
                  <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-primary">Secure Checkout</span>
                </div>

                {/* Amount */}
                <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">You are paying</p>
                <div className="flex items-baseline gap-1 mb-3 sm:mb-4">
                  <span className="text-sm sm:text-lg font-black text-primary/50">$</span>
                  <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black text-white tracking-tighter italic">{details.amount.toFixed(2)}</h1>
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground ml-1 uppercase">{details.currency || 'USD'}</span>
                </div>

                {/* Fee Breakdown */}
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  <div className="flex justify-between text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" /> Base Amount</span>
                    <span className="text-white">${details.amount.toFixed(2)}</span>
                  </div>
                  {details.feePercent > 0 && (
                    <div className="flex justify-between text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Gateway Fee ({details.feePercent}%)</span>
                      <span className="text-accent">+${feeAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest">Total</span>
                    <span className="text-lg sm:text-xl font-black text-primary italic">${totalToPay.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="relative space-y-2 sm:space-y-3">
                {/* Merchant */}
                <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                    <UserIcon className="w-3 h-3 text-white/40" />
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Payment To</p>
                    <p className="text-xs sm:text-sm font-bold text-white uppercase italic">{details.agentName || "Trusted Merchant"}</p>
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <Lock className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                    <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-wider">256-bit SSL</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <Clock className="w-2.5 h-2.5 text-primary shrink-0" />
                    <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-wider">Instant Credit</span>
                  </div>
                </div>

                {details.remark && (
                  <p className="text-[7px] sm:text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest text-center">
                    {details.remark}
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT — Form */}
            <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
              <form onSubmit={handlePay} className="space-y-3 sm:space-y-4">
                <h2 className="text-sm sm:text-base font-black uppercase italic tracking-tight text-white">Enter Your Details</h2>
                <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Fill in to proceed with payment</p>

                {/* Game Name */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest">Platform / Game</label>
                    <Gamepad2 className="w-2.5 h-2.5 text-muted-foreground/30" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. PUBG, FREE FIRE"
                    value={gameName}
                    onChange={(e) => { setGameName(e.target.value); setErrors(prev => ({ ...prev, gameName: undefined })); }}
                    className={`w-full h-9 sm:h-10 bg-white/[0.03] border rounded-lg sm:rounded-xl px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/20 ${errors.gameName ? 'border-red-500/50' : 'border-white/5'}`}
                    maxLength={100}
                    required
                  />
                  {errors.gameName && (
                    <p className="text-[8px] font-bold text-red-500 flex items-center gap-1 pl-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> {errors.gameName}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest">Player ID / Username</label>
                    <UserIcon className="w-2.5 h-2.5 text-muted-foreground/30" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your game ID"
                    value={gameUsername}
                    onChange={(e) => { setGameUsername(e.target.value); setErrors(prev => ({ ...prev, gameUsername: undefined })); }}
                    className={`w-full h-9 sm:h-10 bg-white/[0.03] border rounded-lg sm:rounded-xl px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/20 ${errors.gameUsername ? 'border-red-500/50' : 'border-white/5'}`}
                    maxLength={100}
                    required
                  />
                  {errors.gameUsername && (
                    <p className="text-[8px] font-bold text-red-500 flex items-center gap-1 pl-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> {errors.gameUsername}
                    </p>
                  )}
                </div>

                {/* Payment Method — PayPal Only */}
                <div className="space-y-1">
                  <label className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1 block">Payment Method</label>
                  <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#0070ba]/10 border-2 border-[#0070ba]/40">
                    {/* PayPal SVG Logo */}
                    <svg className="h-5 sm:h-6 w-auto" viewBox="0 0 101 32" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.237 2.4H4.437c-.535 0-.99.39-1.073.916L.584 21.748c-.063.39.24.742.637.742h3.72c.535 0 .99-.39 1.073-.917l.928-5.89c.084-.527.538-.917 1.074-.917h2.474c5.157 0 8.133-2.494 8.912-7.436.35-2.164.014-3.864-.998-5.053C17.27 3.108 15.07 2.4 12.237 2.4zm.905 7.322c-.428 2.81-2.577 2.81-4.656 2.81h-1.183l.83-5.254c.05-.316.326-.55.646-.55h.543c1.415 0 2.75 0 3.44.807.41.482.535 1.198.38 2.187z" fill="#253B80"/>
                      <path d="M35.768 9.64h-3.734c-.32 0-.596.234-.647.55l-.164 1.045-.262-.378c-.808-1.172-2.61-1.564-4.408-1.564-4.124 0-7.648 3.124-8.336 7.505-.358 2.186.15 4.276 1.395 5.735 1.143 1.34 2.775 1.898 4.72 1.898 3.34 0 5.19-2.147 5.19-2.147l-.166 1.04c-.063.39.238.743.636.743h3.363c.534 0 .99-.39 1.073-.917l2.018-12.768c.063-.39-.238-.742-.637-.742zm-5.228 7.264c-.36 2.135-2.058 3.567-4.227 3.567-1.088 0-1.96-.35-2.52-1.012-.555-.658-.764-1.594-.588-2.63.337-2.117 2.063-3.597 4.198-3.597 1.065 0 1.93.353 2.502 1.02.576.674.8 1.614.635 2.652z" fill="#253B80"/>
                      <path d="M55.96 9.64h-3.753c-.36 0-.696.18-.898.48l-5.18 7.63-2.197-7.33c-.137-.46-.558-.78-1.04-.78h-3.69c-.442 0-.75.432-.607.848l4.14 12.14-3.895 5.496c-.302.427.013 1.016.53 1.016h3.748c.357 0 .69-.177.893-.473l12.49-18.04c.297-.427-.018-1.016-.54-1.016z" fill="#253B80"/>
                      <path d="M67.055 2.4h-7.8c-.534 0-.99.39-1.073.916l-2.78 17.433c-.063.39.238.742.637.742h3.97c.374 0 .692-.273.75-.642l.788-4.998c.084-.527.538-.917 1.074-.917h2.473c5.158 0 8.134-2.494 8.913-7.436.352-2.164.015-3.864-.997-5.053C71.876 3.108 69.674 2.4 67.055 2.4zm.904 7.322c-.428 2.81-2.576 2.81-4.655 2.81h-1.183l.83-5.254c.05-.316.326-.55.646-.55h.542c1.416 0 2.752 0 3.441.807.41.482.535 1.198.38 2.187z" fill="#179BD7"/>
                      <path d="M90.586 9.64h-3.734c-.32 0-.596.234-.647.55l-.164 1.045-.262-.378c-.808-1.172-2.61-1.564-4.408-1.564-4.124 0-7.648 3.124-8.335 7.505-.358 2.186.15 4.276 1.394 5.735 1.143 1.34 2.776 1.898 4.72 1.898 3.34 0 5.19-2.147 5.19-2.147l-.166 1.04c-.063.39.238.743.636.743h3.363c.535 0 .99-.39 1.073-.917l2.02-12.768c.06-.39-.24-.742-.64-.742zm-5.228 7.264c-.36 2.135-2.058 3.567-4.226 3.567-1.088 0-1.96-.35-2.52-1.012-.556-.658-.765-1.594-.59-2.63.34-2.117 2.065-3.597 4.2-3.597 1.064 0 1.93.353 2.5 1.02.578.674.802 1.614.636 2.652z" fill="#179BD7"/>
                      <path d="M95.088 2.977l-2.823 17.96c-.063.39.238.743.636.743h3.216c.535 0 .99-.39 1.074-.917L99.97 3.33c.063-.39-.238-.743-.637-.743h-3.608c-.32.002-.596.236-.647.55z" fill="#179BD7"/>
                    </svg>
                    <span className="text-[9px] sm:text-[10px] font-black text-[#0070ba] uppercase tracking-widest">Secure Payment</span>
                  </div>
                </div>

                {/* Submit */}
                <Button 
                  type="submit" 
                  disabled={paying} 
                  className="w-full h-10 sm:h-12 neon-button text-sm sm:text-base font-black italic uppercase tracking-wider group mt-1"
                >
                  {paying ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Redirecting...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm">Complete Payment</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                  )}
                </Button>

                <p className="text-[6px] sm:text-[7px] text-center text-muted-foreground/30 font-bold uppercase tracking-[0.15em]">
                  Authorized Payment Protocol — Pay4Edge 2026
                </p>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
