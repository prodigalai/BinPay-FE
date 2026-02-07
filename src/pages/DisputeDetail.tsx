import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, User, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import type { Dispute } from "../lib/api";
import { toast } from "../hooks/use-toast";

export default function DisputeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [staffList, setStaffList] = useState<{ _id: string; name: string }[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const canAssign = user?.role === "ADMIN" || user?.role === "STAFF";
  const isStaff = isAdmin || user?.role === "STAFF" || user?.role === "SUPPORT";

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<{ success: boolean; dispute: Dispute }>(`disputes/${id}`).then((res) => {
      if (res.success) setDispute(res.dispute);
    }).catch(() => {
      toast({ title: "Error", description: "Failed to load dispute", variant: "destructive" });
      navigate("/disputes");
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (canAssign && staffList.length === 0) {
      api.get<{ success: boolean; staff: { _id: string; name: string }[] }>("admin/disputes/staff").then((res) => {
        if (res.success) setStaffList(res.staff ?? []);
      }).catch(() => {});
    }
  }, [canAssign]);

  const handleReply = async () => {
    if (!replyText.trim() || !id) return;
    setSending(true);
    try {
      const res = await api.post<{ success: boolean; dispute: Dispute }>(`disputes/${id}/reply`, { text: replyText });
      if (res.success) {
        setDispute(res.dispute);
        setReplyText("");
        toast({ title: "Message sent" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async (staffId: string) => {
    if (!id) return;
    setAssigning(true);
    try {
      await api.post(`admin/disputes/${id}/assign`, { staffId });
      toast({ title: "Assigned" });
      const res = await api.get<{ success: boolean; dispute: Dispute }>(`disputes/${id}`);
      if (res.success) setDispute(res.dispute);
    } catch {
      toast({ title: "Error", description: "Failed to assign", variant: "destructive" });
    } finally {
      setAssigning(false);
    }
  };

  const handleResolve = async () => {
    if (!id) return;
    setResolving(true);
    try {
      await api.post(`admin/disputes/${id}/resolve`, { resolution: resolutionNote });
      toast({ title: "Resolved" });
      setShowResolve(false);
      const res = await api.get<{ success: boolean; dispute: Dispute }>(`disputes/${id}`);
      if (res.success) setDispute(res.dispute);
    } catch {
      toast({ title: "Error", description: "Failed to resolve", variant: "destructive" });
    } finally {
      setResolving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!dispute) return null;

  const canReply = !["RESOLVED", "CLOSED"].includes(dispute.status);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate("/disputes")}><ArrowLeft className="w-5 h-5" /></Button>
        <span className="text-sm text-muted-foreground">{dispute.status}</span>
      </div>

      <div className="glass rounded-lg p-4">
        <p className="text-sm text-muted-foreground">User: {typeof dispute.user === "object" ? dispute.user?.name : "—"}</p>
        <p className="font-medium mt-1">{dispute.reason}</p>
        {dispute.assignedStaff && <p className="text-xs text-muted-foreground mt-1">Assigned: {dispute.assignedStaff.name}</p>}
      </div>

      {isStaff && canAssign && canReply && (
        <div className="flex flex-wrap gap-2">
          {staffList.map((s) => (
            <Button key={s._id} variant="outline" size="sm" disabled={assigning} onClick={() => handleAssign(s._id)}>
              Assign: {s.name}
            </Button>
          ))}
          {isAdmin && (
            <Button variant="default" size="sm" onClick={() => setShowResolve(true)}><CheckCircle className="w-4 h-4 mr-1" /> Resolve</Button>
          )}
        </div>
      )}

      {showResolve && (
        <div className="glass rounded-lg p-4 space-y-3">
          <textarea placeholder="Resolution note" value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-white/10 bg-background/50 text-sm min-h-[80px]" />
          <div className="flex gap-2">
            <Button onClick={handleResolve} disabled={resolving}>{resolving ? "Resolving…" : "Confirm resolve"}</Button>
            <Button variant="outline" onClick={() => setShowResolve(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="glass rounded-lg p-4">
        <h3 className="font-semibold mb-3">Messages</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {dispute.messages?.length ? dispute.messages.map((m) => (
            <div key={m._id} className="p-2 rounded-lg bg-white/5 text-sm">
              <span className="text-muted-foreground">{m.sender?.name ?? "—"}: </span>
              {m.text}
            </div>
          )) : <p className="text-muted-foreground text-sm">No messages yet.</p>}
        </div>
        {canReply && (
          <div className="flex gap-2 mt-3">
            <Textarea placeholder="Reply…" value={replyText} onChange={(e) => setReplyText(e.target.value)} className="min-h-[80px]" />
            <Button onClick={handleReply} disabled={sending || !replyText.trim()}><Send className="w-4 h-4" /></Button>
          </div>
        )}
      </div>
    </div>
  );
}
