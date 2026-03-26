import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Settings, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const SettingsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ display_name: "", phone: "", department: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setProfile({ display_name: data.display_name || "", phone: data.phone || "", department: data.department || "" });
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update(profile).eq("user_id", user!.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="max-w-xl">
        <div className="rounded-lg border bg-card p-6 space-y-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile.display_name || "Operator"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {loading ? <p className="text-muted-foreground">Loading...</p> : (
            <div className="space-y-4">
              <div><Label>Display Name</Label><Input value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555 000 0000" /></div>
              <div><Label>Department</Label><Input value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))} placeholder="Operations, Engineering..." /></div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
