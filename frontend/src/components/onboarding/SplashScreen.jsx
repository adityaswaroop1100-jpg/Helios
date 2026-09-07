import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun } from 'lucide-react';

const STATS = [
  { value: '$17K/yr', label: 'Grid Savings', color: '#c9973e' },
  { value: '66.9 T',  label: 'CO₂ Avoided', color: '#2dd4a8' },
  { value: '99.89%',  label: 'ML Accuracy',  color: '#4dd0e1' },
  { value: '<12 ms',  label: 'Edge Response',color: '#c9973e' },
];

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);

  // Hard dismiss after 2.2 seconds — no dependencies on animation state
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      // Give exit animation 400ms then call onDone
      setTimeout(onDone, 420);
    }, 2200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  const dismiss = () => {
    setVisible(false);
    setTimeout(onDone, 420);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.4 } }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          onClick={dismiss}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer"
          style={{
            background: '#060a14',
            backgroundImage: [
              'radial-gradient(ellipse 70% 50% at 30% 20%, rgba(201,151,62,0.10) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 40% at 75% 80%, rgba(77,208,225,0.07) 0%, transparent 55%)',
            ].join(','),
          }}
        >
          {/* Logo */}
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
          >
            {/* Sun icon */}
            <div className="relative mb-6">
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,151,62,0.20), rgba(77,208,225,0.14))',
                  border: '1px solid rgba(201,151,62,0.40)',
                  boxShadow: '0 0 60px rgba(201,151,62,0.22), 0 0 120px rgba(201,151,62,0.08)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              >
                <Sun size={38} style={{ color: '#c9973e' }} />
              </motion.div>
            </div>

            {/* Brand */}
            <h1
              className="text-6xl font-bold mb-2"
              style={{
                letterSpacing: '0.22em',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                background: 'linear-gradient(90deg, #c9973e 0%, #dbb060 45%, #4dd0e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              HELIOS
            </h1>

            <p className="text-sm font-mono tracking-[0.22em] uppercase mb-2"
              style={{ color: '#7a8ba3' }}>
              Autonomous Solar Intelligence
            </p>

            {/* Live badge */}
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold"
                style={{ background: 'rgba(45,212,168,0.12)', color: '#2dd4a8', border: '1px solid rgba(45,212,168,0.28)' }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: '#2dd4a8' }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ background: '#2dd4a8' }} />
                </span>
                LIVE SCADA
              </span>
              <span className="text-xs font-mono" style={{ color: '#4a5a72' }}>· 48 kW · Chengalpattu, India</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex items-center gap-4 mt-10"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.55, duration: 0.45 } }}
          >
            {STATS.map((s) => (
              <div key={s.label}
                className="text-center px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="font-mono font-bold text-lg" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs font-mono mt-0.5 uppercase tracking-wider" style={{ color: '#4a5a72' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #c9973e, #4dd0e1)' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%', transition: { duration: 2.1, ease: 'easeInOut' } }}
            />
          </motion.div>

          <p className="absolute bottom-5 font-mono text-xs" style={{ color: '#2e3f55' }}>
            Click anywhere to continue · ORION 1.0
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
