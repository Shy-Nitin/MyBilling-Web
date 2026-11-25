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
  setSession: (accessToken: string, userData: User) => void;
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

const WORKSPACE_STORAGE_KEY = "mybilling_active_workspace";

const readStoredWorkspace = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<User | null>(() => readStoredWorkspace());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const switchWorkspace = useCallback((targetUser: User | null) => {
    if (!targetUser || targetUser.id === user?.id) {
      setActiveTenantUserId(null);
      setActiveWorkspace(null);
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    } else if (user?.role === "master_admin") {
      setActiveTenantUserId(targetUser.id);
      setActiveWorkspace(targetUser);
      localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(targetUser));
    }
  }, [user]);

  const setSession = useCallback((accessToken: string, userData: User) => {
    setAuthToken(accessToken);
    setUser(userData);
    if (userData.role !== "master_admin") {
      setActiveTenantUserId(null);
      setActiveWorkspace(null);
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore network errors on logout
    } finally {
      setActiveTenantUserId(null);
      setActiveWorkspace(null);
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      apiClient.clearCache();
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
        if (refreshRes.user?.role === "master_admin") {
          const saved = readStoredWorkspace();
          if (saved && saved.id !== refreshRes.user.id) {
            setActiveTenantUserId(saved.id);
            setActiveWorkspace(saved);
          } else {
            setActiveTenantUserId(null);
            setActiveWorkspace(null);
            localStorage.removeItem(WORKSPACE_STORAGE_KEY);
          }
        } else {
          setActiveTenantUserId(null);
          setActiveWorkspace(null);
          localStorage.removeItem(WORKSPACE_STORAGE_KEY);
        }
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
    setSession(res.access_token, res.user);
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
    setSession(res.access_token, res.user);
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
        setSession,
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
