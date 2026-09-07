import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Zap } from 'lucide-react';

const STATS = [
  { value: '$17K', label: 'Annual Savings' },
  { value: '66.9T', label: 'CO₂ Avoided' },
  { value: '99.89%', label: 'ML Accuracy' },
  { value: '<12ms', label: 'Edge Response' },
];

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('logo'); // logo → stats → out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('stats'), 1100);
    const t2 = setTimeout(() => setPhase('out'), 2400);
    const t3 = setTimeout(() => onDone(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase !== 'out' && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse at 40% 30%, rgba(201,151,62,0.10) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(77,208,225,0.07) 0%, transparent 55%), #060a14',
          }}
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-0 right-0 h-px"
                style={{ top: `${(i + 1) * 12.5}%`, background: 'rgba(255,255,255,0.025)' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.06, duration: 0.8, ease: 'easeOut' }}
              />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-0 bottom-0 w-px"
                style={{ left: `${(i + 1) * 16.66}%`, background: 'rgba(255,255,255,0.025)' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.06, duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </div>

          {/* Logo cluster */}
          <motion.div
            className="flex flex-col items-center text-center relative z-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Icon */}
            <div className="relative mb-6">
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,151,62,0.22), rgba(77,208,225,0.16))',
                  border: '1px solid rgba(201,151,62,0.45)',
                  boxShadow: '0 0 60px rgba(201,151,62,0.25), 0 0 120px rgba(201,151,62,0.10)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              >
                <Sun size={36} style={{ color: '#c9973e' }} />
              </motion.div>
              {/* Orbit ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ border: '1px solid rgba(77,208,225,0.25)' }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Brand name */}
            <motion.h1
              className="text-7xl font-bold tracking-[0.25em] mb-2"
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                background: 'linear-gradient(90deg, #c9973e 0%, #dbb060 40%, #4dd0e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              HELIOS
            </motion.h1>

            <motion.p
              className="text-text-secondary font-mono text-sm tracking-[0.20em] uppercase mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Autonomous Solar Intelligence
            </motion.p>

            <motion.div
              className="flex items-center gap-2 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-mono font-bold"
                style={{ background: 'rgba(45,212,168,0.12)', color: '#2dd4a8', border: '1px solid rgba(45,212,168,0.30)' }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jade opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-jade" />
                </span>
                LIVE SCADA
              </span>
              <span className="text-text-muted font-mono text-2xs">·</span>
              <span className="text-text-muted font-mono text-2xs">48 kW · Chengalpattu, India</span>
            </motion.div>
          </motion.div>

          {/* Stats row */}
          <AnimatePresence>
            {phase === 'stats' && (
              <motion.div
                className="flex items-center gap-6 mt-12 relative z-10"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    className="text-center px-5 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                  >
                    <div className="font-mono font-bold text-xl" style={{ color: i === 0 ? '#c9973e' : i === 1 ? '#2dd4a8' : i === 2 ? '#4dd0e1' : '#c9973e' }}>
                      {s.value}
                    </div>
                    <div className="text-2xs text-text-muted font-mono mt-0.5 uppercase tracking-wider">{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading bar */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #c9973e, #4dd0e1)' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.4, ease: 'easeInOut' }}
            />
          </motion.div>

          <motion.p
            className="absolute bottom-6 text-text-muted font-mono text-3xs tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
          >
            ORION 1.0 · IEC 61724 Compliant · IEEE 1547
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
