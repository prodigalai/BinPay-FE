import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Plus, Eye } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import type { Dispute, DisputesResponse } from "../lib/api";
import { toast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { StatusBadge } from "../components/ui/status-badge";
import { EmptyState } from "../components/ui/empty-state";
import { cn } from "../lib/utils";

export default function Disputes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState({ open: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [newReason, setNewReason] = useState("");
  const [newOrderId, setNewOrderId] = useState("");
  const [creating, setCreating] = useState(false);

  const isStaff = user?.role === "ADMIN" || user?.role === "STAFF" || user?.role === "SUPPORT";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const endpoint = isStaff ? "admin/disputes" : "disputes/my";
    const params = statusFilter !== "all" ? { status: statusFilter } : {};
    api.get<DisputesResponse>(endpoint, { params }).then((res) => {
      if (!cancelled && res.success) {
        setDisputes(res.disputes ?? []);
        if (res.stats) setStats(res.stats);
      }
    }).catch(() => {
      if (!cancelled) toast({ title: "Error", description: "Failed to load disputes", variant: "destructive" });
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [isStaff, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason.trim()) {
      toast({ title: "Reason required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const res = await api.post<{ success: boolean; dispute: Dispute }>("disputes", {
        reason: newReason.trim(),
        orderId: newOrderId.trim() || undefined,
      });
      if (res.success) {
        toast({ title: "Dispute created" });
        setCreateOpen(false);
        setNewReason("");
        setNewOrderId("");
        setDisputes((prev) => [res.dispute!, ...prev]);
      }
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to create dispute", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Disputes</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">{isStaff ? "Manage and resolve transaction issues" : "Track and manage your raised disputes"}</p>
        </div>
        {!isStaff && (
          <Button onClick={() => setCreateOpen(true)} className="neon-button-accent h-12 px-6 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Plus className="w-4 h-4" /> Raise Dispute
          </Button>
        )}
      </div>

      {createOpen && (
        <div className="glass rounded-lg p-4">
          <h3 className="font-semibold mb-3">New dispute</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              placeholder="Order ID (optional)"
              value={newOrderId}
              onChange={(e) => setNewOrderId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-background/50 text-sm"
            />
            <textarea
              placeholder="Reason *"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-background/50 text-sm min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={creating}>{creating ? "Creating…" : "Submit"}</Button>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-2">
        {["all", "OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
              statusFilter === s 
                ? "bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-105" 
                : "bg-white/[0.02] text-muted-foreground border-white/5 hover:bg-white/[0.05] hover:text-white"
            )}
          >
            {s === "all" ? "All Cases" : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-20 animate-pulse text-xs font-bold tracking-widest uppercase">Loading Disputes...</p>
      ) : disputes.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center">
          <EmptyState
            icon={<AlertTriangle className="w-12 h-12 text-muted-foreground/50 mb-4" />}
            title="No Disputes Found"
            description={isStaff ? "Great job! No active disputes matching criteria." : "You have no active disputes."}
          />
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-bold text-white tracking-tight">Active Cases</h3>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Status</th>
                  <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Reason</th>
                  <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">User</th>
                  <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Date</th>
                  <th className="text-right py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Details</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="py-5 px-6 whitespace-nowrap"><StatusBadge status={d.status === "RESOLVED" || d.status === "CLOSED" ? "completed" : "pending"}>{d.status}</StatusBadge></td>
                    <td className="py-5 px-6 text-sm font-medium text-white/90 truncate max-w-[200px] sm:max-w-xs">{d.reason}</td>
                    <td className="py-5 px-6 text-xs font-bold text-white/80 whitespace-nowrap">{typeof d.user === "object" ? d.user?.name ?? "—" : "—"}</td>
                    <td className="py-5 px-6 text-xs text-muted-foreground font-medium whitespace-nowrap">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="py-5 px-6 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/disputes/${d._id}`)} className="h-8 w-8 p-0 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
