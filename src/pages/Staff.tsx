import { useState, useEffect } from "react";
import { Plus, User, Trash2, Edit2, MoreVertical, MapPin, ShieldCheck, UserCog } from "lucide-react";
import { cn } from "../lib/utils";
import { AddStaffModal } from "../components/modals/AddStaffModal";
import { ConfirmActionModal } from "../components/modals/ConfirmActionModal";
import { CredentialsModal } from "../components/modals/CredentialsModal";
import type { StaffFormData } from "../components/modals/AddStaffModal";
import { api } from "../lib/api";
import type { StaffMember, StaffListResponse } from "../lib/api";
import { toast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";

const roleConfig: Record<string, { label: string; className: string }> = {
  ADMIN: { label: "Master", className: "bg-primary/20 text-primary border-primary/30" },
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
  const [credentialsModal, setCredentialsModal] = useState<{ email: string; password: string } | null>(null);

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
        // Edit mode
        let endpoint = `admin/staff/${editingStaff._id}`;
        if (user?.role === "AGENT") {
          endpoint = `agent/staff/${editingStaff._id}`;
        }
        
        await api.put(endpoint, { 
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

        const res: any = await api.post(endpoint, {
          name: data.fullName,
          email: data.email,
          password: data.password,
          role: data.role,
          location: data.location,
        });

        const createdUser = res?.user;
        if (createdUser?.email && createdUser?.password) {
          setCredentialsModal({ email: createdUser.email, password: createdUser.password });
        } else {
          toast({ title: "Success", description: `${data.role} member added.` });
        }
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
      let endpoint = `admin/staff/${deletingStaff._id}`;
      if (user?.role === "AGENT") {
        endpoint = `agent/staff/${deletingStaff._id}`;
      }
      await api.delete(endpoint);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Management</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Oversee staff members and agent nodes</p>
        </div>
        <button type="button" onClick={() => { setEditingStaff(null); setIsModalOpen(true); }} className="neon-button-accent h-12 px-6 text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {user?.role === "ADMIN" && (
        <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab("staff")}
            className={cn(
              "px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all", 
              activeTab === "staff" ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            Staff
          </button>
          <button 
            onClick={() => setActiveTab("agents")}
            className={cn(
              "px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all", 
              activeTab === "agents" ? "bg-accent text-black shadow-lg shadow-accent/20" : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            Agents
          </button>
        </div>
      )}

      <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight uppercase italic">{activeTab === "agents" ? "Agent Network" : "Staff Directory"}</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                  {activeTab === "agents" ? "Manage and monitor agent nodes" : "Manage internal team permissions"}
              </p>
            </div>
          </div>
        </div>

        {loading && <p className="text-muted-foreground text-center py-20 animate-pulse text-xs font-bold tracking-widest uppercase">Syncing Directory...</p>}
        {error && !loading && <p className="text-red-500 text-sm py-8 text-center font-medium">{error}</p>}
        {!loading && !error && (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Identity</th>
                  <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Role</th>
                  <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Location</th>
                  <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Joined Date</th>
                  <th className="text-right py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-muted-foreground text-xs font-medium italic">Directory is empty.</td>
                  </tr>
                ) : (
                  staff.map((m) => (
                    <tr key={m._id ?? m.email} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase border shadow-inner transition-colors",
                            m.role === 'ADMIN' ? "bg-primary/10 text-primary border-primary/20" : 
                            m.role === 'AGENT' ? "bg-accent/10 text-accent border-accent/20" : 
                            "bg-white/5 text-muted-foreground border-white/10"
                          )}>
                            {m.role === 'ADMIN' ? <ShieldCheck className="w-5 h-5" /> : (m.role === 'AGENT' ? <UserCog className="w-5 h-5" /> : <User className="w-5 h-5" />)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{m.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border", 
                          roleConfig[m.role as string]?.className || "bg-white/5 text-muted-foreground border-white/10"
                        )}>
                          {roleConfig[m.role as string]?.label || m.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          {m.location || "Headquarters"}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-muted-foreground font-medium">{formatDate(m.createdAt)}</td>
                      <td className="py-4 px-6 text-right">
                        {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => initEdit(m)}
                              className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-all"
                              title="Edit Permissions"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => initDelete(m)}
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Revoke Access"
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
        currentUserRole={user?.role}
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

      {credentialsModal && (
        <CredentialsModal
          isOpen={!!credentialsModal}
          onClose={() => setCredentialsModal(null)}
          email={credentialsModal.email}
          password={credentialsModal.password}
          title="Member created"
        />
      )}
    </div>
  );
}
