import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      </div>
      <div className="text-center relative z-10 p-8 glass rounded-3xl border border-white/10 shadow-2xl">
        <h1 className="mb-4 text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 animate-bounce">404</h1>
        <p className="mb-6 text-xl font-bold uppercase tracking-widest text-muted-foreground">Page Not Found</p>
        <a href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-black font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(var(--primary),0.4)]">
          Return Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
