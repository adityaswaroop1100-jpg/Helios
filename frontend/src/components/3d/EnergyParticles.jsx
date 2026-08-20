import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function EnergyParticles({ currentKW }) {
  const pulse1Ref = useRef();
  const pulse2Ref = useRef();

  // Speed of energy pulse along physical conduit
  const activeSpeed = currentKW > 0 ? 0.8 + (currentKW / 48.0) * 1.5 : 0;

  useFrame((_, delta) => {
    if (currentKW > 0) {
      if (pulse1Ref.current) {
        pulse1Ref.current.position.x += delta * activeSpeed * 2.5;
        if (pulse1Ref.current.position.x > 7.0) pulse1Ref.current.position.x = 0;
      }
      if (pulse2Ref.current) {
        pulse2Ref.current.position.x += delta * activeSpeed * 2.5;
        if (pulse2Ref.current.position.x > 7.0) pulse2Ref.current.position.x = 0;
      }
    }
  });

  return (
    <group position={[0, 0.08, 0]}>
      {/* 1. Ground Electrical Conduit Cable (Black Industrial Conduit) */}
      <mesh position={[3.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 7.0, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* 2. Moving Pulse Indicators along Conduit */}
      {currentKW > 0 && (
        <>
          <mesh ref={pulse1Ref} position={[0.5, 0, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={1.2}
            />
          </mesh>

          <mesh ref={pulse2Ref} position={[4.0, 0, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={1.2}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
