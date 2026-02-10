import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, User, CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/disputes")}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Case #{id?.slice(-6)}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                "px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border",
                dispute.status === 'RESOLVED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                dispute.status === 'CLOSED' ? "bg-white/5 text-muted-foreground border-white/10" :
                "bg-amber-500/10 text-amber-500 border-amber-500/20"
              )}>
                {dispute.status}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Created on {new Date(dispute.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Dispute Reason</h3>
            <p className="text-lg font-medium text-white leading-relaxed">{dispute.reason}</p>
          </div>
          <div className="w-full sm:w-64 space-y-4">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Raised By</p>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">{typeof dispute.user === "object" ? dispute.user?.name : "Unknown"}</span>
              </div>
            </div>
            {dispute.assignedStaff && (
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Assigned Agent</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold">{dispute.assignedStaff.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
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

      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col h-[600px]">
        <h3 className="text-lg font-bold text-white uppercase italic tracking-tight mb-6 border-b border-white/5 pb-4">Communication Log</h3>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {dispute.messages?.length ? dispute.messages.map((m, i) => {
            // Determine if message is from the current user or staff/admin
            // This logic might need adjustment based on how `sender` is populated
            const isMe = m.sender?._id === (user as any)?._id || m.sender?._id === (user as any)?.id; 
            return (
              <div key={m._id || i} className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                 <div className={cn(
                   "p-4 rounded-2xl max-w-[80%] text-sm font-medium leading-relaxed",
                   isMe ? "bg-primary text-black rounded-tr-sm" : "bg-white/10 text-white rounded-tl-sm"
                 )}>
                   {m.text}
                 </div>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                   {m.sender?.name ?? "Support"} • {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
              </div>
            );
          }) : (
            <div className="py-12 text-center opacity-30">
              <p className="text-xs font-bold uppercase tracking-widest">No communication history</p>
            </div>
          )}
        </div>
        
        {canReply && (
          <div className="mt-6 flex gap-3 items-end bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
            <Textarea 
              placeholder="Type your reply here..." 
              value={replyText} 
              onChange={(e) => setReplyText(e.target.value)} 
              className="min-h-[60px] max-h-[120px] bg-transparent border-none focus:ring-0 resize-none text-sm p-3" 
            />
            <Button 
              onClick={handleReply} 
              disabled={sending || !replyText.trim()}
              className="neon-button-accent h-10 w-10 p-0 rounded-xl flex items-center justify-center mb-1 mr-1 flex-shrink-0"
            >
              {sending ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
