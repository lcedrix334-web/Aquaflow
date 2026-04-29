import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { u as useAuth } from "./router-97rOjTFy.js";
import { c as cn, A as AquaLogo, B as Button } from "./button-BG0AlLm4.js";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import { LogOut, Mail, RefreshCw, Wifi, WifiOff, CheckCircle2, Sprout, Power, Gauge, Droplet, Activity, Cpu, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitives.Root.displayName;
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
function Dashboard() {
  const {
    user,
    loading,
    signOut,
    subscriptionStatus,
    subscriptionLoading,
    refreshSubscription
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: "/login"
      });
    }
  }, [loading, user, navigate]);
  const [mode, setMode] = useState("automatic");
  const [pumpOn, setPumpOn] = useState(true);
  const [valveOpen, setValveOpen] = useState(true);
  const [moisture, setMoisture] = useState(45);
  const [esp32Connected] = useState(true);
  const [history, setHistory] = useState(() => Array.from({
    length: 24
  }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    value: 35 + Math.round(Math.sin(i / 3) * 12 + Math.random() * 8)
  })));
  const [logs, setLogs] = useState([{
    id: 1,
    time: nowTime(-2),
    activity: "Pump turned ON",
    status: "Success"
  }, {
    id: 2,
    time: nowTime(-3),
    activity: "Valve opened",
    status: "Success"
  }, {
    id: 3,
    time: nowTime(-5),
    activity: "Soil moisture: 45%",
    status: "Info"
  }, {
    id: 4,
    time: nowTime(-8),
    activity: "System check",
    status: "Success"
  }, {
    id: 5,
    time: nowTime(-12),
    activity: "ESP32 connected",
    status: "Success"
  }]);
  const [lastUpdate, setLastUpdate] = useState(/* @__PURE__ */ new Date());
  useEffect(() => {
    const id = setInterval(() => {
      setLastUpdate(/* @__PURE__ */ new Date());
      setMoisture((m) => {
        let next = m;
        if (mode === "automatic") {
          if (m < 35 && !pumpOn) {
            setPumpOn(true);
            setValveOpen(true);
            pushLog("Auto: pump turned ON (low moisture)", "Success");
          } else if (m > 65 && pumpOn) {
            setPumpOn(false);
            setValveOpen(false);
            pushLog("Auto: pump turned OFF (target reached)", "Success");
          }
        }
        if (pumpOn && valveOpen) next = Math.min(85, m + 1.5 + Math.random());
        else next = Math.max(15, m - 0.6 - Math.random() * 0.5);
        return Math.round(next);
      });
    }, 2e3);
    return () => clearInterval(id);
  }, [mode, pumpOn, valveOpen]);
  useEffect(() => {
    const id = setInterval(() => {
      setHistory((h) => {
        const next = [...h.slice(1), {
          time: nowTime(0),
          value: moisture
        }];
        return next;
      });
    }, 5e3);
    return () => clearInterval(id);
  }, [moisture]);
  function pushLog(activity, status) {
    setLogs((l) => [{
      id: Date.now(),
      time: nowTime(0),
      activity,
      status
    }, ...l.slice(0, 9)]);
  }
  function togglePump() {
    if (mode === "automatic") {
      toast.error("Switch to Manual mode to control the pump");
      return;
    }
    setPumpOn((p) => {
      pushLog(`Pump turned ${!p ? "ON" : "OFF"}`, "Success");
      return !p;
    });
  }
  function toggleValve() {
    if (mode === "automatic") {
      toast.error("Switch to Manual mode to control the valve");
      return;
    }
    setValveOpen((v) => {
      pushLog(`Valve ${!v ? "opened" : "closed"}`, "Success");
      return !v;
    });
  }
  function handleModeChange(value) {
    const m = value;
    setMode(m);
    pushLog(`Mode switched to ${m === "automatic" ? "Automatic" : "Manual"}`, "Info");
  }
  const moistureStatus = useMemo(() => {
    if (moisture < 30) return {
      label: "Low",
      color: "text-destructive"
    };
    if (moisture > 70) return {
      label: "High",
      color: "text-water"
    };
    return {
      label: "Optimal",
      color: "text-leaf"
    };
  }, [moisture]);
  const flowRate = pumpOn && valveOpen ? (1.8 + Math.random() * 0.8).toFixed(1) : "0.0";
  if (loading || !user || subscriptionLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: "Loading dashboard..." }) });
  }
  if (subscriptionStatus === "pending" || subscriptionStatus === "none") {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
      /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto flex h-16 max-w-7xl items-center justify-between px-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx(AquaLogo, {}) }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => signOut(), className: "gap-2", children: [
          /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Logout" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("main", { className: "container mx-auto max-w-7xl px-4 py-8", children: /* @__PURE__ */ jsx("div", { className: "flex min-h-[60vh] items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "glass-card max-w-lg rounded-2xl p-10 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-water/10", children: /* @__PURE__ */ jsx(Mail, { className: "h-8 w-8 text-water" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Subscription Required" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Your account is not yet subscribed." }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Please check your email and confirm your subscription to activate your system." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-lg border border-water/20 bg-water/5 p-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: "Plan:" }),
            " AquaFlow Smart Irrigation"
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: "Price:" }),
            " ₱499 per month"
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: "Includes:" }),
            " System monitoring, automation, and maintenance support"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => refreshSubscription(), className: "gap-2 mx-auto", children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
            "Refresh Subscription Status"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Already confirmed? Click refresh to update your status." })
        ] })
      ] }) }) })
    ] });
  }
  const userName = user.user_metadata?.name || user.email?.split("@")[0] || "User";
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto flex h-16 max-w-7xl items-center justify-between px-4", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx(AquaLogo, {}) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "hidden items-center gap-2 rounded-full border border-border/50 bg-card/40 px-3 py-1.5 text-xs sm:flex", children: esp32Connected ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Wifi, { className: "h-3.5 w-3.5 text-leaf" }),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "ESP32" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-leaf", children: "Connected" })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(WifiOff, { className: "h-3.5 w-3.5 text-destructive" }),
          /* @__PURE__ */ jsx("span", { className: "text-destructive", children: "Disconnected" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "hidden items-center gap-2 rounded-full border border-leaf/30 bg-leaf/5 px-3 py-1.5 text-xs sm:flex", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-leaf" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-leaf", children: "Subscribed" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-leaf to-water text-xs font-bold text-primary-foreground", children: userName.charAt(0).toUpperCase() }),
          /* @__PURE__ */ jsx("span", { className: "hidden text-sm font-medium text-foreground sm:block", children: userName })
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => signOut(), className: "gap-2", children: [
          /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Logout" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto max-w-7xl px-4 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: "System Overview" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Real-time monitoring & control of your AquaFlow irrigation system." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsx(StatusCard, { label: "Soil Moisture", value: `${moisture}%`, sublabel: moistureStatus.label, sublabelClass: moistureStatus.color, icon: /* @__PURE__ */ jsx(Sprout, { className: "h-5 w-5" }), accent: "leaf", progress: moisture }),
        /* @__PURE__ */ jsx(StatusCard, { label: "Pump Status", value: pumpOn ? "ON" : "OFF", sublabel: pumpOn ? "Running" : "Idle", sublabelClass: pumpOn ? "text-leaf" : "text-muted-foreground", icon: /* @__PURE__ */ jsx(Power, { className: "h-5 w-5" }), accent: pumpOn ? "leaf" : "muted" }),
        /* @__PURE__ */ jsx(StatusCard, { label: "Valve Status", value: valveOpen ? "OPEN" : "CLOSED", sublabel: valveOpen ? "Water flowing" : "Sealed", sublabelClass: valveOpen ? "text-water" : "text-muted-foreground", icon: /* @__PURE__ */ jsx(Gauge, { className: "h-5 w-5" }), accent: valveOpen ? "water" : "muted" }),
        /* @__PURE__ */ jsx(StatusCard, { label: "Water Flow", value: `${flowRate} L/m`, sublabel: "Flow rate", sublabelClass: "text-water", icon: /* @__PURE__ */ jsx(Droplet, { className: "h-5 w-5" }), accent: "water" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-2xl p-6 lg:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Moisture Trend" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Last 24 readings" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "rounded-full border border-border/50 bg-background/40 px-3 py-1 text-xs text-muted-foreground", children: "Live" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: history, children: [
            /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "moistureGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "oklch(0.78 0.19 152)", stopOpacity: 0.5 }),
              /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "oklch(0.72 0.16 230)", stopOpacity: 0 })
            ] }) }),
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "oklch(1 0 0 / 0.06)" }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "time", stroke: "oklch(0.72 0.03 230)", fontSize: 11, tickLine: false, axisLine: false, interval: 3 }),
            /* @__PURE__ */ jsx(YAxis, { stroke: "oklch(0.72 0.03 230)", fontSize: 11, tickLine: false, axisLine: false, domain: [0, 100] }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
              background: "oklch(0.22 0.045 252)",
              border: "1px solid oklch(1 0 0 / 0.1)",
              borderRadius: "0.5rem",
              color: "oklch(0.97 0.01 220)"
            } }),
            /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "value", stroke: "oklch(0.78 0.19 152)", strokeWidth: 2, fill: "url(#moistureGrad)" })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-2xl p-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Control Panel" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Mode & manual overrides" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: "Mode" }),
            /* @__PURE__ */ jsx(Tabs, { value: mode, onValueChange: handleModeChange, className: "mt-2", children: /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
              /* @__PURE__ */ jsx(TabsTrigger, { value: "automatic", children: "Automatic" }),
              /* @__PURE__ */ jsx(TabsTrigger, { value: "manual", children: "Manual" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-4", children: [
            /* @__PURE__ */ jsx(ControlRow, { label: "Pump", state: pumpOn ? "ON" : "OFF", checked: pumpOn, onChange: togglePump, disabled: mode === "automatic", accent: "leaf" }),
            /* @__PURE__ */ jsx(ControlRow, { label: "Valve", state: valveOpen ? "OPEN" : "CLOSED", checked: valveOpen, onChange: toggleValve, disabled: mode === "automatic", accent: "water" })
          ] }),
          mode === "automatic" && /* @__PURE__ */ jsx("p", { className: "mt-4 rounded-lg border border-leaf/20 bg-leaf/5 p-3 text-xs text-leaf", children: "Automatic mode is on — AquaFlow controls the pump and valve based on live soil moisture readings." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-2xl p-6 lg:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5 text-leaf" }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Recent Activity" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 overflow-hidden rounded-lg border border-border/40", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-background/40", children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-xs uppercase tracking-wider text-muted-foreground", children: [
              /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5 font-medium", children: "Time" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5 font-medium", children: "Activity" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5 font-medium", children: "Status" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: logs.map((log) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border/30 transition-colors hover:bg-background/40", children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 font-mono text-xs text-muted-foreground", children: log.time }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-foreground", children: log.activity }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsx(StatusPill, { status: log.status }) })
            ] }, log.id)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-2xl p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Cpu, { className: "h-5 w-5 text-water" }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-foreground", children: "System Info" })
          ] }),
          /* @__PURE__ */ jsxs("dl", { className: "mt-4 space-y-3 text-sm", children: [
            /* @__PURE__ */ jsx(InfoRow, { label: "Device", value: "AquaFlow ESP32" }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Status", value: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-leaf", children: [
              /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-leaf" }),
              "Connected"
            ] }) }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Uptime", value: "2d 14h 32m" }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Last Update", value: lastUpdate.toLocaleTimeString() }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Firmware", value: "v1.2.0" }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Mode", value: mode === "automatic" ? "Automatic" : "Manual" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function StatusCard({
  label,
  value,
  sublabel,
  sublabelClass = "",
  icon,
  accent,
  progress
}) {
  const accentClasses = {
    leaf: "bg-leaf/10 text-leaf",
    water: "bg-water/10 text-water",
    muted: "bg-muted text-muted-foreground"
  };
  return /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-2xl p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: label }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 text-3xl font-bold text-foreground", children: value }),
        /* @__PURE__ */ jsx("div", { className: `mt-1 text-xs font-medium ${sublabelClass}`, children: sublabel })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-xl ${accentClasses[accent]}`, children: icon })
    ] }),
    typeof progress === "number" && /* @__PURE__ */ jsx("div", { className: "mt-4 h-1.5 overflow-hidden rounded-full bg-background/50", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-leaf to-water transition-all duration-500", style: {
      width: `${Math.min(100, Math.max(0, progress))}%`
    } }) })
  ] });
}
function ControlRow({
  label,
  state,
  checked,
  onChange,
  disabled,
  accent
}) {
  const dotClass = checked ? accent === "leaf" ? "bg-leaf shadow-[0_0_10px] shadow-leaf" : "bg-water shadow-[0_0_10px] shadow-water" : "bg-muted-foreground/40";
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border/40 bg-background/30 p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: `h-2.5 w-2.5 rounded-full transition-all ${dotClass}` }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-foreground", children: label }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: state })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Switch, { checked, onCheckedChange: onChange, disabled })
  ] });
}
function StatusPill({
  status
}) {
  const map = {
    Success: {
      class: "bg-leaf/10 text-leaf",
      icon: CheckCircle2
    },
    Info: {
      class: "bg-water/10 text-water",
      icon: Activity
    },
    Warning: {
      class: "bg-destructive/10 text-destructive",
      icon: AlertCircle
    }
  };
  const Icon = map[status].icon;
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${map[status].class}`, children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
    status
  ] });
}
function InfoRow({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/30 pb-2 last:border-b-0 last:pb-0", children: [
    /* @__PURE__ */ jsx("dt", { className: "text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("dd", { className: "font-medium text-foreground", children: value })
  ] });
}
function nowTime(offsetMinutes) {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1e3);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
export {
  Dashboard as component
};
