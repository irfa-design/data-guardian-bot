import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { SensorCard } from "@/components/dashboard/SensorCard";
import { RobotPanel } from "@/components/dashboard/RobotPanel";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { ServerRoomMap } from "@/components/dashboard/ServerRoomMap";
import { sensorReadings, alerts, robots, serverRacks } from "@/data/mockData";

const robotPositions = [
  { row: 0, col: 2, name: 'DCR-01' },
  { row: 1, col: 5, name: 'DCR-03' },
];

const Index = () => (
  <DashboardLayout>
    <StatsBar />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
        {sensorReadings.map(sensor => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>
      <RobotPanel robots={robots} />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3">
        <ServerRoomMap racks={serverRacks} robotPositions={robotPositions} />
      </div>
      <div className="lg:col-span-2">
        <AlertsPanel alerts={alerts} />
      </div>
    </div>
  </DashboardLayout>
);

export default Index;
