import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: 'normal' | 'warning' | 'critical' | 'healthy' | 'patrolling' | 'inspecting' | 'charging' | 'idle' | 'info';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const statusColors: Record<string, string> = {
  normal: 'bg-success',
  healthy: 'bg-success',
  patrolling: 'bg-primary',
  inspecting: 'bg-primary',
  info: 'bg-primary',
  charging: 'bg-warning',
  idle: 'bg-muted-foreground',
  warning: 'bg-warning',
  critical: 'bg-destructive',
};

export const StatusIndicator = ({ status, size = 'sm', pulse = true }: StatusIndicatorProps) => (
  <span className="relative flex items-center">
    <span className={cn(
      "rounded-full",
      size === 'sm' ? 'h-2 w-2' : 'h-3 w-3',
      statusColors[status]
    )} />
    {pulse && (status === 'critical' || status === 'patrolling' || status === 'inspecting') && (
      <span className={cn(
        "absolute rounded-full animate-ping",
        size === 'sm' ? 'h-2 w-2' : 'h-3 w-3',
        statusColors[status],
        'opacity-75'
      )} />
    )}
  </span>
);
