import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusColor: Record<string, string> = {
  operational: "text-success", degraded: "text-warning", failed: "text-destructive",
  maintenance: "text-primary", decommissioned: "text-muted-foreground",
};

const InventoryPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", model: "", serial_number: "", location: "", status: "operational" });

  const fetch = async () => {
    const { data } = await supabase.from("equipment_inventory").select("*").order("name");
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("equipment_inventory").insert(form);
    if (error) { toast.error(error.message); return; }
    toast.success("Equipment added");
    setOpen(false);
    setForm({ name: "", category: "", model: "", serial_number: "", location: "", status: "operational" });
    fetch();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Equipment Inventory</h1>
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{items.length} ITEMS</span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Equipment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Equipment</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required /></div>
                <div><Label>Model</Label><Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} /></div>
                <div><Label>Serial #</Label><Input value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required /></div>
                <div><Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="degraded">Degraded</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="decommissioned">Decommissioned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Add Equipment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-left p-3 font-medium">Model</th>
              <th className="text-left p-3 font-medium">Location</th>
              <th className="text-left p-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr> :
                items.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No equipment registered yet.</td></tr> :
                items.map(item => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-mono font-medium text-foreground">{item.name}</td>
                    <td className="p-3 text-muted-foreground">{item.category}</td>
                    <td className="p-3 text-muted-foreground">{item.model || "—"}</td>
                    <td className="p-3 text-muted-foreground">{item.location}</td>
                    <td className="p-3"><span className={cn("font-mono text-xs uppercase", statusColor[item.status])}>{item.status}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InventoryPage;
