import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, DollarSign, Loader2, Landmark, ArrowRight, ShieldCheck } from "lucide-react";
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
  const [creating, setCreating] = useState(false);
  const [feePercent, setFeePercent] = useState(0);

  useEffect(() => {
    if (isOpen) {
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
        gateway: "OBLIQPAY" 
      });
      
      if (res.success && res.order) {
        const desc = res.amountCharged != null 
          ? `Pay $${res.amountCharged.toFixed(2)} to receive $${(res.amountCredited ?? amountNum).toFixed(2)}` 
          : "Deposit created successfully.";
          
        toast({ title: "Deposit created", description: desc });
        
        if (res.order.paymentLink) {
          window.open(res.order.paymentLink, "_blank", "noopener,noreferrer");
        }
        
        if (onSuccess) onSuccess();
        onClose();
        setAmount("");
      }
    } catch (err) {
      toast({ 
        title: "Failed to create deposit", 
        description: err instanceof Error ? err.message : "An unexpected error occurred", 
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative glass-strong rounded-2xl w-full max-w-md overflow-hidden animate-scale-in border border-white/20 shadow-2xl">
        {/* Header Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/20 to-accent/20 -z-10 blur-2xl" />
        
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Landmark className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Deposit</h2>
              <p className="text-xs text-muted-foreground">Add funds to your wallet</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Amount to receive
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                  <DollarSign className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-14 bg-card/40 border border-white/10 rounded-xl pl-12 pr-4 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30"
                  required
                />
              </div>
            </div>

            {amountNum > 0 && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2 animate-fade-in">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Receive Amount</span>
                  <span className="font-medium">${amountNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gateway Fee ({feePercent}%)</span>
                  <span className="font-medium text-accent">+${feeAmount.toFixed(2)}</span>
                </div>
                <div className="h-px bg-white/5 my-2" />
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg -mx-2">
                  <span className="font-semibold text-white">Total to Pay</span>
                  <span className="text-lg font-bold text-primary">${totalToPay.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <p className="text-[10px] text-emerald-500/80 leading-tight">
              Securely processed via our encrypted payment gateway. Your funds will be credited instantly upon confirmation.
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={creating || !amountNum} 
            className="w-full h-14 neon-button text-lg font-bold group"
          >
            {creating ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Proceed to Payment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
}
