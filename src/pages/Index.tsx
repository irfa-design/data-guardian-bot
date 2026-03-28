import { useState, useCallback, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LiveStatsBar } from "@/components/dashboard/LiveStatsBar";
import { SensorCard } from "@/components/dashboard/SensorCard";
import { RobotPanel } from "@/components/dashboard/RobotPanel";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { ServerRoom3D } from "@/components/dashboard/ServerRoom3D";
import { sensorReadings, alerts, robots, serverRacks } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { Activity } from "lucide-react";

const robotPositions = [
  { row: 0, col: 2, name: "DCR-01" },
  { row: 1, col: 5, name: "DCR-03" },
];

const Index = () => {
  const [liveAlerts, setLiveAlerts] = useState(alerts);
  const [liveSensors, setLiveSensors] = useState(sensorReadings);
  const [liveRobots, setLiveRobots] = useState(robots);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const fetchRecentActivity = useCallback(async () => {
    const { data } = await supabase
      .from("alerts")
      .select("id, message, severity, resolved, created_at, resolution_notes")
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentActivity(data || []);
  }, []);

  useEffect(() => { fetchRecentActivity(); }, [fetchRecentActivity]);
  useRealtimeSubscription("alerts", fetchRecentActivity);

  // Simulate live sensor updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSensors(prev =>
        prev.map(s => ({
          ...s,
          value: +(s.value + (Math.random() - 0.5) * (s.unit === "°C" ? 0.3 : s.unit === "kW" ? 5 : 1)).toFixed(1),
          trend: [...s.trend.slice(1), s.value],
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <LiveStatsBar />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {liveSensors.map((sensor) => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
        <RobotPanel robots={liveRobots} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <ServerRoom3D racks={serverRacks} robotPositions={robotPositions} />
        </div>
        <div className="lg:col-span-2 space-y-5">
          <AlertsPanel alerts={liveAlerts} />

          {/* Recent Resolution Activity */}
          {recentActivity.length > 0 && (
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">Recent Activity</h3>
              </div>
              <div className="space-y-2">
                {recentActivity.map((a) => (
                  <div key={a.id} className="text-xs border-b border-border/30 pb-2 last:border-0">
                    <p className={`${a.resolved ? "text-success" : a.severity === "critical" ? "text-destructive" : "text-warning"}`}>
                      {a.resolved ? "✓ Resolved" : "● Active"}: {a.message}
                    </p>
                    {a.resolution_notes && (
                      <p className="text-muted-foreground mt-0.5 italic">Fix: {a.resolution_notes}</p>
                    )}
                    <p className="text-muted-foreground font-mono mt-0.5">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
