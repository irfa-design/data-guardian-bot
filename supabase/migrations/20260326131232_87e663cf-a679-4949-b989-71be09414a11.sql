
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Sensor Logs
CREATE TABLE public.sensor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_name TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'normal',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sensor_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read sensor logs" ON public.sensor_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sensor logs" ON public.sensor_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_sensor_logs_recorded ON public.sensor_logs(recorded_at DESC);
CREATE INDEX idx_sensor_logs_type ON public.sensor_logs(sensor_type);

-- 3. Alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL CHECK (severity IN ('info','warning','critical')),
  message TEXT NOT NULL,
  location TEXT NOT NULL,
  source TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read alerts" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert alerts" ON public.alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update alerts" ON public.alerts FOR UPDATE TO authenticated USING (true);
CREATE INDEX idx_alerts_severity ON public.alerts(severity);
CREATE INDEX idx_alerts_resolved ON public.alerts(resolved);

-- 4. Robot Tracking
CREATE TABLE public.robot_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  robot_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('patrolling','inspecting','charging','idle','maintenance')),
  battery_level INTEGER NOT NULL,
  location TEXT NOT NULL,
  current_task TEXT,
  uptime_hours NUMERIC DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  last_inspection TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.robot_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read robots" ON public.robot_tracking FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage robots" ON public.robot_tracking FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update robots" ON public.robot_tracking FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_robot_tracking_updated_at BEFORE UPDATE ON public.robot_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Maintenance Tickets
CREATE TABLE public.maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  location TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read tickets" ON public.maintenance_tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create tickets" ON public.maintenance_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update tickets" ON public.maintenance_tickets FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_maintenance_tickets_updated_at BEFORE UPDATE ON public.maintenance_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Inspection Reports
CREATE TABLE public.inspection_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  robot_id UUID REFERENCES public.robot_tracking(id),
  inspector_id UUID REFERENCES auth.users(id),
  location TEXT NOT NULL,
  findings TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('normal','warning','critical')),
  recommendations TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inspection_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read reports" ON public.inspection_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create reports" ON public.inspection_reports FOR INSERT TO authenticated WITH CHECK (true);

-- 7. Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- 8. Shift Schedules
CREATE TABLE public.shift_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  zone TEXT NOT NULL,
  role TEXT DEFAULT 'operator',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shift_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read schedules" ON public.shift_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own schedule" ON public.shift_schedules FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedule" ON public.shift_schedules FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_shift_schedules_updated_at BEFORE UPDATE ON public.shift_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Equipment Inventory
CREATE TABLE public.equipment_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  model TEXT,
  serial_number TEXT UNIQUE,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational','degraded','failed','maintenance','decommissioned')),
  install_date DATE,
  warranty_expiry DATE,
  specifications JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read inventory" ON public.equipment_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage inventory" ON public.equipment_inventory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update inventory" ON public.equipment_inventory FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_equipment_inventory_updated_at BEFORE UPDATE ON public.equipment_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. SLA Metrics
CREATE TABLE public.sla_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'met' CHECK (status IN ('met','at_risk','breached')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sla_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read SLA metrics" ON public.sla_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert SLA metrics" ON public.sla_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update SLA metrics" ON public.sla_metrics FOR UPDATE TO authenticated USING (true);

-- 11. Incidents
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','mitigated','resolved','closed')),
  location TEXT NOT NULL,
  affected_systems TEXT[],
  reported_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  root_cause TEXT,
  resolution TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read incidents" ON public.incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create incidents" ON public.incidents FOR INSERT TO authenticated WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Authenticated users can update incidents" ON public.incidents FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info','warning','critical','success')),
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- 13. Anomaly Insights
CREATE TABLE public.anomaly_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  anomaly_type TEXT NOT NULL,
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  affected_equipment TEXT[],
  location TEXT NOT NULL,
  recommended_action TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','acknowledged','investigating','resolved','dismissed')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anomaly_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read anomalies" ON public.anomaly_insights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert anomalies" ON public.anomaly_insights FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update anomalies" ON public.anomaly_insights FOR UPDATE TO authenticated USING (true);

-- 14. Analytics Snapshots
CREATE TABLE public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read snapshots" ON public.analytics_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert snapshots" ON public.analytics_snapshots FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_analytics_date ON public.analytics_snapshots(snapshot_date DESC);
CREATE INDEX idx_analytics_type ON public.analytics_snapshots(metric_type);

-- 15. System Settings
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read settings" ON public.system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage settings" ON public.system_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update settings" ON public.system_settings FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
