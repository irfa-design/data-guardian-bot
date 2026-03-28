import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { ServerRack } from "@/data/mockData";

const statusColor: Record<string, string> = {
  healthy: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
};

function ServerRackMesh({
  rack,
  position,
  onClick,
  isSelected,
}: {
  rack: ServerRack;
  position: [number, number, number];
  onClick: () => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = statusColor[rack.status];

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        hovered ? 0.1 : 0,
        delta * 5
      );
    }
    if (glowRef.current && rack.status === "critical") {
      glowRef.current.scale.setScalar(
        1 + Math.sin(Date.now() * 0.005) * 0.05
      );
    }
  });

  const height = 1.2 + (rack.load / 100) * 0.6;

  return (
    <group position={position}>
      {/* Server rack body */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.7, height, 0.5]} />
        <meshStandardMaterial
          color={isSelected ? "#06b6d4" : hovered ? "#334155" : "#1e293b"}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Status LED strip */}
      <mesh position={[0.36, 0, 0]}>
        <boxGeometry args={[0.02, height * 0.8, 0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>

      {/* Temperature glow overlay */}
      {rack.status !== "healthy" && (
        <mesh ref={glowRef} position={[0, height / 2 + 0.1, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={rack.status === "critical" ? 4 : 2}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {/* Label */}
      <Text
        position={[0, height / 2 + 0.3, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        {rack.name}
      </Text>

      {/* Temperature label */}
      {(hovered || isSelected) && (
        <Text
          position={[0, -height / 2 - 0.2, 0]}
          fontSize={0.1}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          {`${rack.temperature}°C | ${rack.load}%`}
        </Text>
      )}

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, -height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function RobotMesh({
  position,
  name,
}: {
  position: [number, number, number];
  name: string;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={ref} position={position}>
        {/* Robot body */}
        <mesh castShadow>
          <capsuleGeometry args={[0.12, 0.2, 8, 16]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1} metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Antenna */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.15]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={3} />
        </mesh>
        {/* Label */}
        <Text position={[0, 0.45, 0]} fontSize={0.1} color="#06b6d4" anchorX="center">
          {name}
        </Text>
      </group>
    </Float>
  );
}

function FloorGrid() {
  return (
    <group position={[0, -1.2, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.8} />
      </mesh>
      <gridHelper args={[12, 24, "#1e3a5f", "#0f2847"]} position={[0, 0.01, 0]} />
    </group>
  );
}

function ZoneLabel({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <Text position={position} fontSize={0.2} color="#475569" anchorX="center" rotation={[-Math.PI / 2, 0, 0]}>
      {text}
    </Text>
  );
}

interface ServerRoom3DProps {
  racks: ServerRack[];
  robotPositions?: { row: number; col: number; name: string }[];
  onRackSelect?: (rack: ServerRack | null) => void;
}

export const ServerRoom3D = ({ racks, robotPositions = [], onRackSelect }: ServerRoom3DProps) => {
  const [selectedRack, setSelectedRack] = useState<string | null>(null);

  const handleRackClick = (rack: ServerRack) => {
    setSelectedRack(selectedRack === rack.id ? null : rack.id);
    onRackSelect?.(selectedRack === rack.id ? null : rack);
  };

  const selectedRackData = useMemo(
    () => racks.find((r) => r.id === selectedRack),
    [racks, selectedRack]
  );

  return (
    <div className="rounded-lg border bg-card overflow-hidden relative">
      <div className="flex items-center gap-2 p-4 border-b border-border/50">
        <div className="h-5 w-5 rounded bg-primary/20 flex items-center justify-center">
          <div className="h-2 w-2 rounded-sm bg-primary" />
        </div>
        <h2 className="font-semibold text-foreground">Server Room — 3D Live View</h2>
        <span className="ml-auto text-[10px] font-mono text-primary animate-pulse">● LIVE</span>
      </div>

      <div className="h-[420px] w-full">
        <Canvas
          shadows
          camera={{ position: [8, 6, 8], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => { gl.setClearColor("#0a0f1a"); }}
        >
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow shadow-mapSize={1024} />
          <pointLight position={[-5, 5, -5]} intensity={0.4} color="#06b6d4" />

          <Suspense fallback={null}>
            <FloorGrid />

            {/* Zone labels */}
            <ZoneLabel position={[-3, -1.18, -2.5]} text="ZONE A" />
            <ZoneLabel position={[0, -1.18, -2.5]} text="ZONE B" />
            <ZoneLabel position={[3, -1.18, -2.5]} text="ZONE C" />

            {/* Server racks */}
            {racks.map((rack) => {
              const x = (rack.col - 3.5) * 1.1;
              const z = (rack.row - 1.5) * 1.5;
              return (
                <ServerRackMesh
                  key={rack.id}
                  rack={rack}
                  position={[x, 0, z]}
                  onClick={() => handleRackClick(rack)}
                  isSelected={selectedRack === rack.id}
                />
              );
            })}

            {/* Robots */}
            {robotPositions.map((rp) => (
              <RobotMesh
                key={rp.name}
                position={[(rp.col - 3.5) * 1.1, 0.8, (rp.row - 1.5) * 1.5]}
                name={rp.name}
              />
            ))}

            <OrbitControls
              makeDefault
              minDistance={4}
              maxDistance={16}
              maxPolarAngle={Math.PI / 2.1}
              enablePan
              autoRotate
              autoRotateSpeed={0.3}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Selected rack info panel */}
      {selectedRackData && (
        <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm border border-primary/30 rounded-lg p-3 glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-primary text-lg">{selectedRackData.name}</span>
              <span className={`ml-3 text-xs font-mono uppercase ${
                selectedRackData.status === "critical" ? "text-destructive" : selectedRackData.status === "warning" ? "text-warning" : "text-success"
              }`}>
                {selectedRackData.status}
              </span>
            </div>
            <button onClick={() => { setSelectedRack(null); onRackSelect?.(null); }} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Temperature</span>
              <p className={`font-mono font-bold ${selectedRackData.temperature > 35 ? "text-destructive" : selectedRackData.temperature > 28 ? "text-warning" : "text-success"}`}>
                {selectedRackData.temperature}°C
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Load</span>
              <p className="font-mono font-bold text-foreground">{selectedRackData.load}%</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Position</span>
              <p className="font-mono text-foreground">R{selectedRackData.row + 1}C{selectedRackData.col + 1}</p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border/30 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-success/60" />
          <span className="text-muted-foreground">Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-warning/60" />
          <span className="text-muted-foreground">Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-destructive/60" />
          <span className="text-muted-foreground">Critical</span>
        </div>
        <span className="text-muted-foreground ml-auto">Click rack to inspect • Drag to rotate</span>
      </div>
    </div>
  );
};
