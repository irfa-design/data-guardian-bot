import { Bot, Radio } from "lucide-react";

export const Header = () => (
  <header className="flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-primary/10 p-2 glow-primary">
        <Bot className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          DataCenter <span className="text-primary text-glow-primary">Sentinel</span>
        </h1>
        <p className="text-xs text-muted-foreground font-mono">AUTONOMOUS INFRASTRUCTURE MONITORING</p>
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs font-mono">
      <Radio className="h-3 w-3 text-success animate-pulse-glow" />
      <span className="text-success">SYSTEM ONLINE</span>
      <span className="text-muted-foreground ml-2">|</span>
      <span className="text-muted-foreground ml-2">{new Date().toLocaleTimeString()}</span>
    </div>
  </header>
);
