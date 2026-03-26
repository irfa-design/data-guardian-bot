import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Brain, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const sevConfig: Record<string, { icon: any; color: string; bg: string }> = {
  low: { icon: CheckCircle2, color: "text-muted-foreground", bg: "bg-secondary" },
  medium: { icon: AlertTriangle, color: "text-primary", bg: "bg-primary/10" },
  high: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  critical: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

const AnomaliesPage = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase.from("anomaly_insights").select("*").order("detected_at", { ascending: false });
    setInsights(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("anomaly_insights").update({ status }).eq("id", id);
    toast.success(`Anomaly ${status}`);
    fetch();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">AI Anomaly Insights</h1>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> :
        insights.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No anomalies detected. The AI engine will surface insights as patterns emerge from sensor and equipment data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map(a => {
              const config = sevConfig[a.severity] || sevConfig.low;
              const Icon = config.icon;
              return (
                <div key={a.id} className={cn("rounded-lg border bg-card p-5", config.bg)}>
                  <div className="flex items-start gap-3">
                    <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.color)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{a.title}</h3>
                        <span className={cn("text-xs font-mono uppercase", config.color)}>{a.severity}</span>
                        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{a.confidence}% confidence</span>
                        <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded ml-auto">{a.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{a.description}</p>
                      <p className="text-xs text-muted-foreground">{a.anomaly_type} • {a.location} • {new Date(a.detected_at).toLocaleString()}</p>
                      {a.recommended_action && <p className="text-xs text-primary mt-2 italic">💡 {a.recommended_action}</p>}
                      {a.affected_equipment?.length > 0 && <p className="text-xs text-muted-foreground mt-1">Affected: {a.affected_equipment.join(", ")}</p>}
                    </div>
                    {a.status === "new" && (
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "acknowledged")}>Ack</Button>
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, "dismissed")}>Dismiss</Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </DashboardLayout>
  );
};

export default AnomaliesPage;
