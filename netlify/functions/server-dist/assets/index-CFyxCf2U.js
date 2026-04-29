import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { A as AquaLogo, B as Button } from "./button-BG0AlLm4.js";
import { u as useAuth, h as heroImage } from "./router-97rOjTFy.js";
import { LogOut, Sprout, ArrowRight, Leaf, Droplet, DollarSign, Wrench, Cpu, GitBranch } from "lucide-react";
import "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@supabase/supabase-js";
import "sonner";
function PublicNav() {
  const { user, signOut } = useAuth();
  return /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto flex h-16 max-w-6xl items-center justify-between px-4", children: [
    /* @__PURE__ */ jsx(Link, { to: "/", className: "transition-opacity hover:opacity-80", children: /* @__PURE__ */ jsx(AquaLogo, {}) }),
    /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-1 sm:gap-2", children: [
      /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          activeProps: { className: "text-leaf" },
          activeOptions: { exact: true },
          children: "Home"
        }
      ) }),
      user ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(Link, { to: "/dashboard", activeProps: { className: "text-leaf" }, children: "Dashboard" }) }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => signOut(),
            className: "gap-2",
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Logout" })
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(Link, { to: "/login", children: "Login" }) }),
        /* @__PURE__ */ jsx(Button, { asChild: true, variant: "leaf", size: "sm", children: /* @__PURE__ */ jsx(Link, { to: "/signup", children: "Sign Up" }) })
      ] })
    ] })
  ] }) });
}
const features = [{
  icon: Leaf,
  title: "Smart Automation",
  desc: "Automatically waters your plants based on real-time soil moisture data."
}, {
  icon: Droplet,
  title: "Water Efficient",
  desc: "Reduces water waste by delivering the right amount of water at the right time."
}, {
  icon: DollarSign,
  title: "Low Cost",
  desc: "Built with affordable components for maximum value and efficiency."
}, {
  icon: Wrench,
  title: "Easy to Deploy",
  desc: "Simple to install and use for small farms, gardens, and home setups."
}];
const steps = [{
  n: "01",
  title: "Sense",
  icon: Sprout,
  desc: "Soil moisture sensors continuously monitor the soil conditions."
}, {
  n: "02",
  title: "Analyze",
  icon: Cpu,
  desc: "ESP32 analyzes the data and decides the best action to take."
}, {
  n: "03",
  title: "Act",
  icon: GitBranch,
  desc: "Water pump and valve activate to irrigate through drip emitters."
}];
function Home() {
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-screen", children: [
    /* @__PURE__ */ jsx(PublicNav, {}),
    /* @__PURE__ */ jsx("section", { className: "relative overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-3 py-1 text-xs font-medium text-leaf", children: [
          /* @__PURE__ */ jsx(Sprout, { className: "h-3.5 w-3.5" }),
          "Powered by ESP32 & soil sensors"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-6xl", children: [
          "Smart Irrigation.",
          /* @__PURE__ */ jsx("br", {}),
          "For a",
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-gradient-leaf-water", children: "Greener" }),
          " Tomorrow."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-lg text-base text-muted-foreground md:text-lg", children: "AquaFlow is an automated irrigation system that uses ESP32 and soil moisture sensors to deliver the right amount of water at the right time — reducing waste and improving plant health." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Button, { asChild: true, variant: "hero", size: "lg", children: /* @__PURE__ */ jsxs(Link, { to: "/signup", children: [
            "Get Started ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", size: "lg", children: /* @__PURE__ */ jsx(Link, { to: "/login", children: "Login" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute -inset-4 rounded-3xl bg-gradient-to-br from-leaf/20 via-transparent to-water/20 blur-3xl" }),
        /* @__PURE__ */ jsx("div", { className: "relative overflow-hidden rounded-3xl border border-border/50 glass-card", children: /* @__PURE__ */ jsx("img", { src: heroImage, alt: "AquaFlow smart irrigation system with ESP32, soil sensors, and drip emitters watering green plants under a starry sky", width: 1920, height: 1080, className: "h-auto w-full object-cover" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto max-w-6xl px-4 py-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground md:text-4xl", children: "Why AquaFlow?" }),
        /* @__PURE__ */ jsx("div", { className: "mx-auto mt-3 h-1 w-16 rounded bg-leaf" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4", children: features.map((f) => /* @__PURE__ */ jsxs("div", { className: "glass-card group rounded-2xl p-6 transition-transform hover:-translate-y-1", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-leaf/10 text-leaf transition-colors group-hover:bg-leaf/20", children: /* @__PURE__ */ jsx(f.icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-semibold text-foreground", children: f.title }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: f.desc })
      ] }, f.title)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto max-w-6xl px-4 py-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground md:text-4xl", children: "How It Works" }),
        /* @__PURE__ */ jsx("div", { className: "mx-auto mt-3 h-1 w-16 rounded bg-water" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-12 grid gap-5 md:grid-cols-3", children: steps.map((s) => /* @__PURE__ */ jsxs("div", { className: "glass-card relative rounded-2xl p-6", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-water/70", children: s.n }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(s.icon, { className: "h-5 w-5 text-leaf" }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-foreground", children: s.title })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: s.desc })
      ] }, s.n)) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto max-w-4xl px-4 py-20", children: /* @__PURE__ */ jsxs("div", { className: "glass-card relative overflow-hidden rounded-3xl p-10 text-center md:p-14", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-leaf/10 via-transparent to-water/10" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground md:text-3xl", children: "Smarter Irrigation. Healthier Plants. Better Future." }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-3 max-w-xl text-muted-foreground", children: "Join AquaFlow and take control of your irrigation system today." }),
        /* @__PURE__ */ jsx(Button, { asChild: true, variant: "hero", size: "lg", className: "mt-7", children: /* @__PURE__ */ jsxs(Link, { to: "/signup", children: [
          "Get Started Now ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("footer", { className: "border-t border-border/40 py-8 text-center text-sm text-muted-foreground", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " AquaFlow — Smart irrigation for a greener tomorrow."
    ] })
  ] });
}
export {
  Home as component
};
