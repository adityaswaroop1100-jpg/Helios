import React, { useState, useEffect } from 'react';
import { Sun, AlertTriangle, Monitor, RotateCcw } from 'lucide-react';

/**
 * Checks if browser supports WebGL
 */
export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

/**
 * High-Tech SCADA 3D Loading Screen
 */
export default function Scada3DLoader({ text = 'Initializing 3D Photovoltaic Digital Twin...' }) {
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    setWebGLSupported(isWebGLAvailable());
  }, []);

  if (!webGLSupported) {
    return (
      <div className="w-full h-[480px] rounded-2xl glass-premium border border-crimson/40 p-8 flex flex-col items-center justify-center text-center shadow-premium"
        style={{ background: 'rgba(10, 6, 12, 0.95)' }}>
        <div className="w-12 h-12 rounded-xl bg-crimson/15 border border-crimson/30 flex items-center justify-center text-crimson mb-4">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-base font-bold text-text-primary mb-2">Hardware Acceleration Required</h3>
        <p className="text-2xs font-mono text-text-secondary max-w-md mb-4 leading-relaxed">
          Your browser environment does not have WebGL enabled. Please ensure GPU hardware acceleration is turned on in browser settings (Chrome / Edge / Firefox).
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl font-mono text-xs font-bold text-gold border border-gold/30 bg-gold/10 hover:bg-gold/20 transition-all flex items-center gap-2"
        >
          <RotateCcw size={13} />
          <span>Retry 3D Context</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[480px] rounded-2xl glass-premium border border-white/[0.08] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-premium"
      style={{ background: 'rgba(6, 10, 20, 0.95)' }}>
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(201,151,62,0.12) 0%, transparent 65%)' }} />

      {/* Rotating Sun Core */}
      <div className="relative mb-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg animate-spin-slow"
          style={{
            background: 'linear-gradient(135deg, rgba(201,151,62,0.22), rgba(77,208,225,0.18))',
            borderColor: 'rgba(201,151,62,0.4)',
            boxShadow: '0 0 35px rgba(201,151,62,0.25)',
          }}
        >
          <Sun size={28} className="text-gold" />
        </div>
      </div>

      <h3 className="text-base font-bold text-text-primary tracking-tight mb-1">
        Rendering Solar SCADA Array
      </h3>
      <p className="text-2xs font-mono text-text-secondary max-w-sm mb-4">
        {text}
      </p>

      {/* High-tech progress indicator */}
      <div className="w-48 h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full animate-pulse"
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #c9973e, #4dd0e1)',
            boxShadow: '0 0 10px rgba(201,151,62,0.5)',
          }}
        />
      </div>

      <span className="text-3xs font-mono text-text-muted mt-3 uppercase tracking-widest">
        Three.js WebGL 2.0 · PBR Shaders Compiling
      </span>
    </div>
  );
}
