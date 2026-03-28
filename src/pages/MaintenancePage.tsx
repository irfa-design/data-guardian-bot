import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Wrench, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const priorityColor: Record<string, string> = { low: "text-muted-foreground", medium: "text-primary", high: "text-warning", critical: "text-destructive" };
const statusColor: Record<string, string> = { open: "bg-primary/10 text-primary", in_progress: "bg-warning/10 text-warning", resolved: "bg-success/10 text-success", closed: "bg-secondary text-muted-foreground" };

const MaintenancePage = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", location: "" });
  const { user } = useAuth();

  const fetch = async () => {
    const { data } = await supabase.from("maintenance_tickets").select("*").order("created_at", { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("maintenance_tickets").insert({ ...form, created_by: user!.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Ticket created");
    setOpen(false);
    setForm({ title: "", description: "", priority: "medium", location: "" });
    fetch();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("maintenance_tickets").update({ status }).eq("id", id);
    fetch();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Maintenance Tickets</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Ticket</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Maintenance Ticket</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
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
              <Button type="submit" className="w-full">Create Ticket</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-muted-foreground">Loading...</p> :
          tickets.length === 0 ? <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">No maintenance tickets yet.</div> :
          tickets.map(t => (
            <div key={t.id} className="rounded-lg border bg-card p-4 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{t.title}</h3>
                  <span className={cn("text-xs font-mono uppercase", priorityColor[t.priority])}>{t.priority}</span>
                  <span className={cn("text-xs font-mono px-2 py-0.5 rounded", statusColor[t.status])}>{t.status}</span>
                </div>
                {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                <p className="text-xs text-muted-foreground mt-1">{t.location} • {new Date(t.created_at).toLocaleString()}</p>
              </div>
              <Select value={t.status} onValueChange={v => updateStatus(t.id, v)}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
      </div>
    </DashboardLayout>
  );
};

export default MaintenancePage;
