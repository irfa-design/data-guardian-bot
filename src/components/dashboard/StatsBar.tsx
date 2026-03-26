import { Server, Thermometer, Zap, ShieldCheck, Activity, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: 'Total Racks', value: '32', icon: Server, trend: 'stable' },
  { label: 'Avg Temp', value: '22.4°C', icon: Thermometer, trend: 'stable' },
  { label: 'Power Draw', value: '847 kW', icon: Zap, trend: 'up' },
  { label: 'Uptime', value: '99.97%', icon: ShieldCheck, trend: 'stable' },
  { label: 'Active Alerts', value: '4', icon: Activity, trend: 'up' },
  { label: 'Network', value: '99.9%', icon: Wifi, trend: 'stable' },
];

export const StatsBar = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
    {stats.map((stat) => {
      const Icon = stat.icon;
      return (
        <div key={stat.label} className="rounded-lg border bg-card p-3 flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold font-mono text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        </div>
      );
    })}
  </div>
);
