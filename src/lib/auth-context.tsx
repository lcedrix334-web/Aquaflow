import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import { supabase } from "@/integrations/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;

  signIn: (
    username: string,
    password: string
  ) => Promise<{
    error: string | null;
  }>;

  signUp: (
    firstName: string,
    lastName: string,
    username: string,
    password: string
  ) => Promise<{
    error: string | null;
  }>;

  signOut: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    try {
      const { data } =
        supabase.auth.onAuthStateChange(
          (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
          }
        );

      unsub = () =>
        data.subscription.unsubscribe();

      supabase.auth
        .getSession()
        .then(
          ({
            data: { session },
          }) => {
            setSession(session);
            setUser(
              session?.user ?? null
            );
            setLoading(false);
          }
        )
        .catch((err) => {
          console.error(
            "Session error:",
            err
          );

          setLoading(false);
        });

    } catch (err) {
      console.error(
        "Auth initialization failed:",
        err
      );

      setLoading(false);
    }

    return () => {
      unsub?.();
    };
  }, []);

  // SIGN UP

  async function signUp(
    firstName: string,
    lastName: string,
    username: string,
    password: string
  ) {

    try {

      // Hidden email generated from username
      const generatedEmail =
        `${username}@aquaflow.local`;

      const { error } =
        await supabase.auth.signUp({
          email: generatedEmail,
          password,

          options: {
            emailRedirectTo:
              `${window.location.origin}/dashboard`,

            data: {
              firstName,
              lastName,
              username,
            },
          },
        });

      if (error) {
        return {
          error: error.message,
        };
      }

      return {
        error: null,
      };

    } catch (err: any) {

      return {
        error:
          err.message ??
          "Signup failed",
      };
    }
  }

  // LOGIN

  async function signIn(
    username: string,
    password: string
  ) {

    try {

      // recreate same generated email
      const generatedEmail =
        `${username}@aquaflow.local`;

      const { error } =
        await supabase.auth
          .signInWithPassword({
            email: generatedEmail,
            password,
          });

      if (error) {
        return {
          error: error.message,
        };
      }

      return {
        error: null,
      };

    } catch (err: any) {

      return {
        error:
          err.message ??
          "Login failed",
      };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx =
    useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}