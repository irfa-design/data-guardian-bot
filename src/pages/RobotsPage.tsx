import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Bot, Battery, MapPin, Clock, CheckCircle2, Activity, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { Progress } from "@/components/ui/progress";

const statusColors: Record<string, string> = {
  patrolling: "text-primary",
  inspecting: "text-warning",
  charging: "text-success",
  idle: "text-muted-foreground",
  maintenance: "text-destructive",
};

const statusBg: Record<string, string> = {
  patrolling: "border-primary/30 bg-primary/5",
  inspecting: "border-warning/30 bg-warning/5",
  charging: "border-success/20 bg-success/5",
  idle: "border-border",
  maintenance: "border-destructive/30 bg-destructive/5",
};

const RobotsPage = () => {
  const [robots, setRobots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRobots = useCallback(async () => {
    const { data } = await supabase.from("robot_tracking").select("*").order("robot_name");
    setRobots(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRobots(); }, [fetchRobots]);
  useRealtimeSubscription("robot_tracking", fetchRobots);

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Robot Fleet Management</h1>
        <div className="ml-auto flex items-center gap-2">
          <Wifi className="h-3 w-3 text-success animate-pulse" />
          <span className="text-xs font-mono text-success">LIVE TRACKING</span>
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{robots.length} UNITS</span>
        </div>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> :
        robots.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No robots registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {robots.map(robot => (
              <div key={robot.id} className={cn(
                "rounded-lg border bg-card p-5 transition-all hover:shadow-lg",
                statusBg[robot.status] || "border-border"
              )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Bot className={cn("h-6 w-6", statusColors[robot.status] || "text-muted-foreground")} />
                      {robot.status === "patrolling" && (
                        <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-ping" />
                      )}
                    </div>
                    <span className="font-mono font-bold text-foreground text-lg">{robot.robot_name}</span>
                  </div>
                  <span className={cn("text-xs font-mono uppercase px-2 py-0.5 rounded bg-secondary", statusColors[robot.status])}>{robot.status}</span>
                </div>

                {/* Battery bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Battery</span>
                    <span className={cn("text-xs font-mono font-bold", robot.battery_level > 50 ? "text-success" : robot.battery_level > 20 ? "text-warning" : "text-destructive")}>
                      {robot.battery_level}%
                    </span>
                  </div>
                  <Progress value={robot.battery_level} className="h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {robot.location}</div>
                  <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {robot.uptime_hours}h uptime</div>
                  <div className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> {robot.tasks_completed} tasks</div>
                  <div className="flex items-center gap-1.5 text-muted-foreground"><Activity className="h-3.5 w-3.5 text-primary" /> {robot.current_task || "Idle"}</div>
                </div>

                {robot.current_task && (
                  <div className="mt-3 p-2 rounded bg-primary/5 border border-primary/20">
                    <p className="text-[10px] text-muted-foreground uppercase">Current Task</p>
                    <p className="text-xs text-primary font-mono">{robot.current_task}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </DashboardLayout>
  );
};

export default RobotsPage;
