import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { u as useAuth } from "./router-97rOjTFy.js";
import { A as AquaLogo, B as Button } from "./button-BG0AlLm4.js";
import { L as Label, I as Input } from "./label-De4Mh788.js";
import { User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function SignupPage() {
  const {
    signUp,
    user
  } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  if (user) {
    navigate({
      to: "/dashboard"
    });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const {
      error
    } = await signUp(name, email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Account created! Check your email to confirm your subscription.");
    navigate({
      to: "/dashboard"
    });
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative flex min-h-screen items-center justify-center px-4 py-12", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 starfield" }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-8 flex justify-center", children: /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx(AquaLogo, { size: "lg" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-2xl p-8 glow-water", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Create Account" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: "Sign up to get started with AquaFlow" })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Full Name" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { id: "name", required: true, placeholder: "Jane Doe", value: name, onChange: (e) => setName(e.target.value), className: "pl-10" })
            ] })
          ] }),
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
              /* @__PURE__ */ jsx(Input, { id: "password", type: "password", required: true, autoComplete: "new-password", placeholder: "At least 6 characters", value: password, onChange: (e) => setPassword(e.target.value), className: "pl-10" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "confirm", children: "Confirm Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { id: "confirm", type: "password", required: true, autoComplete: "new-password", placeholder: "Confirm your password", value: confirm, onChange: (e) => setConfirm(e.target.value), className: "pl-10" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-water/20 bg-water/5 p-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground mb-1", children: "Subscription Notice" }),
            /* @__PURE__ */ jsxs("p", { children: [
              "By creating an account, you agree to receive a confirmation email for our subscription service. AquaFlow operates on a",
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: "₱499 monthly plan" }),
              " which includes system automation, monitoring, and maintenance. Subscription activation requires user confirmation via email."
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", variant: "hero", size: "lg", className: "w-full", disabled: loading, children: loading ? "Creating account..." : "Sign Up" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "/login", className: "font-medium text-leaf hover:underline", children: "Login" })
        ] })
      ] })
    ] })
  ] });
}
export {
  SignupPage as component
};
