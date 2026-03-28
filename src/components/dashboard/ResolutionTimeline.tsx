import { CheckCircle2, Clock, AlertTriangle, Wrench, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  type: "created" | "investigating" | "action" | "resolved";
  label: string;
  detail: string;
  time: string;
}

interface ResolutionTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const iconMap = {
  created: AlertTriangle,
  investigating: Clock,
  action: Wrench,
  resolved: CheckCircle2,
};

const colorMap = {
  created: "text-destructive border-destructive/30 bg-destructive/10",
  investigating: "text-warning border-warning/30 bg-warning/10",
  action: "text-primary border-primary/30 bg-primary/10",
  resolved: "text-success border-success/30 bg-success/10",
};

export const ResolutionTimeline = ({ events, className }: ResolutionTimelineProps) => (
  <div className={cn("space-y-0", className)}>
    {events.map((evt, i) => {
      const Icon = iconMap[evt.type];
      return (
        <div key={i} className="flex gap-3 relative">
          {/* Connector line */}
          {i < events.length - 1 && (
            <div className="absolute left-[13px] top-7 w-0.5 h-[calc(100%-4px)] bg-border" />
          )}
          <div className={cn("shrink-0 h-7 w-7 rounded-full border flex items-center justify-center z-10", colorMap[evt.type])}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="pb-4 flex-1">
            <p className="text-sm font-medium text-foreground">{evt.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{evt.detail}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{evt.time}</p>
          </div>
        </div>
      );
    })}
  </div>
);
