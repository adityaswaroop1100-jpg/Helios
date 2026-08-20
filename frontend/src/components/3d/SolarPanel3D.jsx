import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PanelInspectorHtml from './PanelInspectorHtml';

export default function SolarPanel3D({
  panelData,
  position,
  isSelected,
  onSelectPanel,
  totalArrayKW,
  isPulseHighlighted,
  panelTiltDeg = 30,
  onSetFault,
}) {
  const glassRef    = useRef();
  const [hovered, setHovered] = useState(false);

  const isOffline  = panelData.status === 'Offline';
  const isDegraded = panelData.status === 'Underperforming';
  const outputRatio = Math.min(1.0, (panelData.predictedKW || 0) / 4.0);

  // Per-panel subtle clearcoat & roughness variance for physical glass realism
  const matParams = useMemo(() => {
    const id = panelData.id || 1;
    if (isOffline)  return { roughness: 0.85, metalness: 0.15, clearcoatRoughness: 0.35, emissiveColor: '#ef4444' };
    if (isDegraded) return { roughness: 0.55, metalness: 0.45, clearcoatRoughness: 0.18, emissiveColor: '#f59e0b' };
    const roughness          = 0.06 + (Math.sin(id * 3.7) * 0.025 + 0.025); // 0.06–0.11
    const clearcoatRoughness = 0.03 + (Math.cos(id * 2.1) * 0.015 + 0.015); // 0.03–0.06
    return { roughness, metalness: 0.82, clearcoatRoughness, emissiveColor: '#f0a830' };
  }, [panelData.id, isOffline, isDegraded]);

  // Dynamic emissive pulse
  useFrame((state, delta) => {
    if (!glassRef.current) return;
    const mat = glassRef.current.material;
    const t   = state.clock.getElapsedTime();
    let target = 0;
    if (isOffline)         target = Math.sin(t * 2) * 0.06 + 0.06;
    else if (isDegraded)   target = Math.sin(t * 3) * 0.08 + 0.1;
    else if (hovered || isSelected) target = 0.25 + (isPulseHighlighted ? Math.sin(t * 8) * 0.15 : 0);
    else                   target = outputRatio * 0.08 + (isPulseHighlighted ? Math.sin(t * 8) * 0.15 + 0.12 : 0);
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, target, delta * 5);
  });

  const tiltRad  = (panelTiltDeg * Math.PI) / 180;
  const yawRad   = -Math.PI / 2;
  const panelW   = 1.95;
  const panelH   = 1.15;
  const panelD   = 0.035;

  const handleClick = e => { e.stopPropagation(); onSelectPanel(isSelected ? null : panelData); };
  const handleOver  = e => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; };
  const handleOut   = ()  => { setHovered(false); document.body.style.cursor = 'auto'; };

  const frameColor = isOffline ? '#2d3748' : (isSelected ? '#f0a830' : hovered ? '#e2e8f0' : '#94a3b8');

  return (
    <group position={position}>
      <group rotation={[tiltRad, yawRad, 0]} onClick={handleClick} onPointerOver={handleOver} onPointerOut={handleOut}>

        {/* ── Selection wireframe ── */}
        {(isSelected || hovered) && (
          <mesh>
            <boxGeometry args={[panelW + 0.14, panelH + 0.14, panelD + 0.04]} />
            <meshBasicMaterial color={isSelected ? '#f0a830' : '#c7ccd4'} wireframe transparent opacity={isSelected ? 0.85 : 0.35} />
          </mesh>
        )}

        {/* ── Anodized aluminum bevel frame ── */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[panelW + 0.07, panelH + 0.07, panelD]} />
          <meshStandardMaterial color={frameColor} metalness={0.92} roughness={0.18} />
        </mesh>

        {/* ── Inner frame lip (4 thin strips for depth) ── */}
        {[
          [0,  (panelH / 2 + 0.02), panelD / 2 + 0.001, panelW + 0.07, 0.04, 0.008],
          [0, -(panelH / 2 + 0.02), panelD / 2 + 0.001, panelW + 0.07, 0.04, 0.008],
          [ (panelW / 2 + 0.02), 0, panelD / 2 + 0.001, 0.04, panelH + 0.07, 0.008],
          [-(panelW / 2 + 0.02), 0, panelD / 2 + 0.001, 0.04, panelH + 0.07, 0.008],
        ].map(([x, y, z, w, h, d], i) => (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.12} />
          </mesh>
        ))}

        {/* ── Photovoltaic glass — meshPhysicalMaterial with clearcoat ── */}
        <mesh ref={glassRef} castShadow receiveShadow position={[0, 0, panelD / 2 + 0.002]}>
          <boxGeometry args={[panelW, panelH, 0.006]} />
          <meshPhysicalMaterial
            color={isOffline ? '#111827' : isDegraded ? '#0d1a0a' : '#020617'}
            metalness={matParams.metalness}
            roughness={matParams.roughness}
            clearcoat={isOffline ? 0.2 : 1.0}
            clearcoatRoughness={matParams.clearcoatRoughness}
            reflectivity={1.0}
            ior={1.52}
            emissive={matParams.emissiveColor}
            emissiveIntensity={0.05}
            polygonOffset polygonOffsetFactor={1}
          />
        </mesh>

        {/* ── Cell busbar grid (very fine, 6×4 cells) ── */}
        {Array.from({ length: 5 }, (_, row) =>
          <mesh key={`hr${row}`} position={[0, -panelH / 2 + (row + 1) * panelH / 5, panelD / 2 + 0.008]}>
            <boxGeometry args={[panelW - 0.03, 0.003, 0.001]} />
            <meshBasicMaterial color={isOffline ? '#1f2937' : '#1e3a5f'} transparent opacity={0.55} />
          </mesh>
        )}
        {Array.from({ length: 7 }, (_, col) =>
          <mesh key={`vc${col}`} position={[-panelW / 2 + (col + 1) * panelW / 7, 0, panelD / 2 + 0.008]}>
            <boxGeometry args={[0.003, panelH - 0.03, 0.001]} />
            <meshBasicMaterial color={isOffline ? '#1f2937' : '#1e3a5f'} transparent opacity={0.55} />
          </mesh>
        )}

        {/* ── 3 silver busbars (vertical collector ribbons) ── */}
        {[-panelW * 0.3, 0, panelW * 0.3].map((x, i) => (
          <mesh key={`bus${i}`} position={[x, 0, panelD / 2 + 0.009]}>
            <boxGeometry args={[0.008, panelH - 0.04, 0.001]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
          </mesh>
        ))}

        {/* ── Rear crossmember rails (2 horizontal steel sections) ── */}
        {[panelH * 0.3, -panelH * 0.3].map((y, i) => (
          <mesh key={`rail${i}`} position={[0, y, -panelD / 2 - 0.012]} castShadow>
            <boxGeometry args={[panelW + 0.12, 0.038, 0.038]} />
            <meshStandardMaterial color="#374151" metalness={0.88} roughness={0.25} />
          </mesh>
        ))}

        {/* ── Extruded aluminum mounting rail (full-width, centre) ── */}
        <mesh position={[0, 0, -panelD / 2 - 0.05]} castShadow>
          <boxGeometry args={[panelW + 0.12, 0.055, 0.055]} />
          <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.22} />
        </mesh>

        {/* ── Mounting bracket clips (4 per panel) ── */}
        {[[-panelW * 0.4, panelH * 0.3], [panelW * 0.4, panelH * 0.3], [-panelW * 0.4, -panelH * 0.3], [panelW * 0.4, -panelH * 0.3]].map(([bx, by], i) => (
          <mesh key={`bracket${i}`} position={[bx, by, -panelD / 2 - 0.025]} castShadow>
            <boxGeometry args={[0.045, 0.065, 0.04]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* ── Support legs (2 per panel, rear angled) ── */}
        {[-panelW * 0.38, panelW * 0.38].map((x, i) => (
          <mesh key={`leg${i}`} position={[x, -panelH * 0.22, -0.38]} rotation={[-tiltRad * 0.6, 0, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.028, 0.72, 10]} />
            <meshStandardMaterial color="#1e293b" metalness={0.82} roughness={0.28} />
          </mesh>
        ))}

        {/* ── Conduit junction box (rear, bottom centre) ── */}
        <mesh position={[0, -panelH * 0.3, -panelD / 2 - 0.06]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.06]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.4} />
        </mesh>

      </group>

      {/* Inspector HUD */}
      {isSelected && (
        <PanelInspectorHtml
          panel={panelData}
          onClose={() => onSelectPanel(null)}
          totalArrayKW={totalArrayKW}
          onSetFault={onSetFault}
        />
      )}
    </group>
  );
}
