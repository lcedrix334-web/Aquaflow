import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AquaLogo } from "@/components/AquaLogo";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
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
  Wifi,
  WifiOff,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Activity,
  Cpu,
  Sprout,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const deviceId = import.meta.env.VITE_DEVICE_ID || "AF-001";

  // ---- Auth guard ----
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  // ---- Real system state ----
  const [mode, setMode] = useState<"automatic" | "manual">("automatic");
  const [soil1, setSoil1] = useState(0);
  const [soil2, setSoil2] = useState(0);
  const [soil3, setSoil3] = useState(0);
  const [relay1, setRelay1] = useState(false);
  const [relay2, setRelay2] = useState(false);
  const [relay3, setRelay3] = useState(false);
  const [relay4, setRelay4] = useState(false);
  const [esp32Connected, setEsp32Connected] = useState(false);
  const [lastSensorTime, setLastSensorTime] = useState<Date | null>(null);
  const [history, setHistory] = useState<MoisturePoint[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [systemReady, setSystemReady] = useState(false);

  // ---- Fetch initial data ----
  useEffect(() => {
    async function fetchInitialData() {
      const { data: sensorData, error: sensorError } = await supabase
        .from("sensor_data")
        .select("*")
        .eq("device_id", deviceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (sensorError) {
        console.error("Error fetching sensor data:", sensorError);
      }

      if (!sensorError && sensorData) {
        setSoil1(sensorData.soil1);
        setSoil2(sensorData.soil2);
        setSoil3(sensorData.soil3);
        setRelay1(sensorData.relay1);
        setRelay2(sensorData.relay2);
        setRelay3(sensorData.relay3);
        setRelay4(sensorData.relay4);
        setLastSensorTime(new Date(sensorData.created_at));
        setLastUpdate(new Date(sensorData.created_at));
        setSystemReady(true);
      }

      const { data: controlData, error: controlError } = await supabase
        .from("control_status")
        .select("*")
        .eq("device_id", deviceId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (controlError) {
        console.error("Error fetching control status:", controlError);
      }

      if (!controlError && controlData) {
        setMode(controlData.mode as "automatic" | "manual");
        setRelay1(controlData.relay1);
        setRelay2(controlData.relay2);
        setRelay3(controlData.relay3);
        setRelay4(controlData.relay4);
      }

      const { data: historyData, error: historyError } = await supabase
        .from("sensor_data")
        .select("created_at, soil1")
        .eq("device_id", deviceId)
        .order("created_at", { ascending: true })
        .limit(24);

      if (historyError) {
        console.error("Error fetching history data:", historyError);
      }

      if (!historyError && historyData) {
        const historyPoints: MoisturePoint[] = historyData.map((d) => ({
          time: new Date(d.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          value: d.soil1,
        }));
        setHistory(historyPoints);
      }
    }

    fetchInitialData();
  }, [deviceId]);

  // ---- Supabase realtime subscriptions ----
  useEffect(() => {
    const sensorChannel = supabase
      .channel("sensor_data_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sensor_data",
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setSoil1(newData.soil1);
          setSoil2(newData.soil2);
          setSoil3(newData.soil3);
          // Only sync relay states from ESP32 during automatic mode
          if (mode === "automatic") {
            setRelay1(newData.relay1);
            setRelay2(newData.relay2);
            setRelay3(newData.relay3);
            setRelay4(newData.relay4);
          }
          setLastSensorTime(new Date(newData.created_at));
          setLastUpdate(new Date(newData.created_at));
          setHistory((h) => {
            const updated = [
              ...h,
              {
                time: new Date(newData.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                value: newData.soil1,
              },
            ];
            return updated.slice(-24);
          });
          pushLog("Sensor update received", "Info");
        }
      )
      .subscribe();

    const controlChannel = supabase
      .channel("control_status_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "control_status",
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setMode(newData.mode as "automatic" | "manual");
          setRelay1(newData.relay1);
          setRelay2(newData.relay2);
          setRelay3(newData.relay3);
          setRelay4(newData.relay4);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sensorChannel);
      supabase.removeChannel(controlChannel);
    };
  }, [deviceId, mode]);

  // ---- ESP32 connection status check ----
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastSensorTime) return;
      const now = new Date();
      const diff = Math.abs(now.getTime() - lastSensorTime.getTime());
      setEsp32Connected(diff <= 30000);
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [lastSensorTime]);

  // ---- Log connection changes ----
  useEffect(() => {
    if (lastSensorTime) {
      const wasConnected = esp32Connected;
      const now = new Date();
      const diff = Math.abs(now.getTime() - lastSensorTime.getTime());
      const isConnected = diff <= 30000;
      if (wasConnected !== isConnected && logs.length > 0) {
        pushLog(`ESP32 ${isConnected ? "connected" : "disconnected"}`, isConnected ? "Success" : "Warning");
      }
    }
  }, [esp32Connected, lastSensorTime]);

  function pushLog(activity: string, status: ActivityLog["status"]) {
    setLogs((l) => [
      { id: Date.now(), time: nowTime(0), activity, status },
      ...l.slice(0, 9),
    ]);
  }

  async function toggleRelay(
    relayNum: 1 | 2 | 3 | 4
  ) {
    if (mode === "automatic") {
      toast.error(
        "Switch to Manual mode first"
      );
      return;
    }

    const relayMap = {
      1: relay1,
      2: relay2,
      3: relay3,
      4: relay4,
    };

    const relayKey =
      `relay${relayNum}` as
      "relay1" |
      "relay2" |
      "relay3" |
      "relay4";

    const newValue =
      !relayMap[relayNum];

    const { data, error } =
    await supabase
      .from("control_status")
      .update({
        [relayKey]: newValue,
        updated_at: new Date().toISOString()
      })
      .eq("device_id", deviceId)
      .select();

    if(error)
    {
      console.error(error);

      toast.error(
      "Failed to update relay"
      );

      return;
    }

    // Immediate UI update

    switch(relayNum)
    {
      case 1:
        setRelay1(newValue);
        break;

      case 2:
        setRelay2(newValue);
        break;

      case 3:
        setRelay3(newValue);
        break;

      case 4:
        setRelay4(newValue);
        break;
    }

    pushLog(
      `${
        relayNum===1
        ? "Main Pump"
        : `Valve ${relayNum-1}` 
      } ${
        newValue
        ? "ON"
        : "OFF"
      }`,
      "Success"
    );
  }

  async function handleModeChange(value: string) {
    const newMode = value as "automatic" | "manual";

    const { error } = await supabase
      .from("control_status")
      .update({
        mode: newMode,
        updated_at: new Date().toISOString()
      })
      .eq("device_id", deviceId);

    if (error) {
      console.error(error);
      toast.error("Failed to update mode");
      return;
    }

    setMode(newMode);
    pushLog(`Mode switched to ${newMode === "automatic" ? "Automatic" : "Manual"}`, "Info");
  }

  const getMoistureStatus = (value: number) => {
    if (value < 30) return { label: "Low", color: "text-destructive" };
    if (value > 70) return { label: "High", color: "text-water" };
    return { label: "Optimal", color: "text-leaf" };
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!systemReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center py-8">
          Waiting for ESP32 data...
        </div>
      </div>
    );
  }

  const firstName =
    (user as any)?.user_metadata?.firstName || "User";

  const lastName =
    (user as any)?.user_metadata?.lastName || "";

  const displayName = lastName ? `${firstName} ${lastName}` : firstName;

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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-leaf to-water text-xs font-bold text-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-foreground sm:block">
                {displayName}
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
            label="Zone 1 Moisture"
            value={`${soil1}%`}
            sublabel={getMoistureStatus(soil1).label}
            sublabelClass={getMoistureStatus(soil1).color}
            icon={<Sprout className="h-5 w-5" />}
            accent="leaf"
            progress={soil1}
          />
          <StatusCard
            label="Zone 2 Moisture"
            value={`${soil2}%`}
            sublabel={getMoistureStatus(soil2).label}
            sublabelClass={getMoistureStatus(soil2).color}
            icon={<Sprout className="h-5 w-5" />}
            accent="leaf"
            progress={soil2}
          />
          <StatusCard
            label="Zone 3 Moisture"
            value={`${soil3}%`}
            sublabel={getMoistureStatus(soil3).label}
            sublabelClass={getMoistureStatus(soil3).color}
            icon={<Sprout className="h-5 w-5" />}
            accent="leaf"
            progress={soil3}
          />
          <StatusCard
            label="Active Zones"
            value={`${[relay2, relay3, relay4].filter(Boolean).length}/3`}
            sublabel="Valves open"
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
label="Main Water Pump"
state={relay1 ? "ON" : "OFF"}
checked={relay1}
onChange={() => toggleRelay(1)}
disabled={mode==="automatic"}
accent="water"
/>

<ControlRow
label="Zone 1 Valve"
state={relay2 ? "OPEN":"CLOSED"}
checked={relay2}
onChange={() => toggleRelay(2)}
disabled={mode==="automatic"}
accent="leaf"
/>

<ControlRow
label="Zone 2 Valve"
state={relay3 ? "OPEN":"CLOSED"}
checked={relay3}
onChange={() => toggleRelay(3)}
disabled={mode==="automatic"}
accent="leaf"
/>

<ControlRow
label="Zone 3 Valve"
state={relay4 ? "OPEN":"CLOSED"}
checked={relay4}
onChange={() => toggleRelay(4)}
disabled={mode==="automatic"}
accent="leaf"
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
                  esp32Connected ? (
                    <span className="inline-flex items-center gap-1.5 text-leaf">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-leaf" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-destructive">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                      Disconnected
                    </span>
                  )
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
