import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Float, Grid } from '@react-three/drei';
import * as THREE from 'three';
import {
  X, Activity, Zap, Cloud, Sun, Wind, Thermometer,
  HardDrive, Monitor, AlertTriangle, Play,
  BatteryCharging, Wrench, ShieldCheck, RotateCcw,
  Server, Cpu, CloudRain, CloudLightning, TrendingDown,
  TrendingUp, CheckCircle2, Radio, Camera, Eye,
  Flame, Database, Maximize2, Sparkles, Layers
} from 'lucide-react';

// ── Smooth Camera Switcher ──────────────────────────────────────────────────
function CameraRig({ cameraView }) {
  const { camera } = useThree();
  const targetPos = useMemo(() => {
    switch (cameraView) {
      case 'operator':  return new THREE.Vector3(0, 1.4, -0.6);
      case 'servers':   return new THREE.Vector3(-3.2, 1.8, -1.2);
      case 'wide':
      default:          return new THREE.Vector3(0, 3.2, 4.2);
    }
  }, [cameraView]);

  const targetLook = useMemo(() => {
    switch (cameraView) {
      case 'operator':  return new THREE.Vector3(0, 1.2, -3.2);
      case 'servers':   return new THREE.Vector3(-4.8, 1.8, -1.5);
      case 'wide':
      default:          return new THREE.Vector3(0, 2.0, -2.5);
    }
  }, [cameraView]);

  useFrame(() => {
    camera.position.lerp(targetPos, 0.05);
  });

  return null;
}

// ── Room Architecture & Photorealistic Lighting ──────────────────────────────
function NOCArchitecture() {
  return (
    <group>
      {/* ── Reflective Epoxy Floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial
          color="#060c18"
          metalness={0.88}
          roughness={0.18}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Raised Floor SCADA Tile Grid */}
      <Grid
        position={[0, 0.003, 0]}
        args={[18, 18]}
        cellSize={1.2}
        cellThickness={0.4}
        cellColor="#0e2238"
        sectionSize={3.6}
        sectionThickness={0.8}
        sectionColor="#0284c7"
        fadeDistance={14}
        fadeStrength={1.2}
      />

      {/* ── Main Curved Video Wall Backing Structure ── */}
      <mesh position={[0, 3.2, -5.2]} receiveShadow>
        <boxGeometry args={[14, 6.4, 0.3]} />
        <meshStandardMaterial color="#040812" roughness={0.7} metalness={0.6} />
      </mesh>

      {/* Wall Acoustic Slat Panels */}
      {[-6.2, -5.2, 5.2, 6.2].map((wx, wi) => (
        <mesh key={`slat-${wi}`} position={[wx, 3.2, -5.0]}>
          <boxGeometry args={[0.8, 6.0, 0.05]} />
          <meshStandardMaterial color="#0c1829" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}

      {/* Left Server Wall */}
      <mesh position={[-6.8, 3.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[14, 6.4, 0.3]} />
        <meshStandardMaterial color="#060d1a" roughness={0.8} />
      </mesh>

      {/* Right Glass Observation Wall (Looking into Solar Farm) */}
      <group position={[6.8, 3.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[14, 6.0]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transparent
            opacity={0.12}
            roughness={0.05}
            metalness={0.9}
            clearcoat={1.0}
            reflectivity={0.9}
          />
        </mesh>
        {/* Steel Mullions */}
        {[-4.5, -1.5, 1.5, 4.5].map((mx, mi) => (
          <mesh key={`mull-${mi}`} position={[mx, 0, 0.04]}>
            <boxGeometry args={[0.12, 6.0, 0.15]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ── Ceiling with Recessed Architectural Light Coves ── */}
      <mesh position={[0, 6.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#030712" roughness={0.9} />
      </mesh>

      {/* Cyan & Amber Ambient Ceiling Glow Strips */}
      {[-3.5, 0, 3.5].map((cx, ci) => (
        <mesh key={`c-light-${ci}`} position={[cx, 6.18, -1.5]}>
          <boxGeometry args={[0.35, 0.02, 7.5]} />
          <meshBasicMaterial color={ci === 1 ? '#38bdf8' : '#e0f2fe'} />
        </mesh>
      ))}

      {/* Floor Baseboard Cyber Glow Trim */}
      <mesh position={[0, 0.06, -5.02]}>
        <boxGeometry args={[13.8, 0.06, 0.04]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>
      <mesh position={[-6.68, 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[13.8, 0.06, 0.04]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
    </group>
  );
}

// ── Massive 6×2 Curved Interactive Video Wall ───────────────────────────────
function CurvedVideoWall({ currentKW = 42.5, irradiance = 850, activeIncidentStep, isSimulating, onStartSimulation, onResetSimulation, location }) {
  const screenRef = useRef();

  return (
    <group position={[0, 3.0, -4.95]}>
      {/* Curved Screen Frame Bezel */}
      <mesh position={[0, 0, -0.05]} castShadow>
        <boxGeometry args={[11.6, 4.4, 0.12]} />
        <meshStandardMaterial color="#020617" metalness={0.95} roughness={0.2} />
      </mesh>

      {/* Screen Inset Frame */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[11.3, 4.1, 0.02]} />
        <meshStandardMaterial color="#091428" roughness={0.1} />
      </mesh>

      {/* High-Resolution HTML SCADA NOC Operating System */}
      <Html
        transform
        occlude="blending"
        position={[0, 0, 0.04]}
        distanceFactor={4.8}
        className="select-none pointer-events-auto"
      >
        <div
          style={{ width: '1360px', height: '520px' }}
          className="bg-[#030917]/95 border-2 border-sky-500/40 rounded-2xl p-5 shadow-2xl flex flex-col justify-between text-slate-100 font-sans backdrop-blur-3xl overflow-hidden"
        >
          {/* NOC Top Operating System Banner */}
          <div className="flex items-center justify-between pb-3 border-b border-sky-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                <Monitor size={17} className="text-sky-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm tracking-widest text-white">HELIOS SCADA NOC CORE OS</span>
                  <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    MODBUS RTU 1500V SYNCED
                  </span>
                  <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    🔥 FIREBASE CLOUD ACTIVE
                  </span>
                </div>
                <div className="text-3xs text-slate-400">
                  Node: {location?.name || 'Chengalpattu'}, India (12.82°N, 80.04°E) · Grid Frequency: 50.00 Hz · Inverter Temp: 44.2°C
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-3xs font-display text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>32/32 MODULES OPTIMAL</span>
              </div>
            </div>
          </div>

          {/* 4 Multi-Screen Industrial SCADA Tiles */}
          {activeIncidentStep === 0 && (
            <div className="grid grid-cols-4 gap-4 my-auto">
              {/* Tile 1: Generation & Inverter */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-3xs uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1"><Zap size={13} className="text-amber-400" /> Total Generation</span>
                  <span className="text-emerald-400 font-bold">100% NOMINAL</span>
                </div>
                <div className="text-3xl font-display font-bold text-amber-400">{currentKW} <span className="text-sm text-slate-500 font-normal">kW</span></div>
                <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" style={{ width: `${Math.min(100, (currentKW / 48) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-3xs text-slate-500 font-display">
                  <span>Nameplate: 48.0 kW</span>
                  <span>Inverter Eff: 98.4%</span>
                </div>
              </div>

              {/* Tile 2: Solar Irradiance & Weather Radar */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-3xs uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1"><Sun size={13} className="text-sky-400" /> Solar Irradiance</span>
                  <span className="text-sky-400 font-bold">CLEAR SKY</span>
                </div>
                <div className="text-3xl font-display font-bold text-sky-400">{irradiance} <span className="text-sm text-slate-500 font-normal">W/m²</span></div>
                <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-sky-300 rounded-full" style={{ width: `${Math.min(100, (irradiance / 1000) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-3xs text-slate-500 font-display">
                  <span>Direct: {Math.round(irradiance * 0.8)} W/m²</span>
                  <span>Diffuse: {Math.round(irradiance * 0.2)} W/m²</span>
                </div>
              </div>

              {/* Tile 3: 32-Module Health Grid */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-3xs uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1"><Layers size={13} className="text-emerald-400" /> 32-Module Health</span>
                  <span className="text-emerald-400 font-bold">8×4 ARRAY</span>
                </div>
                <div className="grid grid-cols-8 gap-1 pt-1">
                  {Array.from({ length: 32 }, (_, i) => (
                    <div key={i} className="h-2 rounded-sm bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm" title={`Module ${i + 1}`} />
                  ))}
                </div>
                <div className="flex justify-between text-3xs text-slate-500 font-display pt-1">
                  <span>String Conductance: 100%</span>
                  <span>Zero Faults</span>
                </div>
              </div>

              {/* Tile 4: BESS Battery Storage */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-3xs uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1"><BatteryCharging size={13} className="text-indigo-400" /> BESS Storage</span>
                  <span className="text-indigo-400 font-bold">50 kWh BANK</span>
                </div>
                <div className="text-3xl font-display font-bold text-indigo-300">84% <span className="text-sm text-slate-500 font-normal">SoC</span></div>
                <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full" style={{ width: '84%' }} />
                </div>
                <div className="flex justify-between text-3xs text-slate-500 font-display">
                  <span>Reserve: +42.1 kW</span>
                  <span>Auto-Dispatch: ON</span>
                </div>
              </div>
            </div>
          )}

          {/* Incident Simulation Steps (When trigger button is clicked) */}
          {activeIncidentStep > 0 && (
            <div className="my-auto p-4 rounded-xl border border-rose-500/40 bg-rose-950/40 animate-fadeIn space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-display uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <AlertTriangle size={15} className="animate-pulse" />
                  <span>STEP {activeIncidentStep} / 5: {
                    activeIncidentStep === 1 ? 'ANOMALY DETECTED ON STRING A-7'
                    : activeIncidentStep === 2 ? 'EDGE XGBOOST AI DIAGNOSTIC IN PROGRESS'
                    : activeIncidentStep === 3 ? 'AUTOMATED SCADA RTU ISOLATION'
                    : activeIncidentStep === 4 ? 'BESS POWER INJECTION ACTIVE'
                    : 'FIELD WORK ORDER DISPATCHED'
                  }</span>
                </span>
                <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-slate-950">LIVE INCIDENT FLOW</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeIncidentStep === 1 && 'P1000 MLPE Sensor on String #7 reported voltage collapse (42.1V -> 4.2V). Array generation down by 3.8 kW.'}
                {activeIncidentStep === 2 && 'XGBoost AI compared 850 W/m² irradiance with historical curve in 45ms. Ruled out weather; confirmed diode failure on String A-7.'}
                {activeIncidentStep === 3 && 'SCADA tripped electronic DC contactor in 12ms, isolating String #7 to prevent reverse current damage.'}
                {activeIncidentStep === 4 && '50 kWh BESS storage injected +3.8 kW instantly. Grid frequency locked at 50.00 Hz with zero droop penalties.'}
                {activeIncidentStep === 5 && 'Automated work order ticket #8492 dispatched to technician app with GPS coordinates & replacement SKU.'}
              </p>
            </div>
          )}

          {/* NOC Bottom Action & Flow Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-sky-500/20">
            <div className="flex items-center gap-2">
              {[
                { s: 1, l: '1. Detect Anomaly' },
                { s: 2, l: '2. AI Diagnosis' },
                { s: 3, l: '3. Auto-Isolate' },
                { s: 4, l: '4. BESS Inject' },
                { s: 5, l: '5. Dispatch Ticket' },
              ].map(({ s, l }) => (
                <div
                  key={s}
                  className={`px-2.5 py-1 rounded-md text-3xs font-bold font-display uppercase tracking-wider transition-all ${
                    activeIncidentStep === s
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : activeIncidentStep > s
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-900/80 text-slate-600 border border-slate-800'
                  }`}
                >
                  {l}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isSimulating ? (
                <button
                  onClick={onStartSimulation}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-glow"
                >
                  <Play size={12} />
                  <span>Simulate Fault Flow for Judges</span>
                </button>
              ) : (
                <button
                  onClick={onResetSimulation}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw size={12} />
                  <span>Reset Simulation</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// ── Multi-Operator Curved Workstation Console ───────────────────────────────
function MultiOperatorWorkstation({ position = [0, 0, -1.2] }) {
  return (
    <group position={position}>
      {/* Heavy Steel Curved Desk Surface */}
      <mesh position={[0, 0.88, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 0.08, 1.5]} />
        <meshStandardMaterial color="#0c1424" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Desk Steel Legs & Cable Tray */}
      {[-2.3, 0, 2.3].map((lx, li) => (
        <mesh key={`leg-${li}`} position={[lx, 0.44, 0]} castShadow>
          <boxGeometry args={[0.08, 0.88, 1.2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* 3 Dual-Monitor Operator Stations */}
      {[-1.6, 0, 1.6].map((stX, stI) => (
        <group key={`station-${stI}`} position={[stX, 0, 0]}>
          {/* Dual Curved Ultrawide Monitors */}
          {[-0.38, 0.38].map((mX, mI) => (
            <group key={`mon-${mI}`} position={[mX, 1.35, -0.25]} rotation={[0, mI === 0 ? 0.12 : -0.12, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.78, 0.48, 0.03]} />
                <meshStandardMaterial color="#020617" metalness={0.9} />
              </mesh>
              {/* Glowing Monitor Display */}
              <mesh position={[0, 0, 0.018]}>
                <planeGeometry args={[0.75, 0.45]} />
                <meshStandardMaterial
                  color={mI === 0 ? '#0284c7' : '#059669'}
                  emissive={mI === 0 ? '#0284c7' : '#059669'}
                  emissiveIntensity={0.55}
                  roughness={0.1}
                />
              </mesh>
              {/* Stand */}
              <mesh position={[0, -0.28, 0]} castShadow>
                <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
                <meshStandardMaterial color="#475569" metalness={0.9} />
              </mesh>
            </group>
          ))}

          {/* Backlit Mechanical Keyboard & Trackball */}
          <group position={[0, 0.93, 0.2]}>
            <mesh>
              <boxGeometry args={[0.45, 0.015, 0.16]} />
              <meshStandardMaterial color="#020617" />
            </mesh>
            <mesh position={[0, 0.009, 0]}>
              <planeGeometry args={[0.43, 0.14]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>

          {/* High-End Ergonomic Mesh Operator Chair */}
          <group position={[0, 0, 0.95]}>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.04, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.45, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.6, 0]} castShadow>
              <boxGeometry args={[0.58, 0.1, 0.58]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>
            <mesh position={[0, 1.05, 0.25]} rotation={[-0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.54, 0.78, 0.08]} />
              <meshStandardMaterial color="#020617" roughness={0.8} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

// ── Edge AI Server Racks & UPS Cabinets ─────────────────────────────────────
function EdgeServerCabinets({ position = [-5.2, 0, -1.5] }) {
  const ledRef = useRef();

  useFrame((state) => {
    if (!ledRef.current) return;
    const t = state.clock.getElapsedTime();
    ledRef.current.children.forEach((child, i) => {
      if (child.material) {
        child.material.emissiveIntensity = Math.sin(t * 10 + i * 1.8) > 0 ? 2.5 : 0.2;
      }
    });
  });

  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {[-1.2, 0, 1.2].map((rx, ri) => (
        <group key={`cabinet-${ri}`} position={[rx, 1.6, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.0, 3.2, 1.1]} />
            <meshStandardMaterial color="#040812" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* Glass Door with Tint */}
          <mesh position={[0, 0, 0.56]}>
            <planeGeometry args={[0.92, 3.05]} />
            <meshPhysicalMaterial
              color="#0284c7"
              transparent
              opacity={0.25}
              roughness={0.05}
              metalness={0.95}
              clearcoat={1.0}
            />
          </mesh>
        </group>
      ))}

      {/* Blinking Activity LEDs */}
      <group ref={ledRef} position={[0, 1.6, 0.58]}>
        {Array.from({ length: 27 }, (_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          return (
            <mesh key={`led-${i}`} position={[(col - 1) * 0.9, row * 0.3 - 1.2, 0]}>
              <sphereGeometry args={[0.014, 8, 8]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#38bdf8' : '#f59e0b'}
                emissive={i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#38bdf8' : '#f59e0b'}
                emissiveIntensity={1.8}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// ── Main Control Room Interior Modal ────────────────────────────────────────
export default function ControlRoomInterior3D({ isOpen, onClose, currentKW = 42.5, irradiance = 850, location }) {
  const [cameraView, setCameraView] = useState('wide'); // 'wide' | 'videowall' | 'operator' | 'servers'
  const [activeIncidentStep, setActiveIncidentStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let timer;
    if (isSimulating) {
      if (activeIncidentStep < 5) {
        timer = setTimeout(() => {
          setActiveIncidentStep((prev) => prev + 1);
        }, 3200);
      }
    }
    return () => clearTimeout(timer);
  }, [isSimulating, activeIncidentStep]);

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setActiveIncidentStep(1);
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setActiveIncidentStep(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/95 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-7xl h-[94vh] rounded-3xl glass-panel border border-sky-500/40 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.08] bg-[#020617]/95 z-20 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shadow-lg">
              <Monitor size={20} className="text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base tracking-wider text-white">
                  3D SCADA NOC COMMAND CENTER
                </span>
                <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  REAL-TIME 3D VIEW
                </span>
              </div>
              <p className="text-2xs text-slate-400 mt-0.5">
                Full 3D Photorealistic Control Room · Node: {location?.name || 'Chengalpattu'}, India
              </p>
            </div>
          </div>

          {/* 3D Camera Angles & Close Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center p-1 rounded-xl glass-panel border border-slate-800 text-xs font-semibold gap-1">
              {[
                ['wide', '🎥 Wide Overview'],
                ['operator', '🧑‍💻 Operator Console'],
                ['servers', '🗄️ Server Racks'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCameraView(key)}
                  className="px-3 py-1.5 rounded-lg transition-all"
                  style={
                    cameraView === key
                      ? { color: '#38bdf8', background: 'rgba(56,189,248,0.18)', boxShadow: '0 0 10px rgba(56,189,248,0.15)' }
                      : { color: '#64748b' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
            >
              <X size={15} />
              <span>Exit to Farm</span>
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <div className="relative flex-1 w-full h-full bg-[#020617]">
          <Canvas
            shadows
            camera={{ position: [0, 3.2, 4.2], fov: 48 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
          >
            <color attach="background" args={['#020617']} />
            <ambientLight color="#1e293b" intensity={0.7} />

            {/* Architectural Spotlights */}
            <pointLight position={[0, 5.5, 0]} color="#dbeafe" intensity={22} distance={14} castShadow />
            <pointLight position={[0, 3.2, -4.5]} color="#38bdf8" intensity={15} distance={9} />
            <pointLight position={[-4.5, 2.5, -1.5]} color="#10b981" intensity={10} distance={7} />
            <pointLight position={[4.5, 2.5, -1.5]} color="#38bdf8" intensity={10} distance={7} />

            <CameraRig cameraView={cameraView} />
            <NOCArchitecture />
            <CurvedVideoWall
              currentKW={currentKW}
              irradiance={irradiance}
              activeIncidentStep={activeIncidentStep}
              isSimulating={isSimulating}
              onStartSimulation={handleStartSimulation}
              onResetSimulation={handleResetSimulation}
              location={location}
            />
            <MultiOperatorWorkstation position={[0, 0, -1.2]} />
            <EdgeServerCabinets position={[-5.5, 0, -1.5]} />

            <OrbitControls
              enableDamping
              dampingFactor={0.06}
              minDistance={1.0}
              maxDistance={7.0}
              maxPolarAngle={Math.PI / 2 - 0.05}
              minPolarAngle={Math.PI / 12}
              target={[0, 2.2, -2.5]}
            />
          </Canvas>

          {/* Interactive Helper Overlay */}
          <div className="absolute bottom-4 left-6 z-20 pointer-events-none">
            <div className="glass-panel px-4 py-2 rounded-xl text-2xs text-slate-300 border border-slate-700/60 shadow-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>Drag to rotate 3D view · Switch camera presets at top · Click "Simulate Fault Flow" on video wall</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
