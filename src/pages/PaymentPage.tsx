
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, CreditCard, Banknote } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "../hooks/use-toast";

interface PublicOrder {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  description?: string;
  createdAt: string;
  user?: { name: string };
}

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get<{ success: boolean; order: PublicOrder }>(`payments/public/${id}`)
        .then((res) => {
          if (res.success) setOrder(res.order);
          else toast({ title: "Invalid Link", variant: "destructive" });
        })
        .catch(() => toast({ title: "Error fetching payment details", variant: "destructive" }))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handlePayment = async (method: "upi" | "card") => {
    setPaying(true);
    // Simulate payment processing
    setTimeout(() => {
      setPaying(false);
      toast({ title: "Payment Simulated Successfully!" });
      // In real scenario, redirect to success page or update status
      if (order) setOrder({ ...order, status: "SUCCESS" });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] text-white text-center p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Invalid or Expired Link</h1>
        <p className="text-muted-foreground">Please contact the sender for a new link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="bg-white/[0.02] backdrop-blur-3xl w-full max-w-md p-8 sm:p-10 rounded-3xl relative z-10 border border-white/5 shadow-2xl animate-fade-in flex flex-col items-center">
        <div className="text-center mb-8 w-full">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-white/5 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Secure Payment Request</h2>
          <div className="flex items-baseline justify-center gap-1">
             <span className="text-lg text-muted-foreground font-bold align-top mt-2">$</span>
             <h1 className="text-5xl font-black text-white tracking-tighter">
                {order.amount.toFixed(2)}
             </h1>
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2">{order.currency}</p>
          <div className="mt-4 px-4 py-2 bg-white/5 rounded-full inline-flex items-center gap-2 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-white/80 font-medium">To: {order.user?.name || "Pay4Edge User"}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8 w-full bg-black/20 rounded-2xl p-6 border border-white/5">
            <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Order ID</span>
                <span className="text-xs font-mono font-bold text-white/70">{order.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Description</span>
                <span className="text-xs font-medium text-white/90 text-right max-w-[150px] truncate">{order.description || "General Payment"}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</span>
                <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                    order.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                    order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                    'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                    {order.status}
                </span>
            </div>
        </div>

        {order.status === 'PENDING' ? (
            <div className="space-y-3 w-full">
                <button 
                    onClick={() => handlePayment('upi')}
                    disabled={paying}
                    className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Banknote className="w-5 h-5" />}
                    Pay with UPI / Bank
                </button>
                <button 
                    onClick={() => handlePayment('card')}
                    disabled={paying}
                    className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                   <CreditCard className="w-5 h-5" />
                   Pay with Card
                </button>
            </div>
        ) : (
            <div className="text-center py-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-green-400">Payment Successful</h3>
                <p className="text-xs text-green-400/70">Transaction ID: {order.id}</p>
            </div>
        )}
        
        <div className="mt-8 text-center">
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Secured by Pay4Edge
            </p>
        </div>
      </div>
    </div>
  );
}
