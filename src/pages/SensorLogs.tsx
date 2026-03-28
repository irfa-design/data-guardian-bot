import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Thermometer, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const SensorLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ sensor_name: "", sensor_type: "temperature", value: "", unit: "°C", location: "", status: "normal" });
  const { user } = useAuth();

  const fetchLogs = async () => {
    const { data } = await supabase.from("sensor_logs").select("*").order("recorded_at", { ascending: false }).limit(100);
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("sensor_logs").insert({ ...form, value: parseFloat(form.value) });
    if (error) { toast.error(error.message); return; }
    toast.success("Sensor log recorded");
    setOpen(false);
    setForm({ sensor_name: "", sensor_type: "temperature", value: "", unit: "°C", location: "", status: "normal" });
    fetchLogs();
  };

  const statusColor = (s: string) => s === "critical" ? "text-destructive" : s === "warning" ? "text-warning" : "text-success";

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Thermometer className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Sensor Logs</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Reading</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Sensor Reading</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Sensor Name</Label><Input value={form.sensor_name} onChange={e => setForm(f => ({ ...f, sensor_name: e.target.value }))} required /></div>
                <div><Label>Type</Label>
                  <Select value={form.sensor_type} onValueChange={v => setForm(f => ({ ...f, sensor_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="humidity">Humidity</SelectItem>
                      <SelectItem value="airflow">Airflow</SelectItem>
                      <SelectItem value="power">Power</SelectItem>
                      <SelectItem value="noise">Noise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Value</Label><Input type="number" step="any" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required /></div>
                <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} required /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required /></div>
                <div><Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Record Reading</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left p-3 font-medium">Sensor</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-right p-3 font-medium">Value</th>
                <th className="text-left p-3 font-medium">Location</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Recorded</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No sensor logs yet. Add your first reading!</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3 font-mono font-medium text-foreground">{log.sensor_name}</td>
                  <td className="p-3 text-muted-foreground capitalize">{log.sensor_type}</td>
                  <td className="p-3 text-right font-mono font-bold text-foreground">{log.value} <span className="text-muted-foreground text-xs">{log.unit}</span></td>
                  <td className="p-3 text-muted-foreground">{log.location}</td>
                  <td className="p-3"><span className={cn("font-mono text-xs uppercase", statusColor(log.status))}>{log.status}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(log.recorded_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SensorLogs;
