
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

      <div className="glass w-full max-w-md p-6 sm:p-8 rounded-2xl relative z-10 border border-white/10 shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Payment Request</h2>
          <h1 className="text-3xl font-bold mt-2">
             ${order.amount.toFixed(2)} <span className="text-lg text-muted-foreground font-normal">{order.currency}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">to {order.user?.name || "Binpay User"}</p>
        </div>

        <div className="space-y-4 mb-8">
            <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Order ID</span>
                <span className="text-sm font-mono opacity-80">{order.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Description</span>
                <span className="text-sm text-right opacity-80">{order.description || "Payment"}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-sm font-bold ${order.status === 'SUCCESS' ? 'text-green-400' : order.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {order.status}
                </span>
            </div>
        </div>

        {order.status === 'PENDING' ? (
            <div className="space-y-3">
                <button 
                    onClick={() => handlePayment('upi')}
                    disabled={paying}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Banknote className="w-5 h-5" />}
                    Pay with UPI / Bank
                </button>
                <button 
                    onClick={() => handlePayment('card')}
                    disabled={paying}
                    className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
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
                Secured by Binpay
            </p>
        </div>
      </div>
    </div>
  );
}
