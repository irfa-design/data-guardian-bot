export interface SensorReading {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  location: string;
  trend: number[];
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  location: string;
  timestamp: string;
  resolved: boolean;
}

export interface RobotStatus {
  id: string;
  name: string;
  battery: number;
  status: 'patrolling' | 'inspecting' | 'charging' | 'idle';
  location: string;
  uptime: string;
  lastInspection: string;
  tasksCompleted: number;
}

export interface ServerRack {
  id: string;
  name: string;
  row: number;
  col: number;
  temperature: number;
  status: 'healthy' | 'warning' | 'critical';
  load: number;
}

export const sensorReadings: SensorReading[] = [
  { id: 's1', name: 'Avg Temperature', value: 22.4, unit: '°C', status: 'normal', location: 'Zone A', trend: [21, 21.5, 22, 22.4, 22.1, 21.8, 22.4] },
  { id: 's2', name: 'Humidity', value: 45, unit: '%', status: 'normal', location: 'Zone A', trend: [44, 45, 44, 46, 45, 45, 45] },
  { id: 's3', name: 'Airflow Rate', value: 3.2, unit: 'm/s', status: 'warning', location: 'Zone B', trend: [3.8, 3.6, 3.4, 3.2, 3.1, 3.0, 3.2] },
  { id: 's4', name: 'Power Draw', value: 847, unit: 'kW', status: 'normal', location: 'Main', trend: [820, 830, 840, 847, 845, 850, 847] },
  { id: 's5', name: 'Noise Level', value: 72, unit: 'dB', status: 'normal', location: 'Zone C', trend: [70, 71, 72, 72, 73, 72, 72] },
  { id: 's6', name: 'Hot Spot Temp', value: 38.7, unit: '°C', status: 'critical', location: 'Rack B-14', trend: [34, 35, 36, 37, 38, 38.5, 38.7] },
];

export const alerts: Alert[] = [
  { id: 'a1', severity: 'critical', message: 'Rack B-14 temperature exceeding threshold (38.7°C)', location: 'Zone B, Row 3', timestamp: '2 min ago', resolved: false },
  { id: 'a2', severity: 'warning', message: 'Airflow obstruction detected near Rack C-08', location: 'Zone C, Row 1', timestamp: '12 min ago', resolved: false },
  { id: 'a3', severity: 'warning', message: 'UPS battery degradation detected (82% capacity)', location: 'Power Room', timestamp: '28 min ago', resolved: false },
  { id: 'a4', severity: 'info', message: 'Scheduled maintenance window approaching for Zone A', location: 'Zone A', timestamp: '45 min ago', resolved: false },
  { id: 'a5', severity: 'info', message: 'Robot DCR-02 completed patrol cycle #147', location: 'Zone B', timestamp: '1 hr ago', resolved: true },
  { id: 'a6', severity: 'critical', message: 'Cooling unit CU-03 operating below optimal efficiency', location: 'HVAC', timestamp: '1.5 hr ago', resolved: true },
];

export const robots: RobotStatus[] = [
  { id: 'r1', name: 'DCR-01', battery: 78, status: 'patrolling', location: 'Zone A, Row 2', uptime: '14h 23m', lastInspection: '3 min ago', tasksCompleted: 147 },
  { id: 'r2', name: 'DCR-02', battery: 34, status: 'charging', location: 'Charging Bay 1', uptime: '22h 05m', lastInspection: '1 hr ago', tasksCompleted: 203 },
  { id: 'r3', name: 'DCR-03', battery: 91, status: 'inspecting', location: 'Zone B, Rack 14', uptime: '6h 41m', lastInspection: 'Now', tasksCompleted: 89 },
];

export const serverRacks: ServerRack[] = Array.from({ length: 32 }, (_, i) => {
  const row = Math.floor(i / 8);
  const col = i % 8;
  const zone = row < 2 ? 'A' : row < 3 ? 'B' : 'C';
  const temp = 20 + Math.random() * 10;
  const isCritical = (row === 1 && col === 5);
  const isWarning = (row === 2 && col === 3) || (row === 0 && col === 7);
  return {
    id: `rack-${zone}-${String(i + 1).padStart(2, '0')}`,
    name: `${zone}-${String(col + 1).padStart(2, '0')}`,
    row,
    col,
    temperature: isCritical ? 38.7 : isWarning ? 32.5 : Math.round(temp * 10) / 10,
    status: isCritical ? 'critical' as const : isWarning ? 'warning' as const : 'healthy' as const,
    load: Math.round(40 + Math.random() * 55),
  };
});
