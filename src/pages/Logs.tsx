import { useState, useEffect } from "react";
import { 
  Activity, 
  ChevronLeft, 
  ChevronDown,
  ChevronUp,
  Search, 
  RefreshCcw,
  Clock,
  Shield,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Hash,
  Truck,
  Calendar,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { cn } from "../lib/utils";
import { PageTransition } from "../components/layout/PageTransition";

interface GatewayData {
  orderId?: string;
  status?: string;
  amount?: number;
  currency?: string;
  paymentStatus?: string;
  deliveryStatus?: string;
  createdAt?: string;
  completedAt?: string;
  merchantSettlementTxHash?: string | null;
}

interface WebhookLog {
  event: string;
  orderId: string;
  userName: string;
  gateway: string;
  timestamp: string;
  processed: boolean;
  reason?: string;
  gatewayData?: GatewayData;
}

export default function Logs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; logs: WebhookLog[] }>("payments/webhooks/logs");
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.gateway?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'ALL' || 
      (filter === 'SUCCESS' && log.processed) || 
      (filter === 'FAILED' && !log.processed);

    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalVolume = logs.reduce((sum, l) => sum + (l.gatewayData?.amount || 0), 0);
  const successCount = logs.filter(l => l.processed).length;
  const failedCount = logs.filter(l => !l.processed).length;

  return (
    <PageTransition>
      <div className="space-y-8 animate-in fade-in duration-700 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-all group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">System Logs</h1>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  Live Stream
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Real-time webhook events & payment gateway audit trail</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchLogs}
              className="h-12 px-6 glass rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
              disabled={loading}
            >
              <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
              <span className="text-xs font-black uppercase tracking-widest">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 group hover:border-primary/20 transition-all hover:bg-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Events</p>
            <h3 className="text-3xl font-black tracking-tighter text-white">{logs.length}</h3>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 group hover:border-emerald-500/20 transition-all hover:bg-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Volume</p>
            <h3 className="text-3xl font-black tracking-tighter text-white">${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 group hover:border-emerald-500/20 transition-all hover:bg-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Processed</p>
            <h3 className="text-3xl font-black tracking-tighter text-emerald-500">{successCount}</h3>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 group hover:border-red-500/20 transition-all hover:bg-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Failed</p>
            <h3 className="text-3xl font-black tracking-tighter text-red-500">{failedCount}</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by Order ID, User, Gateway, or Event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30"
            />
          </div>
          <div className="flex p-1 bg-black/40 rounded-2xl border border-white/10 w-full sm:w-auto">
            {(['ALL', 'SUCCESS', 'FAILED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex-1 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
                )}
              >
                {f === 'ALL' ? 'Everything' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Table/List */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-8"></th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Event & User</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Amount</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Gateway</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-8">
                        <div className="h-8 bg-white/5 rounded-xl w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log, i) => (
                    <>
                      <tr 
                        key={`row-${i}`} 
                        className={cn(
                          "hover:bg-white/[0.02] transition-colors group cursor-pointer",
                          expandedRow === i && "bg-white/[0.02]"
                        )}
                        onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                      >
                        {/* Expand/Collapse */}
                        <td className="px-4 py-5 w-8">
                          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                            {expandedRow === i ? (
                              <ChevronUp className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        </td>
                        
                        {/* Event & User */}
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                              log.processed ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                            )}>
                              {log.processed ? <Shield className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-white uppercase tracking-tight">{log.event.replace(/[._]/g, ' ')}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <CreditCard className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                                  {log.userName || "Unknown"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-5 text-center">
                          {log.gatewayData?.amount ? (
                            <div>
                              <span className="text-base font-black text-white">
                                ${log.gatewayData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                                {(log.gatewayData.currency || 'USD').toUpperCase()}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/40 italic">—</span>
                          )}
                        </td>

                        {/* Gateway */}
                        <td className="px-6 py-5 text-center">
                          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                            {log.gateway}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              log.processed ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                            )} />
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              log.processed ? "text-emerald-500" : "text-red-500"
                            )}>
                              {log.processed ? "Processed" : "Failed"}
                            </span>
                          </div>
                          {log.reason && (
                            <p className="text-[9px] text-muted-foreground/50 italic mt-1 truncate max-w-[150px]" title={log.reason}>
                              {log.reason}
                            </p>
                          )}
                        </td>

                        {/* Time */}
                        <td className="px-6 py-5 text-right">
                          <span className="text-xs font-black text-white/90 font-mono tracking-tighter">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <p className="text-[9px] font-bold text-muted-foreground opacity-40 mt-0.5 uppercase tracking-widest">
                            {new Date(log.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {expandedRow === i && (
                        <tr key={`detail-${i}`} className="bg-white/[0.01]">
                          <td colSpan={6} className="px-6 py-0">
                            <div className="py-6 pl-12 animate-in slide-in-from-top duration-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                                {/* Gateway Order ID */}
                                <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Hash className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Gateway Order ID</span>
                                  </div>
                                  <p className="text-[11px] font-mono font-bold text-white break-all">
                                    {log.gatewayData?.orderId || log.orderId || '—'}
                                  </p>
                                </div>

                                {/* Payment Status */}
                                <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Payment Status</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "w-2 h-2 rounded-full",
                                      log.gatewayData?.paymentStatus === 'completed' ? "bg-emerald-500" : "bg-amber-500"
                                    )} />
                                    <p className="text-xs font-black text-white uppercase tracking-tight">
                                      {log.gatewayData?.paymentStatus || '—'}
                                    </p>
                                  </div>
                                </div>

                                {/* Delivery Status */}
                                <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Truck className="w-3.5 h-3.5 text-purple-400" />
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Delivery Status</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "w-2 h-2 rounded-full",
                                      log.gatewayData?.deliveryStatus === 'completed' ? "bg-emerald-500" : "bg-amber-500"
                                    )} />
                                    <p className="text-xs font-black text-white uppercase tracking-tight">
                                      {log.gatewayData?.deliveryStatus || '—'}
                                    </p>
                                  </div>
                                </div>

                                {/* Settlement Hash */}
                                <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Settlement TX</span>
                                  </div>
                                  <p className="text-[11px] font-mono font-bold text-white break-all">
                                    {log.gatewayData?.merchantSettlementTxHash || 'Pending / N/A'}
                                  </p>
                                </div>
                              </div>

                              {/* Timestamps Row */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Created At</span>
                                  </div>
                                  <p className="text-xs font-bold text-white">
                                    {log.gatewayData?.createdAt 
                                      ? new Date(log.gatewayData.createdAt).toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) 
                                      : '—'}
                                  </p>
                                </div>
                                
                                <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Completed At</span>
                                  </div>
                                  <p className="text-xs font-bold text-white">
                                    {log.gatewayData?.completedAt 
                                      ? new Date(log.gatewayData.completedAt).toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) 
                                      : '—'}
                                  </p>
                                </div>

                                <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Processing Time</span>
                                  </div>
                                  <p className="text-xs font-black text-white">
                                    {log.gatewayData?.createdAt && log.gatewayData?.completedAt
                                      ? (() => {
                                          const diff = new Date(log.gatewayData.completedAt).getTime() - new Date(log.gatewayData.createdAt).getTime();
                                          const mins = Math.floor(diff / 60000);
                                          const secs = Math.floor((diff % 60000) / 1000);
                                          return `${mins}m ${secs}s`;
                                        })()
                                      : '—'}
                                  </p>
                                </div>
                              </div>

                              {/* Internal Ref */}
                              <div className="mt-4 flex items-center gap-3 text-muted-foreground/40">
                                <span className="text-[9px] font-black uppercase tracking-widest">Internal Ref:</span>
                                <span className="text-[10px] font-mono">{log.orderId}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Clock className="w-16 h-16" />
                        <div>
                          <p className="text-lg font-black uppercase tracking-[0.3em]">No Logs Found</p>
                          <p className="text-xs font-medium uppercase tracking-widest mt-1">Refine your search or check back later</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Disclaimer */}
        <div className="flex items-center justify-center gap-3 opacity-30">
          <Shield className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Immutable Log History — End-to-End Encrypted Audit Trail</p>
        </div>
      </div>
    </PageTransition>
  );
}
