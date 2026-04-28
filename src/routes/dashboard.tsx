import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AquaLogo } from "@/components/AquaLogo";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";
import {
  Droplet,
  Power,
  Gauge,
  Wifi,
  WifiOff,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Activity,
  Cpu,
  Sprout,
  Mail,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AquaFlow" },
      { name: "description", content: "Control and monitor your AquaFlow system." },
    ],
  }),
  component: Dashboard,
});

interface MoisturePoint {
  time: string;
  value: number;
}

interface ActivityLog {
  id: number;
  time: string;
  activity: string;
  status: "Success" | "Info" | "Warning";
}

function Dashboard() {
  const { user, loading, signOut, subscriptionStatus, subscriptionLoading, refreshSubscription } = useAuth();
  const navigate = useNavigate();

  // ---- Auth guard ----
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  // ---- Simulated system state ----
  const [mode, setMode] = useState<"automatic" | "manual">("automatic");
  const [pumpOn, setPumpOn] = useState(true);
  const [valveOpen, setValveOpen] = useState(true);
  const [moisture, setMoisture] = useState(45);
  const [esp32Connected] = useState(true);
  const [history, setHistory] = useState<MoisturePoint[]>(() =>
    Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, "0")}:00`,
      value: 35 + Math.round(Math.sin(i / 3) * 12 + Math.random() * 8),
    }))
  );
  const [logs, setLogs] = useState<ActivityLog[]>([
    { id: 1, time: nowTime(-2), activity: "Pump turned ON", status: "Success" },
    { id: 2, time: nowTime(-3), activity: "Valve opened", status: "Success" },
    { id: 3, time: nowTime(-5), activity: "Soil moisture: 45%", status: "Info" },
    { id: 4, time: nowTime(-8), activity: "System check", status: "Success" },
    { id: 5, time: nowTime(-12), activity: "ESP32 connected", status: "Success" },
  ]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // ---- Real-time simulation tick ----
  useEffect(() => {
    const id = setInterval(() => {
      setLastUpdate(new Date());
      setMoisture((m) => {
        let next = m;
        if (mode === "automatic") {
          // Auto: pump on when dry, off when wet
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
    }, 2000);
    return () => clearInterval(id);
  }, [mode, pumpOn, valveOpen]);

  // ---- Update chart history ----
  useEffect(() => {
    const id = setInterval(() => {
      setHistory((h) => {
        const next = [...h.slice(1), { time: nowTime(0), value: moisture }];
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [moisture]);

  function pushLog(activity: string, status: ActivityLog["status"]) {
    setLogs((l) => [
      { id: Date.now(), time: nowTime(0), activity, status },
      ...l.slice(0, 9),
    ]);
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

  function handleModeChange(value: string) {
    const m = value as "automatic" | "manual";
    setMode(m);
    pushLog(`Mode switched to ${m === "automatic" ? "Automatic" : "Manual"}`, "Info");
  }

  const moistureStatus = useMemo(() => {
    if (moisture < 30) return { label: "Low", color: "text-destructive" };
    if (moisture > 70) return { label: "High", color: "text-water" };
    return { label: "Optimal", color: "text-leaf" };
  }, [moisture]);

  const flowRate = pumpOn && valveOpen ? (1.8 + Math.random() * 0.8).toFixed(1) : "0.0";

  if (loading || !user || subscriptionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  // Subscription gate: show notice if not yet active
  if (subscriptionStatus === "pending" || subscriptionStatus === "none") {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
          <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link to="/">
              <AquaLogo />
            </Link>
            <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>
        <main className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="glass-card max-w-lg rounded-2xl p-10 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-water/10">
                <Mail className="h-8 w-8 text-water" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Subscription Required</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Your account is not yet subscribed.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Please check your email and confirm your subscription to activate your system.
              </p>
              <div className="mt-4 rounded-lg border border-water/20 bg-water/5 p-3 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">Plan:</span> AquaFlow Smart Irrigation</p>
                <p><span className="font-medium text-foreground">Price:</span> ₱499 per month</p>
                <p><span className="font-medium text-foreground">Includes:</span> System monitoring, automation, and maintenance support</p>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshSubscription()}
                  className="gap-2 mx-auto"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Subscription Status
                </Button>
                <p className="text-xs text-muted-foreground">
                  Already confirmed? Click refresh to update your status.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const userName =
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "User";

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/">
            <AquaLogo />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border/50 bg-card/40 px-3 py-1.5 text-xs sm:flex">
              {esp32Connected ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-leaf" />
                  <span className="text-muted-foreground">ESP32</span>
                  <span className="font-medium text-leaf">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-destructive">Disconnected</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-leaf/30 bg-leaf/5 px-3 py-1.5 text-xs sm:flex">
                <CheckCircle2 className="h-3.5 w-3.5 text-leaf" />
                <span className="font-medium text-leaf">Subscribed</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-leaf to-water text-xs font-bold text-primary-foreground">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-foreground sm:block">
                {userName}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            System Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time monitoring & control of your AquaFlow irrigation system.
          </p>
        </div>

        {/* Status cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            label="Soil Moisture"
            value={`${moisture}%`}
            sublabel={moistureStatus.label}
            sublabelClass={moistureStatus.color}
            icon={<Sprout className="h-5 w-5" />}
            accent="leaf"
            progress={moisture}
          />
          <StatusCard
            label="Pump Status"
            value={pumpOn ? "ON" : "OFF"}
            sublabel={pumpOn ? "Running" : "Idle"}
            sublabelClass={pumpOn ? "text-leaf" : "text-muted-foreground"}
            icon={<Power className="h-5 w-5" />}
            accent={pumpOn ? "leaf" : "muted"}
          />
          <StatusCard
            label="Valve Status"
            value={valveOpen ? "OPEN" : "CLOSED"}
            sublabel={valveOpen ? "Water flowing" : "Sealed"}
            sublabelClass={valveOpen ? "text-water" : "text-muted-foreground"}
            icon={<Gauge className="h-5 w-5" />}
            accent={valveOpen ? "water" : "muted"}
          />
          <StatusCard
            label="Water Flow"
            value={`${flowRate} L/m`}
            sublabel="Flow rate"
            sublabelClass="text-water"
            icon={<Droplet className="h-5 w-5" />}
            accent="water"
          />
        </div>

        {/* Chart + Controls */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="glass-card rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Moisture Trend
                </h2>
                <p className="text-xs text-muted-foreground">Last 24 readings</p>
              </div>
              <div className="rounded-full border border-border/50 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                Live
              </div>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.78 0.19 152)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.72 0.16 230)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                  <XAxis
                    dataKey="time"
                    stroke="oklch(0.72 0.03 230)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval={3}
                  />
                  <YAxis
                    stroke="oklch(0.72 0.03 230)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.22 0.045 252)",
                      border: "1px solid oklch(1 0 0 / 0.1)",
                      borderRadius: "0.5rem",
                      color: "oklch(0.97 0.01 220)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.78 0.19 152)"
                    strokeWidth={2}
                    fill="url(#moistureGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Control Panel</h2>
            <p className="text-xs text-muted-foreground">Mode & manual overrides</p>

            <div className="mt-5">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Mode
              </div>
              <Tabs value={mode} onValueChange={handleModeChange} className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="automatic">Automatic</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="mt-6 space-y-4">
              <ControlRow
                label="Pump"
                state={pumpOn ? "ON" : "OFF"}
                checked={pumpOn}
                onChange={togglePump}
                disabled={mode === "automatic"}
                accent="leaf"
              />
              <ControlRow
                label="Valve"
                state={valveOpen ? "OPEN" : "CLOSED"}
                checked={valveOpen}
                onChange={toggleValve}
                disabled={mode === "automatic"}
                accent="water"
              />
            </div>

            {mode === "automatic" && (
              <p className="mt-4 rounded-lg border border-leaf/20 bg-leaf/5 p-3 text-xs text-leaf">
                Automatic mode is on — AquaFlow controls the pump and valve based on
                live soil moisture readings.
              </p>
            )}
          </div>
        </div>

        {/* Activity + System info */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="glass-card rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-leaf" />
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead className="bg-background/40">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Time</th>
                    <th className="px-4 py-2.5 font-medium">Activity</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t border-border/30 transition-colors hover:bg-background/40"
                    >
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {log.time}
                      </td>
                      <td className="px-4 py-2.5 text-foreground">{log.activity}</td>
                      <td className="px-4 py-2.5">
                        <StatusPill status={log.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-water" />
              <h2 className="text-lg font-semibold text-foreground">System Info</h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <InfoRow label="Device" value="AquaFlow ESP32" />
              <InfoRow
                label="Status"
                value={
                  <span className="inline-flex items-center gap-1.5 text-leaf">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-leaf" />
                    Connected
                  </span>
                }
              />
              <InfoRow label="Uptime" value="2d 14h 32m" />
              <InfoRow
                label="Last Update"
                value={lastUpdate.toLocaleTimeString()}
              />
              <InfoRow label="Firmware" value="v1.2.0" />
              <InfoRow label="Mode" value={mode === "automatic" ? "Automatic" : "Manual"} />
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}

// ---- Helper components ----

function StatusCard({
  label,
  value,
  sublabel,
  sublabelClass = "",
  icon,
  accent,
  progress,
}: {
  label: string;
  value: string;
  sublabel: string;
  sublabelClass?: string;
  icon: React.ReactNode;
  accent: "leaf" | "water" | "muted";
  progress?: number;
}) {
  const accentClasses = {
    leaf: "bg-leaf/10 text-leaf",
    water: "bg-water/10 text-water",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-3xl font-bold text-foreground">{value}</div>
          <div className={`mt-1 text-xs font-medium ${sublabelClass}`}>{sublabel}</div>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClasses[accent]}`}
        >
          {icon}
        </div>
      </div>
      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-leaf to-water transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ControlRow({
  label,
  state,
  checked,
  onChange,
  disabled,
  accent,
}: {
  label: string;
  state: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  accent: "leaf" | "water";
}) {
  const dotClass = checked
    ? accent === "leaf"
      ? "bg-leaf shadow-[0_0_10px] shadow-leaf"
      : "bg-water shadow-[0_0_10px] shadow-water"
    : "bg-muted-foreground/40";
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/30 p-4">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full transition-all ${dotClass}`} />
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{state}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

function StatusPill({ status }: { status: ActivityLog["status"] }) {
  const map = {
    Success: { class: "bg-leaf/10 text-leaf", icon: CheckCircle2 },
    Info: { class: "bg-water/10 text-water", icon: Activity },
    Warning: { class: "bg-destructive/10 text-destructive", icon: AlertCircle },
  };
  const Icon = map[status].icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${map[status].class}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/30 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function nowTime(offsetMinutes: number) {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
