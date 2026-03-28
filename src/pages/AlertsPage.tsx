import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const severityConfig = {
  critical: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAlerts = async () => {
    const { data } = await supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(100);
    setAlerts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const resolveAlert = async (id: string) => {
    const { error } = await supabase.from("alerts").update({ resolved: true, resolved_by: user?.id, resolved_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Alert resolved");
    fetchAlerts();
  };

  const active = alerts.filter(a => !a.resolved);
  const resolved = alerts.filter(a => a.resolved);

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 text-warning" />
        <h1 className="text-2xl font-bold text-foreground">Alerts Management</h1>
        <span className="ml-auto text-xs font-mono text-destructive bg-destructive/10 px-2 py-1 rounded animate-pulse-glow">{active.length} ACTIVE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold text-foreground mb-3">Active Alerts</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? <p className="text-muted-foreground text-sm">Loading...</p> :
              active.length === 0 ? <p className="text-muted-foreground text-sm">No active alerts 🎉</p> :
              active.map(alert => {
                const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.info;
                const Icon = config.icon;
                return (
                  <div key={alert.id} className={cn("rounded-md border p-3", config.bg, config.border)}>
                    <div className="flex items-start gap-2">
                      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{alert.message}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{alert.location}</span>
                          <span className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)} className="shrink-0 text-xs">Resolve</Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold text-foreground mb-3">Resolved ({resolved.length})</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {resolved.map(alert => (
              <div key={alert.id} className="rounded-md border border-border/50 p-3 opacity-60">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground line-through">{alert.message}</p>
                    <span className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlertsPage;
