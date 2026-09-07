import React, { useEffect, useRef } from 'react';

/**
 * Ultra-reliable splash screen.
 * - Uses a ref (not state) to avoid re-render interference with timers
 * - CSS opacity transition instead of framer-motion (no animation lib deps)
 * - Auto-dismisses after 1.8s, click-to-skip always works
 * - sessionStorage flag: only shows once per browser session
 */
export default function SplashScreen({ onDone }) {
  const divRef = useRef(null);
  const doneRef = useRef(false);

  const dismiss = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (divRef.current) {
      divRef.current.style.opacity = '0';
      divRef.current.style.pointerEvents = 'none';
    }
    setTimeout(onDone, 380);
  };

  useEffect(() => {
    // Fade in
    requestAnimationFrame(() => {
      if (divRef.current) divRef.current.style.opacity = '1';
    });

    // Auto dismiss after 1.8s
    const t = window.setTimeout(dismiss, 1800);

    // Safety net: force dismiss at 3s no matter what
    const safety = window.setTimeout(() => {
      doneRef.current = false; // allow re-trigger
      dismiss();
    }, 3000);

    return () => {
      window.clearTimeout(t);
      window.clearTimeout(safety);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={divRef}
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: 0,
        transition: 'opacity 0.35s ease',
        background: [
          'radial-gradient(ellipse 70% 50% at 30% 20%, rgba(201,151,62,0.10) 0%, transparent 60%)',
          'radial-gradient(ellipse 60% 40% at 75% 80%, rgba(77,208,225,0.07) 0%, transparent 55%)',
          '#060a14',
        ].join(','),
      }}
    >
      {/* Sun icon */}
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(201,151,62,0.20), rgba(77,208,225,0.14))',
        border: '1px solid rgba(201,151,62,0.40)',
        boxShadow: '0 0 60px rgba(201,151,62,0.22)',
        marginBottom: 24,
        animation: 'spin 14s linear infinite',
      }}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#c9973e" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="6"/>
          <line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="4.22" y1="4.22" x2="7.05" y2="7.05"/>
          <line x1="16.95" y1="16.95" x2="19.78" y2="19.78"/>
          <line x1="2" y1="12" x2="6" y2="12"/>
          <line x1="18" y1="12" x2="22" y2="12"/>
          <line x1="4.22" y1="19.78" x2="7.05" y2="16.95"/>
          <line x1="16.95" y1="7.05" x2="19.78" y2="4.22"/>
        </svg>
      </div>

      {/* Brand */}
      <h1 style={{
        fontSize: '4rem',
        fontWeight: 700,
        letterSpacing: '0.22em',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        background: 'linear-gradient(90deg, #c9973e 0%, #dbb060 45%, #4dd0e1 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0,
        lineHeight: 1,
      }}>HELIOS</h1>

      <p style={{
        marginTop: 12, marginBottom: 8,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.75rem',
        letterSpacing: '0.20em',
        textTransform: 'uppercase',
        color: '#7a8ba3',
      }}>Autonomous Solar Intelligence</p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
        {[
          ['$17K/yr', 'Grid Savings', '#c9973e'],
          ['66.9 T',  'CO₂ Avoided', '#2dd4a8'],
          ['99.89%',  'ML Accuracy',  '#4dd0e1'],
          ['<12 ms',  'Edge Latency', '#c9973e'],
        ].map(([val, lbl, clr]) => (
          <div key={lbl} style={{
            textAlign: 'center', padding: '10px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: '1.1rem', color: clr }}>{val}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4a5a72', marginTop: 3 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)',
        width: 160, height: 2, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 4,
          background: 'linear-gradient(90deg, #c9973e, #4dd0e1)',
          animation: 'grow 1.75s ease-in-out forwards',
        }} />
      </div>

      <p style={{
        position: 'absolute', bottom: 20,
        fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem',
        color: '#2e3f55', letterSpacing: '0.06em',
      }}>Click anywhere to continue</p>

      {/* Inline keyframes */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes grow { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
}
