import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, ShieldCheck, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";

interface OrderStatus {
  id: string;
  amount: number;
  currency: string;
  status: string;
  gameUsername: string;
  gameName: string;
  gateway: string;
  createdAt: string;
}

export default function PayLinkSuccess() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  const fetchStatus = async () => {
    if (!id) return;
    try {
      const res = await api.get<{ success: boolean; order: OrderStatus }>(`payments/link/${id}/status`);
      if (res.success) {
        setOrder(res.order);
        // If still pending, poll once more after delay
        if (res.order.status === 'PENDING' && !polling) {
          setPolling(true);
          setTimeout(async () => {
            try {
              const r2 = await api.get<{ success: boolean; order: OrderStatus }>(`payments/link/${id}/status`);
              if (r2.success) setOrder(r2.order);
            } catch { /* ignore */ }
            setPolling(false);
          }, 5000);
        }
      }
    } catch {
      // order not found
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-[0.3em] animate-pulse">Checking Payment Status...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tight">Order Not Found</h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            We couldn't find this payment record.
          </p>
        </div>
      </div>
    );
  }

  const isSuccess = order.status === 'SUCCESS' || order.status === 'COMPLETED';
  const isPending = order.status === 'PENDING';
  const isFailed = order.status === 'FAILED';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] ${
          isSuccess ? 'bg-emerald-500/10' : isPending ? 'bg-amber-500/10' : 'bg-red-500/10'
        }`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] ${
          isSuccess ? 'bg-emerald-500/5' : isPending ? 'bg-amber-500/5' : 'bg-red-500/5'
        }`} />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="glass-strong rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10">
          
          <div className="p-10 text-center">
            {/* Status Icon */}
            <div className="mb-8">
              {isSuccess && (
                <div className="relative inline-flex">
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" />
                  <div className="relative w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </div>
                </div>
              )}
              {isPending && (
                <div className="relative inline-flex">
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-amber-500/10 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                    <Clock className="w-12 h-12 text-amber-500" />
                  </div>
                </div>
              )}
              {isFailed && (
                <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
              )}
            </div>

            {/* Status Title */}
            <h1 className="text-3xl font-black uppercase italic tracking-tight mb-2">
              {isSuccess ? 'Payment Successful!' : isPending ? 'Payment Processing...' : 'Payment Failed'}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-8">
              {isSuccess 
                ? 'Your payment has been confirmed and we have received your funds.' 
                : isPending 
                  ? 'Your payment is being processed. This typically takes a few seconds.'
                  : 'Something went wrong with your payment. Please try again or contact support.'}
            </p>

            {/* Order Details Card */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-3 text-left mb-8">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-bold uppercase tracking-widest">Order ID</span>
                <span className="text-white font-mono">#{order.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-bold uppercase tracking-widest">Amount</span>
                <span className="text-xl font-black text-primary italic">${order.amount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-bold uppercase tracking-widest">Player ID</span>
                <span className="text-white font-bold">{order.gameUsername}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-bold uppercase tracking-widest">Game</span>
                <span className="text-white font-bold">{order.gameName}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-bold uppercase tracking-widest">Method</span>
                <span className="text-white font-bold">{order.gateway}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-bold uppercase tracking-widest">Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                  isSuccess ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  isPending ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  {order.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            {isPending && (
              <Button
                onClick={() => { setLoading(true); fetchStatus(); }}
                className="w-full h-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 rounded-2xl font-black uppercase tracking-widest text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${polling ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
            )}

            {isSuccess && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-normal text-left">
                  Your funds will be credited shortly. You can safely close this page.
                </p>
              </div>
            )}

            {isFailed && (
              <Link to={`/pay-link/${id}`}>
                <Button className="w-full h-14 neon-button text-lg font-black italic uppercase tracking-wider group">
                  Try Again
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
            )}
          </div>

          <div className="px-8 pb-8 text-center">
            <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">
              Authorized Payment Protocol — Pay4Edge 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
