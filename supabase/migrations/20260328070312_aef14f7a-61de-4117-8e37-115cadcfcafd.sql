
-- Add resolution_notes to alerts
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS resolution_notes text;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.robot_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anomaly_insights;
