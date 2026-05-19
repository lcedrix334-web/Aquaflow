import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { supabase } from "@/integrations/client";

interface LocalUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  password: string;
}

interface AuthContextValue {
  user: LocalUser | null;
  session: null;
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
}:{
  children:ReactNode
}) {

  const [user,setUser] =
  useState<LocalUser | null>(null);

  const [loading] =
  useState(false);

  useEffect(()=>{

    const savedUser =
    localStorage.getItem(
      "aquaflow_user"
    );

    if(savedUser){

      setUser(
        JSON.parse(savedUser)
      );
    }

  },[]);

  async function signUp(
    firstName:string,
    lastName:string,
    username:string,
    password:string
  ){

    try{

      // Bypass Supabase generated type issues
      const db =
      supabase as any;

      // Check existing username
      const {
        data:existingUser
      } =
      await db
      .from("subscriptions")
      .select("username")
      .eq(
        "username",
        username
      )
      .maybeSingle();

      if(existingUser){

        return{
          error:
          "Username already exists"
        };
      }

      // Insert user
      const {
        error
      } =
      await db
      .from("subscriptions")
      .insert({

        first_name:
        firstName,

        last_name:
        lastName,

        username:
        username,

        password:
        password,

      });

      return{

        error:
        error?.message ??
        null

      };

    }
    catch(err:any){

      return{

        error:
        err.message ??
        "Signup failed"

      };
    }
  }

  async function signIn(
    username:string,
    password:string
  ){

    try{

      const db =
      supabase as any;

      const {
        data,
        error
      } =
      await db
      .from("subscriptions")
      .select("*")
      .eq(
        "username",
        username
      )
      .single();

      if(
        error ||
        !data
      ){

        return{

          error:
          "User not found"

        };
      }

      if(
        data.password !==
        password
      ){

        return{

          error:
          "Incorrect password"

        };
      }

      setUser(
        data
      );

      localStorage.setItem(
        "aquaflow_user",
        JSON.stringify(data)
      );

      return{
        error:null
      };

    }
    catch(err:any){

      return{

        error:
        err.message ??
        "Login failed"

      };
    }
  }

  async function signOut(){

    localStorage.removeItem(
      "aquaflow_user"
    );

    setUser(
      null
    );
  }

  return(

    <AuthContext.Provider
      value={{

        user,
        session:null,
        loading,

        signIn,
        signUp,
        signOut

      }}
    >

      {children}

    </AuthContext.Provider>

  );
}

export function useAuth(){

  const ctx =
  useContext(
    AuthContext
  );

  if(!ctx){

    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}