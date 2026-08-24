import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PanelInspectorHtml from './PanelInspectorHtml';

// ── Photorealistic 9-Busbar Half-Cut Monocrystalline Cell Texture ──────────
function createSolarCellTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  // Deep ARCoating black backsheet
  ctx.fillStyle = '#03070f';
  ctx.fillRect(0, 0, 2048, 2048);

  const cols = 6;
  const rows = 10;
  const cellW = 2048 / cols;
  const cellH = 2048 / rows;
  const pad = 5;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW + pad;
      const y = r * cellH + pad;
      const w = cellW - pad * 2;
      const h = cellH - pad * 2;

      // Realistic monocrystalline gradient — deep midnight blue with subtle iridescence
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0.00, '#07152b');
      grad.addColorStop(0.18, '#050e1e');
      grad.addColorStop(0.45, '#030a16');
      grad.addColorStop(0.72, '#060f20');
      grad.addColorStop(1.00, '#020610');
      ctx.fillStyle = grad;

      // Monocrystalline pseudo-square wafer with chamfered corners
      const cut = 10;
      ctx.beginPath();
      ctx.moveTo(x + cut, y);
      ctx.lineTo(x + w - cut, y);
      ctx.lineTo(x + w, y + cut);
      ctx.lineTo(x + w, y + h - cut);
      ctx.lineTo(x + w - cut, y + h);
      ctx.lineTo(x + cut, y + h);
      ctx.lineTo(x, y + h - cut);
      ctx.lineTo(x, y + cut);
      ctx.closePath();
      ctx.fill();

      // Subtle AR coating shimmer overlay
      const shimmer = ctx.createLinearGradient(x, y, x + w * 0.5, y + h);
      shimmer.addColorStop(0, 'rgba(30, 80, 160, 0.04)');
      shimmer.addColorStop(0.5, 'rgba(10, 30, 80, 0.02)');
      shimmer.addColorStop(1, 'rgba(0, 0, 40, 0)');
      ctx.fillStyle = shimmer;
      ctx.beginPath();
      ctx.moveTo(x + cut, y);
      ctx.lineTo(x + w - cut, y);
      ctx.lineTo(x + w, y + cut);
      ctx.lineTo(x + w, y + h - cut);
      ctx.lineTo(x + w - cut, y + h);
      ctx.lineTo(x + cut, y + h);
      ctx.lineTo(x, y + h - cut);
      ctx.lineTo(x, y + cut);
      ctx.closePath();
      ctx.fill();

      // Half-cut cell center laser separation line
      ctx.strokeStyle = 'rgba(1, 4, 10, 0.95)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();

      // 9 silver multi-busbars (ultra-fine)
      ctx.strokeStyle = 'rgba(210, 230, 255, 0.50)';
      ctx.lineWidth = 1.2;
      for (let b = 1; b <= 9; b++) {
        const bx = x + (w * b) / 10;
        ctx.beginPath();
        ctx.moveTo(bx, y + 2);
        ctx.lineTo(bx, y + h - 2);
        ctx.stroke();
      }

      // High-density conductor grid fingers (28 fingers per cell)
      ctx.strokeStyle = 'rgba(160, 210, 255, 0.14)';
      ctx.lineWidth = 0.5;
      for (let f = 1; f < 28; f++) {
        const fy = y + (h * f) / 28;
        ctx.beginPath();
        ctx.moveTo(x + 3, fy);
        ctx.lineTo(x + w - 3, fy);
        ctx.stroke();
      }
    }
  }

  // EVA encapsulant cell gap lines
  ctx.strokeStyle = 'rgba(1, 3, 8, 0.9)';
  ctx.lineWidth = pad * 1.2;
  for (let c = 1; c < cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, 0);
    ctx.lineTo(c * cellW, 2048);
    ctx.stroke();
  }
  for (let r = 1; r < rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellH);
    ctx.lineTo(2048, r * cellH);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

let _cachedCellTexture = null;
function getCellTexture() {
  if (!_cachedCellTexture && typeof document !== 'undefined') {
    _cachedCellTexture = createSolarCellTexture();
  }
  return _cachedCellTexture;
}

// ── P1000 MLPE Smart Optimizer Sensor ────────────────────────────────────────
function PanelOptimizerSensor3D({ isOffline = false, isDegraded = false }) {
  const ledRef = useRef();

  useFrame((state) => {
    if (!ledRef.current) return;
    const t = state.clock.getElapsedTime();
    const intensity = isOffline ? 0.05 : isDegraded
      ? Math.abs(Math.sin(t * 4)) * 1.2 + 0.3
      : Math.sin(t * 1.8) * 0.4 + 1.8;
    ledRef.current.children.forEach((child) => {
      if (child.material) child.material.emissiveIntensity = intensity;
    });
  });

  return (
    <group position={[0.72, 0.42, 0.046]}>
      {/* IP67 Matte Black Enclosure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.20, 0.048]} />
        <meshStandardMaterial color="#141e2e" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* Recessed Beveled Faceplate */}
      <mesh position={[0, 0, 0.026]} castShadow>
        <boxGeometry args={[0.24, 0.17, 0.005]} />
        <meshStandardMaterial color="#0a1220" metalness={0.65} roughness={0.5} />
      </mesh>

      {/* Cyan brand stripe */}
      <mesh position={[0, 0.04, 0.029]}>
        <planeGeometry args={[0.18, 0.025]} />
        <meshBasicMaterial color="#0ea5e9" />
      </mesh>

      {/* LED indicators */}
      <group ref={ledRef} position={[0, 0.065, 0.030]}>
        {[-0.07, -0.023, 0.023, 0.07].map((lx, li) => (
          <mesh key={`led-${li}`} position={[lx, 0, 0]}>
            <sphereGeometry args={[0.006, 10, 10]} />
            <meshStandardMaterial
              color={isOffline ? '#334155' : '#38bdf8'}
              emissive={isOffline ? '#000' : '#0284c7'}
              emissiveIntensity={isOffline ? 0 : 2.2}
            />
          </mesh>
        ))}
      </group>

      {/* RF comms LED */}
      <mesh position={[0.085, -0.04, 0.030]}>
        <sphereGeometry args={[0.007, 10, 10]} />
        <meshStandardMaterial
          color={isOffline ? '#475569' : '#f43f5e'}
          emissive={isOffline ? '#000' : '#f43f5e'}
          emissiveIntensity={isOffline ? 0 : 1.4}
        />
      </mesh>

      {/* MC4 connector ports left */}
      {[-0.04, 0.04].map((py, pi) => (
        <group key={`mc4-l-${pi}`} position={[-0.165, py, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.019, 0.019, 0.055, 12]} />
            <meshStandardMaterial color="#080c16" roughness={0.4} metalness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Wiring conduits */}
      <mesh position={[-0.06, -0.14, -0.015]} rotation={[0.35, 0, 0.25]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.14, 8]} />
        <meshStandardMaterial color="#cc2020" roughness={0.7} />
      </mesh>
      <mesh position={[0.06, -0.14, -0.015]} rotation={[0.35, 0, -0.25]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.14, 8]} />
        <meshStandardMaterial color="#0a0f1a" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ── Main SolarPanel3D Component ───────────────────────────────────────────────
export default function SolarPanel3D({
  panelData,
  position,
  isSelected,
  onSelectPanel,
  totalArrayKW,
  isPulseHighlighted,
  panelTiltDeg = 30,
  onSetFault,
  targetRoll = 0,
  trackingMode = 'fixed',
  sunlightFactor = 1.0,
}) {
  const glassRef    = useRef();
  const currentRoll = useRef(0);
  const [hovered, setHovered] = useState(false);

  const isOffline  = panelData.status === 'Offline';
  const isDegraded = panelData.status === 'Underperforming';
  const outputRatio = Math.min(1.0, (panelData.predictedKW || 0) / 4.0);

  const cellTexture = useMemo(() => getCellTexture(), []);

  const matParams = useMemo(() => {
    if (isOffline)  return { roughness: 0.88, metalness: 0.05, clearcoat: 0.05, emissiveColor: '#ef4444' };
    if (isDegraded) return { roughness: 0.38, metalness: 0.30, clearcoat: 0.55, emissiveColor: '#f59e0b' };
    return { roughness: 0.04, metalness: 0.45, clearcoat: 1.0, clearcoatRoughness: 0.02, emissiveColor: '#38bdf8' };
  }, [isOffline, isDegraded]);

  useFrame((state, delta) => {
    currentRoll.current = THREE.MathUtils.lerp(currentRoll.current, targetRoll, delta * 3.5);
    const isTracking = trackingMode === 'tracking' && Math.abs(currentRoll.current - targetRoll) > 0.005;
    if (!glassRef.current) return;
    const mat = glassRef.current.material;
    const t = state.clock.getElapsedTime();
    let target = 0;
    if (isOffline)          target = Math.sin(t * 2) * 0.06 + 0.06;
    else if (isDegraded)    target = Math.sin(t * 3) * 0.08 + 0.10;
    else if (isTracking)    target = 0.16 + Math.sin(t * 10) * 0.05;
    else if (hovered || isSelected) target = 0.14 + (isPulseHighlighted ? Math.sin(t * 8) * 0.10 : 0);
    else if (sunlightFactor > 0.05) target = outputRatio * 0.05 * sunlightFactor;
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, target, delta * 5);
  });

  const panelTiltRad = (panelTiltDeg * Math.PI) / 180;
  const groupTiltRad = -Math.PI / 2 + panelTiltRad;
  const panelW = 1.96;
  const panelH = 1.16;
  const panelD = 0.040;

  const handleClick = e => { e.stopPropagation(); onSelectPanel(isSelected ? null : panelData); };
  const handleOver  = e => { e.stopPropagation(); setHovered(true);  document.body.style.cursor = 'pointer'; };
  const handleOut   = () => { setHovered(false); document.body.style.cursor = 'auto'; };

  const frameColor = isOffline
    ? '#1a2030'
    : isSelected
    ? '#7dd3fc'
    : hovered
    ? '#f0f4f8'
    : '#78909c';

  return (
    <group position={position}>
      <group rotation={[groupTiltRad, 0, currentRoll.current]}
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        {/* ── Hover / Selection Halo ── */}
        {(isSelected || hovered) && (
          <mesh>
            <boxGeometry args={[panelW + 0.10, panelH + 0.10, panelD + 0.025]} />
            <meshBasicMaterial
              color={isSelected ? '#38bdf8' : '#94a3b8'}
              wireframe
              transparent
              opacity={isSelected ? 0.85 : 0.25}
            />
          </mesh>
        )}

        {/* ── Anodized Aluminum Frame — 4 precise rails ── */}
        {/* Top rail */}
        <mesh position={[0, panelH / 2 + 0.025, 0]} castShadow receiveShadow>
          <boxGeometry args={[panelW + 0.06, 0.048, panelD + 0.008]} />
          <meshStandardMaterial color={frameColor} metalness={0.96} roughness={0.12} envMapIntensity={1.2} />
        </mesh>
        {/* Bottom rail */}
        <mesh position={[0, -(panelH / 2 + 0.025), 0]} castShadow receiveShadow>
          <boxGeometry args={[panelW + 0.06, 0.048, panelD + 0.008]} />
          <meshStandardMaterial color={frameColor} metalness={0.96} roughness={0.12} envMapIntensity={1.2} />
        </mesh>
        {/* Left rail */}
        <mesh position={[-(panelW / 2 + 0.025), 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.048, panelH + 0.006, panelD + 0.008]} />
          <meshStandardMaterial color={frameColor} metalness={0.96} roughness={0.12} envMapIntensity={1.2} />
        </mesh>
        {/* Right rail */}
        <mesh position={[panelW / 2 + 0.025, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.048, panelH + 0.006, panelD + 0.008]} />
          <meshStandardMaterial color={frameColor} metalness={0.96} roughness={0.12} envMapIntensity={1.2} />
        </mesh>

        {/* ── Outer Tempered AR-Glass (Photovoltaic Cells) ── */}
        <mesh ref={glassRef} position={[0, 0, panelD / 2 + 0.002]} receiveShadow castShadow>
          <planeGeometry args={[panelW, panelH]} />
          <meshPhysicalMaterial
            map={cellTexture}
            color={isOffline ? '#1a2233' : '#ffffff'}
            roughness={matParams.roughness}
            metalness={matParams.metalness}
            clearcoat={matParams.clearcoat}
            clearcoatRoughness={0.02}
            reflectivity={0.98}
            ior={1.52}
            emissive={matParams.emissiveColor}
            emissiveIntensity={0}
          />
        </mesh>

        {/* ── Back White Tedlar Sheet ── */}
        <mesh position={[0, 0, -(panelD / 2 + 0.002)]}>
          <planeGeometry args={[panelW + 0.01, panelH + 0.01]} />
          <meshStandardMaterial color="#0c1422" roughness={0.85} />
        </mesh>

        {/* ── Back Junction Box ── */}
        <mesh position={[0, panelH * 0.28, -(panelD / 2 + 0.020)]} castShadow>
          <boxGeometry args={[0.15, 0.10, 0.032]} />
          <meshStandardMaterial color="#080d18" roughness={0.55} metalness={0.3} />
        </mesh>

        {/* ── Corner Mounting Clamps ── */}
        {[[-panelW / 2 - 0.026, -0.3], [-panelW / 2 - 0.026, 0.3],
          [ panelW / 2 + 0.026, -0.3], [ panelW / 2 + 0.026, 0.3]].map(([cx, cy], ci) => (
          <mesh key={`clamp-${ci}`} position={[cx, cy, panelD / 2 + 0.005]} castShadow>
            <boxGeometry args={[0.032, 0.055, 0.014]} />
            <meshStandardMaterial color="#90a0b0" metalness={0.96} roughness={0.18} />
          </mesh>
        ))}

        {/* ── P1000 MLPE Optimizer Sensor ── */}
        <PanelOptimizerSensor3D isOffline={isOffline} isDegraded={isDegraded} />
      </group>

      {/* ── HTML Telemetry Inspector ── */}
      {isSelected && (
        <PanelInspectorHtml
          panel={panelData}
          onClose={() => onSelectPanel(null)}
          onSetFault={onSetFault}
        />
      )}
    </group>
  );
}
