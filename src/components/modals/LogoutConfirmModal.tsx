import { LogOut } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-xs sm:max-w-sm glass-strong rounded-lg border border-white/10 p-4 sm:p-6 animate-fade-in">
        {/* Icon */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-destructive/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <LogOut className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" />
        </div>

        {/* Content */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">Confirm Logout</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Are you sure you want to log out? You'll need to sign in again.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-9 sm:h-11 rounded-lg glass border border-white/10 text-xs sm:text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-9 sm:h-11 rounded-lg bg-destructive text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 hover:bg-destructive/90 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
