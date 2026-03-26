import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CalendarClock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ shift_date: "", start_time: "08:00", end_time: "16:00", zone: "", notes: "" });
  const { user } = useAuth();

  const fetch = async () => {
    const { data } = await supabase.from("shift_schedules").select("*").order("shift_date", { ascending: false });
    setSchedules(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("shift_schedules").insert({ ...form, user_id: user!.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Shift scheduled");
    setOpen(false);
    setForm({ shift_date: "", start_time: "08:00", end_time: "16:00", zone: "", notes: "" });
    fetch();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Shift Schedules</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Shift</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule Shift</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><Label>Date</Label><Input type="date" value={form.shift_date} onChange={e => setForm(f => ({ ...f, shift_date: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Start</Label><Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required /></div>
                <div><Label>End</Label><Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required /></div>
              </div>
              <div><Label>Zone</Label><Input value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} placeholder="Zone A, Zone B..." required /></div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button type="submit" className="w-full">Schedule</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Time</th>
              <th className="text-left p-3 font-medium">Zone</th>
              <th className="text-left p-3 font-medium">Notes</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr> :
                schedules.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No shifts scheduled yet.</td></tr> :
                schedules.map(s => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-mono text-foreground">{s.shift_date}</td>
                    <td className="p-3 text-muted-foreground">{s.start_time} – {s.end_time}</td>
                    <td className="p-3 text-primary font-mono">{s.zone}</td>
                    <td className="p-3 text-muted-foreground">{s.notes || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SchedulesPage;
