import { useEffect, useState, useCallback } from "react";
import { Server, Thermometer, Zap, ShieldCheck, Activity, Wifi, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

interface StatItem {
  label: string;
  value: string;
  icon: any;
  trend: "up" | "down" | "stable";
  trendColor: string;
}

export const LiveStatsBar = () => {
  const [stats, setStats] = useState<StatItem[]>([
    { label: "Total Racks", value: "32", icon: Server, trend: "stable", trendColor: "text-muted-foreground" },
    { label: "Avg Temp", value: "—", icon: Thermometer, trend: "stable", trendColor: "text-muted-foreground" },
    { label: "Power Draw", value: "—", icon: Zap, trend: "stable", trendColor: "text-muted-foreground" },
    { label: "Uptime", value: "99.97%", icon: ShieldCheck, trend: "stable", trendColor: "text-success" },
    { label: "Active Alerts", value: "—", icon: Activity, trend: "stable", trendColor: "text-muted-foreground" },
    { label: "Robots Online", value: "—", icon: Wifi, trend: "stable", trendColor: "text-muted-foreground" },
  ]);

  const fetchLive = useCallback(async () => {
    const [alertsRes, robotsRes, sensorRes] = await Promise.all([
      supabase.from("alerts").select("id", { count: "exact" }).eq("resolved", false),
      supabase.from("robot_tracking").select("id, status", { count: "exact" }),
      supabase.from("sensor_logs").select("sensor_type, value").order("recorded_at", { ascending: false }).limit(50),
    ]);

    const activeAlerts = alertsRes.count ?? 0;
    const robots = robotsRes.data ?? [];
    const onlineRobots = robots.filter((r: any) => r.status !== "maintenance").length;
    const sensors = sensorRes.data ?? [];
    const temps = sensors.filter((s: any) => s.sensor_type === "temperature");
    const avgTemp = temps.length > 0 ? (temps.reduce((a: number, s: any) => a + Number(s.value), 0) / temps.length).toFixed(1) : "22.4";
    const powers = sensors.filter((s: any) => s.sensor_type === "power");
    const avgPower = powers.length > 0 ? Math.round(powers.reduce((a: number, s: any) => a + Number(s.value), 0) / powers.length) : 847;

    setStats([
      { label: "Total Racks", value: "32", icon: Server, trend: "stable", trendColor: "text-muted-foreground" },
      { label: "Avg Temp", value: `${avgTemp}°C`, icon: Thermometer, trend: Number(avgTemp) > 25 ? "up" : "stable", trendColor: Number(avgTemp) > 30 ? "text-destructive" : "text-success" },
      { label: "Power Draw", value: `${avgPower} kW`, icon: Zap, trend: avgPower > 850 ? "up" : "stable", trendColor: "text-primary" },
      { label: "Uptime", value: "99.97%", icon: ShieldCheck, trend: "stable", trendColor: "text-success" },
      { label: "Active Alerts", value: String(activeAlerts), icon: Activity, trend: activeAlerts > 3 ? "up" : "stable", trendColor: activeAlerts > 3 ? "text-destructive" : "text-success" },
      { label: "Robots Online", value: `${onlineRobots}/${robots.length}`, icon: Wifi, trend: "stable", trendColor: onlineRobots === robots.length ? "text-success" : "text-warning" },
    ]);
  }, []);

  useEffect(() => { fetchLive(); }, [fetchLive]);
  useRealtimeSubscription("alerts", fetchLive);
  useRealtimeSubscription("robot_tracking", fetchLive);
  useRealtimeSubscription("sensor_logs", fetchLive);

  const TrendIcon = ({ trend }: { trend: string }) =>
    trend === "up" ? <TrendingUp className="h-3 w-3" /> : trend === "down" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-lg border bg-card p-3 flex items-center gap-3 transition-all hover:border-primary/30 hover:glow-primary">
            <div className="rounded-md bg-primary/10 p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="text-lg font-bold font-mono text-foreground">{stat.value}</p>
                <span className={cn("ml-auto", stat.trendColor)}>
                  <TrendIcon trend={stat.trend} />
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
