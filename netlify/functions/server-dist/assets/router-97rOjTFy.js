import { jsx, jsxs } from "react/jsx-runtime";
import { createRootRoute, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter, useRouter } from "@tanstack/react-router";
import { useState, useEffect, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import { Toaster as Toaster$1 } from "sonner";
function createSupabaseClient() {
  const SUPABASE_URL = "https://xnahjcdqhsjgpymymrur.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuYWhqY2RxaHNqZ3B5bXltcnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMTExMzUsImV4cCI6MjA5Mjg4NzEzNX0.8g9iVdcQtSfTVAaKwNfRw-vMQ0AeNqLQykYW1Zcv3VI";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
async function getSubscriptionStatus(userId) {
  const { data, error } = await supabase.from("subscriptions").select("status, email").eq("user_id", userId).single();
  if (error || !data) {
    return { status: "none", email: null };
  }
  const row = data;
  return { status: row.status, email: row.email };
}
async function confirmSubscription(token) {
  try {
    const res = await fetch("/api/confirm-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState("none");
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session: session2 } }) => {
      setSession(session2);
      setUser(session2?.user ?? null);
      setLoading(false);
    });
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);
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
  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };
  const signUp = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { name }
      }
    });
    if (error) {
      return { error: error.message };
    }
    const userId = data.user?.id;
    if (userId) {
      try {
        await new Promise((r) => setTimeout(r, 1500));
        const res = await fetch("/api/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            email
          })
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
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { user, session, loading, subscriptionStatus, subscriptionLoading, signIn, signUp, signOut, refreshSubscription }, children });
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const appCss = "/assets/styles-DMjvbdd9.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "glass-card max-w-md rounded-2xl p-10 text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-gradient-leaf-water", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex h-10 items-center justify-center rounded-md bg-leaf px-5 text-sm font-medium text-leaf-foreground transition-colors hover:bg-leaf/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
const Route$5 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AquaFlow — Smart Irrigation for a Greener Tomorrow" },
      {
        name: "description",
        content: "AquaFlow is an automated ESP32 irrigation system that delivers the right amount of water at the right time using soil moisture sensors."
      },
      { name: "author", content: "AquaFlow" },
      { property: "og:title", content: "AquaFlow — Smart Irrigation for a Greener Tomorrow" },
      {
        property: "og:description",
        content: "Automated ESP32-based irrigation. Save water, grow healthier plants."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AquaFlow — Smart Irrigation for a Greener Tomorrow" },
      { name: "description", content: "AquaFlow Control Hub is a web application for managing and monitoring irrigation systems." },
      { property: "og:description", content: "AquaFlow Control Hub is a web application for managing and monitoring irrigation systems." },
      { name: "twitter:description", content: "AquaFlow Control Hub is a web application for managing and monitoring irrigation systems." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/aae2b914-e8e2-4ca4-bb86-fc3186437320/id-preview-6d595bc8--7d1709e1-d201-4602-9701-d1bc70f67a93.lovable.app-1777308122838.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/aae2b914-e8e2-4ca4-bb86-fc3186437320/id-preview-6d595bc8--7d1709e1-d201-4602-9701-d1bc70f67a93.lovable.app-1777308122838.png" }
    ],
    links: [{ rel: "stylesheet", href: appCss }]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "dark", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  return /* @__PURE__ */ jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
const $$splitComponentImporter$4 = () => import("./signup-Cm670jHS.js");
const Route$4 = createFileRoute("/signup")({
  head: () => ({
    meta: [{
      title: "Sign Up — AquaFlow"
    }, {
      name: "description",
      content: "Create your AquaFlow account."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./login-BbEabhpZ.js");
const Route$3 = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Login — AquaFlow"
    }, {
      name: "description",
      content: "Login to your AquaFlow dashboard."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./dashboard-CGmWTeDI.js");
const Route$2 = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard — AquaFlow"
    }, {
      name: "description",
      content: "Control and monitor your AquaFlow system."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./confirm-V2rpTVI3.js");
const Route$1 = createFileRoute("/confirm")({
  head: () => ({
    meta: [{
      title: "Confirm Subscription — AquaFlow"
    }, {
      name: "description",
      content: "Confirm your AquaFlow subscription."
    }]
  }),
  validateSearch: (search) => ({
    token: search.token ?? ""
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const heroImage = "/assets/hero-irrigation-CDaDho_i.jpg";
const $$splitComponentImporter = () => import("./index-CFyxCf2U.js");
const Route = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "AquaFlow — Smart Irrigation for a Greener Tomorrow"
    }, {
      name: "description",
      content: "Automated ESP32 irrigation system using soil moisture sensors. Save water, grow healthier plants."
    }, {
      property: "og:title",
      content: "AquaFlow — Smart Irrigation"
    }, {
      property: "og:description",
      content: "Automated ESP32 irrigation system. Save water, grow healthier plants."
    }, {
      property: "og:image",
      content: heroImage
    }, {
      name: "twitter:image",
      content: heroImage
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SignupRoute = Route$4.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$5
});
const LoginRoute = Route$3.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$5
});
const DashboardRoute = Route$2.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$5
});
const ConfirmRoute = Route$1.update({
  id: "/confirm",
  path: "/confirm",
  getParentRoute: () => Route$5
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$5
});
const rootRouteChildren = {
  IndexRoute,
  ConfirmRoute,
  DashboardRoute,
  LoginRoute,
  SignupRoute
};
const routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({ error, reset }) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-destructive",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
    false,
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  confirmSubscription as c,
  heroImage as h,
  router as r,
  useAuth as u
};
