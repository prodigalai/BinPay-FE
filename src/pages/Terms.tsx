import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, FileText, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-xl bg-white/5 hover:bg-white/10 w-12 h-12 border border-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight text-white">Terms of Service</h1>
        </div>

        <section className="bg-white/[0.02] p-8 md:p-10 rounded-3xl border border-white/5 space-y-6 hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-4 text-primary mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
               <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">1. Acceptance of Terms</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg font-medium">
            By accessing and using Pay4Edge ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="bg-white/[0.02] p-8 md:p-10 rounded-3xl border border-white/5 space-y-6 hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-4 text-primary mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
               <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">2. Privacy & Data</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg font-medium">
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal data. By using Pay4Edge, you consent to our data practices.
          </p>
        </section>

        <section className="bg-white/[0.02] p-8 md:p-10 rounded-3xl border border-white/5 space-y-6 hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-4 text-primary mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
               <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">3. User Responsibilities</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg font-medium">
            Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section className="bg-white/[0.02] p-8 md:p-10 rounded-3xl border border-white/5 space-y-6 hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-4 text-primary mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
               <Scale className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">4. Limitation of Liability</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg font-medium">
            Pay4Edge shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
          </p>
        </section>

        <footer className="text-center pt-12 text-muted-foreground text-sm">
          Last updated: February 2026
          <br />
          © 2026 Pay4Edge Inc.
        </footer>
      </div>
    </div>
  );
}
