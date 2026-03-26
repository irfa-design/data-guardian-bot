import { AlertTriangle, Info, XCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alert } from "@/data/mockData";

const severityConfig = {
  critical: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
};

export const AlertsPanel = ({ alerts }: { alerts: Alert[] }) => {
  const active = alerts.filter(a => !a.resolved);
  const resolved = alerts.filter(a => a.resolved);

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <h2 className="font-semibold text-foreground">Alerts & Notifications</h2>
        <span className="ml-auto text-xs font-mono text-destructive bg-destructive/10 px-2 py-0.5 rounded animate-pulse-glow">
          {active.length} ACTIVE
        </span>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {active.map(alert => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <div key={alert.id} className={cn("rounded-md border p-3", config.bg, config.border)}>
              <div className="flex items-start gap-2">
                <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{alert.location}</span>
                    <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {resolved.length > 0 && (
          <div className="pt-2 border-t border-border mt-3">
            <p className="text-xs text-muted-foreground mb-2">Resolved</p>
            {resolved.map(alert => (
              <div key={alert.id} className="rounded-md border border-border/50 p-3 opacity-60 mb-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground line-through">{alert.message}</p>
                    <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
