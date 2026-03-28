import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ResolutionTimeline } from "@/components/dashboard/ResolutionTimeline";
import { ShieldAlert, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const sevColor: Record<string, string> = { low: "text-muted-foreground", medium: "text-primary", high: "text-warning", critical: "text-destructive" };
const statColor: Record<string, string> = { open: "bg-destructive/10 text-destructive", investigating: "bg-warning/10 text-warning", mitigated: "bg-primary/10 text-primary", resolved: "bg-success/10 text-success", closed: "bg-secondary text-muted-foreground" };

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", severity: "medium", location: "" });
  const [resolutionForm, setResolutionForm] = useState({ root_cause: "", resolution: "" });
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from("incidents").select("*").order("created_at", { ascending: false });
    setIncidents(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeSubscription("incidents", fetchData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("incidents").insert({ ...form, reported_by: user!.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Incident reported");
    setOpen(false);
    setForm({ title: "", description: "", severity: "medium", location: "" });
  };

  const updateStatus = async (id: string, status: string) => {
    const update: any = { status };
    if (status === "resolved") update.resolved_at = new Date().toISOString();
    await supabase.from("incidents").update(update).eq("id", id);
  };

  const submitResolution = async (id: string) => {
    if (!resolutionForm.root_cause || !resolutionForm.resolution) {
      toast.error("Please fill root cause and resolution");
      return;
    }
    await supabase.from("incidents").update({
      ...resolutionForm,
      status: "resolved",
      resolved_at: new Date().toISOString(),
    }).eq("id", id);
    toast.success("Incident resolved with details");
    setExpandedId(null);
    setResolutionForm({ root_cause: "", resolution: "" });
  };

  const buildTimeline = (inc: any) => {
    const events: any[] = [
      { type: "created", label: "Incident Reported", detail: inc.description, time: new Date(inc.started_at || inc.created_at).toLocaleString() },
    ];
    if (inc.status !== "open") {
      events.push({ type: "investigating", label: "Investigation", detail: inc.root_cause || "Under investigation", time: "" });
    }
    if (inc.resolution) {
      events.push({ type: "action", label: "Resolution Applied", detail: inc.resolution, time: "" });
    }
    if (inc.resolved_at) {
      events.push({ type: "resolved", label: "Incident Closed", detail: "All systems restored", time: new Date(inc.resolved_at).toLocaleString() });
    }
    return events;
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
          incidents.map(inc => {
            const isExpanded = expandedId === inc.id;
            return (
              <div key={inc.id} className="rounded-lg border bg-card p-4 transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{inc.title}</h3>
                      <span className={cn("text-xs font-mono uppercase", sevColor[inc.severity])}>{inc.severity}</span>
                      <span className={cn("text-xs font-mono px-2 py-0.5 rounded", statColor[inc.status])}>{inc.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{inc.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{inc.location} • {new Date(inc.created_at).toLocaleString()}</p>

                    {/* Root cause & resolution display */}
                    {inc.root_cause && (
                      <div className="mt-2 p-2 rounded bg-secondary/50 border border-border/30">
                        <p className="text-xs font-semibold text-warning">Root Cause:</p>
                        <p className="text-xs text-muted-foreground">{inc.root_cause}</p>
                      </div>
                    )}
                    {inc.resolution && (
                      <div className="mt-2 p-2 rounded bg-success/5 border border-success/20">
                        <p className="text-xs font-semibold text-success">Resolution:</p>
                        <p className="text-xs text-muted-foreground">{inc.resolution}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 items-end">
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
                    <Button size="sm" variant="ghost" onClick={() => setExpandedId(isExpanded ? null : inc.id)} className="text-xs">
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {isExpanded ? "Less" : "Details"}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Timeline */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Resolution Timeline</h4>
                      <ResolutionTimeline events={buildTimeline(inc)} />
                    </div>

                    {/* Resolution form */}
                    {inc.status !== "resolved" && inc.status !== "closed" && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Add Resolution</h4>
                        <div>
                          <Label className="text-xs">Root Cause</Label>
                          <Textarea
                            placeholder="What caused this incident?"
                            value={resolutionForm.root_cause}
                            onChange={e => setResolutionForm(f => ({ ...f, root_cause: e.target.value }))}
                            className="text-xs min-h-[50px]"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">How it was fixed</Label>
                          <Textarea
                            placeholder="Steps taken to resolve..."
                            value={resolutionForm.resolution}
                            onChange={e => setResolutionForm(f => ({ ...f, resolution: e.target.value }))}
                            className="text-xs min-h-[50px]"
                          />
                        </div>
                        <Button size="sm" onClick={() => submitResolution(inc.id)} className="w-full text-xs">Mark Resolved</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </DashboardLayout>
  );
};

export default IncidentsPage;
