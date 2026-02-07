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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Disputes</h1>
          <p className="text-muted-foreground text-sm">{isStaff ? "Manage all disputes" : "Your disputes"}</p>
        </div>
        {!isStaff && (
          <Button onClick={() => setCreateOpen(true)} className="neon-button gap-2">
            <Plus className="w-4 h-4" /> Raise dispute
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

      <div className="flex gap-2">
        {["all", "OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusFilter === s ? "bg-primary/20 text-primary border border-primary/30" : "bg-card/60 text-muted-foreground border border-white/10"}`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading…</p>
      ) : disputes.length === 0 ? (
        <div className="glass rounded-lg p-8">
          <EmptyState
            icon={<AlertTriangle className="w-10 h-10 text-muted-foreground" />}
            title="No disputes"
            description={isStaff ? "No disputes match the filter." : "You have not raised any disputes."}
          />
        </div>
      ) : (
        <div className="glass rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Reason</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">User</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4"><StatusBadge status={d.status === "RESOLVED" || d.status === "CLOSED" ? "completed" : "pending"}>{d.status}</StatusBadge></td>
                  <td className="py-3 px-4 text-sm truncate max-w-[200px]">{d.reason}</td>
                  <td className="py-3 px-4 text-sm">{typeof d.user === "object" ? d.user?.name ?? "—" : "—"}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/disputes/${d._id}`)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
