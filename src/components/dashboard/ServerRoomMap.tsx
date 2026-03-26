import { cn } from "@/lib/utils";
import type { ServerRack } from "@/data/mockData";
import { Bot } from "lucide-react";

const statusBg = {
  healthy: 'bg-success/20 border-success/30 hover:bg-success/30',
  warning: 'bg-warning/20 border-warning/40 hover:bg-warning/30',
  critical: 'bg-destructive/30 border-destructive/50 hover:bg-destructive/40 animate-pulse-glow',
};

interface ServerRoomMapProps {
  racks: ServerRack[];
  robotPositions?: { row: number; col: number; name: string }[];
}

export const ServerRoomMap = ({ racks, robotPositions = [] }: ServerRoomMapProps) => (
  <div className="rounded-lg border bg-card p-5">
    <div className="flex items-center gap-2 mb-4">
      <div className="h-5 w-5 rounded bg-primary/20 flex items-center justify-center">
        <div className="h-2 w-2 rounded-sm bg-primary" />
      </div>
      <h2 className="font-semibold text-foreground">Server Room — Live Map</h2>
    </div>

    <div className="relative bg-secondary/30 rounded-lg p-4 border border-border/50">
      {/* Zone labels */}
      <div className="flex justify-between mb-2 px-1">
        <span className="text-[10px] font-mono text-muted-foreground">ZONE A</span>
        <span className="text-[10px] font-mono text-muted-foreground">ZONE B</span>
        <span className="text-[10px] font-mono text-muted-foreground">ZONE C</span>
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        {racks.map((rack) => (
          <div
            key={rack.id}
            className={cn(
              "relative aspect-square rounded border flex flex-col items-center justify-center cursor-pointer transition-all text-[10px] font-mono",
              statusBg[rack.status]
            )}
            title={`${rack.name} | ${rack.temperature}°C | Load: ${rack.load}%`}
          >
            <span className={cn(
              rack.status === 'critical' ? 'text-destructive' : rack.status === 'warning' ? 'text-warning' : 'text-success'
            )}>{rack.name}</span>
            <span className="text-muted-foreground">{rack.temperature}°</span>

            {/* Robot overlay */}
            {robotPositions.map(rp =>
              rp.row === rack.row && rp.col === rack.col ? (
                <div key={rp.name} className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 animate-float z-10">
                  <Bot className="h-3 w-3 text-primary-foreground" />
                </div>
              ) : null
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-success/40 border border-success/50" />
          <span className="text-[10px] text-muted-foreground">Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-warning/40 border border-warning/50" />
          <span className="text-[10px] text-muted-foreground">Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-destructive/40 border border-destructive/50" />
          <span className="text-[10px] text-muted-foreground">Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Bot className="h-3 w-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">Robot</span>
        </div>
      </div>
    </div>
  </div>
);
