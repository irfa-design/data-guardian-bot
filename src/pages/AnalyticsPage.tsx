import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(185,80%,50%)", "hsl(145,65%,45%)", "hsl(38,92%,55%)", "hsl(0,72%,55%)"];

const AnalyticsPage = () => {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [sensorStats, setSensorStats] = useState<any[]>([]);
  const [alertStats, setAlertStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [snaps, sensors, alerts] = await Promise.all([
        supabase.from("analytics_snapshots").select("*").order("snapshot_date", { ascending: false }).limit(30),
        supabase.from("sensor_logs").select("sensor_type, status").limit(500),
        supabase.from("alerts").select("severity, resolved").limit(500),
      ]);

      setSnapshots(snaps.data || []);

      // Aggregate sensor stats by type
      const typeMap: Record<string, number> = {};
      (sensors.data || []).forEach((s: any) => { typeMap[s.sensor_type] = (typeMap[s.sensor_type] || 0) + 1; });
      setSensorStats(Object.entries(typeMap).map(([name, value]) => ({ name, value })));

      // Aggregate alert stats
      const sevMap: Record<string, number> = {};
      (alerts.data || []).forEach((a: any) => { sevMap[a.severity] = (sevMap[a.severity] || 0) + 1; });
      setAlertStats(Object.entries(sevMap).map(([name, value]) => ({ name, value })));

      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
      </div>

      {loading ? <p className="text-muted-foreground">Loading analytics...</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="font-semibold text-foreground mb-4">Sensor Readings by Type</h2>
            {sensorStats.length === 0 ? <p className="text-sm text-muted-foreground">No sensor data yet. Readings will populate this chart.</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sensorStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,18%)" />
                  <XAxis dataKey="name" stroke="hsl(215,15%,50%)" fontSize={12} />
                  <YAxis stroke="hsl(215,15%,50%)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(220,18%,10%)", border: "1px solid hsl(220,15%,18%)", borderRadius: 8 }} />
                  <Bar dataKey="value" fill="hsl(185,80%,50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-lg border bg-card p-5">
            <h2 className="font-semibold text-foreground mb-4">Alert Distribution</h2>
            {alertStats.length === 0 ? <p className="text-sm text-muted-foreground">No alerts recorded yet.</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={alertStats} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {alertStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(220,18%,10%)", border: "1px solid hsl(220,15%,18%)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-lg border bg-card p-5 lg:col-span-2">
            <h2 className="font-semibold text-foreground mb-4">Analytics Snapshots Over Time</h2>
            {snapshots.length === 0 ? <p className="text-sm text-muted-foreground">No analytics snapshots yet. Data trends will appear here.</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={snapshots.reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,18%)" />
                  <XAxis dataKey="snapshot_date" stroke="hsl(215,15%,50%)" fontSize={12} />
                  <YAxis stroke="hsl(215,15%,50%)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(220,18%,10%)", border: "1px solid hsl(220,15%,18%)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(185,80%,50%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AnalyticsPage;
