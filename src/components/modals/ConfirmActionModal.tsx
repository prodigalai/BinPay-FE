import { createPortal } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  isDestructive = false,
  isLoading = false,
}: ConfirmActionModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={isLoading ? undefined : onClose} 
      />
      <div className="relative w-full max-w-sm glass-strong rounded-xl border border-white/10 p-6 animate-scale-in">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDestructive ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-primary/20 text-primary"}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-6">
          {description}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-10 rounded-lg glass border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                isDestructive 
                ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20" 
                : "neon-button"
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
