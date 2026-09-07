import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Float, Grid } from '@react-three/drei';
import * as THREE from 'three';
import {
  X, Activity, Zap, Sun, HardDrive, Monitor, AlertTriangle, Play,
  BatteryCharging, RotateCcw, Server, Cpu, Layers, Maximize2,
  Volume2, VolumeX, ShieldAlert, Sparkles, Radio, CheckCircle2,
  Compass, Eye, Sliders, ShieldCheck
} from 'lucide-react';

// ── Synthesized Sci-Fi Audio Cues (Zero External Assets) ─────────────────────
function playBeep(type = 'click') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'confirm') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08);   // A5
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.23);
    }
  } catch (e) {
    // AudioContext blocked or not supported - silent graceful fallback
  }
}

// ── Smooth Cinematic Camera Rig ─────────────────────────────────────────────
function CameraRig({ cameraView, controlsRef }) {
  const { camera } = useThree();

  const cameraTargets = useMemo(() => ({
    wide: {
      pos: new THREE.Vector3(0, 3.4, 4.4),
      look: new THREE.Vector3(0, 1.8, -2.4),
    },
    videowall: {
      pos: new THREE.Vector3(0, 2.7, -0.6),
      look: new THREE.Vector3(0, 2.7, -4.8),
    },
    hologram: {
      pos: new THREE.Vector3(0, 2.2, 0.9),
      look: new THREE.Vector3(0, 1.4, -0.9),
    },
    operator: {
      pos: new THREE.Vector3(0, 1.5, -0.1),
      look: new THREE.Vector3(0, 1.8, -4.5),
    },
    servers: {
      pos: new THREE.Vector3(-3.2, 2.0, -0.5),
      look: new THREE.Vector3(-5.6, 1.8, -1.5),
    }
  }), []);

  useFrame(() => {
    const target = cameraTargets[cameraView] || cameraTargets.wide;
    camera.position.lerp(target.pos, 0.06);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(target.look, 0.06);
      controlsRef.current.update();
    }
  });

  return null;
}

// ── Central 3D Holographic Digital Twin Pedestal ─────────────────────────────
function CentralHologramTable({ isAlertMode, currentKW = 42.5 }) {
  const laserRef = useRef();
  const ringRef = useRef();
  const particleGroupRef = useRef();

  // Create floating holographic particles
  const particleGeo = useMemo(() => {
    const count = 48;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.9;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.2 + Math.random() * 1.0;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (laserRef.current) {
      laserRef.current.rotation.y = t * 0.9;
      laserRef.current.position.y = 1.35 + Math.sin(t * 1.5) * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = -t * 0.6;
      ringRef.current.rotation.z = Math.sin(t * 0.8) * 0.12;
    }
    if (particleGroupRef.current) {
      particleGroupRef.current.rotation.y = t * 0.3;
    }
  });

  const hologramColor = isAlertMode ? '#e5484d' : '#4dd0e1';
  const glowColor = isAlertMode ? '#e5484d' : '#c9973e';

  return (
    <group position={[0, 0, -1.0]}>
      {/* Cylindrical Heavy Carbon Console Pedestal */}
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.25, 0.88, 32]} />
        <meshStandardMaterial color="#0b1322" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Hologram Emitter Bezel Ring */}
      <mesh position={[0, 0.89, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.04, 32]} />
        <meshStandardMaterial color="#16263b" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Glowing Energy Core Ring */}
      <mesh position={[0, 0.915, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.95, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.65} />
      </mesh>

      {/* Vertical Holographic Projector Light Cone */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[1.2, 0.5, 1.2, 32, 1, true]} />
        <meshBasicMaterial
          color={hologramColor}
          transparent
          opacity={isAlertMode ? 0.22 : 0.12}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Floating 3D Solar Farm Miniature Digital Twin */}
      <Float speed={2.5} rotationIntensity={0.25} floatIntensity={0.4}>
        <group position={[0, 1.55, 0]} scale={0.75}>
          {/* Wireframe Array Platform */}
          <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.2, 1.4, 8, 4]} />
            <meshBasicMaterial color={hologramColor} wireframe transparent opacity={0.4} />
          </mesh>

          {/* 32 Mini Hologram Solar Modules */}
          {Array.from({ length: 32 }).map((_, idx) => {
            const col = idx % 8;
            const row = Math.floor(idx / 8);
            const x = (col - 3.5) * 0.24;
            const z = (row - 1.5) * 0.28;
            const isFaulted = isAlertMode && (idx === 6 || idx === 14 || idx === 22);

            return (
              <mesh
                key={`holo-cell-${idx}`}
                position={[x, 0.05, z]}
                rotation={[-0.35, 0, 0]}
              >
                <boxGeometry args={[0.2, 0.015, 0.24]} />
                <meshStandardMaterial
                  color={isFaulted ? '#e5484d' : '#0e3a58'}
                  emissive={isFaulted ? '#e5484d' : hologramColor}
                  emissiveIntensity={isFaulted ? 1.4 : 0.6}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
            );
          })}

          {/* Holographic Radar Sweep Disc */}
          <mesh ref={laserRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.35, 32, 0, Math.PI / 3]} />
            <meshBasicMaterial
              color={glowColor}
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Holographic Concentric Orbit Ring */}
          <mesh ref={ringRef} position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.38, 1.42, 48]} />
            <meshBasicMaterial color={hologramColor} transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>

          {/* Floating Data Particles */}
          <group ref={particleGroupRef}>
            <points geometry={particleGeo}>
              <pointsMaterial
                size={0.035}
                color={hologramColor}
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
              />
            </points>
          </group>
        </group>
      </Float>

      {/* Floating 3D Metric Badge */}
      <Float speed={1.5} floatIntensity={0.2}>
        <Html position={[0, 2.45, 0]} center distanceFactor={7} transform>
          <div className="px-3 py-1 rounded-full font-mono text-3xs font-bold tracking-wider uppercase border pointer-events-none select-none backdrop-blur-md shadow-2xl flex items-center gap-1.5 whitespace-nowrap"
            style={{
              background: isAlertMode ? 'rgba(229,72,77,0.25)' : 'rgba(6,10,20,0.85)',
              color: isAlertMode ? '#ff8589' : '#4dd0e1',
              borderColor: isAlertMode ? 'rgba(229,72,77,0.6)' : 'rgba(77,208,225,0.4)',
              boxShadow: `0 0 20px ${isAlertMode ? 'rgba(229,72,77,0.4)' : 'rgba(77,208,225,0.2)'}`
            }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: isAlertMode ? '#e5484d' : '#2dd4a8' }} />
            <span>{isAlertMode ? '⚡ FAULT ISOLATION ACTIVE' : `FIELD TWIN · ${currentKW} kW AC`}</span>
          </div>
        </Html>
      </Float>
    </group>
  );
}

// ── NASA/Tesla SCADA Command Bunker Architecture ─────────────────────────────
function CommandDeckArchitecture({ isAlertMode }) {
  const rotatingBeaconRef = useRef();

  useFrame((state) => {
    if (rotatingBeaconRef.current && isAlertMode) {
      rotatingBeaconRef.current.rotation.y = state.clock.getElapsedTime() * 4.0;
    }
  });

  const ambientFloorGridColor = isAlertMode ? '#e5484d' : '#4dd0e1';
  const floorTrimColor = isAlertMode ? '#e5484d' : '#c9973e';

  return (
    <group>
      {/* ── Polished Mirror Epoxy SCADA Floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial
          color="#050a14"
          metalness={0.92}
          roughness={0.16}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Cybernetic Raised-Floor Hex Tile Grid */}
      <Grid
        position={[0, 0.004, 0]}
        args={[20, 20]}
        cellSize={1.25}
        cellThickness={0.4}
        cellColor={isAlertMode ? 'rgba(229,72,77,0.18)' : '#0d2238'}
        sectionSize={3.75}
        sectionThickness={0.9}
        sectionColor={ambientFloorGridColor}
        fadeDistance={16}
        fadeStrength={1.2}
      />

      {/* Floor Recessed Neon Fiber Channels */}
      {[-4.5, 4.5].map((fx, fi) => (
        <mesh key={`fl-lane-${fi}`} position={[fx, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 14]} />
          <meshBasicMaterial color={floorTrimColor} />
        </mesh>
      ))}

      {/* ── Main Curved Video Wall Composite Framing ── */}
      <mesh position={[0, 3.2, -5.3]} receiveShadow>
        <boxGeometry args={[15, 6.8, 0.4]} />
        <meshStandardMaterial color="#040711" roughness={0.65} metalness={0.8} />
      </mesh>

      {/* Wall Acoustic Brushed Titanium Fin Battens */}
      {[-6.8, -5.6, -4.4, 4.4, 5.6, 6.8].map((bx, bi) => (
        <mesh key={`batten-${bi}`} position={[bx, 3.2, -5.1]} castShadow>
          <boxGeometry args={[0.35, 6.4, 0.12]} />
          <meshStandardMaterial color="#0d1829" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}

      {/* Left Wall - Edge AI Server Enclosure Partition */}
      <mesh position={[-7.5, 3.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[15, 6.8, 0.4]} />
        <meshStandardMaterial color="#060c18" roughness={0.7} metalness={0.8} />
      </mesh>

      {/* Right Wall - Panoramic Observation Deck into Solar Farm */}
      <group position={[7.5, 3.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Anti-Reflective Aerospace Glass */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[15, 6.2]} />
          <meshPhysicalMaterial
            color="#4dd0e1"
            transparent
            opacity={0.14}
            roughness={0.04}
            metalness={0.95}
            clearcoat={1.0}
            reflectivity={0.9}
          />
        </mesh>

        {/* Outer Solar Farm Twilight Backdrop */}
        <mesh position={[0, 0, -2.5]}>
          <planeGeometry args={[20, 8]} />
          <meshBasicMaterial color="#081427" />
        </mesh>

        {/* Structural Carbon Mullions */}
        {[-5.0, -2.5, 0, 2.5, 5.0].map((mx, mi) => (
          <mesh key={`mullion-${mi}`} position={[mx, 0, 0.06]}>
            <boxGeometry args={[0.16, 6.2, 0.22]} />
            <meshStandardMaterial color="#111c2e" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ── Floating Architectural Ceiling with Recessed Light Coves ── */}
      <mesh position={[0, 6.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#030610" roughness={0.8} metalness={0.9} />
      </mesh>

      {/* Hexagonal Recessed Halo Light in Ceiling */}
      <mesh position={[0, 6.36, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.4, 6]} />
        <meshBasicMaterial color={isAlertMode ? '#e5484d' : '#c9973e'} />
      </mesh>

      {/* Overhead Warning Strobe Beacon */}
      {isAlertMode && (
        <group ref={rotatingBeaconRef} position={[0, 6.2, -1.0]}>
          <pointLight color="#e5484d" intensity={40} distance={12} />
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
            <meshBasicMaterial color="#e5484d" />
          </mesh>
        </group>
      )}

      {/* Floor Baseboard Cyber Accent Trim */}
      <mesh position={[0, 0.05, -5.08]}>
        <boxGeometry args={[14.8, 0.08, 0.05]} />
        <meshBasicMaterial color={floorTrimColor} />
      </mesh>
    </group>
  );
}

// ── Multi-Monitor SCADA Curved Video Wall ────────────────────────────────────
function MissionVideoWall({
  currentKW = 42.5,
  irradiance = 850,
  activeIncidentStep = 0,
  isSimulating = false,
  onStartSimulation,
  onResetSimulation,
  location
}) {
  const isAlert = activeIncidentStep > 0;

  return (
    <group position={[0, 3.0, -5.02]}>
      {/* Heavy Bezel Frame with Metallic Chamfer */}
      <mesh position={[0, 0, -0.06]} castShadow>
        <boxGeometry args={[12.8, 4.8, 0.16]} />
        <meshStandardMaterial color="#02050c" metalness={0.95} roughness={0.2} />
      </mesh>

      {/* Screen Frame Inset */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[12.5, 4.5, 0.02]} />
        <meshStandardMaterial color="#060c18" roughness={0.1} />
      </mesh>

      {/* High-Resolution HTML SCADA NOC Interface */}
      <Html
        transform
        occlude="blending"
        position={[0, 0, 0.035]}
        distanceFactor={4.9}
        className="select-none pointer-events-auto"
      >
        <div
          style={{ width: '1380px', height: '530px' }}
          className="rounded-2xl p-6 flex flex-col justify-between text-text-primary font-sans backdrop-blur-3xl overflow-hidden border shadow-2xl transition-all duration-500"
          style={{
            background: isAlert
              ? 'linear-gradient(135deg, rgba(20,8,12,0.98), rgba(12,6,10,0.98))'
              : 'linear-gradient(135deg, rgba(6,10,20,0.98), rgba(8,14,28,0.98))',
            borderColor: isAlert ? 'rgba(229,72,77,0.55)' : 'rgba(201,151,62,0.35)',
            boxShadow: isAlert
              ? '0 0 60px rgba(229,72,77,0.3), inset 0 0 30px rgba(229,72,77,0.1)'
              : '0 0 50px rgba(201,151,62,0.15), inset 0 0 20px rgba(77,208,225,0.06)',
          }}
        >
          {/* Top OS Telemetry Banner */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border"
                style={{
                  background: isAlert ? 'rgba(229,72,77,0.18)' : 'rgba(201,151,62,0.15)',
                  borderColor: isAlert ? 'rgba(229,72,77,0.45)' : 'rgba(201,151,62,0.35)'
                }}
              >
                <Monitor size={20} style={{ color: isAlert ? '#e5484d' : '#c9973e' }} />
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-base tracking-widest text-text-primary">
                    HELIOS MISSION SCADA · NOC CORE OS
                  </span>
                  <span
                    className="text-3xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border flex items-center gap-1.5"
                    style={{
                      background: isAlert ? 'rgba(229,72,77,0.18)' : 'rgba(45,212,168,0.12)',
                      color: isAlert ? '#e5484d' : '#2dd4a8',
                      borderColor: isAlert ? 'rgba(229,72,77,0.35)' : 'rgba(45,212,168,0.3)'
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-ping"
                      style={{ background: isAlert ? '#e5484d' : '#2dd4a8' }} />
                    {isAlert ? 'EMERGENCY SCADA INTERVENTION' : 'IEC 61724 / IEEE 1547 CERTIFIED'}
                  </span>
                  <span className="text-3xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan/10 text-cyan border border-cyan/25">
                    MODBUS RTU 1500V SYNCED
                  </span>
                </div>
                <div className="text-3xs font-mono text-text-muted mt-0.5">
                  Node: {location?.name || 'Chengalpattu'}, India ({location?.latitude || 12.82}°N, {location?.longitude || 80.04}°E) · Grid Sync: 49.98 Hz · RTU Latency: 4.2ms
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-carbon/90 border border-white/[0.08] text-3xs font-mono">
                <span className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: isAlert ? '#e5484d' : '#2dd4a8' }} />
                <span className="text-text-secondary">
                  {isAlert ? 'STRING A-7 ISOLATED' : '32/32 STRING OPTIMIZERS ACTIVE'}
                </span>
              </div>
            </div>
          </div>

          {/* 4 SCADA Primary Multi-Screen Tiles */}
          {activeIncidentStep === 0 ? (
            <div className="grid grid-cols-4 gap-4 my-auto">
              {/* Tile 1: Active PV Yield */}
              <div className="p-4 rounded-xl border border-white/[0.08] space-y-2 relative overflow-hidden"
                style={{ background: 'rgba(8,14,26,0.85)' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-gold-light" />
                <div className="flex items-center justify-between text-3xs font-mono uppercase tracking-wider text-text-muted">
                  <span className="flex items-center gap-1.5"><Zap size={13} className="text-gold" /> Active Generation</span>
                  <span className="text-jade font-bold">100% NOMINAL</span>
                </div>
                <div className="text-3xl font-mono font-bold text-gold">
                  {currentKW} <span className="text-xs text-text-muted font-normal">kW</span>
                </div>
                <div className="h-1.5 rounded-full bg-carbon overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                    style={{ width: `${Math.min(100, (currentKW / 48) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-3xs font-mono text-text-secondary pt-0.5">
                  <span>Nameplate: 48.0 kW</span>
                  <span>Inverter Eff: 98.4%</span>
                </div>
              </div>

              {/* Tile 2: Solar Irradiance */}
              <div className="p-4 rounded-xl border border-white/[0.08] space-y-2 relative overflow-hidden"
                style={{ background: 'rgba(8,14,26,0.85)' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan to-cyan-dim" />
                <div className="flex items-center justify-between text-3xs font-mono uppercase tracking-wider text-text-muted">
                  <span className="flex items-center gap-1.5"><Sun size={13} className="text-cyan" /> Solar Irradiance</span>
                  <span className="text-cyan font-bold">GHI FEED</span>
                </div>
                <div className="text-3xl font-mono font-bold text-cyan">
                  {irradiance} <span className="text-xs text-text-muted font-normal">W/m²</span>
                </div>
                <div className="h-1.5 rounded-full bg-carbon overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan to-cyan-dim rounded-full"
                    style={{ width: `${Math.min(100, (irradiance / 1000) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-3xs font-mono text-text-secondary pt-0.5">
                  <span>Direct: {Math.round(irradiance * 0.8)} W/m²</span>
                  <span>Diffuse: {Math.round(irradiance * 0.2)} W/m²</span>
                </div>
              </div>

              {/* Tile 3: 32-Module Health Matrix */}
              <div className="p-4 rounded-xl border border-white/[0.08] space-y-2 relative overflow-hidden"
                style={{ background: 'rgba(8,14,26,0.85)' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-jade to-jade-dim" />
                <div className="flex items-center justify-between text-3xs font-mono uppercase tracking-wider text-text-muted">
                  <span className="flex items-center gap-1.5"><Layers size={13} className="text-jade" /> String Health</span>
                  <span className="text-jade font-bold">4×8 ARRAY</span>
                </div>
                <div className="grid grid-cols-8 gap-1 pt-1">
                  {Array.from({ length: 32 }, (_, i) => (
                    <div
                      key={`wall-mod-${i}`}
                      className="h-2 rounded-sm transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #2dd4a8, #189874)',
                        boxShadow: '0 0 4px rgba(45,212,168,0.4)'
                      }}
                      title={`Module A-${i + 1}: Optimal`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-3xs font-mono text-text-secondary pt-1">
                  <span>Array Conductance: 98.4%</span>
                  <span className="text-jade font-bold">Zero Faults</span>
                </div>
              </div>

              {/* Tile 4: BESS Battery Storage */}
              <div className="p-4 rounded-xl border border-white/[0.08] space-y-2 relative overflow-hidden"
                style={{ background: 'rgba(8,14,26,0.85)' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-cyan" />
                <div className="flex items-center justify-between text-3xs font-mono uppercase tracking-wider text-text-muted">
                  <span className="flex items-center gap-1.5"><BatteryCharging size={13} className="text-cyan" /> BESS Storage</span>
                  <span className="text-gold font-bold">50 kWh BANK</span>
                </div>
                <div className="text-3xl font-mono font-bold text-text-primary">
                  84% <span className="text-xs text-text-muted font-normal">SoC</span>
                </div>
                <div className="h-1.5 rounded-full bg-carbon overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-jade to-cyan rounded-full" style={{ width: '84%' }} />
                </div>
                <div className="flex justify-between text-3xs font-mono text-text-secondary pt-0.5">
                  <span>Reserve: +42.1 kW</span>
                  <span className="text-jade font-bold">Auto-Dispatch: READY</span>
                </div>
              </div>
            </div>
          ) : (
            /* Live Incident Diagnostic Banner */
            <div className="my-auto p-5 rounded-2xl border bg-crimson-dim/30 animate-fadeIn space-y-3"
              style={{
                borderColor: 'rgba(229,72,77,0.5)',
                boxShadow: '0 0 35px rgba(229,72,77,0.2)'
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono uppercase tracking-wider text-crimson flex items-center gap-2">
                  <AlertTriangle size={17} className="animate-pulse" />
                  <span>STEP {activeIncidentStep} / 5: {
                    activeIncidentStep === 1 ? 'ANOMALY DETECTED ON STRING A-7'
                    : activeIncidentStep === 2 ? 'EDGE XGBOOST AI DIAGNOSTIC RESOLUTION'
                    : activeIncidentStep === 3 ? 'SOLID-STATE DC RTU ISOLATION'
                    : activeIncidentStep === 4 ? 'BESS POWER INJECTION ACTIVE'
                    : 'TECHNICIAN WORK ORDER AUTO-DISPATCHED'
                  }</span>
                </span>
                <span className="text-3xs font-mono font-bold px-3 py-1 rounded-full bg-crimson text-carbon">
                  SUB-12MS RESPONSE
                </span>
              </div>
              <p className="text-xs font-mono text-slate-200 leading-relaxed max-w-4xl">
                {activeIncidentStep === 1 && 'P1000 MLPE Sensor on String #7 reported voltage collapse (42.1V -> 4.2V). Current power suppressed by 3.8 kW.'}
                {activeIncidentStep === 2 && 'XGBoost regression compared 850 W/m² GHI against baseline in 45ms. Ruled out cloud transient; confirmed bypass diode failure on String A-7.'}
                {activeIncidentStep === 3 && 'SCADA tripped solid-state electronic DC contactor in sub-12ms, isolating String #7 to eliminate reverse current risks.'}
                {activeIncidentStep === 4 && '50 kWh BESS storage instantly injected +3.8 kW. Grid frequency stabilized at 49.98 Hz with zero drop penalties.'}
                {activeIncidentStep === 5 && 'Automated field ticket #9042 dispatched to service team with GPS pinpoint & replacement bypass diode SKU.'}
              </p>
            </div>
          )}

          {/* NOC Bottom Action & Step Tracker */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              {[
                { s: 1, l: '1. Detect Anomaly' },
                { s: 2, l: '2. AI Diagnosis' },
                { s: 3, l: '3. Auto-Isolate' },
                { s: 4, l: '4. BESS Inject' },
                { s: 5, l: '5. Dispatch Ticket' },
              ].map(({ s, l }) => (
                <div
                  key={s}
                  className="px-3 py-1.5 rounded-lg text-3xs font-mono font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: activeIncidentStep === s
                      ? '#c9973e'
                      : activeIncidentStep > s
                      ? 'rgba(45,212,168,0.18)'
                      : 'rgba(255,255,255,0.03)',
                    color: activeIncidentStep === s
                      ? '#060a14'
                      : activeIncidentStep > s
                      ? '#2dd4a8'
                      : '#4a5a72',
                    border: `1px solid ${activeIncidentStep === s ? '#c9973e' : activeIncidentStep > s ? 'rgba(45,212,168,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    boxShadow: activeIncidentStep === s ? '0 0 16px rgba(201,151,62,0.4)' : 'none'
                  }}
                >
                  {l}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {!isSimulating ? (
                <button
                  onClick={onStartSimulation}
                  className="px-5 py-2 rounded-xl font-mono font-bold text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(90deg, #c9973e, #dbb060)',
                    color: '#060a14',
                    boxShadow: '0 0 24px rgba(201,151,62,0.35)'
                  }}
                >
                  <Play size={13} fill="#060a14" />
                  <span>Simulate SCADA Incident Response</span>
                </button>
              ) : (
                <button
                  onClick={onResetSimulation}
                  className="px-4 py-2 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition-all hover:bg-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#eef2f6',
                    border: '1px solid rgba(255,255,255,0.12)'
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Reset SCADA Feed</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// ── Multi-Operator Ergonomic Workstations ────────────────────────────────────
function OperatorWorkstations({ position = [0, 0, 1.4] }) {
  return (
    <group position={position}>
      {/* Heavy Steel Curved Console Desk */}
      <mesh position={[0, 0.86, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.6, 0.08, 1.4]} />
        <meshStandardMaterial color="#0b1322" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Desk Steel Structural Legs */}
      {[-2.5, 0, 2.5].map((lx, li) => (
        <mesh key={`desk-leg-${li}`} position={[lx, 0.43, 0]} castShadow>
          <boxGeometry args={[0.08, 0.86, 1.1]} />
          <meshStandardMaterial color="#16263b" metalness={0.92} roughness={0.3} />
        </mesh>
      ))}

      {/* 3 Dual-Monitor Operator Tactical Terminals */}
      {[-1.8, 0, 1.8].map((stX, stI) => (
        <group key={`op-station-${stI}`} position={[stX, 0, 0]}>
          {/* Dual Curved Ultrawide Displays */}
          {[-0.42, 0.42].map((mX, mI) => (
            <group key={`mon-${mI}`} position={[mX, 1.34, -0.22]} rotation={[0, mI === 0 ? 0.12 : -0.12, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.82, 0.5, 0.03]} />
                <meshStandardMaterial color="#030712" metalness={0.95} roughness={0.15} />
              </mesh>
              {/* Glowing Monitor Display Surface */}
              <mesh position={[0, 0, 0.018]}>
                <planeGeometry args={[0.79, 0.47]} />
                <meshStandardMaterial
                  color={mI === 0 ? '#4dd0e1' : '#c9973e'}
                  emissive={mI === 0 ? '#4dd0e1' : '#c9973e'}
                  emissiveIntensity={0.55}
                  roughness={0.15}
                />
              </mesh>
              {/* Stand */}
              <mesh position={[0, -0.3, 0]} castShadow>
                <cylinderGeometry args={[0.018, 0.018, 0.25, 8]} />
                <meshStandardMaterial color="#334155" metalness={0.9} />
              </mesh>
            </group>
          ))}

          {/* Backlit SCADA Mechanical Console Surface */}
          <group position={[0, 0.915, 0.18]}>
            <mesh>
              <boxGeometry args={[0.48, 0.015, 0.18]} />
              <meshStandardMaterial color="#020617" />
            </mesh>
            <mesh position={[0, 0.009, 0]}>
              <planeGeometry args={[0.46, 0.16]} />
              <meshBasicMaterial color="#4dd0e1" transparent opacity={0.65} />
            </mesh>
          </group>

          {/* Ergonomic SCADA Operator Chair */}
          <group position={[0, 0, 0.85]}>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
              <meshStandardMaterial color="#16263b" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.34, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.45, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.58, 0]} castShadow>
              <boxGeometry args={[0.58, 0.1, 0.58]} />
              <meshStandardMaterial color="#0a1220" roughness={0.7} />
            </mesh>
            <mesh position={[0, 1.02, 0.24]} rotation={[-0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.54, 0.78, 0.08]} />
              <meshStandardMaterial color="#030712" roughness={0.8} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

// ── Edge AI Server Cabinets with Cascading Activity LEDs ─────────────────────
function EdgeServerRacks({ position = [-6.2, 0, -1.2], isAlertMode }) {
  const ledGroupRef = useRef();

  useFrame((state) => {
    if (!ledGroupRef.current) return;
    const t = state.clock.getElapsedTime();
    ledGroupRef.current.children.forEach((child, idx) => {
      if (child.material) {
        if (isAlertMode) {
          child.material.color.set('#e5484d');
          child.material.emissive.set('#e5484d');
          child.material.emissiveIntensity = (Math.sin(t * 14 + idx) > 0) ? 2.5 : 0.3;
        } else {
          const isGreen = idx % 3 === 0;
          const isCyan = idx % 3 === 1;
          const col = isGreen ? '#2dd4a8' : isCyan ? '#4dd0e1' : '#c9973e';
          child.material.color.set(col);
          child.material.emissive.set(col);
          child.material.emissiveIntensity = (Math.sin(t * 8 + idx * 1.5) > 0) ? 1.8 : 0.2;
        }
      }
    });
  });

  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {[-1.3, 0, 1.3].map((rx, ri) => (
        <group key={`cabinet-${ri}`} position={[rx, 1.7, 0]}>
          {/* Main Structural Enclosure */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.1, 3.4, 1.15]} />
            <meshStandardMaterial color="#030712" metalness={0.92} roughness={0.25} />
          </mesh>

          {/* Tempered Glass Front Door */}
          <mesh position={[0, 0, 0.59]}>
            <planeGeometry args={[1.0, 3.2]} />
            <meshPhysicalMaterial
              color="#4dd0e1"
              transparent
              opacity={0.22}
              roughness={0.05}
              metalness={0.95}
              clearcoat={1.0}
            />
          </mesh>

          {/* Interior Server Chassis Bays */}
          {Array.from({ length: 8 }).map((_, bi) => (
            <mesh key={`bay-${bi}`} position={[0, (bi - 3.5) * 0.38, 0]}>
              <boxGeometry args={[0.98, 0.32, 0.95]} />
              <meshStandardMaterial color="#0c182a" metalness={0.8} roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Dynamic Activity LED Array */}
      <group ref={ledGroupRef} position={[0, 1.7, 0.6]}>
        {Array.from({ length: 36 }).map((_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <mesh key={`srv-led-${i}`} position={[(col - 1) * 1.3, (row - 5.5) * 0.25, 0]}>
              <sphereGeometry args={[0.016, 8, 8]} />
              <meshStandardMaterial
                color="#2dd4a8"
                emissive="#2dd4a8"
                emissiveIntensity={1.5}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// ── MAIN CONTROL ROOM COMPONENT & MODAL ──────────────────────────────────────
export default function ControlRoomInterior3D({
  isOpen,
  onClose,
  currentKW = 42.5,
  irradiance = 850,
  location
}) {
  const [cameraView, setCameraView] = useState('wide'); // 'wide' | 'videowall' | 'hologram' | 'operator' | 'servers'
  const [activeIncidentStep, setActiveIncidentStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAlertModeManual, setIsAlertModeManual] = useState(false);
  const controlsRef = useRef();

  // Multi-step incident simulation timer
  useEffect(() => {
    let timer;
    if (isSimulating) {
      if (activeIncidentStep < 5) {
        timer = setTimeout(() => {
          setActiveIncidentStep((prev) => prev + 1);
          if (soundEnabled) playBeep(activeIncidentStep === 0 ? 'alert' : 'confirm');
        }, 3200);
      } else {
        // Complete
        if (soundEnabled) playBeep('confirm');
      }
    }
    return () => clearTimeout(timer);
  }, [isSimulating, activeIncidentStep, soundEnabled]);

  const handleStartSimulation = useCallback(() => {
    if (soundEnabled) playBeep('alert');
    setIsSimulating(true);
    setActiveIncidentStep(1);
  }, [soundEnabled]);

  const handleResetSimulation = useCallback(() => {
    if (soundEnabled) playBeep('click');
    setIsSimulating(false);
    setActiveIncidentStep(0);
  }, [soundEnabled]);

  const handleCameraChange = (view) => {
    if (soundEnabled) playBeep('click');
    setCameraView(view);
  };

  const isAlertMode = activeIncidentStep > 0 || isAlertModeManual;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-3xl animate-fadeIn select-none">
      <div
        className="relative w-full max-w-[96vw] h-[95vh] rounded-3xl overflow-hidden flex flex-col border shadow-2xl transition-colors duration-700"
        style={{
          background: '#040711',
          borderColor: isAlertMode ? 'rgba(229,72,77,0.5)' : 'rgba(201,151,62,0.3)',
          boxShadow: isAlertMode
            ? '0 25px 80px rgba(229,72,77,0.3), inset 0 1px 0 rgba(255,255,255,0.08)'
            : '0 25px 80px rgba(0,0,0,0.9), 0 0 40px rgba(201,151,62,0.1), inset 0 1px 0 rgba(255,255,255,0.08)'
        }}
      >
        {/* ── Top Sci-Fi SCADA Command Navigation Header ── */}
        <div
          className="flex items-center justify-between px-6 py-3.5 border-b z-20 flex-wrap gap-3 transition-colors duration-500"
          style={{
            background: isAlertMode ? 'rgba(20,6,10,0.95)' : 'rgba(6,10,20,0.95)',
            borderColor: isAlertMode ? 'rgba(229,72,77,0.3)' : 'rgba(255,255,255,0.07)'
          }}
        >
          {/* Brand & Location Telemetry */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border"
              style={{
                background: isAlertMode ? 'rgba(229,72,77,0.18)' : 'rgba(201,151,62,0.15)',
                borderColor: isAlertMode ? 'rgba(229,72,77,0.45)' : 'rgba(201,151,62,0.35)',
                boxShadow: isAlertMode ? '0 0 20px rgba(229,72,77,0.4)' : '0 0 20px rgba(201,151,62,0.2)'
              }}
            >
              <Monitor size={19} style={{ color: isAlertMode ? '#e5484d' : '#c9973e' }} />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-base tracking-widest text-text-primary">
                  3D SCADA NOC COMMAND CENTER
                </span>
                <span
                  className="text-2xs font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 uppercase"
                  style={{
                    background: isAlertMode ? 'rgba(229,72,77,0.15)' : 'rgba(45,212,168,0.12)',
                    color: isAlertMode ? '#e5484d' : '#2dd4a8',
                    borderColor: isAlertMode ? 'rgba(229,72,77,0.35)' : 'rgba(45,212,168,0.3)'
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: isAlertMode ? '#e5484d' : '#2dd4a8' }} />
                  {isAlertMode ? 'DEFCON 1 · ANOMALY ACTIVE' : 'LIVE TWIN · ORION 1.0'}
                </span>
              </div>
              <p className="text-2xs font-mono text-text-muted mt-0.5">
                NASA/SCADA Photorealistic HMI · {location?.name || 'Chengalpattu'}, India ({location?.latitude || 12.82}°N, {location?.longitude || 80.04}°E)
              </p>
            </div>
          </div>

          {/* 3D Camera Switching Controls & Command Tools */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Camera Presets */}
            <div className="flex items-center p-1 rounded-xl glass-premium border border-white/[0.08] text-xs font-mono font-semibold gap-1">
              {[
                ['wide', '🎥 Wide Deck'],
                ['videowall', '🖥️ Video Wall'],
                ['hologram', '🛸 Hologram Twin'],
                ['operator', '🧑‍💻 Operator POV'],
                ['servers', '🗄️ Server Racks'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleCameraChange(key)}
                  className="px-2.5 py-1.5 rounded-lg transition-all"
                  style={
                    cameraView === key
                      ? {
                          color: '#c9973e',
                          background: 'rgba(201,151,62,0.18)',
                          border: '1px solid rgba(201,151,62,0.35)',
                          boxShadow: '0 0 14px rgba(201,151,62,0.2)'
                        }
                      : { color: '#7a8ba3' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sound FX Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl border border-white/[0.08] text-text-secondary hover:text-white transition-all glass-premium"
              title={soundEnabled ? 'Mute SCADA SFX' : 'Enable SCADA SFX'}
            >
              {soundEnabled ? <Volume2 size={15} className="text-cyan" /> : <VolumeX size={15} className="text-text-muted" />}
            </button>

            {/* Manual Emergency Alert Switch */}
            <button
              onClick={() => {
                if (soundEnabled) playBeep(isAlertModeManual ? 'click' : 'alert');
                setIsAlertModeManual(!isAlertModeManual);
              }}
              className="px-3 py-1.5 rounded-xl border font-mono text-2xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
              style={{
                background: isAlertModeManual ? 'rgba(229,72,77,0.25)' : 'rgba(255,255,255,0.04)',
                color: isAlertModeManual ? '#e5484d' : '#7a8ba3',
                borderColor: isAlertModeManual ? 'rgba(229,72,77,0.5)' : 'rgba(255,255,255,0.1)',
                boxShadow: isAlertModeManual ? '0 0 16px rgba(229,72,77,0.35)' : 'none'
              }}
              title="Toggle Tactical Emergency Strobe Mode"
            >
              <ShieldAlert size={14} />
              <span>{isAlertModeManual ? 'Alert Active' : 'Test Alert'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 border"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#eef2f6',
                borderColor: 'rgba(255,255,255,0.12)'
              }}
            >
              <X size={14} />
              <span>Exit Deck</span>
            </button>
          </div>
        </div>

        {/* ── 3D WebGL Command Deck Canvas ── */}
        <div className="relative flex-1 w-full h-full bg-[#02050e]">
          <Canvas
            shadows
            camera={{ position: [0, 3.4, 4.4], fov: 46 }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.25,
              powerPreference: 'high-performance'
            }}
          >
            <color attach="background" args={['#030611']} />
            <ambientLight color="#0c182c" intensity={isAlertMode ? 0.35 : 0.65} />

            {/* Architectural Downlights */}
            <pointLight
              position={[0, 5.8, 0]}
              color={isAlertMode ? '#ff8589' : '#e0f2fe'}
              intensity={isAlertMode ? 35 : 24}
              distance={16}
              castShadow
            />

            {/* Video Wall Neon Bleed Light */}
            <pointLight
              position={[0, 3.2, -4.6]}
              color={isAlertMode ? '#e5484d' : '#4dd0e1'}
              intensity={isAlertMode ? 28 : 18}
              distance={10}
            />

            {/* Server Rack Edge Light */}
            <pointLight
              position={[-5.2, 2.5, -1.2]}
              color={isAlertMode ? '#e5484d' : '#2dd4a8'}
              intensity={12}
              distance={8}
            />

            {/* Hologram Pedestal Ambient Light */}
            <pointLight
              position={[0, 1.8, -1.0]}
              color={isAlertMode ? '#e5484d' : '#c9973e'}
              intensity={15}
              distance={5}
            />

            {/* Smooth Camera Rig */}
            <CameraRig cameraView={cameraView} controlsRef={controlsRef} />

            {/* Room Architecture & Lighting */}
            <CommandDeckArchitecture isAlertMode={isAlertMode} />

            {/* Central 3D Hologram Table */}
            <CentralHologramTable isAlertMode={isAlertMode} currentKW={currentKW} />

            {/* Massive Multi-Screen Curved Video Wall */}
            <MissionVideoWall
              currentKW={currentKW}
              irradiance={irradiance}
              activeIncidentStep={activeIncidentStep}
              isSimulating={isSimulating}
              onStartSimulation={handleStartSimulation}
              onResetSimulation={handleResetSimulation}
              location={location}
            />

            {/* Ergonomic Operator Workstation */}
            <OperatorWorkstations position={[0, 0, 1.3]} />

            {/* Edge AI Server Racks */}
            <EdgeServerRacks position={[-6.2, 0, -1.2]} isAlertMode={isAlertMode} />

            {/* Smooth Interactive Orbit Controls */}
            <OrbitControls
              ref={controlsRef}
              enableDamping
              dampingFactor={0.06}
              minDistance={1.0}
              maxDistance={7.5}
              maxPolarAngle={Math.PI / 2 - 0.05}
              minPolarAngle={Math.PI / 16}
              target={[0, 1.8, -2.4]}
            />
          </Canvas>

          {/* Bottom HUD Floating Status Overlay */}
          <div className="absolute bottom-4 left-6 z-20 pointer-events-none flex items-center gap-3">
            <div className="glass-premium px-4 py-2 rounded-xl text-2xs font-mono text-text-secondary border border-white/[0.08] shadow-2xl flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full animate-ping"
                style={{ background: isAlertMode ? '#e5484d' : '#4dd0e1' }} />
              <span>
                {isAlertMode
                  ? 'TACTICAL ALERT: String #7 Isolated · BESS Dynamic Compensation Engaged'
                  : 'Orbit: Drag to inspect · Switch cameras in header · Click "Simulate SCADA Incident" on video wall'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
