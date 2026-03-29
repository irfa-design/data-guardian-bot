import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { SensorCard } from "@/components/dashboard/SensorCard";
import { RobotPanel } from "@/components/dashboard/RobotPanel";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { ServerRoomMap } from "@/components/dashboard/ServerRoomMap";
import { sensorReadings, serverRacks } from "@/data/mockData";
import type { RobotStatus, Alert } from "@/data/mockData";

const robotPositions = [
  { row: 0, col: 2, name: 'DCR-01' },
  { row: 1, col: 5, name: 'DCR-03' },
  { row: 3, col: 3, name: 'DCR-05' },
];

const Index = () => {
  const [liveRobots, setLiveRobots] = useState<RobotStatus[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({ sensors: 0, robots: 0, alerts: 0, incidents: 0 });

  useEffect(() => {
    // Fetch live robots
    supabase.from("robot_tracking").select("*").order("robot_name").then(({ data }) => {
      if (data) {
        setLiveRobots(data.map(r => ({
          id: r.id,
          name: r.robot_name,
          battery: r.battery_level,
          status: r.status as RobotStatus["status"],
          location: r.location,
          uptime: `${r.uptime_hours}h`,
          lastInspection: r.last_inspection ? 'Recently' : 'N/A',
          tasksCompleted: r.tasks_completed || 0,
        })));
      }
    });

    // Fetch live alerts
    supabase.from("alerts").select("*").eq("resolved", false).order("created_at", { ascending: false }).limit(10).then(({ data }) => {
      if (data) {
        setLiveAlerts(data.map(a => ({
          id: a.id,
          severity: a.severity as Alert["severity"],
          message: a.message,
          location: a.location,
          timestamp: new Date(a.created_at).toLocaleString(),
          resolved: a.resolved,
        })));
      }
    });

    // Fetch counts
    Promise.all([
      supabase.from("sensor_logs").select("id", { count: "exact", head: true }),
      supabase.from("robot_tracking").select("id", { count: "exact", head: true }),
      supabase.from("alerts").select("id", { count: "exact", head: true }).eq("resolved", false),
      supabase.from("incidents").select("id", { count: "exact", head: true }).neq("status", "resolved"),
    ]).then(([s, r, a, i]) => {
      setStats({
        sensors: s.count || 0,
        robots: r.count || 0,
        alerts: a.count || 0,
        incidents: i.count || 0,
      });
    });
  }, []);

  const displayRobots = liveRobots.length > 0 ? liveRobots : undefined;
  const displayAlerts = liveAlerts.length > 0 ? liveAlerts : undefined;

  return (
    <DashboardLayout>
      <StatsBar liveStats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {sensorReadings.map(sensor => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
        <RobotPanel robots={displayRobots} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <ServerRoomMap racks={serverRacks} robotPositions={robotPositions} />
        </div>
        <div className="lg:col-span-2">
          <AlertsPanel alerts={displayAlerts} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
