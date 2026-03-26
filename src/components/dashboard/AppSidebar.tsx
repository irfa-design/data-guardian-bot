import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Thermometer, AlertTriangle, Bot, Wrench,
  ClipboardCheck, BarChart3, FileText, CalendarClock, Package,
  Target, ShieldAlert, Brain, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/sensors", icon: Thermometer, label: "Sensor Logs" },
  { to: "/alerts", icon: AlertTriangle, label: "Alerts" },
  { to: "/robots", icon: Bot, label: "Robot Fleet" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance" },
  { to: "/inspections", icon: ClipboardCheck, label: "Inspections" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/audit", icon: FileText, label: "Audit Logs" },
  { to: "/schedules", icon: CalendarClock, label: "Shift Schedules" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/sla", icon: Target, label: "SLA Monitoring" },
  { to: "/incidents", icon: ShieldAlert, label: "Incidents" },
  { to: "/anomalies", icon: Brain, label: "AI Anomalies" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <aside className={cn(
      "h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-16" : "w-56"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <Bot className="h-6 w-6 text-sidebar-primary shrink-0" />
        {!collapsed && (
          <span className="font-bold text-sidebar-foreground text-sm truncate">
            DC <span className="text-sidebar-primary">Sentinel</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-primary font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
            title={label}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {!collapsed && user && (
          <p className="text-[10px] text-muted-foreground truncate px-3 mb-1">{user.email}</p>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center text-muted-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
};
