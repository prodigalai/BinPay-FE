import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { GlassInput } from "../ui/glass-input";
import { GlassSelect } from "../ui/glass-select";

import { StaffMember } from "../../lib/api";

export interface StaffFormData {
  fullName: string;
  email: string;
  password?: string;
  role: "STAFF" | "SUPPORT" | "ADMIN" | "AGENT";
  location?: string;
}

const roleOptions = [
  { value: "STAFF", label: "Staff" },
  { value: "SUPPORT", label: "Support" },
  { value: "AGENT", label: "Agent" },
];

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StaffFormData) => void | Promise<void>;
  initialData?: StaffMember | null;
}

export function AddStaffModal({ isOpen, onClose, onSubmit, initialData }: AddStaffModalProps) {
  const [formData, setFormData] = useState<StaffFormData>({
    fullName: "",
    email: "",
    password: "",
    role: "STAFF",
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Sync with initialData when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          fullName: initialData.name,
          email: initialData.email,
          password: "",
          role: (initialData.role as StaffFormData["role"]) || "STAFF",
          location: initialData.location || "",
        });
      } else {
        setFormData({
          fullName: "",
          email: "",
          password: "",
          role: "STAFF",
          location: "",
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      // Only clear if adding new staff
      if (!initialData) {
        setFormData({ fullName: "", email: "", password: "", role: "STAFF" });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl w-full max-w-md mx-auto animate-scale-in max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#11081f]/80 backdrop-blur-md">
          <h2 className="text-xl font-semibold">{initialData ? "Edit Staff" : "Add New Staff"}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
            <GlassInput showSearchIcon={false} placeholder="Full name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
            <GlassInput showSearchIcon={false} type="email" placeholder="email@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Password {initialData ? <span className="text-xs font-normal opacity-50">(Leave blank to keep current)</span> : <span className="text-xs font-normal opacity-50">(Leave blank to send via email)</span>}</label>
            <GlassInput 
              showSearchIcon={false} 
              type="password" 
              placeholder={initialData ? "Only to change password" : "••••••••"} 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              required={false} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Location (Office/Branch Name)</label>
            <GlassInput showSearchIcon={false} placeholder="e.g., Delhi Office, Site-B" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Role</label>
            <GlassSelect options={roleOptions} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffFormData["role"] })} />
          </div>
          <button type="submit" disabled={submitting} className="w-full h-12 neon-button rounded-xl text-sm font-semibold disabled:opacity-70 mt-2">
            {submitting ? (initialData ? "Saving..." : "Adding...") : (initialData ? "Save Changes" : "Add Staff Member")}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
