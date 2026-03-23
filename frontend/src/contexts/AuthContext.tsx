/**
 * Auth context: user state, login/register/logout, and restore-from-token on load.
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@/api/auth";
import * as authApi from "@/api/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (input: authApi.UpdateProfileInput) => Promise<User>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = authApi.getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      authApi.clearStoredToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const handleSessionExpired = () => setUser(null);
    globalThis.addEventListener("auth:session-expired", handleSessionExpired);
    return () => globalThis.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      setUser(res.user);
    },
    []
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      await authApi.register(email, username, password);
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.getProfile();
      setUser(me);
    } catch (error) {
      authApi.clearStoredToken();
      setUser(null);
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (input: authApi.UpdateProfileInput) => {
    const updatedUser = await authApi.updateProfile(input);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
