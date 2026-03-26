import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ShieldAlert, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const sevColor: Record<string, string> = { low: "text-muted-foreground", medium: "text-primary", high: "text-warning", critical: "text-destructive" };
const statColor: Record<string, string> = { open: "bg-destructive/10 text-destructive", investigating: "bg-warning/10 text-warning", mitigated: "bg-primary/10 text-primary", resolved: "bg-success/10 text-success", closed: "bg-secondary text-muted-foreground" };

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", severity: "medium", location: "" });
  const { user } = useAuth();

  const fetch = async () => {
    const { data } = await supabase.from("incidents").select("*").order("created_at", { ascending: false });
    setIncidents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("incidents").insert({ ...form, reported_by: user!.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Incident reported");
    setOpen(false);
    setForm({ title: "", description: "", severity: "medium", location: "" });
    fetch();
  };

  const updateStatus = async (id: string, status: string) => {
    const update: any = { status };
    if (status === "resolved") update.resolved_at = new Date().toISOString();
    await supabase.from("incidents").update(update).eq("id", id);
    fetch();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Incident Management</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" variant="destructive"><Plus className="h-4 w-4 mr-1" /> Report Incident</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Report Incident</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Severity</Label>
                  <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required /></div>
              </div>
              <Button type="submit" variant="destructive" className="w-full">Report</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-muted-foreground">Loading...</p> :
          incidents.length === 0 ? <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">No incidents reported.</div> :
          incidents.map(inc => (
            <div key={inc.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{inc.title}</h3>
                    <span className={cn("text-xs font-mono uppercase", sevColor[inc.severity])}>{inc.severity}</span>
                    <span className={cn("text-xs font-mono px-2 py-0.5 rounded", statColor[inc.status])}>{inc.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{inc.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{inc.location} • {new Date(inc.created_at).toLocaleString()}</p>
                </div>
                <Select value={inc.status} onValueChange={v => updateStatus(inc.id, v)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
      </div>
    </DashboardLayout>
  );
};

export default IncidentsPage;
