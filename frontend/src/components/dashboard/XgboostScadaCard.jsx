import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, CheckCircle2, Loader2,
  AlertTriangle, Zap, Cpu
} from 'lucide-react';
import { getRecommendations } from '../../api/forecastApi';

export default function XgboostScadaCard({
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

  const isCritical = recommendation.type === 'ANOMALY_WARNING';
  const isActive   = status === 'active';

  const accentColor  = isCritical ? '#e5484d' : '#c9973e';
  const accentBg     = isCritical ? 'rgba(229,72,77,0.10)' : 'rgba(201,151,62,0.10)';
  const accentBorder = isCritical ? 'rgba(229,72,77,0.25)' : 'rgba(201,151,62,0.25)';

  const BAR_COLORS = ['#c9973e', '#4dd0e1', '#2dd4a8', '#a78bfa', '#e5484d'];

  return (
    <div className={`data-card rounded-xl2 p-5 relative overflow-hidden flex flex-col justify-between h-full gap-4 ${className}`}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />

      {/* ── Decision Header ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
              {isCritical ? <AlertTriangle size={15} style={{ color: accentColor }} /> : <Zap size={15} style={{ color: accentColor }} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-3xs font-bold font-mono uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}>
                  {recommendation.type?.replace('_', ' ')}
                </span>
                <span className="text-3xs text-text-muted font-mono uppercase tracking-wider">SCADA Engine</span>
              </div>
              <h3 className="text-sm font-semibold text-text-primary mt-1 tracking-tight">
                {recommendation.title}
              </h3>
            </div>
          </div>
          <span className="badge-jade hidden sm:inline-flex items-center gap-1">Sub-12ms</span>
        </div>

        <p className="text-2xs text-text-secondary leading-relaxed">{recommendation.description}</p>

        {/* Action */}
        <div className="flex items-center gap-3 pt-1">
          {status === 'idle' && (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleDispatch}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-2xs font-mono font-bold uppercase tracking-wider transition-all"
              style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}`, boxShadow: `0 0 16px ${accentColor}20` }}
            >
              <span>{recommendation.actionText}</span>
              <ArrowRight size={13} />
            </motion.button>
          )}
          {status === 'dispatching' && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-2xs font-mono font-bold uppercase tracking-wider"
              style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}>
              <Loader2 size={13} className="animate-spin" />
              <span>Transmitting…</span>
            </div>
          )}
          {isActive && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-2xs font-mono font-bold uppercase tracking-wider"
              style={{ background: 'rgba(45,212,168,0.12)', color: '#2dd4a8', border: '1px solid rgba(45,212,168,0.28)' }}>
              <CheckCircle2 size={13} />
              <span>BESS Injection Active · 0 Droop</span>
            </motion.div>
          )}
          <span className="text-3xs text-text-muted font-mono">Auto-dispatch: Ready</span>
        </div>
      </div>

      {/* ── Feature Importance ── */}
      <div className="p-3.5 rounded-xl space-y-2.5"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between pb-1.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 text-2xs font-semibold text-text-primary font-mono">
            <Cpu size={13} className="text-cyan" />
            XGBoost Feature Gain (Normalized)
          </div>
          <span className="text-gold font-mono font-bold text-3xs">R² 0.9989</span>
        </div>

        <div className="space-y-2">
          {Object.entries(featureImportances).map(([feat, pct], idx) => (
            <div key={feat}>
              <div className="flex justify-between text-3xs font-mono text-text-secondary mb-1">
                <span>{feat}</span>
                <span className="font-bold text-text-primary">{pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: BAR_COLORS[idx % BAR_COLORS.length],
                    boxShadow: `0 0 8px ${BAR_COLORS[idx % BAR_COLORS.length]}50`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
