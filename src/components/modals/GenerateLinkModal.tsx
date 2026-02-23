import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, DollarSign, Loader2, Link as LinkIcon, Copy, CheckCircle2, Edit3 } from "lucide-react";
import { api } from "../../lib/api";
import { toast } from "../../hooks/use-toast";
import { Button } from "../ui/button";

interface GenerateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When true, open with "Custom amount link" pre-selected */
  initialCustomAmount?: boolean;
}

export function GenerateLinkModal({ isOpen, onClose, initialCustomAmount }: GenerateLinkModalProps) {
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeneratedUrl(null);
      setAmount("");
      setRemark("");
      setCustomAmount(!!initialCustomAmount);
    }
  }, [isOpen, initialCustomAmount]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAmount) {
      const amountNum = parseFloat(amount);
      if (!amountNum || amountNum <= 0) {
        toast({ title: "Invalid amount", variant: "destructive" });
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; url: string; customAmount?: boolean }>("payments/generate-link", {
        ...(customAmount ? { customAmount: true } : { amount: parseFloat(amount) }),
        remark: customAmount ? (remark || "Custom amount — payer enters amount") : remark
      });
      if (res.success) {
        setGeneratedUrl(res.url);
        toast({ title: res.customAmount ? "Custom amount link created!" : "Payment link generated!" });
      }
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative glass-strong rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/20 -z-10 blur-3xl" />
        
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-tight text-white uppercase">Generate Link</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Create a shareable payment link</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          {generatedUrl ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase italic">Link Ready</h3>
                  <p className="text-xs text-muted-foreground mt-1">Share this link with your player to receive payment.</p>
               </div>

               <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <span className="text-[10px] font-mono text-white/50 truncate flex-1">{generatedUrl}</span>
                  <button onClick={copyToClipboard} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-primary transition-all active:scale-95 shrink-0 border border-white/5">
                    <Copy className="w-4 h-4" />
                  </button>
               </div>

               <Button onClick={onClose} className="w-full h-14 neon-button text-lg font-bold">Done</Button>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <input
                    type="checkbox"
                    id="customAmount"
                    checked={customAmount}
                    onChange={(e) => setCustomAmount(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/40"
                  />
                  <label htmlFor="customAmount" className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                    <Edit3 className="w-4 h-4 text-primary" />
                    Custom amount link (payer enters amount, username & game on pay page)
                  </label>
                </div>

                {!customAmount && (
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 pl-1">Amount (USD)</label>
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
                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 text-xl font-black italic focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/20"
                        required={!customAmount}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 pl-1">Note / Description (optional)</label>
                  <input
                    type="text"
                    placeholder={customAmount ? "e.g. Deposit — enter your amount" : "e.g. Deposit for Game"}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/20"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading || (!customAmount && !amount)} className="w-full h-14 neon-button text-lg font-bold">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : customAmount ? "Generate Custom Amount Link" : "Generate Unique Link"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
