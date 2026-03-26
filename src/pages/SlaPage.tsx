import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const statusColor: Record<string, string> = { met: "text-success", at_risk: "text-warning", breached: "text-destructive" };
const progressColor: Record<string, string> = { met: "bg-success", at_risk: "bg-warning", breached: "bg-destructive" };

const SlaPage = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("sla_metrics").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setMetrics(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2">
        <Target className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">SLA Monitoring</h1>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> :
        metrics.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No SLA metrics configured yet. Metrics will be tracked here once defined.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map(m => {
              const pct = Math.min(100, (m.current_value / m.target_value) * 100);
              return (
                <div key={m.id} className="rounded-lg border bg-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground text-sm">{m.metric_name}</h3>
                    <span className={cn("text-xs font-mono uppercase", statusColor[m.status])}>{m.status.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold font-mono text-foreground">{m.current_value}</span>
                    <span className="text-sm text-muted-foreground">/ {m.target_value} {m.unit}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(m.period_start).toLocaleDateString()} – {new Date(m.period_end).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
    </DashboardLayout>
  );
};

export default SlaPage;
