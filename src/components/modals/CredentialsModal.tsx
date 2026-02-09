import { createPortal } from "react-dom";
import { X, Copy, Check } from "lucide-react";
import { useState } from "react";

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  password: string;
  title?: string;
}

export function CredentialsModal({
  isOpen,
  onClose,
  email,
  password,
  title = "Member created",
}: CredentialsModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const copyToClipboard = async (text: string, type: "email" | "password" | "all") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 1500);
      } else if (type === "password") {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 1500);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 1500);
      }
    } catch {
      // Fallback for older browsers
    }
  };

  if (!isOpen) return null;

  const copyAllText = `Email: ${email}\nPassword: ${password}`;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-strong rounded-2xl border border-white/10 overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-muted-foreground text-sm px-5 pt-4 pb-2">
          Share these credentials with the user (copy and send via WhatsApp/email):
        </p>
        <div className="p-5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
              <span className="flex-1 text-sm font-mono truncate" title={email}>{email}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(email, "email")}
                className="shrink-0 p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                title="Copy email"
              >
                {copiedEmail ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
              <span className="flex-1 text-sm font-mono truncate" title={password}>{password}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(password, "password")}
                className="shrink-0 p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                title="Copy password"
              >
                {copiedPassword ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(copyAllText, "all")}
            className="w-full h-11 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
          >
            {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedAll ? "Copied!" : "Copy email & password"}
          </button>
        </div>
        <div className="p-5 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-xl neon-button text-sm font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
