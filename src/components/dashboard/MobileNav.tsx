import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Menu, X, Bot, LogOut,
  LayoutDashboard, Thermometer, AlertTriangle, Wrench,
  ClipboardCheck, BarChart3, FileText, CalendarClock, Package,
  Target, ShieldAlert, Brain, Bell, Settings,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/sensors", icon: Thermometer, label: "Sensor Logs" },
  { to: "/alerts", icon: AlertTriangle, label: "Alerts" },
  { to: "/robots", icon: Bot, label: "Robot Fleet" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance" },
  { to: "/inspections", icon: ClipboardCheck, label: "Inspections" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/audit", icon: FileText, label: "Audit Logs" },
  { to: "/schedules", icon: CalendarClock, label: "Schedules" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/sla", icon: Target, label: "SLA" },
  { to: "/incidents", icon: ShieldAlert, label: "Incidents" },
  { to: "/anomalies", icon: Brain, label: "AI Anomalies" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)} className="p-2 text-muted-foreground hover:text-foreground">
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col animate-in slide-in-from-left">
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-sidebar-primary" />
                <span className="font-bold text-sidebar-foreground text-sm">DC <span className="text-sidebar-primary">Sentinel</span></span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-2 border-t border-sidebar-border">
              <button onClick={signOut} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive w-full">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
