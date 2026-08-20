import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls, Environment, ContactShadows,
  Html, Stars, Grid
} from '@react-three/drei';
import * as THREE from 'three';
import SolarPanel3D from './SolarPanel3D';
import EnergyParticles from './EnergyParticles';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

function getSunPosition(hour) {
  if (hour < 5 || hour > 19) return [-30, -8, 15];
  const t = (hour - 5) / 14;
  const a = t * Math.PI;
  return [-Math.cos(a) * 26, Math.sin(a) * 20, 10 + Math.sin(a) * 5];
}

function CameraTourController({ tourStep }) {
  const ref = useRef();
  const targets = useMemo(() => [
    { camPos: [-9, 8.5, 14],  target: [0, 0.5, 0] },
    { camPos: [-4, 5, 8],     target: [0, 0.5, 0] },
    { camPos: [3, 3.5, 6],    target: [3.5, 0.2, 0] },
    { camPos: [6, 3.2, 5],    target: [7.2, 0.6, 0] },
    { camPos: [7, 2.2, 3.5],  target: [7.2, 1.2, 0] },
  ], []);

  useFrame((state, delta) => {
    if (!ref.current || tourStep === null || !targets[tourStep]) return;
    const { camPos, target } = targets[tourStep];
    state.camera.position.lerp(new THREE.Vector3(...camPos), delta * 3.5);
    ref.current.target.lerp(new THREE.Vector3(...target), delta * 3.5);
    ref.current.update();
  });

  return (
    <OrbitControls ref={ref} enableDamping dampingFactor={0.05}
      minDistance={5} maxDistance={26}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minPolarAngle={Math.PI / 10}
      target={[0, 0.5, 0]}
    />
  );
}

function InverterUnit({ currentKW }) {
  const isOn = currentKW > 0;
  return (
    <group position={[7.2, 0, 0]}>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.55, 1.2, 1.55]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.38} roughness={0.58} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[-0.74 + i * 0.065, 0.7, -0.5]} castShadow>
          <boxGeometry args={[0.012, 0.88, 0.36]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.72} roughness={0.30} />
        </mesh>
      ))}
      <mesh position={[0, 0.68, 0.784]}>
        <boxGeometry args={[1.0, 0.52, 0.018]} />
        <meshStandardMaterial color="#111827" metalness={0.2} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.68, 0.796]}>
        <planeGeometry args={[0.88, 0.42]} />
        <meshStandardMaterial
          color="#0c4a6e"
          emissive={isOn ? '#0284c7' : '#020617'}
          emissiveIntensity={isOn ? 0.8 : 0.04}
        />
      </mesh>
      <mesh position={[0, 1.24, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.12, 16]} />
        <meshStandardMaterial
          color={isOn ? '#10b981' : '#4b5563'}
          emissive={isOn ? '#10b981' : '#000'}
          emissiveIntensity={isOn ? 1.8 : 0}
          roughness={0.1} metalness={0.3}
        />
      </mesh>
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.04, 0]} receiveShadow>
          <boxGeometry args={[0.28, 0.08, 1.0]} />
          <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function MountingRails() {
  return (
    <group>
      {[-2.1, 0, 2.1].map((z, rowIdx) => (
        <group key={rowIdx}>
          {[-0.28, 0.28].map((off, ri) => (
            <mesh key={ri} position={[0, 0.06, z + off * 0.9]} receiveShadow castShadow>
              <boxGeometry args={[11.5, 0.04, 0.04]} />
              <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.22} />
            </mesh>
          ))}
          {[-3.6, -1.2, 1.2, 3.6].map((x, ci) => (
            <mesh key={ci} position={[x, 0.06, z]} castShadow>
              <boxGeometry args={[0.04, 0.04, 1.0]} />
              <meshStandardMaterial color="#334155" metalness={0.88} roughness={0.22} />
            </mesh>
          ))}
        </group>
      ))}
      {[-3.6, -1.2, 1.2, 3.6].map((x, ci) =>
        [-2.1, 2.1].map((z, ri) => (
          <mesh key={`${ci}-${ri}`} position={[x, 0.18, z]} castShadow>
            <cylinderGeometry args={[0.028, 0.032, 0.36, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.28} />
          </mesh>
        ))
      )}
    </group>
  );
}

export default function Solar3DScene({
  hourOfDay,
  panelDataList,
  selectedPanel,
  onSelectPanel,
  currentKW,
  tourStep,
  onNextTourStep,
  onPrevTourStep,
  onEndTour,
  activeFormulaHighlight,
  onFormulaHover,
  panelTiltDeg = 30,
  cloudShadowFactor = 0,
  faultedPanels = {},
  onSetPanelFault,
}) {
  const sunPosition    = useMemo(() => getSunPosition(hourOfDay), [hourOfDay]);
  const isNight        = hourOfDay < 6 || hourOfDay > 18;
  const sunAltitudeDeg = isNight ? 0 : Math.round(Math.sin(((hourOfDay - 5) / 14) * Math.PI) * 72);
  const isCloudActive  = cloudShadowFactor > 0.05;
  const lightIntensity = isNight ? 0.04 : (1.8 * (1 - cloudShadowFactor * 0.7));
  const isGoldenHour   = !isNight && (hourOfDay < 9 || hourOfDay > 16);
  const sunColor       = isGoldenHour ? '#ffb060' : '#fffdf5';
  const bgColor        = isNight ? '#050608' : '#0c1220';

  const gridPositions = useMemo(() => {
    const rows = 3, cols = 4, colSpacing = 2.4, rowSpacing = 2.1;
    const startX = -((cols - 1) * colSpacing) / 2;
    const startZ = -((rows - 1) * rowSpacing) / 2;
    return Array.from({ length: rows * cols }, (_, i) => ({
      id: i + 1,
      pos: [startX + (i % cols) * colSpacing, 0.45, startZ + Math.floor(i / cols) * rowSpacing],
    }));
  }, []);

  const tourCallouts = [
    { title: 'Step 1: Sun Position',         text: `Sun at ${sunAltitudeDeg}°. HDRI environment drives glass reflections. Drag time slider to move the sun across the sky.`, anchorPos: [0, 3.0, 0] },
    { title: 'Step 2: PV Glass Material',    text: `12 modules at ${panelTiltDeg}° tilt. meshPhysicalMaterial with clearcoat=1.0 and ior=1.52 — realism comes from environment reflections.`, anchorPos: [0, 2.5, 0] },
    { title: 'Step 3: Aluminum Rail System', text: 'Longitudinal rails, lateral cross-braces every 2.4 m, and ground anchor posts — mirrors real ground-mount racking geometry.', anchorPos: [3.5, 1.4, 0] },
    { title: 'Step 4: Inverter Unit',        text: 'Matte metal casing with 12 extruded rear heatsink fins, recessed LCD screen, mounting foot pads, and green status LED.', anchorPos: [7.2, 1.8, 0] },
    { title: 'Step 5: Fault Injection',      text: 'Click any module to open the telemetry inspector. Inject Underperforming (45% output) or Offline (0 kW) faults.', anchorPos: [0, 2.5, 0] },
  ];

  return (
    <div className="w-full h-[520px] sm:h-[580px] rounded-sm overflow-hidden relative border border-[#2a2d32]">

      {/* CSS vignette overlay — no postprocessing needed */}
      <div
        className="absolute inset-0 z-10 pointer-events-none rounded-sm"
        style={{ boxShadow: 'inset 0 0 120px 40px rgba(0,0,0,0.72)' }}
      />

      {/* ── HUD overlay ── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none select-none">
        <div className="bg-[#141619]/90 border border-[#2a2d32] px-3.5 py-2 rounded-sm text-xs space-y-0.5 pointer-events-auto">
          <div className="font-bold text-[#c7ccd4] tracking-widest uppercase text-[11px] flex items-center gap-2 font-mono">
            <span className="w-2.5 h-1.5 rounded-none bg-[#f0a830]" />
            HELIOS — 48.0 kW PHOTOVOLTAIC ARRAY
          </div>
          <div className="text-[10px] text-[#9ca3af] font-mono tracking-wider">
            4×3 GRID • {panelTiltDeg}° TILT ANGLE • SOUTH-FACING
            {isCloudActive && <span className="ml-2 text-[#f59e0b]">☁ CLOUD ACTIVE (-{Math.round(cloudShadowFactor * 100)}%)</span>}
          </div>
        </div>

        <div className="bg-[#141619]/90 border border-[#2a2d32] rounded-sm flex items-center divide-x divide-[#2a2d32] pointer-events-auto">
          <div
            onMouseEnter={() => onFormulaHover('kw')}
            onMouseLeave={() => onFormulaHover(null)}
            className={`px-3.5 py-1.5 text-xs font-mono cursor-pointer relative ${activeFormulaHighlight === 'kw' ? 'bg-[#1f2328]' : ''}`}
          >
            <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider">ARRAY OUTPUT:</span>{' '}
            <span className={`font-bold text-sm tabular-nums ${isCloudActive ? 'text-[#f59e0b]' : 'text-[#f0a830]'}`}>{currentKW} kW</span>
            {activeFormulaHighlight === 'kw' && (
              <div className="absolute right-0 top-10 z-30 w-72 p-3 bg-[#141619] border border-[#f0a830] rounded-sm text-xs text-[#c7ccd4] font-sans">
                <div className="font-bold text-[#f0a830] pb-1 mb-1 font-mono text-[11px] uppercase tracking-wider border-b border-[#2a2d32]">FORMULA: ARRAY POWER</div>
                <div className="font-mono text-[11px] bg-[#0b0c0e] p-1.5 rounded-sm text-[#f0a830]">P(t) = 48kW × SolarFactor^1.3 × (1-Cloud) × TiltEff</div>
              </div>
            )}
          </div>
          <div
            onMouseEnter={() => onFormulaHover('sun')}
            onMouseLeave={() => onFormulaHover(null)}
            className={`px-3.5 py-1.5 text-xs font-mono cursor-pointer relative ${activeFormulaHighlight === 'sun' ? 'bg-[#1f2328]' : ''}`}
          >
            <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider">SUN ALTITUDE:</span>{' '}
            <span className="font-bold text-[#c7ccd4] text-sm tabular-nums">{sunAltitudeDeg}°</span>
            {activeFormulaHighlight === 'sun' && (
              <div className="absolute right-0 top-10 z-30 w-72 p-3 bg-[#141619] border border-[#c7ccd4] rounded-sm text-xs text-[#c7ccd4] font-sans">
                <div className="font-bold text-[#c7ccd4] pb-1 mb-1 font-mono text-[11px] uppercase tracking-wider border-b border-[#2a2d32]">FORMULA: ZENITH ANGLE</div>
                <div className="font-mono text-[11px] bg-[#0b0c0e] p-1.5 rounded-sm text-[#c7ccd4]">α(t) = sin((t-6)/12 × π) × 72°</div>
              </div>
            )}
          </div>
          {Object.keys(faultedPanels).length > 0 && (
            <div className="px-3.5 py-1.5 text-xs font-mono">
              <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider">FAULTS:</span>{' '}
              <span className="font-bold text-[#ef4444] tabular-nums">{Object.keys(faultedPanels).length} MODULE{Object.keys(faultedPanels).length > 1 ? 'S' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── R3F Canvas — NO EffectComposer ── */}
      <Canvas
        shadows
        camera={{ position: [-7.5, 9.0, 15.0], fov: 40 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: bgColor }}
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 24, 55]} />

        {/* HDRI — drives physical glass reflections */}
        <Environment preset={isNight ? 'night' : isGoldenHour ? 'sunset' : 'city'} background={false} />

        {isNight && <Stars radius={120} depth={60} count={2000} factor={5} saturation={0} fade speed={0.8} />}

        {/* Primary sun light */}
        <directionalLight
          position={sunPosition}
          intensity={lightIntensity}
          color={isNight ? '#8094b8' : sunColor}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={55}
          shadow-camera-left={-18}
          shadow-camera-right={18}
          shadow-camera-top={18}
          shadow-camera-bottom={-18}
          shadow-bias={-0.0003}
        />

        <ambientLight intensity={isNight ? 0.12 : 0.4} color="#94a3b8" />
        <hemisphereLight skyColor={isNight ? '#1a2744' : '#87ceeb'} groundColor="#0f172a" intensity={0.45} />
        <pointLight position={[-8, 6, 9]} intensity={isNight ? 0 : 0.3} color="#bfdbfe" />

        {/* Sun disc */}
        {!isNight && (
          <mesh position={sunPosition}>
            <sphereGeometry args={[1.4, 32, 32]} />
            <meshBasicMaterial color={isGoldenHour ? '#fb923c' : '#fbbf24'} />
          </mesh>
        )}

        {/* Panel array */}
        <group>
          {gridPositions.map((item, idx) => {
            const data  = panelDataList[idx] || { id: item.id, predictedKW: 0, label: `Panel A-${idx + 1}`, status: 'Standby' };
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
              />
            );
          })}
        </group>

        <MountingRails />
        <InverterUnit currentKW={currentKW} />
        <EnergyParticles currentKW={currentKW} />

        {/* DC cables */}
        <group position={[3.8, 0.07, 0.18]}>
          {[0.07, -0.07].map((z, i) => (
            <mesh key={i} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.022, 0.022, 7.5, 12]} />
              <meshStandardMaterial color={i === 0 ? '#dc2626' : '#1f2937'} metalness={0.5} roughness={0.45} />
            </mesh>
          ))}
        </group>

        {/* AC cable */}
        <mesh position={[9.2, 0.07, 0.7]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 3.2, 12]} />
          <meshStandardMaterial color="#ea580c" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[65, 65]} />
          <meshStandardMaterial color="#111827" roughness={0.92} metalness={0.06} />
        </mesh>

        {/* Technical grid */}
        <Grid
          position={[0, 0.002, 0]}
          args={[65, 65]}
          cellSize={1}
          cellThickness={0.35}
          cellColor="#1e2938"
          sectionSize={5}
          sectionThickness={0.7}
          sectionColor="#1e3a5f"
          fadeDistance={35}
          fadeStrength={1.2}
          infiniteGrid
        />

        <ContactShadows
          position={[0, 0.005, 0]}
          opacity={0.7}
          scale={28}
          blur={2.2}
          far={6}
        />

        {/* Tour callouts */}
        {tourStep !== null && tourCallouts[tourStep] && (
          <Html position={tourCallouts[tourStep].anchorPos} center distanceFactor={10} zIndexRange={[100, 0]}>
            <div className="bg-[#141619] border border-[#2a2d32] p-4 rounded-sm w-72 text-[#c7ccd4] font-sans pointer-events-auto select-none">
              <div className="flex items-center justify-between border-b border-[#2a2d32] pb-2 mb-2">
                <span className="text-[11px] font-bold text-[#f0a830] font-mono uppercase tracking-wider">{tourCallouts[tourStep].title}</span>
                <span className="text-[10px] text-[#9ca3af] font-mono">{tourStep + 1}/5</span>
              </div>
              <p className="text-xs text-[#c7ccd4] leading-relaxed mb-3">{tourCallouts[tourStep].text}</p>
              <div className="flex items-center justify-between pt-1 border-t border-[#2a2d32]">
                <button onClick={e => { e.stopPropagation(); onPrevTourStep(); }} disabled={tourStep === 0}
                  className="px-2.5 py-1 text-xs bg-[#1f2328] hover:bg-[#2a2d32] disabled:opacity-40 rounded-sm text-[#c7ccd4] flex items-center gap-1 font-mono">
                  <ArrowLeft size={12} /><span>PREV</span>
                </button>
                <button onClick={e => { e.stopPropagation(); onEndTour(); }} className="text-xs text-[#9ca3af] hover:text-white font-mono">CLOSE</button>
                {tourStep < 4
                  ? <button onClick={e => { e.stopPropagation(); onNextTourStep(); }} className="px-3 py-1 text-xs bg-[#f0a830] hover:bg-[#d99426] text-[#0b0c0e] font-bold rounded-sm flex items-center gap-1 font-mono">
                      <span>NEXT</span><ArrowRight size={12} />
                    </button>
                  : <button onClick={e => { e.stopPropagation(); onEndTour(); }} className="px-3 py-1 text-xs bg-[#10b981] hover:bg-[#059669] text-[#0b0c0e] font-bold rounded-sm flex items-center gap-1 font-mono">
                      <span>DONE</span><Check size={12} />
                    </button>
                }
              </div>
            </div>
          </Html>
        )}

        <CameraTourController tourStep={tourStep} />
      </Canvas>
    </div>
  );
}
