import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FileText } from "lucide-react";

const AuditPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200).then(({ data }) => {
      setLogs(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left p-3 font-medium">Action</th>
                <th className="text-left p-3 font-medium">Resource</th>
                <th className="text-left p-3 font-medium">Details</th>
                <th className="text-left p-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No audit logs recorded yet. Actions will be logged here automatically.</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3 font-mono text-primary text-xs">{log.action}</td>
                  <td className="p-3 text-foreground">{log.resource_type} {log.resource_id && `#${log.resource_id.slice(0, 8)}`}</td>
                  <td className="p-3 text-muted-foreground text-xs truncate max-w-xs">{log.details ? JSON.stringify(log.details) : "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditPage;
