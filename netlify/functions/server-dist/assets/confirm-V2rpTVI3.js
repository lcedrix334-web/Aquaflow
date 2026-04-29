import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useSearch, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { c as confirmSubscription } from "./router-97rOjTFy.js";
import { A as AquaLogo, B as Button } from "./button-BG0AlLm4.js";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import "@supabase/supabase-js";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
function ConfirmPage() {
  const {
    token
  } = useSearch({
    strict: false
  });
  const [status, setStatus] = useState("loading");
  const [email, setEmail] = useState(null);
  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    confirmSubscription(token).then((result) => {
      if (result.success) {
        setStatus("success");
        setEmail(result.email ?? null);
      } else {
        setStatus("error");
      }
    }).catch(() => {
      setStatus("error");
    });
  }, [token]);
  return /* @__PURE__ */ jsxs("div", { className: "relative flex min-h-screen items-center justify-center px-4 py-12", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 starfield" }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-8 flex justify-center", children: /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx(AquaLogo, { size: "lg" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-2xl p-8 text-center", children: [
        status === "loading" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-water/10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 text-water animate-spin" }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Confirming Subscription..." }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Please wait while we activate your AquaFlow subscription." })
        ] }),
        status === "success" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-leaf/10", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-8 w-8 text-leaf" }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Subscription Activated!" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: email ? `Your subscription for ${email} is now active.` : "Your AquaFlow subscription is now active." }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Plan: AquaFlow Smart Irrigation — ₱499/month" }),
          /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsx(Button, { variant: "hero", size: "lg", className: "w-full", children: "Go to Dashboard" }) }) })
        ] }),
        status === "error" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsx(XCircle, { className: "h-8 w-8 text-destructive" }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Confirmation Failed" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The confirmation link is invalid or has expired. Please check your email for a valid link or contact support." }),
          /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "lg", className: "w-full", children: "Go Home" }) }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  ConfirmPage as component
};
