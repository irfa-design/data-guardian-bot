import { cn } from "@/lib/utils";
import type { SensorReading } from "@/data/mockData";
import { StatusIndicator } from "./StatusIndicator";

const MiniChart = ({ data, status }: { data: number[]; status: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const color = status === 'critical' ? 'hsl(var(--destructive))' : status === 'warning' ? 'hsl(var(--warning))' : 'hsl(var(--primary))';

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-12" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

export const SensorCard = ({ sensor }: { sensor: SensorReading }) => (
  <div className={cn(
    "rounded-lg border bg-card p-4 transition-all hover:border-primary/30",
    sensor.status === 'critical' && 'border-destructive/50 glow-danger',
    sensor.status === 'warning' && 'border-warning/30 glow-warning',
  )}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{sensor.location}</span>
      <StatusIndicator status={sensor.status} />
    </div>
    <div className="flex items-baseline gap-1 mb-1">
      <span className={cn(
        "text-2xl font-bold font-mono",
        sensor.status === 'critical' ? 'text-destructive' : sensor.status === 'warning' ? 'text-warning' : 'text-foreground'
      )}>
        {sensor.value}
      </span>
      <span className="text-sm text-muted-foreground">{sensor.unit}</span>
    </div>
    <p className="text-sm text-muted-foreground mb-2">{sensor.name}</p>
    <MiniChart data={sensor.trend} status={sensor.status} />
  </div>
);
