import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { BottomNav } from "./components/layout/BottomNav";
import { PageTransition } from "./components/layout/PageTransition";
import { AuthProvider, useAuth, type UserRole } from "./contexts/AuthContext";
import { useSwipeNavigation } from "./hooks/useSwipeNavigation";
import Index from "./pages/Index";
import Players from "./pages/Players";
import Deposits from "./pages/Deposits";
import Staff from "./pages/Staff";
import Disputes from "./pages/Disputes";
import DisputeDetail from "./pages/DisputeDetail";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Withdrawals from "./pages/Withdrawals";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: UserRole[] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.role as UserRole)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function SwipeHandler() {
  useSwipeNavigation({ threshold: 80 });
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <PageTransition>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/players" element={<RoleRoute allowedRoles={["ADMIN", "STAFF"]}><Players /></RoleRoute>} />
        <Route path="/deposits" element={<ProtectedRoute><Deposits /></ProtectedRoute>} />
        <Route path="/staff" element={<RoleRoute allowedRoles={["ADMIN"]}><Staff /></RoleRoute>} />
        <Route path="/disputes" element={<ProtectedRoute><Disputes /></ProtectedRoute>} />
        <Route path="/disputes/:id" element={<ProtectedRoute><DisputeDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/withdrawals" element={<ProtectedRoute><Withdrawals /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[60%]">
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-t from-accent/20 via-primary/10 to-transparent rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-t from-primary/15 via-accent/10 to-transparent rounded-full blur-[100px]" />
        </div>
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
      </div>
      {isAuthenticated && <Navbar />}
      {isAuthenticated && <BottomNav />}
      {isAuthenticated && <SwipeHandler />}
      <main className={isAuthenticated ? "relative pt-16 sm:pt-20 pb-20 md:pb-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto" : ""}>
        <AnimatedRoutes />
      </main>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
