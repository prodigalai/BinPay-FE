import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Link, Copy, Search, ChevronDown, ChevronUp, History, Users, Gamepad2, User as UserIcon, LinkIcon, DollarSign, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

interface ChildOrder {
  id: string;
  amount: number;
  amountCharged: number;
  currency: string;
  status: string;
  gameUsername: string;
  gameName: string;
  gateway: string;
  createdAt: string;
}

interface StaffLink {
  id: string;
  paymentLink: string;
  status: string;
  amount: number;
  amountCharged: number;
  currency: string;
  remark: string;
  customAmount?: boolean;
  createdAt: string;
  attempts: number;
  generatedBy: { name: string; role: string } | null;
  stats: {
    success: number;
    failed: number;
    pending: number;
  };
  revenue: number;
}

interface Summary {
  totalLinksCreated: number;
  totalPayments: number;
  totalRevenue: number;
  totalPending: number;
}

interface StaffStatsResponse {
  success: boolean;
  summary: Summary;
  links: StaffLink[];
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    SUCCESS: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
    PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    LINK_CREATED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };
  return map[status] || "bg-white/5 text-muted-foreground border-white/10";
};

function LinkOrdersRow({ linkId }: { linkId: string }) {
  const [orders, setOrders] = useState<ChildOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ success: boolean; orders: ChildOrder[] }>(`payments/link/${linkId}/orders`)
      .then((r) => {
        if (r.success) setOrders(r.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [linkId]);

  if (loading) {
    return (
      <tr>
        <td colSpan={7} className="px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
            <div className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            Loading orders...
          </div>
        </td>
      </tr>
    );
  }

  if (orders.length === 0) {
    return (
      <tr>
        <td colSpan={7} className="px-6 py-6 text-center">
          <p className="text-xs text-muted-foreground/50">No payments yet from this link</p>
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="bg-white/[0.01]">
        <td colSpan={7} className="px-6 py-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
            <Users className="w-3 h-3" />
            {orders.length} Payment{orders.length !== 1 ? 's' : ''} from this link
          </div>
        </td>
      </tr>
      <tr className="bg-white/[0.02]">
        <td className="px-6 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Date</td>
        <td className="px-6 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Player ID</td>
        <td className="px-6 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Game</td>
        <td className="px-6 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Amount</td>
        <td className="px-6 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Gateway</td>
        <td className="px-6 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 text-right" colSpan={2}>Status</td>
      </tr>
      {orders.map((order) => (
        <tr key={order.id} className="bg-white/[0.01] hover:bg-white/[0.03] transition-colors border-b border-white/[0.02]">
          <td className="px-6 py-3 text-xs text-muted-foreground font-mono">
            {new Date(order.createdAt).toLocaleString()}
          </td>
          <td className="px-6 py-3">
            <div className="flex items-center gap-1.5">
              <UserIcon className="w-3 h-3 text-primary/50" />
              <span className="text-xs font-bold text-white">{order.gameUsername || '—'}</span>
            </div>
          </td>
          <td className="px-6 py-3">
            <div className="flex items-center gap-1.5">
              <Gamepad2 className="w-3 h-3 text-primary/50" />
              <span className="text-xs font-bold text-white">{order.gameName || '—'}</span>
            </div>
          </td>
          <td className="px-6 py-3 text-xs font-bold text-white">
            ${order.amount.toFixed(2)}
          </td>
          <td className="px-6 py-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{order.gateway}</span>
          </td>
          <td className="px-6 py-3 text-right" colSpan={2}>
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
              statusBadge(order.status)
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {order.status}
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function GeneratedLinks() {
  const [links, setLinks] = useState<StaffLink[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalLinksCreated: 0, totalPayments: 0, totalRevenue: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedLink, setExpandedLink] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const showAllLinks = isAdmin || isAgent;

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = () => {
    setLoading(true);
    api.get<StaffStatsResponse>("dashboard/staff-links")
      .then((r) => {
        if (r.success) {
          setLinks(r.links);
          setSummary(r.summary);
        }
      })
      .catch(() => {
        toast({ title: "Error", description: "Failed to fetch links", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Link copied to clipboard." });
  };

  const toggleExpand = (id: string) => {
    setExpandedLink(prev => prev === id ? null : id);
  };

  const filteredLinks = links.filter(l => 
    l.paymentLink?.toLowerCase().includes(search.toLowerCase()) ||
    l.id.toLowerCase().includes(search.toLowerCase()) ||
    l.remark?.toLowerCase().includes(search.toLowerCase()) ||
    l.generatedBy?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Generated Links</h1>
          <p className="text-muted-foreground mt-2">
            {showAllLinks ? "All payment links across team." : "Your generated payment links."}
          </p>
        </div>
        <button 
          onClick={fetchLinks}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white self-start sm:self-auto"
        >
          <History className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 group relative overflow-hidden hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[60px] -z-10" />
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <LinkIcon className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Links Created</p>
          <span className="text-2xl font-black tracking-tighter">{summary.totalLinksCreated}</span>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 group relative overflow-hidden hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[60px] -z-10" />
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Payments</p>
          <span className="text-2xl font-black tracking-tighter">{summary.totalPayments}</span>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 group relative overflow-hidden hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[60px] -z-10" />
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Revenue</p>
          <span className="text-2xl font-black tracking-tighter text-emerald-500">${(summary.totalRevenue || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 group relative overflow-hidden hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[60px] -z-10" />
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pending</p>
          <span className="text-2xl font-black tracking-tighter text-amber-500">{summary.totalPending}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-6 border-b border-white/5">
          <div className="relative group max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder={showAllLinks ? "Search links, agents..." : "Search links..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/10 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.01] text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              <tr>
                <th className="px-6 py-4 w-8"></th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Amount</th>
                {showAllLinks && <th className="px-6 py-4">Generated By</th>}
                <th className="px-6 py-4">Link</th>
                <th className="px-6 py-4 text-center">Payments</th>
                <th className="px-6 py-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-4 bg-white/5 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 rounded" /></td>
                    {showAllLinks && <td className="px-6 py-4"><div className="h-4 w-20 bg-white/5 rounded" /></td>}
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-white/5 rounded mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredLinks.length > 0 ? (
                filteredLinks.map((link) => (
                  <>
                    <tr 
                      key={link.id} 
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => toggleExpand(link.id)}
                    >
                      <td className="px-6 py-4">
                        <div className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                          expandedLink === link.id ? "bg-primary/10 text-primary" : "bg-white/5 text-muted-foreground group-hover:bg-white/10"
                        )}>
                          {expandedLink === link.id 
                            ? <ChevronUp className="w-3.5 h-3.5" /> 
                            : <ChevronDown className="w-3.5 h-3.5" />
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-white font-mono">{new Date(link.createdAt).toLocaleDateString()}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{new Date(link.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {link.customAmount ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">Custom amount</span>
                        ) : (
                          <>${link.amount?.toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">{link.currency}</span></>
                        )}
                      </td>
                      {showAllLinks && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                              {link.generatedBy?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">{link.generatedBy?.name || 'Unknown'}</span>
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest",
                                link.generatedBy?.role === 'ADMIN' ? 'text-red-400' :
                                link.generatedBy?.role === 'AGENT' ? 'text-amber-400' :
                                'text-blue-400'
                              )}>{link.generatedBy?.role || '—'}</span>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 max-w-[180px]">
                          <div className="flex-1 truncate text-xs text-muted-foreground bg-black/20 px-2 py-1.5 rounded border border-white/5 font-mono">
                            {link.paymentLink}
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(link.paymentLink); }}
                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-muted-foreground hover:text-white shrink-0"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-white/5 text-xs font-bold text-white">
                            {link.attempts}
                          </span>
                          {link.stats.success > 0 && (
                            <span className="inline-flex items-center gap-1 text-[9px] text-emerald-500 font-bold">
                              <CheckCircle className="w-2.5 h-2.5" />{link.stats.success}
                            </span>
                          )}
                          {link.stats.pending > 0 && (
                            <span className="inline-flex items-center gap-1 text-[9px] text-amber-500 font-bold">
                              <Clock className="w-2.5 h-2.5" />{link.stats.pending}
                            </span>
                          )}
                          {link.stats.failed > 0 && (
                            <span className="inline-flex items-center gap-1 text-[9px] text-red-500 font-bold">
                              <XCircle className="w-2.5 h-2.5" />{link.stats.failed}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "text-sm font-black",
                          link.revenue > 0 ? "text-emerald-500" : "text-muted-foreground/30"
                        )}>
                          ${link.revenue?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}
                        </span>
                      </td>
                    </tr>
                    {expandedLink === link.id && (
                      <LinkOrdersRow linkId={link.id} />
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan={showAllLinks ? 7 : 6} className="py-20 text-center text-muted-foreground text-sm">
                    <Link className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No generated links found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
