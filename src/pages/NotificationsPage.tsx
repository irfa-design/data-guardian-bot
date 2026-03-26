import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const typeColor: Record<string, string> = {
  info: "border-primary/30 bg-primary/5",
  warning: "border-warning/30 bg-warning/5",
  critical: "border-destructive/30 bg-destructive/5",
  success: "border-success/30 bg-success/5",
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetch = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    fetch();
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("user_id", user!.id).eq("read", false);
    fetch();
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          {unread > 0 && <span className="text-xs font-mono text-destructive bg-destructive/10 px-2 py-0.5 rounded animate-pulse-glow">{unread} UNREAD</span>}
        </div>
        {unread > 0 && <Button size="sm" variant="outline" onClick={markAllRead}><Check className="h-4 w-4 mr-1" /> Mark All Read</Button>}
      </div>

      <div className="space-y-2">
        {loading ? <p className="text-muted-foreground">Loading...</p> :
          notifications.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">No notifications yet.</div>
          ) : notifications.map(n => (
            <div key={n.id} className={cn("rounded-lg border p-4 flex items-start gap-3 transition-all", typeColor[n.type], n.read && "opacity-50")}>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">{n.title}</h3>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}><Check className="h-4 w-4" /></Button>}
            </div>
          ))}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
