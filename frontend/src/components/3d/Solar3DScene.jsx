import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import {
  OrbitControls, ContactShadows,
  Html, Stars, Grid, Text, Sky, Environment,
  GradientTexture,
} from '@react-three/drei';
import * as THREE from 'three';
import SolarPanel3D from './SolarPanel3D';
import EnergyParticles from './EnergyParticles';
import { ArrowRight, ArrowLeft, Check, Building2 } from 'lucide-react';

const ARRAY_ELEVATION_Y = 0.88;

// ── Dynamic Lighting Conditions ──────────────────────────────────────────────
function getLightingConditions(hour, cloudShadowFactor = 0, meteoData = null) {
  const isNight   = hour < 5.5 || hour > 19.5;
  const isSunrise = !isNight && hour >= 5.5 && hour < 8.0;
  const isSunset  = !isNight && hour >= 17.0 && hour <= 19.5;
  const isNoon    = !isNight && hour >= 10.5 && hour <= 14.5;

  let solarFactor = 0;
  if (!isNight) {
    solarFactor = Math.sin(((hour - 5.5) / 14) * Math.PI);
  }

  const meteoMultiplier = meteoData?.totalW > 0
    ? Math.min(1.5, Math.max(0.4, meteoData.totalW / 700.0)) : 1.1;
  const effectiveCloud = Math.min(1.0, cloudShadowFactor + (meteoData?.cloudPct ? meteoData.cloudPct / 180 : 0));

  const sunAngle = ((hour - 5.5) / 14) * Math.PI;
  const sunPosition = isNight
    ? [25, -15, 12]
    : [-Math.cos(sunAngle) * 32, Math.max(3.0, Math.sin(sunAngle) * 32), 15 - Math.cos(sunAngle) * 5];

  let skyColor, sunColor, ambientColor, lightIntensity, ambientIntensity, hemiIntensity;
  let skyInclination, skyAzimuth;

  if (isNight) {
    skyColor = '#030810'; sunColor = '#506e96'; ambientColor = '#0a1520';
    lightIntensity = 0.15; ambientIntensity = 0.3; hemiIntensity = 0.2;
    skyInclination = 0.0; skyAzimuth = 0.25;
  } else if (isSunrise || isSunset) {
    skyColor = '#1a2040'; sunColor = '#ff9a3c'; ambientColor = '#ffc88a';
    const t = Math.max(0.3, solarFactor);
    lightIntensity = 3.8 * t * (1 - effectiveCloud * 0.5) * meteoMultiplier;
    ambientIntensity = 1.2 * t * meteoMultiplier; hemiIntensity = 1.0 * t;
    skyInclination = isSunrise ? 0.505 : 0.495; skyAzimuth = isSunrise ? 0.05 : 0.25;
  } else if (isNoon) {
    skyColor = '#0e2a50'; sunColor = '#fffefa'; ambientColor = '#ddf0ff';
    lightIntensity = 6.5 * (1 - effectiveCloud * 0.65) * meteoMultiplier;
    ambientIntensity = 2.8 * meteoMultiplier; hemiIntensity = 2.0;
    skyInclination = 0.49; skyAzimuth = 0.25;
  } else {
    skyColor = '#0d2645'; sunColor = '#fff8ee'; ambientColor = '#cce8ff';
    lightIntensity = 5.2 * Math.max(0.4, solarFactor) * (1 - effectiveCloud * 0.6) * meteoMultiplier;
    ambientIntensity = 2.2 * Math.max(0.4, solarFactor) * meteoMultiplier;
    hemiIntensity = 1.7 * Math.max(0.4, solarFactor);
    skyInclination = 0.495; skyAzimuth = 0.25;
  }

  return {
    isNight, isSunrise, isSunset, isNoon, solarFactor, sunPosition,
    skyColor, sunColor, ambientColor,
    lightIntensity, ambientIntensity, hemiIntensity,
    effectiveCloud, meteoMultiplier,
    skyInclination, skyAzimuth,
  };
}

// ── Procedural Sky & Atmosphere ─────────────────────────────────────────────
function SceneSky({ isNight, isSunrise, isSunset, inclination, azimuth }) {
  if (isNight) return null;
  return (
    <Sky
      distance={450000}
      sunPosition={[
        Math.sin(azimuth * Math.PI * 2) * Math.cos((inclination - 0.5) * Math.PI),
        Math.sin((inclination - 0.5) * Math.PI),
        Math.cos(azimuth * Math.PI * 2) * Math.cos((inclination - 0.5) * Math.PI),
      ]}
      inclination={inclination}
      azimuth={azimuth}
      mieCoefficient={0.006}
      mieDirectionalG={0.82}
      rayleigh={isSunrise || isSunset ? 1.8 : 0.9}
      turbidity={isSunrise || isSunset ? 12 : 5}
    />
  );
}

// ── Camera Tour Controller ───────────────────────────────────────────────────
function CameraTourController({ tourStep }) {
  const ref = useRef();
  const targets = useMemo(() => [
    { camPos: [-12.0, 8.5, 15.0], target: [0, ARRAY_ELEVATION_Y, 0] },
    { camPos: [-4.5, 4.5, 7.0],   target: [-2.2, ARRAY_ELEVATION_Y, 0] },
    { camPos: [3.5, 4.0, 7.0],    target: [2.2, ARRAY_ELEVATION_Y, 0] },
    { camPos: [10.5, 5.0, 6.0],   target: [11.5, 1.2, 0] },
    { camPos: [-8.5, 4.5, 6.0],   target: [-9.8, 2.2, -3.8] },
    { camPos: [-11.5, 5.0, 7.0],  target: [-13.5, 1.4, 1.8] },
  ], []);

  useFrame((state, delta) => {
    if (!ref.current || tourStep === null || !targets[tourStep]) return;
    const { camPos, target } = targets[tourStep];
    state.camera.position.lerp(new THREE.Vector3(...camPos), delta * 3.0);
    ref.current.target.lerp(new THREE.Vector3(...target), delta * 3.0);
    ref.current.update();
  });

  return (
    <OrbitControls ref={ref} enableDamping dampingFactor={0.07}
      minDistance={4.0} maxDistance={42}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minPolarAngle={Math.PI / 14}
      target={[0, ARRAY_ELEVATION_Y, 0]}
    />
  );
}

// ── Premium Terrain Ground ───────────────────────────────────────────────────
function Terrain({ isNight }) {
  return (
    <group>
      {/* Base field — tinted grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[100, 100, 1, 1]} />
        <meshStandardMaterial
          color={isNight ? '#060c08' : '#0e2010'}
          roughness={0.98}
          metalness={0.0}
        />
      </mesh>

      {/* Gravel / compacted access road pad under array */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[28, 16]} />
        <meshStandardMaterial color={isNight ? '#121a14' : '#192818'} roughness={0.97} metalness={0.01} />
      </mesh>

      {/* Gravel service road strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0.001, 8]}>
        <planeGeometry args={[5, 20]} />
        <meshStandardMaterial color={isNight ? '#1a1a1a' : '#2a2a2a'} roughness={0.95} metalness={0.01} />
      </mesh>

      {/* Technical Engineering Grid */}
      <Grid
        position={[0, 0.001, 0]}
        args={[100, 100]}
        cellSize={1.5}
        cellThickness={0.2}
        cellColor={isNight ? '#0d2218' : '#162e1e'}
        sectionSize={6}
        sectionThickness={0.5}
        sectionColor={isNight ? '#153622' : '#1e5030'}
        fadeDistance={48}
        fadeStrength={1.5}
        infiniteGrid
      />
    </group>
  );
}

// ── Galvanized Steel Mounting Racking ────────────────────────────────────────
function MountingRacking({ rowZPositions = [-3.45, -1.15, 1.15, 3.45], rowLength = 19.5 }) {
  const pipeColor   = '#7c8fa0';
  const steelGray   = '#586474';
  const concreteCol = '#3d4a56';

  return (
    <group>
      {rowZPositions.map((z, rowIdx) => (
        <group key={`row-rack-${rowIdx}`}>
          {/* Torque tube — square hollow section with seam highlight */}
          <mesh position={[0, ARRAY_ELEVATION_Y, z]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.052, 0.052, rowLength, 12]} />
            <meshStandardMaterial color={pipeColor} metalness={0.94} roughness={0.15} />
          </mesh>

          {/* Torque tube galvanized sheen seam */}
          <mesh position={[0, ARRAY_ELEVATION_Y + 0.052, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.004, 0.004, rowLength, 6]} />
            <meshStandardMaterial color="#9ab0c0" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Central motor actuator / slew ring */}
          <group position={[0, ARRAY_ELEVATION_Y, z]}>
            <mesh castShadow>
              <boxGeometry args={[0.28, 0.24, 0.24]} />
              <meshStandardMaterial color="#1e2c3a" metalness={0.85} roughness={0.28} />
            </mesh>
            {/* motor bolts */}
            {[-0.1, 0.1].map((bx, bi) => (
              <mesh key={`bolt-${bi}`} position={[bx, 0.13, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
                <meshStandardMaterial color="#4a5568" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
          </group>

          {/* Dual purlin channel rails */}
          {[-0.36, 0.36].map((off, ri) => (
            <mesh key={`purlin-${ri}`} position={[0, ARRAY_ELEVATION_Y + 0.04, z + off]} castShadow>
              <boxGeometry args={[rowLength - 0.5, 0.026, 0.036]} />
              <meshStandardMaterial color={steelGray} metalness={0.9} roughness={0.22} />
            </mesh>
          ))}

          {/* Concrete pier foundations + galvanized posts */}
          {[-8.4, -6.0, -3.6, -1.2, 1.2, 3.6, 6.0, 8.4].map((x, ci) => (
            <group key={`post-${ci}`} position={[x, 0, z]}>
              {/* Concrete footing */}
              <mesh position={[0, 0.04, 0]} receiveShadow>
                <boxGeometry args={[0.32, 0.08, 0.32]} />
                <meshStandardMaterial color={concreteCol} roughness={0.95} metalness={0.02} />
              </mesh>
              {/* Anchor bolt pattern */}
              {[[-0.1,-0.1],[-0.1,0.1],[0.1,-0.1],[0.1,0.1]].map(([ax,az], ai) => (
                <mesh key={`ab-${ai}`} position={[ax, 0.08, az]}>
                  <cylinderGeometry args={[0.008, 0.008, 0.04, 6]} />
                  <meshStandardMaterial color="#8a9ab0" metalness={0.95} roughness={0.15} />
                </mesh>
              ))}
              {/* Galvanized post */}
              <mesh position={[0, ARRAY_ELEVATION_Y / 2 + 0.05, 0]} castShadow>
                <cylinderGeometry args={[0.042, 0.048, ARRAY_ELEVATION_Y, 12]} />
                <meshStandardMaterial color={pipeColor} metalness={0.92} roughness={0.18} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

// ── SCADA Weather Station Mast ───────────────────────────────────────────────
function WeatherStationMast({ isNight }) {
  const anemRef = useRef();
  useFrame((_, delta) => {
    if (anemRef.current) anemRef.current.rotation.y += delta * 5.0;
  });

  const mastColor = '#8da0b0';
  return (
    <group position={[-9.8, 0, -3.8]}>
      {/* Concrete base */}
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <boxGeometry args={[0.9, 0.14, 0.9]} />
        <meshStandardMaterial color="#3d4a56" roughness={0.95} metalness={0.02} />
      </mesh>

      {/* Main tapered mast */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.044, 4.0, 14]} />
        <meshStandardMaterial color={mastColor} metalness={0.93} roughness={0.16} />
      </mesh>

      {/* Cross boom */}
      <mesh position={[0, 3.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.013, 0.013, 1.0, 8]} />
        <meshStandardMaterial color={mastColor} metalness={0.93} roughness={0.16} />
      </mesh>

      {/* Cup anemometer */}
      <group position={[-0.46, 3.85, 0]}>
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 0.09, 8]} />
          <meshStandardMaterial color="#2d3a48" />
        </mesh>
        <group ref={anemRef}>
          {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
            <group key={`cup-${i}`} rotation={[0, angle, 0]}>
              <mesh position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.003, 0.003, 0.12, 6]} />
                <meshStandardMaterial color="#5a6a7a" />
              </mesh>
              <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <sphereGeometry args={[0.022, 12, 12, 0, Math.PI]} />
                <meshStandardMaterial color="#0f172a" roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* Pyranometer dome */}
      <group position={[0.46, 3.82, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.038, 0.038, 0.052, 16]} />
          <meshStandardMaterial color="#f0f4f8" metalness={0.75} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.032, 0]}>
          <sphereGeometry args={[0.024, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#ffffff" clearcoat={1.0} roughness={0.04} transparent opacity={0.9} />
        </mesh>
      </group>

      {/* Radiation shields (louvered temperature sensor) */}
      <group position={[0, 2.6, 0.14]}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={`s-${i}`} position={[0, i * 0.035, 0]}>
            <cylinderGeometry args={[0.06, 0.05, 0.014, 14]} />
            <meshStandardMaterial color="#f0f4f8" roughness={0.55} />
          </mesh>
        ))}
      </group>

      {/* Warning beacon light */}
      <mesh position={[0, 4.06, 0]}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={isNight ? 3.5 : 0.5}
        />
      </mesh>
    </group>
  );
}

// ── Industrial Central Inverter Substation ───────────────────────────────────
function InverterSubstation({ currentKW }) {
  const isOn = currentKW > 0;
  const fanRef1 = useRef();
  const fanRef2 = useRef();

  useFrame((_, delta) => {
    if (isOn) {
      if (fanRef1.current) fanRef1.current.rotation.z += delta * 16;
      if (fanRef2.current) fanRef2.current.rotation.z += delta * 16;
    }
  });

  const bodyColor = '#b8c8d8';
  const darkMetal = '#1e2c3a';
  const steelCol  = '#3d5060';

  return (
    <group position={[11.5, 0, 0]}>
      {/* Concrete equipment skid */}
      <mesh position={[0, 0.09, 0]} receiveShadow>
        <boxGeometry args={[3.8, 0.18, 3.6]} />
        <meshStandardMaterial color="#3a464e" roughness={0.94} />
      </mesh>

      {/* Painted yellow cable trench strips */}
      {[[-1.8, 0], [1.8, 0]].map(([tx, tz], i) => (
        <mesh key={`stripe-${i}`} position={[tx, 0.178, tz]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 3.5]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      ))}

      {/* Main inverter housing */}
      <group position={[-0.4, 1.22, 0]}>
        {/* Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.3, 1.96, 1.85]} />
          <meshStandardMaterial color={bodyColor} metalness={0.72} roughness={0.28} />
        </mesh>

        {/* Rear louvered vents */}
        {[-0.92, 0.92].map((sz, si) => (
          <group key={`vent-${si}`} position={[0, 0, sz]}>
            {Array.from({ length: 8 }, (_, vi) => (
              <mesh key={`louver-${vi}`} position={[0, -0.6 + vi * 0.18, sz < 0 ? -0.004 : 0.004]}>
                <boxGeometry args={[1.8, 0.04, 0.015]} />
                <meshStandardMaterial color={darkMetal} metalness={0.9} roughness={0.3} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Front face panel — dark brushed steel */}
        <mesh position={[0, 0, 0.925]}>
          <boxGeometry args={[2.28, 1.94, 0.018]} />
          <meshStandardMaterial color="#1a2534" metalness={0.88} roughness={0.22} />
        </mesh>

        {/* Front top exhaust fans */}
        {[-0.6, 0.6].map((fx, fi) => (
          <group key={`fan-${fi}`} position={[fx, 0.78, 0.935]}>
            {/* Fan housing ring */}
            <mesh castShadow>
              <torusGeometry args={[0.26, 0.04, 10, 24]} />
              <meshStandardMaterial color={steelCol} metalness={0.85} roughness={0.28} />
            </mesh>
            {/* Guard grille */}
            {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((ang, gi) => (
              <mesh key={`grille-${gi}`} rotation={[0, 0, ang]}>
                <boxGeometry args={[0.52, 0.014, 0.012]} />
                <meshStandardMaterial color={darkMetal} metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
            {/* Spinning blades */}
            <group ref={fi === 0 ? fanRef1 : fanRef2} rotation={[0, 0, 0]}>
              {[0, Math.PI / 3, (2*Math.PI)/3, Math.PI, (4*Math.PI)/3, (5*Math.PI)/3].map((ang, bi) => (
                <mesh key={`blade-${bi}`} rotation={[0, 0, ang]} position={[0, 0, 0.009]}>
                  <boxGeometry args={[0.22, 0.038, 0.006]} />
                  <meshStandardMaterial color="#0f1c28" metalness={0.8} roughness={0.25} />
                </mesh>
              ))}
            </group>
          </group>
        ))}

        {/* LCD telemetry display bezel */}
        <group position={[0, 0.12, 0.944]}>
          <mesh castShadow>
            <boxGeometry args={[1.15, 0.58, 0.038]} />
            <meshStandardMaterial color="#0a0f18" metalness={0.92} roughness={0.18} />
          </mesh>
          {/* Screen */}
          <mesh position={[0, 0, 0.020]}>
            <planeGeometry args={[1.06, 0.50]} />
            <meshStandardMaterial color="#020614" emissive="#020614" emissiveIntensity={1} />
          </mesh>
          {isOn && (
            <group position={[0, 0, 0.024]}>
              <Text position={[-0.48, 0.17, 0]} color="#38bdf8" fontSize={0.048} anchorX="left" anchorY="middle">
                HELIOS SCADA · 1500V DC
              </Text>
              <Text position={[-0.48, 0.07, 0]} color="#64748b" fontSize={0.038} anchorX="left" anchorY="middle">
                AC OUTPUT — GRID TIED
              </Text>
              <Text position={[-0.48, -0.08, 0]} color="#10b981" fontSize={0.115} anchorX="left" anchorY="middle">
                {currentKW} kW
              </Text>
            </group>
          )}
        </group>

        {/* LED status strip */}
        <group position={[0, -0.22, 0.945]}>
          <mesh>
            <boxGeometry args={[0.5, 0.055, 0.018]} />
            <meshStandardMaterial color={darkMetal} />
          </mesh>
          {[-0.16, 0, 0.16].map((x, i) => (
            <mesh key={`led-${i}`} position={[x, 0, 0.012]}>
              <sphereGeometry args={[0.016, 12, 12]} />
              <meshStandardMaterial
                color={isOn ? (i === 0 ? '#10b981' : i === 1 ? '#f59e0b' : '#3b82f6') : '#1e2a38'}
                emissive={isOn ? (i === 0 ? '#10b981' : i === 1 ? '#f59e0b' : '#3b82f6') : '#000'}
                emissiveIntensity={isOn ? 2.8 : 0}
              />
            </mesh>
          ))}
        </group>

        {/* Lower maintenance doors */}
        {[-0.55, 0.55].map((dx, di) => (
          <group key={`door-${di}`} position={[dx, -0.58, 0.935]}>
            <mesh castShadow>
              <boxGeometry args={[0.95, 0.68, 0.030]} />
              <meshStandardMaterial color="#c8d8e8" metalness={0.76} roughness={0.28} />
            </mesh>
            {/* Ventilation louvres on door */}
            {Array.from({ length: 4 }, (_, li) => (
              <mesh key={`dl-${li}`} position={[0, -0.12 + li * 0.09, 0.016]}>
                <boxGeometry args={[0.72, 0.018, 0.008]} />
                <meshStandardMaterial color={darkMetal} metalness={0.9} roughness={0.25} />
              </mesh>
            ))}
            <mesh position={[di === 0 ? 0.36 : -0.36, 0, 0.022]} castShadow>
              <boxGeometry args={[0.028, 0.11, 0.018]} />
              <meshStandardMaterial color="#2a3a4a" metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Warning label plate */}
        <mesh position={[0, -0.93, 0.936]}>
          <planeGeometry args={[0.4, 0.11]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* Medium voltage step-up transformer */}
      <group position={[1.15, 0.98, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.05, 1.65, 1.45]} />
          <meshStandardMaterial color={steelCol} metalness={0.82} roughness={0.28} />
        </mesh>
        {/* Oil cooling radiator banks */}
        {[-0.74, 0.74].map((rz, ri) => (
          <group key={`rad-${ri}`} position={[0, -0.08, rz]}>
            {Array.from({ length: 7 }, (_, fi) => (
              <mesh key={`fin-${fi}`} position={[(fi - 3) * 0.14, 0, 0]}>
                <boxGeometry args={[0.022, 1.30, 0.12]} />
                <meshStandardMaterial color="#2a3a4a" metalness={0.92} roughness={0.18} />
              </mesh>
            ))}
          </group>
        ))}
        {/* HV porcelain bushings */}
        {[-0.32, 0, 0.32].map((bx, bi) => (
          <group key={`bushing-${bi}`} position={[bx, 0.95, 0]}>
            {Array.from({ length: 5 }, (_, i) => (
              <mesh key={`disc-${i}`} position={[0, i * 0.055, 0]}>
                <cylinderGeometry args={[0.048, 0.065, 0.036, 14]} />
                <meshStandardMaterial color="#6b3a10" roughness={0.18} metalness={0.05} />
              </mesh>
            ))}
            <mesh position={[0, 0.30, 0]}>
              <cylinderGeometry args={[0.013, 0.013, 0.14, 8]} />
              <meshStandardMaterial color="#e8edf2" metalness={0.92} roughness={0.12} />
            </mesh>
          </group>
        ))}
        {/* Conservator expansion tank */}
        <mesh position={[0, 1.02, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.55, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={steelCol} metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* DC cable tray from array */}
      <mesh position={[-1.85, 0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.55, 0.2, 0.1]} />
        <meshStandardMaterial color={darkMetal} metalness={0.85} roughness={0.28} />
      </mesh>
      {[-0.06, 0.06].map((z, i) => (
        <mesh key={`dc-${i}`} position={[-1.5, 0.32, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 1.5, 10]} />
          <meshStandardMaterial color={i === 0 ? '#b91c1c' : '#0f172a'} metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ── SCADA Operations Building ────────────────────────────────────────────────
function ControlRoomBuilding({ onOpenControlRoom, isNight }) {
  const [hovered, setHovered] = useState(false);

  const wallColor  = hovered ? '#1e3a8a' : '#1a2840';
  const glowEmit   = hovered ? 0.5 : isNight ? 0.35 : 0.08;

  return (
    <group
      position={[-13.5, 0, 1.8]}
      onClick={e => { e.stopPropagation(); onOpenControlRoom(); }}
      onPointerOver={e => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* Foundation / perimeter concrete pad */}
      <mesh position={[0, 0.09, 0]} receiveShadow>
        <boxGeometry args={[4.6, 0.18, 5.4]} />
        <meshStandardMaterial color="#2e3d4a" roughness={0.93} metalness={0.02} />
      </mesh>

      {/* Safety line around perimeter */}
      {[[-2.2, 0], [2.2, 0], [0, -2.6], [0, 2.6]].map(([px, pz], i) => (
        <mesh key={`safeline-${i}`} position={[px, 0.178, pz]}
          rotation={[-Math.PI / 2, 0, i < 2 ? Math.PI / 2 : 0]}>
          <planeGeometry args={[0.1, i < 2 ? 5.4 : 4.6]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      ))}

      {/* Main building body — dark brushed cladding */}
      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.7, 4.8]} />
        <meshStandardMaterial color={wallColor} metalness={0.88} roughness={0.22} />
      </mesh>

      {/* Architectural reveal band mid-height */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[3.84, 0.08, 4.84]} />
        <meshStandardMaterial color="#0a1220" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Parapet roof cap */}
      <mesh position={[0, 2.96, 0]} castShadow>
        <boxGeometry args={[4.0, 0.12, 5.0]} />
        <meshStandardMaterial color="#0e1c2c" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Panoramic NOC glazing — east face */}
      <mesh position={[1.91, 1.65, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.4, 1.5]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          roughness={0.06}
          metalness={0.95}
          clearcoat={1.0}
          transparent
          opacity={0.65}
          emissive="#0ea5e9"
          emissiveIntensity={glowEmit}
        />
      </mesh>
      {/* Window mullions */}
      {[-1.1, 0, 1.1].map((wz, wi) => (
        <mesh key={`mull-${wi}`} position={[1.925, 1.65, wz]}>
          <boxGeometry args={[0.04, 1.5, 0.06]} />
          <meshStandardMaterial color="#0e1c2c" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}

      {/* Side accent window */}
      <mesh position={[0, 1.75, 2.41]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.8, 0.9]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          roughness={0.06}
          metalness={0.95}
          clearcoat={1.0}
          transparent
          opacity={0.55}
          emissive="#0ea5e9"
          emissiveIntensity={glowEmit * 0.7}
        />
      </mesh>

      {/* Steel entrance canopy */}
      <mesh position={[0, 2.25, 2.43]} castShadow>
        <boxGeometry args={[2.0, 0.06, 0.9]} />
        <meshStandardMaterial color="#0a1220" metalness={0.9} roughness={0.18} />
      </mesh>
      {[-0.8, 0.8].map((cx, ci) => (
        <mesh key={`canopy-post-${ci}`} position={[cx, 1.9, 2.43]} castShadow>
          <boxGeometry args={[0.06, 0.7, 0.06]} />
          <meshStandardMaterial color="#1a2840" metalness={0.88} roughness={0.2} />
        </mesh>
      ))}

      {/* Entrance door */}
      <mesh position={[0, 1.08, 2.41]} castShadow>
        <boxGeometry args={[1.05, 1.98, 0.025]} />
        <meshStandardMaterial color="#0a1220" metalness={0.78} roughness={0.18} />
      </mesh>
      {/* Door handle bar */}
      <mesh position={[0.38, 1.08, 2.424]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.55, 10]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#10b981" metalness={0.95} roughness={0.1} emissive="#10b981" emissiveIntensity={0.4} />
      </mesh>

      {/* Roof HVAC unit */}
      <mesh position={[-0.9, 3.08, -0.9]} castShadow>
        <boxGeometry args={[1.4, 0.5, 1.4]} />
        <meshStandardMaterial color="#2a3a4a" metalness={0.82} roughness={0.3} />
      </mesh>
      {/* HVAC fan grille */}
      <mesh position={[-0.9, 3.34, -0.9]}>
        <cylinderGeometry args={[0.5, 0.5, 0.02, 20]} />
        <meshStandardMaterial color="#1a2434" metalness={0.88} roughness={0.2} />
      </mesh>

      {/* Satellite dish */}
      <group position={[0.9, 3.0, 0.9]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.85, 8]} />
          <meshStandardMaterial color="#8da0b0" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0, 0.84, 0]} rotation={[0.45, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.50, 18, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f0f4f8" metalness={0.82} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* Dish LNB arm */}
        <mesh position={[0, 1.1, 0.35]} rotation={[0.45, 0, 0]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.5, 6]} />
          <meshStandardMaterial color="#8da0b0" metalness={0.9} />
        </mesh>
      </group>

      {/* Ground-level security bollards */}
      {[-1.6, -0.8, 0.8, 1.6].map((bx, bi) => (
        <group key={`bollard-${bi}`} position={[bx, 0, 2.8]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.07, 0.7, 10]} />
            <meshStandardMaterial color="#1a2840" metalness={0.88} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <sphereGeometry args={[0.065, 10, 10]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={isNight ? 1.5 : 0.1} />
          </mesh>
        </group>
      ))}

      {/* Hover / entry tooltip */}
      <Html position={[0, 3.7, 0]} center distanceFactor={11} zIndexRange={[100, 0]}>
        <button
          onClick={e => { e.stopPropagation(); onOpenControlRoom(); }}
          className={`px-3.5 py-1.5 rounded-xl text-2xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xl select-none ${
            hovered
              ? 'bg-sky-500 text-slate-950 scale-105 ring-4 ring-sky-400/30'
              : 'glass-panel text-sky-400 border border-sky-500/40 hover:text-white'
          }`}
        >
          <Building2 size={13} className="text-emerald-400" />
          <span>SCADA Control Center</span>
        </button>
      </Html>
    </group>
  );
}

// ── DC Cable Tray Bus ─────────────────────────────────────────────────────────
function DCBusCables() {
  return (
    <group>
      {/* Underground cable trench marker strip */}
      <mesh position={[5.8, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11.5, 0.25]} />
        <meshStandardMaterial color="#1e2c3a" roughness={0.95} />
      </mesh>
      {/* Cable conduit outline */}
      {[-0.06, 0.06].map((z, i) => (
        <mesh key={`cable-${i}`} position={[5.8, 0.06, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 11.4, 10]} />
          <meshStandardMaterial color={i === 0 ? '#991b1b' : '#0c1422'} metalness={0.45} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ── Main Solar3DScene Component ──────────────────────────────────────────────
export default function Solar3DScene({
  hourOfDay, panelDataList, selectedPanel, onSelectPanel,
  currentKW, tourStep, onNextTourStep, onPrevTourStep, onEndTour,
  activeFormulaHighlight, onFormulaHover,
  panelTiltDeg = 30, cloudShadowFactor = 0, faultedPanels = {},
  onSetPanelFault, trackingMode = 'fixed',
  fixedKW = 0, trackedKW = 0, gainPct = 0,
  meteoData = null, onOpenControlRoom = () => {},
}) {
  const lighting = useMemo(
    () => getLightingConditions(hourOfDay, cloudShadowFactor, meteoData),
    [hourOfDay, cloudShadowFactor, meteoData]
  );

  const { isNight, isSunrise, isSunset, lightIntensity, ambientIntensity,
    hemiIntensity, sunPosition, skyInclination, skyAzimuth } = lighting;

  const targetRoll = useMemo(() => {
    if (trackingMode !== 'tracking') return 0;
    if (isNight) return 0;
    const progress = (hourOfDay - 6) / 12;
    return THREE.MathUtils.clamp((progress - 0.5) * (Math.PI * 0.55), -0.75, 0.75);
  }, [trackingMode, hourOfDay, isNight]);

  // 8 col × 4 row grid
  const gridPositions = useMemo(() => {
    const arr = []; let id = 1;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        arr.push({
          id,
          pos: [(c - 3.5) * 2.45, ARRAY_ELEVATION_Y, (r - 1.5) * 2.3],
        });
        id++;
      }
    }
    return arr;
  }, []);

  const tourCallouts = useMemo(() => [
    { title: 'Monocrystalline PV Array', text: '48 kW · 32 half-cut monocrystalline modules with anti-reflective optical glass, 9-busbar cells, and P1000 MLPE optimizers on every panel.', anchorPos: [-4.5, ARRAY_ELEVATION_Y + 1.0, 0] },
    { title: 'Single-Axis Tracking', text: 'Motorized slew drives rotate torque tubes with sun azimuth, boosting daily generation yield by +18% to +26%.', anchorPos: [0, ARRAY_ELEVATION_Y + 0.8, 0] },
    { title: 'Galvanized Racking', text: 'C-section galvanized torque tubes elevated at 0.88 m on reinforced concrete pier foundations, rated for 140 km/h wind loads.', anchorPos: [4.5, ARRAY_ELEVATION_Y + 0.5, 0] },
    { title: 'Central Inverter Substation', text: 'Utility-grade 1500 V DC central inverter with dual forced-air turbine cooling and medium-voltage oil-cooled step-up transformer.', anchorPos: [11.5, 2.2, 0] },
    { title: 'Weather Telemetry Mast', text: 'Calibrated pyranometers, three-cup anemometer, and radiation-shielded thermometer delivering real-time data to Open-Meteo models.', anchorPos: [-9.8, 2.6, -3.8] },
    { title: 'SCADA Operations Center', text: 'On-site command facility with curved NOC video wall, Edge AI XGBoost inference servers, Modbus RTU gateways, and 40 kVA online UPS.', anchorPos: [-13.5, 2.8, 1.8] },
  ], []);

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden glass-card shadow-2xl">
      <Canvas
        shadows="soft"
        camera={{ position: [-10.0, 8.0, 14.0], fov: 40 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isNight ? 0.75 : 1.25,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[lighting.skyColor]} />
        <fog attach="fog" args={[lighting.skyColor, 28, 70]} />

        {/* Night sky */}
        {isNight && <Stars radius={65} depth={55} count={3500} factor={4.5} saturation={0} fade speed={0.8} />}

        {/* Procedural sky */}
        <SceneSky
          isNight={isNight}
          isSunrise={isSunrise}
          isSunset={isSunset}
          inclination={skyInclination}
          azimuth={skyAzimuth}
        />

        {/* Ambient + Hemisphere */}
        <ambientLight color={lighting.ambientColor} intensity={ambientIntensity} />
        <hemisphereLight
          color={lighting.ambientColor}
          groundColor={isNight ? '#060c06' : '#0e1e10'}
          intensity={hemiIntensity}
        />

        {/* Primary Sun Directional Light */}
        <directionalLight
          position={sunPosition}
          intensity={lightIntensity}
          color={lighting.sunColor}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-near={1}
          shadow-camera-far={70}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
          shadow-bias={-0.00025}
          shadow-normalBias={0.04}
        />

        {/* Subtle fill light for realistic bounce */}
        <pointLight
          position={[0, 6, 12]}
          intensity={lightIntensity * 0.25}
          color={lighting.ambientColor}
          distance={45}
          decay={2}
        />

        {/* Sun disk in sky */}
        {!isNight && (
          <group position={sunPosition}>
            <mesh>
              <sphereGeometry args={[2.0, 24, 24]} />
              <meshBasicMaterial color={isSunrise || isSunset ? '#ffa236' : '#fffbe0'} />
            </mesh>
            <mesh>
              <sphereGeometry args={[3.5, 18, 18]} />
              <meshBasicMaterial
                color={isSunrise || isSunset ? '#ff8c00' : '#ffe080'}
                transparent opacity={0.2}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        )}

        {/* ── Terrain & Ground ── */}
        <Terrain isNight={isNight} />

        {/* ── DC Cable Bus ── */}
        <DCBusCables />

        {/* ── Solar Panel Array 32× ── */}
        {gridPositions.map((item, idx) => {
          const data = panelDataList[idx % panelDataList.length] || { id: item.id, predictedKW: 0, label: `Panel A-${idx + 1}`, status: 'Standby' };
          const isSel = !!(selectedPanel && selectedPanel.id === data.id);
          return (
            <SolarPanel3D
              key={item.id}
              panelData={data}
              position={item.pos}
              isSelected={isSel}
              onSelectPanel={onSelectPanel}
              totalArrayKW={currentKW}
              isPulseHighlighted={activeFormulaHighlight === 'kw'}
              panelTiltDeg={panelTiltDeg}
              onSetFault={onSetPanelFault}
              targetRoll={targetRoll}
              trackingMode={trackingMode}
              sunlightFactor={lighting.solarFactor * (1 - lighting.effectiveCloud * 0.5)}
            />
          );
        })}

        {/* ── Racking System ── */}
        <MountingRacking rowZPositions={[-3.45, -1.15, 1.15, 3.45]} rowLength={19.5} />

        {/* ── Weather Mast ── */}
        <WeatherStationMast isNight={isNight} />

        {/* ── Central Inverter ── */}
        <InverterSubstation currentKW={currentKW} />

        {/* ── Control Center ── */}
        <ControlRoomBuilding onOpenControlRoom={onOpenControlRoom} isNight={isNight} />

        {/* ── Energy Particles ── */}
        <EnergyParticles currentKW={currentKW} />

        {/* ── Contact Shadows ── */}
        <ContactShadows
          position={[0, 0.004, 0]}
          opacity={isNight ? 0.5 : 0.85}
          scale={36}
          blur={2.5}
          far={10}
          color="#000000"
        />

        <CameraTourController tourStep={tourStep} />

        {/* ── Tour Callouts ── */}
        {tourStep !== null && tourCallouts[tourStep] && (
          <Html position={tourCallouts[tourStep].anchorPos} center distanceFactor={11} zIndexRange={[100, 0]}>
            <div className="glass-panel p-4 rounded-xl w-80 text-white select-none border border-amber-500/30 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-2xs font-bold text-amber-400 font-display uppercase tracking-wider">
                  {tourCallouts[tourStep].title}
                </span>
                <span className="text-2xs text-slate-400">{tourStep + 1}/6</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{tourCallouts[tourStep].text}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button onClick={e => { e.stopPropagation(); onPrevTourStep(); }} disabled={tourStep === 0}
                  className="px-2.5 py-1 text-2xs bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300 flex items-center gap-1 font-semibold">
                  <ArrowLeft size={12} /><span>PREV</span>
                </button>
                <button onClick={e => { e.stopPropagation(); onEndTour(); }} className="text-2xs text-slate-400 hover:text-white font-semibold">CLOSE</button>
                {tourStep < 5 ? (
                  <button onClick={e => { e.stopPropagation(); onNextTourStep(); }}
                    className="px-3 py-1 text-2xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1">
                    <span>NEXT</span><ArrowRight size={12} />
                  </button>
                ) : (
                  <button onClick={e => { e.stopPropagation(); onEndTour(); }}
                    className="px-3 py-1 text-2xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg flex items-center gap-1">
                    <span>DONE</span><Check size={12} />
                  </button>
                )}
              </div>
            </div>
          </Html>
        )}
      </Canvas>

      {/* HUD overlays */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-none">
        <div className="glass-panel px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 border border-slate-700/60 shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>48 kW Utility Solar Farm · 4-Row Single-Axis Tracking</span>
        </div>
        {trackingMode === 'tracking' && (
          <div className="glass-panel px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-400 border border-amber-500/30 shadow-lg flex items-center gap-1.5">
            <span>Tracking Active · +{gainPct.toFixed(1)}% Yield Gain</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
        <button onClick={onOpenControlRoom}
          className="text-2xs text-sky-300 hover:text-white glass-panel px-3 py-1.5 rounded-lg border border-sky-500/30 hover:border-sky-400 flex items-center gap-1.5 shadow-lg transition-all pointer-events-auto">
          <Building2 size={13} className="text-emerald-400" />
          <span>Enter SCADA Control Room</span>
        </button>
        <div className="text-2xs text-slate-400 glass-panel px-3 py-1.5 rounded-lg pointer-events-none hidden sm:block">
          Click panels for telemetry · Orbit to explore
        </div>
      </div>
    </div>
  );
}
