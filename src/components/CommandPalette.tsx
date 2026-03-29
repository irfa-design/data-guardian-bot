import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Thermometer, AlertTriangle, Bot, Wrench,
  ClipboardCheck, BarChart3, FileText, CalendarClock, Package,
  Target, ShieldAlert, Brain, Bell, Settings, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const commands = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", keywords: "home overview main" },
  { to: "/sensors", icon: Thermometer, label: "Sensor Logs", keywords: "temperature humidity airflow power" },
  { to: "/alerts", icon: AlertTriangle, label: "Alerts", keywords: "warnings critical notifications" },
  { to: "/robots", icon: Bot, label: "Robot Fleet", keywords: "dcr autonomous patrol" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance", keywords: "tickets repair fix" },
  { to: "/inspections", icon: ClipboardCheck, label: "Inspections", keywords: "reports findings" },
  { to: "/analytics", icon: BarChart3, label: "Analytics", keywords: "charts data graphs" },
  { to: "/audit", icon: FileText, label: "Audit Logs", keywords: "history actions" },
  { to: "/schedules", icon: CalendarClock, label: "Shift Schedules", keywords: "staff roster" },
  { to: "/inventory", icon: Package, label: "Inventory", keywords: "equipment hardware assets" },
  { to: "/sla", icon: Target, label: "SLA Monitoring", keywords: "uptime compliance" },
  { to: "/incidents", icon: ShieldAlert, label: "Incidents", keywords: "outage emergency" },
  { to: "/anomalies", icon: Brain, label: "AI Anomalies", keywords: "prediction detection ml" },
  { to: "/notifications", icon: Bell, label: "Notifications", keywords: "messages inbox" },
  { to: "/settings", icon: Settings, label: "Settings", keywords: "profile account preferences" },
];

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filtered = commands.filter(c =>
    `${c.label} ${c.keywords}`.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback((to: string) => {
    setOpen(false);
    setQuery("");
    navigate(to);
  }, [navigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].to);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selectedIndex, handleSelect]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-xl border border-primary/20 bg-card shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: "0 0 60px hsl(185 80% 50% / 0.1)" }}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search modules... (↑↓ to navigate)"
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No results found</p>
          ) : filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.to}
                onClick={() => handleSelect(cmd.to)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  i === selectedIndex
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{cmd.label}</span>
              </button>
            );
          })}
        </div>
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
};
