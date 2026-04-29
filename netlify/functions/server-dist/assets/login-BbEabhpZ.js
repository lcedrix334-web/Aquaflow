import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { u as useAuth } from "./router-97rOjTFy.js";
import { A as AquaLogo, B as Button } from "./button-BG0AlLm4.js";
import { L as Label, I as Input } from "./label-De4Mh788.js";
import { Mail, Lock, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function LoginPage() {
  const {
    signIn,
    user
  } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  if (user) {
    navigate({
      to: "/dashboard"
    });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Welcome back!");
    navigate({
      to: "/dashboard"
    });
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative flex min-h-screen items-center justify-center px-4 py-12", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 starfield" }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-8 flex justify-center", children: /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx(AquaLogo, { size: "lg" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-2xl p-8 glow-leaf", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Welcome Back!" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: "Login to access your dashboard" })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { id: "email", type: "email", required: true, autoComplete: "email", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), className: "pl-10" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { id: "password", type: showPwd ? "text" : "password", required: true, autoComplete: "current-password", placeholder: "••••••••", value: password, onChange: (e) => setPassword(e.target.value), className: "px-10" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowPwd((v) => !v), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", "aria-label": showPwd ? "Hide password" : "Show password", children: showPwd ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", variant: "leaf", size: "lg", className: "w-full", disabled: loading, children: loading ? "Logging in..." : "Login" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
          "Don't have an account?",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "/signup", className: "font-medium text-leaf hover:underline", children: "Sign Up" })
        ] })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
