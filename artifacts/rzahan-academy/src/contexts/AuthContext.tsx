import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  suspended: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    setAuthTokenGetter(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN") {
        setSuspended(false);
      }

      if (event === "SIGNED_IN" && session?.user) {
        const u = session.user;
        const nameParts = ((u.user_metadata?.full_name as string | undefined) || "").split(" ");
        const firstName = (u.user_metadata?.first_name as string | undefined) || nameParts[0] || "";
        const lastName = (u.user_metadata?.last_name as string | undefined) || nameParts.slice(1).join(" ") || "";
        const avatarUrl = (u.user_metadata?.avatar_url as string | undefined) || "";
        fetch("/api/auth/sync-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ firstName, lastName, avatarUrl }),
        }).catch(() => {});
      }
    });

    const handleSuspended = () => {
      setSuspended(true);
      supabase.auth.signOut().catch(() => {});
    };

    window.addEventListener("account-suspended", handleSuspended);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("account-suspended", handleSuspended);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: `${window.location.origin}${(import.meta.env.BASE_URL || "").replace(/\/$/, "")}/`,
      },
    });
    return { error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${basePath}/` },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${basePath}/auth/reset-password`,
    });
    return { error };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, suspended, signIn, signUp, signInWithGoogle, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
