import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiClient, setAuthToken, setOnUnauthorized, setActiveTenantUserId } from "../services/api/apiClient";

export interface User {
  id: number;
  email: string;
  full_name: string;
  business_name: string;
  role: "user" | "master_admin";
  is_active: boolean;
  supabase_uid?: string;
}

interface AuthContextType {
  user: User | null;
  activeWorkspace: User | null;
  isSwitchedWorkspace: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  switchWorkspace: (targetUser: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: {
    fullName: string;
    businessName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const switchWorkspace = useCallback((targetUser: User | null) => {
    if (!targetUser || targetUser.id === user?.id) {
      setActiveTenantUserId(null);
      setActiveWorkspace(null);
    } else if (user?.role === "master_admin") {
      setActiveTenantUserId(targetUser.id);
      setActiveWorkspace(targetUser);
    }
  }, [user]);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore network errors on logout
    } finally {
      setActiveTenantUserId(null);
      setActiveWorkspace(null);
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      // Attempt silent refresh using HttpOnly cookie with in-flight deduplication
      const refreshRes = await apiClient.refreshSession();
      if (refreshRes && refreshRes.access_token) {
        setAuthToken(refreshRes.access_token);
        setUser(refreshRes.user);
      }
    } catch {
      // No valid session cookie found; user remains unauthenticated
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      setAuthToken(null);
      setUser(null);
    });
    restoreSession();
  }, [restoreSession]);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<{ access_token: string; user: User }>("/auth/login", {
      email,
      password,
    });
    setAuthToken(res.access_token);
    setUser(res.user);
  };

  const signup = async (payload: {
    fullName: string;
    businessName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const res = await apiClient.post<{ access_token: string; user: User }>("/auth/signup", {
      full_name: payload.fullName,
      business_name: payload.businessName,
      email: payload.email,
      password: payload.password,
      confirm_password: payload.confirmPassword,
    });
    setAuthToken(res.access_token);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeWorkspace,
        isSwitchedWorkspace: !!activeWorkspace && activeWorkspace.id !== user?.id,
        isAuthenticated: !!user,
        isLoading,
        switchWorkspace,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
