import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type TableName = "alerts" | "sensor_logs" | "robot_tracking" | "incidents" | "maintenance_tickets" | "notifications" | "anomaly_insights";

export function useRealtimeSubscription(table: TableName, onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => onUpdate()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table, onUpdate]);
}
