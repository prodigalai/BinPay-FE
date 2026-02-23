import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, DollarSign, Loader2, Landmark, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";
import { GlassInput } from "../ui/glass-input";
import { Button } from "../ui/button";
import { api, type CreateOrderResponse, type FeeConfigResponse } from "../../lib/api";
import { toast } from "../../hooks/use-toast";

interface CreateDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateDepositModal({ isOpen, onClose, onSuccess }: CreateDepositModalProps) {
  const [amount, setAmount] = useState("");
  const [gateway, setGateway] = useState<"OBLIQPAY" | "PAYPAL">("OBLIQPAY");
  const [gameUsername, setGameUsername] = useState("");
  const [gameName, setGameName] = useState("");
  const [remark, setRemark] = useState("");
  const [creating, setCreating] = useState(false);
  const [feePercent, setFeePercent] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<{ id: string; amountCharged: number; amountCredited: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setLastOrder(null);
      api.get<FeeConfigResponse>("payments/fee-config")
        .then((r) => setFeePercent(r.feePercent ?? 0))
        .catch(() => setFeePercent(0));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const res = await api.post<CreateOrderResponse>("payments/create", { 
        amount: amountNum, 
        gateway,
        gameUsername,
        gameName,
        remark
      });
      
      if (res.success && res.order) {
        setLastOrder({
          id: res.order._id,
          amountCharged: res.amountCharged ?? amountNum + (amountNum * feePercent) / 100,
          amountCredited: res.amountCredited ?? amountNum
        });
        
        if (res.order.paymentLink) {
          window.open(res.order.paymentLink, "_blank", "noopener,noreferrer");
        }
        
        setIsSuccess(true);
        if (onSuccess) onSuccess();
        
        setAmount("");
        setGameUsername("");
        setGameName("");
        setRemark("");
      }
    } catch (err: any) {
      toast({ 
        title: "Failed to create deposit", 
        description: err.message || "An unexpected error occurred", 
        variant: "destructive" 
      });
    } finally {
      setCreating(false);
    }
  };

  const amountNum = parseFloat(amount) || 0;
  const feeAmount = feePercent && amountNum > 0 ? (amountNum * feePercent) / 100 : 0;
  const totalToPay = amountNum + feeAmount;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative glass-strong rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Header Background */}
        <div className={`absolute top-0 left-0 w-full h-40 -z-10 blur-3xl transition-colors duration-500 ${isSuccess ? 'bg-emerald-500/20' : 'bg-primary/20'}`} />
        
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${isSuccess ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-primary/10 border-primary/30'}`}>
              {isSuccess ? <ShieldCheck className="w-5 h-5 text-emerald-500" /> : <Landmark className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-tight text-white uppercase">
                {isSuccess ? 'Order Created' : 'Create Deposit'}
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">
                {isSuccess ? 'Transaction Processed' : 'Add funds to your wallet'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors group">
            <X className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <ShieldCheck className="w-10 h-10 text-emerald-500 relative z-10" />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">Success!</h3>
            <p className="text-sm text-muted-foreground mb-8">
              Your deposit request has been successfully initialized. Payment link opened in a new tab.
            </p>

            <div className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 mb-8 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-bold uppercase tracking-widest">Order ID</span>
                <span className="text-white font-mono">#{lastOrder?.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">Amount Credited</span>
                <span className="text-emerald-500">${lastOrder?.amountCredited.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Total Charged</span>
                <span className="text-xl font-black text-primary">${lastOrder?.amountCharged.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              onClick={onClose}
              className="w-full h-14 neon-button text-lg font-bold"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-3 pl-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGateway("OBLIQPAY")}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                      gateway === "OBLIQPAY"
                        ? "bg-primary/10 border-primary text-primary shadow-[0_0_25px_rgba(var(--primary-rgb),0.2)]"
                        : "bg-white/[0.03] border-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mb-2" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Master/Visa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGateway("PAYPAL")}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group ${
                      gateway === "PAYPAL"
                        ? "bg-[#0070ba]/10 border-[#0070ba] text-[#0070ba] shadow-[0_0_25px_rgba(0,112,186,0.2)]"
                        : "bg-white/[0.03] border-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    <div className="w-6 h-6 mb-2 flex items-center justify-center font-black italic text-lg leading-none">PP</div>
                    <span className="text-[11px] font-black uppercase tracking-widest">PayPal</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-px bg-white/5 flex-1" />
                  <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.3em]">Game Account Info</span>
                  <div className="h-px bg-white/5 flex-1" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest block pl-1">
                      Platform
                    </label>
                    <input
                      list="game-list"
                      type="text"
                      placeholder="e.g. PUBG"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-2xl px-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/20"
                    />
                    <datalist id="game-list">
                      <option value="PUBG" />
                      <option value="FREE FIRE" />
                      <option value="IDN POKER" />
                      <option value="8 BALL POOL" />
                      <option value="MOBILE LEGENDS" />
                    </datalist>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest block pl-1">
                      Username / ID
                    </label>
                    <input
                      type="text"
                      placeholder="Search ID"
                      value={gameUsername}
                      onChange={(e) => setGameUsername(e.target.value)}
                      className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-2xl px-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-2 pl-1">
                  Amount (USD)
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 text-2xl font-black italic tracking-tighter focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                    required
                  />
                </div>
              </div>

              {amountNum > 0 && (
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Base Deposit</span>
                    <span className="text-sm font-bold text-white">${amountNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gateway Fee ({feePercent}%)</span>
                    <span className="text-sm font-bold text-accent">+${feeAmount.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs font-black text-white uppercase tracking-[0.2em]">You Pay</span>
                    <span className="text-2xl font-black text-primary italic tracking-tight">${totalToPay.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-normal">
                Encrypted via <span className="text-emerald-500">Pay4Edge Shield</span>. Funds credited instantly upon verification.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={creating || !amountNum} 
              className="w-full h-16 neon-button text-xl font-black italic uppercase tracking-wider group relative overflow-hidden"
            >
              {creating ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <span className="flex items-center gap-3 relative z-10">
                  Initiate Deposit
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              )}
              {creating && <div className="absolute inset-0 bg-primary/20 animate-pulse" />}
            </Button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
