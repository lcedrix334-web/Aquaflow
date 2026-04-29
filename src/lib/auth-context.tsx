import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/client";
import { getSubscriptionStatus, type SubscriptionStatus } from "@/lib/subscription";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>("none");
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

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

  // Fetch subscription status when user changes
  useEffect(() => {
    if (user) {
      setSubscriptionLoading(true);
      getSubscriptionStatus(user.id).then(({ status }) => {
        setSubscriptionStatus(status);
        setSubscriptionLoading(false);
      });
    } else {
      setSubscriptionStatus("none");
      setSubscriptionLoading(false);
    }
  }, [user]);

  const refreshSubscription = async () => {
    if (!user) return;
    setSubscriptionLoading(true);
    const { status } = await getSubscriptionStatus(user.id);
    setSubscriptionStatus(status);
    setSubscriptionLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { name },
      },
    });
    if (error) {
      return { error: error.message };
    }

    // After signup, the database trigger creates a subscription row.
    // Use the API endpoint to send confirmation email (it uses service role key server-side)
    // We pass the email so the server knows where to send, even if user isn't fully confirmed yet.
    const userId = data.user?.id;

    if (userId) {
      try {
        // Small delay to let the DB trigger finish creating the subscription row
        await new Promise((r) => setTimeout(r, 1500));

        const res = await fetch("/api/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            email,
          }),
        });

        const result = await res.json();
        if (!result.success) {
          console.error("Failed to send confirmation email:", result.error);
        }
      } catch (err) {
        console.error("Error sending confirmation email:", err);
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, subscriptionStatus, subscriptionLoading, signIn, signUp, signOut, refreshSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
