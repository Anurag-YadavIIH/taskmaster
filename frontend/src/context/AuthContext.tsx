import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import * as usersApi from "../api/users";
import { AUTH_EXPIRED_EVENT, clearToken, getToken, setToken } from "../lib/api";
import type { LoginRequest, RegisterRequest, UserResponse } from "../lib/types";

interface AuthContextValue {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserResponse) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    usersApi
      .getMe()
      .then(setUser)
      .catch(() => {
        clearToken();
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      navigate("/login", { replace: true });
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [navigate]);

  const login = useCallback(async (payload: LoginRequest) => {
    const res = await authApi.login(payload);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const res = await authApi.register(payload);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // best-effort; clear local state regardless
    }
    clearToken();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: user !== null, login, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
