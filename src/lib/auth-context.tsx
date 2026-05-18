import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    firstName: string,
    lastName: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    try {
      // Set up auth listener BEFORE checking session
      const { data: subData } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      });
      unsub = () => subData.subscription.unsubscribe();

      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to get session:', err);
          setLoading(false);
        });
    } catch (err) {
      console.error('Failed to initialize auth listener:', err);
      setLoading(false);
    }

    return () => {
      unsub?.();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (firstName: string, lastName: string, password: string) => {
    // Generate a temporary email from firstName and lastName
    const tempEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@aquaflow.local`;
    
    const { data, error } = await supabase.auth.signUp({
      email: tempEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { firstName, lastName },
      },
    });
    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
