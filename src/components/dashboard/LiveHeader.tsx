import { useState, useEffect } from "react";
import { Bot, Radio, Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const LiveHeader = () => {
  const [time, setTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Unread notifications count
  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(({ count }) => setUnreadCount(count || 0));
  }, [user]);

  const uptime = (() => {
    const start = new Date("2026-03-01T00:00:00Z");
    const diff = time.getTime() - start.getTime();
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor((diff % 86400000) / 3600000);
    return `${days}d ${hrs}h`;
  })();

  return (
    <header className="flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-4 lg:px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 glow-primary">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            DataCenter <span className="text-primary text-glow-primary">Sentinel</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono">AUTONOMOUS INFRASTRUCTURE MONITORING</p>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        {/* Search trigger */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
          className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-1.5 hover:bg-secondary/80 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="text-[10px] font-mono bg-muted px-1 rounded">⌘K</kbd>
        </button>

        {/* System uptime */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
          <span className="text-muted-foreground">UPTIME</span>
          <span className="text-primary font-semibold">{uptime}</span>
        </div>

        {/* Notifications bell */}
        <button
          onClick={() => navigate("/notifications")}
          className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Live status */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Radio className="h-3 w-3 text-success animate-pulse" />
          <span className="text-success hidden sm:inline">ONLINE</span>
        </div>

        {/* Clock */}
        <div className="text-xs font-mono text-muted-foreground tabular-nums">
          {time.toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
};
