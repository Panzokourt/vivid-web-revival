import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  hullColor: string;
  tubeColor: string;
  canopyColor: string;
  scale: number;
  equipment: string[];
};

function Boat({ hullColor, tubeColor, canopyColor, scale, equipment }: Props) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    // gentle idle float
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
  });

  // Hull shape (extruded pointed shape)
  const hullGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.6, 0);
    shape.bezierCurveTo(-1.6, 0.35, -1.2, 0.55, 0, 0.55);
    shape.bezierCurveTo(1.4, 0.55, 1.8, 0.3, 2.2, -0.1);
    shape.bezierCurveTo(2.0, -0.15, 1.5, -0.15, 0, -0.15);
    shape.bezierCurveTo(-1.2, -0.15, -1.6, -0.1, -1.6, 0);
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 1.1,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 3,
      curveSegments: 24,
    });
    geom.translate(0, 0, -0.55);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, []);

  return (
    <group ref={group} scale={scale} rotation={[0, Math.PI * 0.15, 0]}>
      {/* Hull */}
      <mesh geometry={hullGeom} castShadow receiveShadow>
        <meshStandardMaterial color={hullColor} metalness={0.15} roughness={0.35} />
      </mesh>

      {/* Tubes - two side torus-like tubes running along hull */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[0, 0.15, side * 0.72]}
          rotation={[0, 0, 0]}
          castShadow
        >
          <capsuleGeometry args={[0.22, 3.2, 8, 20]} />
          <meshStandardMaterial color={tubeColor} metalness={0.05} roughness={0.75} />
          <group />
        </mesh>
      ))}
      {/* rotate capsules along X */}
      {[-1, 1].map((side) => (
        <mesh
          key={`t2-${side}`}
          position={[0, 0.15, side * 0.72]}
          rotation={[0, 0, Math.PI / 2]}
          visible={false}
        >
          <capsuleGeometry args={[0.22, 3.2, 8, 20]} />
          <meshStandardMaterial color={tubeColor} />
        </mesh>
      ))}

      {/* Console */}
      <mesh position={[0.1, 0.65, 0]} castShadow>
        <boxGeometry args={[0.9, 0.9, 1.1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.5} />
      </mesh>

      {/* Windscreen */}
      <mesh position={[0.55, 1.15, 0]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.05, 0.5, 1.0]} />
        <meshStandardMaterial color="#88a2b8" transparent opacity={0.4} metalness={0.9} roughness={0.05} />
      </mesh>

      {/* Canopy (bimini) */}
      {equipment.includes("bimini") && (
        <mesh position={[0.2, 1.9, 0]} castShadow>
          <boxGeometry args={[2.0, 0.06, 1.6]} />
          <meshStandardMaterial color={canopyColor} roughness={0.9} />
        </mesh>
      )}
      {equipment.includes("bimini") &&
        [-1, 1].map((s) => (
          <mesh key={`pole-${s}`} position={[s * 0.9 + 0.2, 1.4, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.0, 8]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

      {/* Sunbed */}
      {equipment.includes("sunbed") && (
        <mesh position={[-1.2, 0.4, 0]} castShadow>
          <boxGeometry args={[0.9, 0.15, 1.2]} />
          <meshStandardMaterial color={canopyColor} roughness={0.85} />
        </mesh>
      )}

      {/* VHF antenna */}
      {equipment.includes("vhf") && (
        <mesh position={[0.1, 1.6, 0.5]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 6]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      )}

      {/* GPS pod */}
      {equipment.includes("gps") && (
        <mesh position={[0.1, 1.15, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.05, 0.28, 0.42]} />
          <meshStandardMaterial color="#0a0a0a" emissive="#1a3a5c" emissiveIntensity={0.4} />
        </mesh>
      )}

      {/* Sport steering wheel */}
      {equipment.includes("sport-wheel") && (
        <mesh position={[0.05, 0.95, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.18, 0.025, 8, 24]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.4} />
        </mesh>
      )}

      {/* Passenger seat */}
      {equipment.includes("passenger-seat") && (
        <mesh position={[0.1, 0.75, -0.5]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={canopyColor} roughness={0.85} />
        </mesh>
      )}

      {/* Teak deck overlay */}
      {equipment.includes("teak") && (
        <mesh position={[0.1, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 1.2]} />
          <meshStandardMaterial color="#8b6a3d" roughness={0.9} />
        </mesh>
      )}

      {/* Motor */}
      <mesh position={[-1.9, 0.35, 0]} castShadow>
        <boxGeometry args={[0.4, 0.7, 0.35]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function BoatCanvas(props: Props) {
  return (
    <Canvas
      shadows
      camera={{ position: [5, 3.2, 5], fov: 35 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#EDEAE4"]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Suspense fallback={null}>
        <Boat {...props} />
        <ContactShadows position={[0, -0.2, 0]} opacity={0.35} scale={12} blur={2.5} far={4} />
        <Environment preset="studio" />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
