import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Bot, Battery, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  patrolling: "text-primary",
  inspecting: "text-warning",
  charging: "text-success",
  idle: "text-muted-foreground",
  maintenance: "text-destructive",
};

const RobotsPage = () => {
  const [robots, setRobots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("robot_tracking").select("*").order("robot_name").then(({ data }) => {
      setRobots(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Robot Fleet Management</h1>
        <span className="ml-auto text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{robots.length} UNITS</span>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> :
        robots.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No robots registered yet. Robot data will appear here once robots are added to the tracking system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {robots.map(robot => (
              <div key={robot.id} className={cn(
                "rounded-lg border bg-card p-5 transition-all hover:border-primary/30",
                robot.status === "inspecting" && "border-primary/30 bg-primary/5",
                robot.status === "charging" && "border-warning/20 bg-warning/5",
              )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bot className={cn("h-5 w-5", statusColors[robot.status] || "text-muted-foreground")} />
                    <span className="font-mono font-bold text-foreground text-lg">{robot.robot_name}</span>
                  </div>
                  <span className={cn("text-xs font-mono uppercase px-2 py-0.5 rounded bg-secondary", statusColors[robot.status])}>{robot.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {robot.location}</div>
                  <div className="flex items-center gap-1.5">
                    <Battery className={cn("h-3.5 w-3.5", robot.battery_level > 50 ? "text-success" : robot.battery_level > 20 ? "text-warning" : "text-destructive")} />
                    <span className={cn("font-mono", robot.battery_level > 50 ? "text-success" : robot.battery_level > 20 ? "text-warning" : "text-destructive")}>{robot.battery_level}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {robot.uptime_hours}h</div>
                  <div className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> {robot.tasks_completed} tasks</div>
                </div>
              </div>
            ))}
          </div>
        )}
    </DashboardLayout>
  );
};

export default RobotsPage;
