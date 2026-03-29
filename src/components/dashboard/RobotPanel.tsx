import { Bot, Battery, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RobotStatus } from "@/data/mockData";
import { robots as mockRobots } from "@/data/mockData";
import { StatusIndicator } from "./StatusIndicator";

const BatteryIcon = ({ level }: { level: number }) => (
  <div className="flex items-center gap-1">
    <Battery className={cn(
      "h-4 w-4",
      level > 50 ? 'text-success' : level > 20 ? 'text-warning' : 'text-destructive'
    )} />
    <span className={cn(
      "text-xs font-mono",
      level > 50 ? 'text-success' : level > 20 ? 'text-warning' : 'text-destructive'
    )}>{level}%</span>
  </div>
);

export const RobotPanel = ({ robots }: { robots?: RobotStatus[] }) => {
  const displayRobots = robots || mockRobots;
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Robot Fleet</h2>
        <span className="ml-auto text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{displayRobots.length} UNITS</span>
      </div>
      <div className="space-y-3">
        {displayRobots.map((robot) => (
          <div key={robot.id} className={cn(
            "rounded-md border p-3 transition-all",
            robot.status === 'inspecting' && 'border-primary/30 bg-primary/5',
            robot.status === 'charging' && 'border-warning/20 bg-warning/5',
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <StatusIndicator status={robot.status} size="md" />
                <span className="font-mono font-semibold text-foreground">{robot.name}</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground capitalize px-2 py-0.5 rounded bg-secondary">{robot.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" /> {robot.location}
              </div>
              <BatteryIcon level={robot.battery} />
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" /> {robot.uptime}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-success" /> {robot.tasksCompleted} tasks
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
