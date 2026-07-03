import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { getToken, setToken, clearToken, apiFetch } from "@/lib/api";

export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  role: "user" | "admin";
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  suspended: boolean;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signUp: (fullName: string, username: string, password: string, confirmPassword: string, email?: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  resetPassword: (usernameOrEmail: string) => Promise<{ error: string | null; devToken?: string }>;
  confirmResetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    setAuthTokenGetter(async () => getToken());

    const token = getToken();
    if (!token) { setLoading(false); return; }

    apiFetch<AppUser>("/api/auth/me")
      .then((u) => setUser(u))
      .catch(() => clearToken())
      .finally(() => setLoading(false));

    const handleSuspended = () => {
      setSuspended(true);
      clearToken();
      setUser(null);
    };
    window.addEventListener("account-suspended", handleSuspended);
    return () => window.removeEventListener("account-suspended", handleSuspended);
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    try {
      const data = await apiFetch<{ token: string; user: AppUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setToken(data.token);
      setUser(data.user);
      setSuspended(false);
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Xəta baş verdi" };
    }
  }, []);

  const signUp = useCallback(async (
    fullName: string, username: string, password: string, confirmPassword: string, email?: string,
  ) => {
    try {
      const data = await apiFetch<{ token: string; user: AppUser }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, username, password, confirmPassword, email }),
      });
      setToken(data.token);
      setUser(data.user);
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Xəta baş verdi" };
    }
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (usernameOrEmail: string) => {
    try {
      const data = await apiFetch<{ message: string; _devToken?: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ usernameOrEmail }),
      });
      return { error: null, devToken: data._devToken };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Xəta baş verdi" };
    }
  }, []);

  const confirmResetPassword = useCallback(async (token: string, password: string, confirmPassword: string) => {
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Xəta baş verdi" };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, suspended, signIn, signUp, signOut, resetPassword, confirmResetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
