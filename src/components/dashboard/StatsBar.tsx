import { Server, Thermometer, Zap, ShieldCheck, Activity, Bot } from "lucide-react";

interface StatsBarProps {
  liveStats?: { sensors: number; robots: number; alerts: number; incidents: number };
}

const baseStats = [
  { label: 'Total Racks', value: '32', icon: Server },
  { label: 'Avg Temp', value: '22.4°C', icon: Thermometer },
  { label: 'Power Draw', value: '847 kW', icon: Zap },
  { label: 'Uptime', value: '99.97%', icon: ShieldCheck },
  { label: 'Active Alerts', value: '0', icon: Activity },
  { label: 'Robots', value: '0', icon: Bot },
];

export const StatsBar = ({ liveStats }: StatsBarProps) => {
  const stats = [...baseStats];
  if (liveStats) {
    stats[4] = { ...stats[4], value: String(liveStats.alerts) };
    stats[5] = { ...stats[5], value: String(liveStats.robots) };
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-lg border bg-card p-3 flex items-center gap-3 hover:border-primary/20 transition-colors">
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
};
