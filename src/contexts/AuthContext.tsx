import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, type AuthUser, type LoginResponse } from "../lib/api";

export type UserRole = "ADMIN" | "STAFF" | "SUPPORT" | "PLAYER";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string; password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleNames: Record<string, string> = {
  ADMIN: "Admin",
  STAFF: "Staff",
  SUPPORT: "Support",
  PLAYER: "Player",
};

function loadStoredUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem("binpay_user");
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);

  useEffect(() => {
    if (user) localStorage.setItem("binpay_user", JSON.stringify(user));
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<LoginResponse>("auth/login", { email, password });
    if (data.success && data.token && data.user) {
      localStorage.setItem("binpay_token", data.token);
      setUser(data.user);
    } else {
      throw new Error("Login failed");
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role: UserRole) => {
      const data = await api.post<LoginResponse>("auth/register", { name, email, password, role });
      if (data.success && data.token && data.user) {
        localStorage.setItem("binpay_token", data.token);
        setUser(data.user);
      } else {
        throw new Error("Registration failed");
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("binpay_user");
    localStorage.removeItem("binpay_token");
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; email?: string; password?: string }) => {
    const res = await api.patch<LoginResponse>("auth/profile", data);
    if (res.success && res.user) setUser(res.user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { roleNames };
