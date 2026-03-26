import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ClipboardCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const InspectionsPage = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ location: "", findings: "", severity: "normal", recommendations: "" });
  const { user } = useAuth();

  const fetch = async () => {
    const { data } = await supabase.from("inspection_reports").select("*").order("created_at", { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("inspection_reports").insert({ ...form, inspector_id: user!.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Report filed");
    setOpen(false);
    setForm({ location: "", findings: "", severity: "normal", recommendations: "" });
    fetch();
  };

  const sevColor: Record<string, string> = { normal: "text-success", warning: "text-warning", critical: "text-destructive" };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Inspection Reports</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Report</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>File Inspection Report</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required /></div>
              <div><Label>Findings</Label><Textarea value={form.findings} onChange={e => setForm(f => ({ ...f, findings: e.target.value }))} required /></div>
              <div><Label>Severity</Label>
                <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Recommendations</Label><Textarea value={form.recommendations} onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))} /></div>
              <Button type="submit" className="w-full">Submit Report</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? <p className="text-muted-foreground">Loading...</p> :
          reports.length === 0 ? <div className="col-span-2 rounded-lg border bg-card p-12 text-center text-muted-foreground">No inspection reports yet.</div> :
          reports.map(r => (
            <div key={r.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("text-xs font-mono uppercase", sevColor[r.severity])}>{r.severity}</span>
                <span className="text-xs text-muted-foreground">{r.location}</span>
                <span className="text-xs text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-foreground mb-1">{r.findings}</p>
              {r.recommendations && <p className="text-xs text-muted-foreground italic">💡 {r.recommendations}</p>}
            </div>
          ))}
      </div>
    </DashboardLayout>
  );
};

export default InspectionsPage;
