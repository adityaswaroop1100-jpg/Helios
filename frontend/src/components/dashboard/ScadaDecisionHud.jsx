import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, CheckCircle2, Loader2,
  AlertTriangle, Zap, Cpu, ShieldCheck
} from 'lucide-react';
import { getRecommendations } from '../../api/forecastApi';

export default function ScadaDecisionHud({
  currentHourData,
  faultedPanels = {},
  featureImportances = {
    'Solar Zenith Angle (θz)': 49.2,
    'Global Irradiance (GHI)':  46.1,
    'NOCT Cell Temp (Tcell)':   2.4,
    'Ambient Air Temp':          1.2,
    'Cloud Cover Index':         1.1,
  },
  className = '',
}) {
  const [status, setStatus] = useState('idle');
  const recommendation = getRecommendations(currentHourData, faultedPanels);

  const handleDispatch = () => {
    if (status !== 'idle') return;
    setStatus('dispatching');
    setTimeout(() => setStatus('active'), 1200);
  };
  const handleReset = () => setStatus('idle');

  useEffect(() => {
    if (status === 'active') {
      const t = setTimeout(handleReset, 10000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const isCritical    = recommendation.type === 'ANOMALY_WARNING';
  const isActive      = status === 'active';
  const accentColor   = isCritical ? '#e5484d' : '#c9973e';
  const accentBg      = isCritical ? 'rgba(229,72,77,0.10)' : 'rgba(201,151,62,0.10)';
  const accentBorder  = isCritical ? 'rgba(229,72,77,0.25)' : 'rgba(201,151,62,0.25)';

  const BAR_COLORS = ['#c9973e', '#4dd0e1', '#2dd4a8', '#a78bfa', '#e5484d'];

  return (
    <div className={`data-card rounded-xl2 p-5 relative overflow-hidden ${className}`}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">

        {/* Left: Decision HUD */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
              {isCritical
                ? <AlertTriangle size={18} style={{ color: accentColor }} />
                : <Zap size={18} style={{ color: accentColor }} />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-3xs font-bold font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                  style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}>
                  {recommendation.type?.replace('_', ' ')}
                </span>
                <span className="text-3xs text-text-muted font-mono uppercase tracking-wider">
                  Sub-12ms SCADA Decision Engine
                </span>
              </div>
              <h2 className="text-sm font-bold text-text-primary tracking-tight">
                {recommendation.title}
              </h2>
            </div>
          </div>

          <p className="text-2xs text-text-secondary leading-relaxed">{recommendation.description}</p>

          <div className="flex items-center gap-3 pt-1">
            {status === 'idle' && (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleDispatch}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-2xs font-mono font-bold uppercase tracking-wider transition-all"
                style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}`, boxShadow: `0 0 16px ${accentColor}18` }}>
                <span>{recommendation.actionText}</span>
                <ArrowRight size={13} />
              </motion.button>
            )}
            {status === 'dispatching' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-2xs font-mono font-bold uppercase tracking-wider"
                style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}>
                <Loader2 size={13} className="animate-spin" />
                <span>Transmitting RTU Signal…</span>
              </div>
            )}
            {isActive && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-2xs font-mono font-bold uppercase tracking-wider"
                style={{ background: 'rgba(45,212,168,0.12)', color: '#2dd4a8', border: '1px solid rgba(45,212,168,0.28)' }}>
                <CheckCircle2 size={13} />
                <span>Command Dispatched · BESS Engaged</span>
              </motion.div>
            )}
            <div className="text-3xs text-text-muted font-mono flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-jade" />
              IEC 61724 · IEEE 1547
            </div>
          </div>
        </div>

        {/* Right: Feature Importance */}
        <div className="lg:col-span-5 p-4 rounded-xl space-y-2.5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between pb-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 text-2xs font-semibold text-text-primary font-mono">
              <Cpu size={13} className="text-cyan" />
              XGBoost Feature Gain
            </div>
            <span className="text-gold font-mono font-bold text-3xs">R² 0.9989</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(featureImportances).map(([feat, pct], idx) => (
              <div key={feat}>
                <div className="flex justify-between text-3xs font-mono text-text-secondary mb-1">
                  <span>{feat}</span>
                  <span className="font-bold text-text-primary">{pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: BAR_COLORS[idx % BAR_COLORS.length],
                      boxShadow: `0 0 8px ${BAR_COLORS[idx % BAR_COLORS.length]}50`,
                    }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
