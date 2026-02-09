import { useState, useEffect } from "react";
import { Plus, User, Trash2, Edit2, MoreVertical, MapPin, ShieldCheck, UserCog } from "lucide-react";
import { cn } from "../lib/utils";
import { AddStaffModal } from "../components/modals/AddStaffModal";
import { ConfirmActionModal } from "../components/modals/ConfirmActionModal";
import type { StaffFormData } from "../components/modals/AddStaffModal";
import { api } from "../lib/api";
import type { StaffMember, StaffListResponse } from "../lib/api";
import { toast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";

const roleConfig: Record<string, { label: string; className: string }> = {
  ADMIN: { label: "Admin", className: "bg-primary/20 text-primary border-primary/30" },
  STAFF: { label: "Staff", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  SUPPORT: { label: "Support", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  AGENT: { label: "Agent", className: "bg-accent/20 text-accent border-accent/30" },
};

function formatDate(s: string | undefined) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return s;
  }
}

export default function Staff() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"staff" | "agents">("staff");

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = "admin/staff";
      if (activeTab === "agents") {
        endpoint = "admin/agents";
      } else if (user?.role === "AGENT") {
        endpoint = "agent/staff";
      }

      const res = await api.get<{ staff?: StaffMember[]; agents?: StaffMember[] }>(endpoint);
      setStaff(res.staff ?? res.agents ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load management data";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [activeTab, user?.role]);

  const handleAddStaff = async (data: StaffFormData) => {
    try {
      if (editingStaff && editingStaff._id) {
        // Edit mode (Admin only)
        await api.put(`admin/staff/${editingStaff._id}`, { 
          name: data.fullName, 
          email: data.email, 
          role: data.role,
          location: data.location,
          ...(data.password ? { password: data.password } : {}) 
        });
        toast({ title: "Success", description: "Member updated." });
      } else {
        // Add mode
        let endpoint = "admin/staff";
        if (data.role === "AGENT") {
            endpoint = "admin/agents";
        } else if (user?.role === "AGENT") {
            endpoint = "agent/staff";
        }

        await api.post(endpoint, { 
            name: data.fullName, 
            email: data.email, 
            password: data.password, 
            role: data.role,
            location: data.location 
        });
        toast({ title: "Success", description: `${data.role} member added.` });
      }
      setEditingStaff(null);
      await fetchStaff();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Operation failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
      throw e;
    }
  };

  const initEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setIsModalOpen(true);
  };

  const initDelete = (member: StaffMember) => {
    setDeletingStaff(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingStaff?._id) return;
    setActionLoading(true);
    try {
      await api.delete(`admin/staff/${deletingStaff._id}`);
      toast({ title: "Success", description: "Member removed." });
      setIsDeleteModalOpen(false);
      setDeletingStaff(null);
      fetchStaff();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to remove member";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingStaff(null), 300); // clear after animation
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Management</h1>
        <button type="button" onClick={() => { setEditingStaff(null); setIsModalOpen(true); }} className="neon-button-accent inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {user?.role === "ADMIN" && (
        <div className="flex gap-2 p-1 glass-strong rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab("staff")}
            className={cn("px-4 py-2 text-sm font-medium rounded-lg transition-all", activeTab === "staff" ? "bg-primary text-white" : "text-muted-foreground hover:text-white")}
          >
            Staff
          </button>
          <button 
            onClick={() => setActiveTab("agents")}
            className={cn("px-4 py-2 text-sm font-medium rounded-lg transition-all", activeTab === "agents" ? "bg-accent text-white" : "text-muted-foreground hover:text-white")}
          >
            Agents
          </button>
        </div>
      )}

      <div className="glass rounded-lg p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{activeTab === "agents" ? "Agents" : "Staff Members"}</h2>
            <p className="text-muted-foreground text-sm">
                {activeTab === "agents" ? "Manage location administrators." : "Manage support and floor team."}
            </p>
          </div>
        </div>

        {loading && <p className="text-muted-foreground text-sm py-8 text-center">Loading…</p>}
        {error && !loading && <p className="text-destructive text-sm py-4">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="py-4 px-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="py-4 px-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="py-4 px-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                  <th className="py-4 px-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">No staff yet. Add one.</td>
                  </tr>
                ) : (
                  staff.map((m) => (
                    <tr key={m._id ?? m.email} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                            {m.role === 'ADMIN' ? <ShieldCheck className="w-4 h-4" /> : (m.role === 'AGENT' ? <UserCog className="w-4 h-4" /> : <User className="w-4 h-4" />)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border", roleConfig[m.role as string]?.className)}>
                          {roleConfig[m.role as string]?.label || m.role}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 text-accent" />
                          {m.location || "Default"}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-muted-foreground">{formatDate(m.createdAt)}</td>
                      <td className="py-4 px-2 text-right">
                        {user?.role === "ADMIN" && (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => initEdit(m)}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => initDelete(m)}
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddStaffModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSubmit={handleAddStaff} 
        initialData={editingStaff}
      />
      
      <ConfirmActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Staff Member"
        description={`Are you sure you want to remove ${deletingStaff?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={actionLoading}
      />
    </div>
  );
}
