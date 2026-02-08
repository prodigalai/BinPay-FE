import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Clock, 
  CreditCard, 
  Gamepad2,
  CheckCircle,
  Globe,
  Lock,
  TrendingUp,
  Users,
  Headphones,
  Play,
  ExternalLink,
  Send,
  Mail,
  MessageCircle,
  UserPlus,
  BadgeCheck,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const stats = [
  { value: "98%", label: "APPROVAL RATE" },
  { value: "12h", label: "ONBOARDING" },
  { value: "24/7", label: "UPTIME" },
  { value: "$1.5k", label: "CHARGEBACK SHIELD" }
];

const coreFeatures = [
  {
    icon: CreditCard,
    title: "98% Card Approval",
    description: "Both 2DS and 3DS cards accepted. Our network of 20+ providers ensures maximum approval rates.",
    badge: null
  },
  {
    icon: Shield,
    title: "$1,500 Chargeback Shield",
    description: "Protected against chargebacks up to $1,500. We handle disputes so you can focus on your business.",
    badge: null
  },
  {
    icon: Clock,
    title: "24/7 Proven Uptime",
    description: "20+ redundant providers ensure your payment gateway never sleeps. Zero downtime, ever.",
    badge: null
  },
  {
    icon: UserPlus,
    title: "No KYC / No KYB",
    description: "Skip the lengthy verification processes. We handle risk and compliance internally for a smooth experience.",
    badge: null
  },
  {
    icon: BadgeCheck,
    title: "12-Hour Onboarding",
    description: "Get started in as little as 12 business hours. No red tape, no waiting weeks for approval.",
    badge: null
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    telegram: "",
    useCase: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Inquiry Submitted!",
      description: "We'll get back to you within 6 hours.",
    });
    setFormData({ email: "", telegram: "", useCase: "" });
  };

  return (
    <div className="min-h-screen w-full text-foreground overflow-hidden selection:bg-green-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[1000px] md:h-[1000px] bg-green-500/10 md:bg-primary/15 rounded-full blur-[100px] md:blur-[200px]" />
        <div className="absolute top-0 left-1/4 w-[200px] h-[200px] md:w-[600px] md:h-[600px] bg-green-500/5 md:bg-primary/10 rounded-full blur-[80px] md:blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[200px] h-[200px] md:w-[500px] md:h-[500px] bg-green-500/5 md:bg-accent/10 rounded-full blur-[80px] md:blur-[150px]" />
      </div>

      {/* Floating Navigation - grid so center links stay in the bar */}
      <nav className="fixed top-6 left-[5%] w-[90%] md:left-[20%] md:w-[60%] z-50 max-w-5xl px-6 py-3 rounded-full border border-border/40 glass-strong backdrop-blur-xl shadow-2xl animate-fade-down duration-700 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4 flex flex-nowrap items-center justify-between">

        {/* Logo - Left */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] border border-green-500/50 shrink-0 overflow-hidden">
            <img src="/logo.png" alt="BinPay Logo" className="w-full h-full object-cover p-1" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 bg-clip-text text-transparent truncate">BinPay</span>
        </div>

        {/* Desktop Links - Center column (grid middle cell) */}
        <div className="hidden md:flex items-center justify-center gap-8 justify-self-center">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">Features</a>
          <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">Demo</a>
          <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">Contact</a>
        </div>

        {/* Desktop Buttons - Right column */}
        <div className="hidden md:flex items-center gap-3 justify-end min-w-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/login")}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all font-medium rounded-full px-4"
          >
            Sign In
          </Button>
          <Button 
            size="sm"
            onClick={() => navigate("/login")}
            className="neon-button px-5 rounded-full text-xs"
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Toggle - Right (only on small screens) */}
        <button 
          className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors shrink-0"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl pt-24 px-6 animate-fade-in md:hidden">
          <div className="flex flex-col gap-6 text-center">
            <a 
              href="#features" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </a>
            <a 
              href="#demo" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Demo
            </a>
            <a 
              href="#contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
            <div className="h-px bg-border/50 my-2" />
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => {
                navigate("/login");
                setIsMobileMenuOpen(false);
              }}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all font-medium rounded-full w-full"
            >
              Sign In
            </Button>
            <Button 
              size="lg"
              onClick={() => {
                navigate("/login");
                setIsMobileMenuOpen(false);
              }}
              className="neon-button rounded-full w-full"
            >
              Get Started
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-32 lg:pt-32 pb-20">
        <div className="max-w-7xl w-full mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Card Visual */}
            <div className="relative order-2 lg:order-1 animate-fade-up delay-200 hidden md:block">
              <div className="relative">
                {/* Credit Card */}
                <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl p-8 border border-border/50 shadow-2xl hover:scale-105 transition-transform duration-500">
                  <div className="bg-gradient-to-br from-muted to-secondary rounded-xl p-6 mb-6">
                    <div className="flex gap-1 mb-8">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-0.5">
                          {[...Array(4)].map((_, j) => (
                            <div key={j} className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="text-xl font-mono text-foreground/80 mb-6">4242</div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-500">VISA</span>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                        <ArrowRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-500">USDT</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instant Settlement Badge */}
                <div className="absolute -bottom-4 -left-4 px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/30 backdrop-blur-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Instant</p>
                    <p className="text-sm font-semibold text-green-500">Settlement</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-8 order-1 lg:order-2 animate-fade-up">
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                <span className="text-sm text-green-500 font-medium tracking-wide">Live & Processing Payments 24/7</span>
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                The Payment Processor for <span className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 bg-clip-text text-transparent">Gaming</span> & High-Risk
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg">
                Accept <span className="text-foreground font-medium">Credit Cards</span> & <span className="text-foreground font-medium">UPI</span> payments 
                and receive instant settlement in <span className="text-foreground font-medium">USDT</span>. No KYC. No sudden bans. Built for businesses that need reliability.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto order-2 sm:order-1 border-green-500/30 text-green-500 hover:bg-green-500/10 gap-2 h-12"
                >
                  <Play className="w-4 h-4" />
                  Try Demo Now
                </Button>
                <Button 
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:opacity-90 gap-2 h-12"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  Get Started
                  <ArrowRight className={cn("w-4 h-4 transition-transform", isHovered && "translate-x-1")} />
                </Button>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-8 pt-4 animate-fade-up delay-300">
                {stats.map((stat, index) => (
                  <div key={index} className="relative">
                    <div className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                    {index < stats.length - 1 && (
                      <div className="hidden md:block absolute right-[-16px] top-1/2 -translate-y-1/2 w-px h-10 bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why BinPay Section */}
      <section id="features" className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <span className="text-sm text-primary font-medium">Why BinPay</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Payment Processing
              <br />
              <span className="gradient-text">Reimagined</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for businesses that need speed, reliability, and freedom from traditional banking limitations.
            </p>
          </div>

          {/* Core Feature Highlight */}
          <div className="relative glass gradient-border rounded-2xl p-8 mb-12 animate-fade-up delay-100 group hover:border-primary/40 transition-all duration-500">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                Core Feature
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Instant USDT Settlement</h3>
            <p className="text-muted-foreground max-w-2xl">
              No waiting for days. Receive your earnings in USDT the moment a transaction is approved. True instant settlement.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <div 
                key={index}
                className="glass rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 group animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Risk Verticals Section (New) */}
      <section className="relative z-10 px-6 lg:px-12 py-20 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <span className="text-sm text-primary font-medium">Built For Gaming</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Specialized in <span className="gradient-text">High-Risk Verticals</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're licensed or unlicensed, BinPay helps you process payments without the headaches of mainstream processors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Online Casinos", icon: Gamepad2, desc: "Seamless payments for gaming platforms" },
              { title: "Gambling", icon: TrendingUp, desc: "Reliable processing for betting platforms" },
              { title: "IPTV Services", icon: Globe, desc: "Instant settlement for streaming businesses" },
              { title: "Adult Content", icon: Lock, desc: "Discreet and reliable payment processing" },
              { title: "SMM Panels", icon: Users, desc: "Fast payments for social media services" },
              { title: "And More", icon: ArrowRight, desc: "Any high-risk business is welcome" }
            ].map((item, i) => (
              <div key={i} className="glass p-6 rounded-xl border border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="relative z-10 px-6 lg:px-12 py-20 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <span className="text-sm text-primary font-medium">See It In Action</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Experience Our <span className="gradient-text">Payment Flow</span>
            </h2>
            <p className="text-muted-foreground">
              Try our demo checkout below. See how smooth and fast the payment experience is.
            </p>
          </div>

          {/* Browser Mockup */}
          <div className="glass rounded-2xl border border-border/50 overflow-hidden animate-zoom-in delay-200 shadow-2xl">
            {/* Browser Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-card/60 border-b border-border/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-primary/60" />
              </div>
              <div className="flex-1 px-4 py-1.5 rounded-md bg-background/50 text-xs text-muted-foreground font-mono">
                https://pay.binpay.com/5kb1063wn2byvitxmugu
              </div>
            </div>

            {/* Payment Form */}
            <div className="p-8 lg:p-12 flex items-center justify-center">
              <div className="w-full max-w-sm glass rounded-xl p-6 border border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount to pay</p>
                    <p className="text-2xl font-bold">$5.00</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Gamepad2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold">BinPay</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="1234 5678 9012 3456"
                      className="w-full h-11 px-4 rounded-lg bg-background/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50"
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Month</label>
                      <select className="w-full h-11 px-3 rounded-lg bg-background/50 border border-border/50 text-sm focus:outline-none">
                        <option>MM</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Year</label>
                      <select className="w-full h-11 px-3 rounded-lg bg-background/50 border border-border/50 text-sm focus:outline-none">
                        <option>YY</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">CVV</label>
                      <input 
                        type="text" 
                        placeholder="123"
                        className="w-full h-11 px-3 rounded-lg bg-background/50 border border-border/50 text-sm focus:outline-none"
                        readOnly
                      />
                    </div>
                  </div>
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                    Continue
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>Secured with 256-bit encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Open Demo Button */}
          <div className="flex justify-center mt-8">
            <Button 
              variant="outline"
              onClick={() => navigate("/login")}
              className="border-primary/30 text-primary hover:bg-primary/10 gap-2"
            >
              Open Demo in New Tab
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <span className="text-sm text-primary font-medium">Get Started</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">Scale Your Business?</span>
            </h2>
            <p className="text-muted-foreground">
              Get set up in as little as 12 business hours. No lengthy processes, no red tape.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Contact Info */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold">Let's Talk</h3>
              <p className="text-muted-foreground">
                Reach out to us directly or fill out the form. We typically respond within 6 hours.
              </p>

              <div className="space-y-4">
                <div className="glass rounded-xl p-4 border border-border/50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#229ED9]/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-[#229ED9]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telegram</p>
                    <p className="font-semibold">@binpaysupport</p>
                  </div>
                </div>

                <div className="glass rounded-xl p-4 border border-border/50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">support@binpay.com</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm">Secure Payments</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm">24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Right - Contact Form */}
            <div className="glass rounded-2xl p-8 border border-border/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email Address <span className="text-primary">*</span>
                  </label>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full h-12 px-4 rounded-lg bg-background/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Telegram Username</label>
                  <input 
                    type="text"
                    value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    placeholder="@yourusername"
                    className="w-full h-12 px-4 rounded-lg bg-background/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tell us about your use case <span className="text-primary">*</span>
                  </label>
                  <textarea 
                    required
                    value={formData.useCase}
                    onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                    placeholder="Describe your business and what you're looking for. Please include links to your project if applicable."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary hover:opacity-90 gap-2"
                >
                  Submit Inquiry
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-12 border-t border-border/50 bg-card/20 backdrop-blur-sm animate-fade-in delay-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)] overflow-hidden">
                  <img src="/logo.png" alt="BinPay Logo" className="w-full h-full object-cover p-1" />
                </div>
                <span className="font-bold text-lg">BinPay</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The premier payment processor for high-risk and gaming industries. Secure, instant, and reliable.
              </p>
            </div>
            
            <div className="animate-fade-up delay-100">
              <h4 className="font-semibold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#demo" className="hover:text-primary transition-colors">Live Demo</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div className="animate-fade-up delay-200">
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Compliance</a></li>
              </ul>
            </div>

            <div className="animate-fade-up delay-300">
              <h4 className="font-semibold mb-4 text-foreground">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#contact" className="hover:text-primary transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Telegram</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Email</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in delay-500">
            <p className="text-sm text-muted-foreground">
              © 2026 BinPay Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               <span className="text-xs text-primary font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
