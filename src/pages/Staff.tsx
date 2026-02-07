import { useState, useEffect } from "react";
import { Plus, User, Trash2, Edit2, MoreVertical } from "lucide-react";
import { cn } from "../lib/utils";
import { AddStaffModal } from "../components/modals/AddStaffModal";
import { ConfirmActionModal } from "../components/modals/ConfirmActionModal";
import type { StaffFormData } from "../components/modals/AddStaffModal";
import { api } from "../lib/api";
import type { StaffMember, StaffListResponse } from "../lib/api";
import { toast } from "../hooks/use-toast";

const roleConfig: Record<string, { label: string; className: string }> = {
  ADMIN: { label: "Admin", className: "bg-primary/20 text-primary border-primary/30" },
  STAFF: { label: "Staff", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  SUPPORT: { label: "Support", className: "bg-green-500/20 text-green-400 border-green-500/30" },
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
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<StaffListResponse>("admin/staff");
      setStaff(res.staff ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load staff";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (data: StaffFormData) => {
    try {
      if (editingStaff && editingStaff._id) {
        // Edit mode
        await api.put(`admin/staff/${editingStaff._id}`, { 
          name: data.fullName, 
          email: data.email, 
          role: data.role,
          ...(data.password ? { password: data.password } : {}) 
        });
        toast({ title: "Success", description: "Staff member updated." });
      } else {
        // Add mode
        await api.post("admin/staff", { name: data.fullName, email: data.email, password: data.password, role: data.role });
        toast({ title: "Success", description: "Staff member added." });
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
      toast({ title: "Success", description: "Staff member removed." });
      setIsDeleteModalOpen(false);
      setDeletingStaff(null);
      fetchStaff();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to remove staff";
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
      <h1 className="text-xl sm:text-2xl font-bold">Staff</h1>

      <div className="glass rounded-lg p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Staff Members</h2>
            <p className="text-muted-foreground text-sm">Manage team and roles.</p>
          </div>
          <button type="button" onClick={() => { setEditingStaff(null); setIsModalOpen(true); }} className="neon-button-accent inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>

        {loading && <p className="text-muted-foreground text-sm py-8 text-center">Loading…</p>}
        {error && !loading && <p className="text-destructive text-sm py-4">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Member</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Role</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Created</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">No staff yet. Add one.</td>
                  </tr>
                ) : (
                  staff.map((m) => (
                    <tr key={m._id ?? m.email} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-card/80 border border-white/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-medium border", roleConfig[m.role]?.className ?? "bg-white/10 border-white/10")}>
                          {roleConfig[m.role]?.label ?? m.role}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-sm text-muted-foreground">{formatDate(m.createdAt)}</td>
                      <td className="py-4 px-2 text-right">
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
