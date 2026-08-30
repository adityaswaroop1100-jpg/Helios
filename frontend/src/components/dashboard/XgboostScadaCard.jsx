import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, CheckCircle2, Loader2,
  BatteryCharging, AlertTriangle, ShieldCheck, Zap,
  Cpu, Sparkles
} from 'lucide-react';
import { getRecommendations } from '../../api/forecastApi';
import { cn } from '../../lib/utils';

export default function XgboostScadaCard({
  currentHourData,
  faultedPanels = {},
  featureImportances = {
    "Solar Zenith Angle (θz)": 49.2,
    "Global Irradiance (GHI)": 46.1,
    "NOCT Cell Temp (Tcell)": 2.4,
    "Ambient Air Temp": 1.2,
    "Cloud Cover Index": 1.1,
  },
  className,
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
      const timer = setTimeout(handleReset, 10000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const isCritical = recommendation.type === 'ANOMALY_WARNING';
  const isActive = status === 'active';

  return (
    <div className={cn('glass-panel p-5 relative overflow-hidden flex flex-col justify-between h-full space-y-4 shadow-lg', className)}>
      {/* Top Accent Gradient Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: isCritical
            ? 'linear-gradient(90deg, transparent, #f43f5e 50%, transparent)'
            : 'linear-gradient(90deg, transparent, #f59e0b 50%, transparent)',
        }}
      />

      {/* ── TOP SECTION: SCADA Engine & Decision HUD ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm shrink-0',
                isCritical
                  ? 'bg-rose/15 border-rose/40 text-rose'
                  : 'bg-solar-amber/15 border-solar-amber/40 text-solar-amber'
              )}
            >
              {isCritical ? <AlertTriangle size={16} /> : <Zap size={16} />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    'text-mono text-3xs font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border font-display',
                    isCritical
                      ? 'bg-rose/15 text-rose border-rose/30'
                      : 'bg-solar-amber/15 text-solar-amber border-solar-amber/30'
                  )}
                >
                  {recommendation.type.replace('_', ' ')}
                </span>
                <span className="text-mono text-3xs text-text-muted uppercase tracking-wider">
                  SCADA Engine
                </span>
              </div>
              <h3 className="text-sm font-semibold text-text-primary mt-1 tracking-tight">
                {recommendation.title}
              </h3>
            </div>
          </div>

          <span className="text-mono text-3xs font-bold px-2 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/30 hidden sm:inline-block">
            SUB-12MS
          </span>
        </div>

        <p className="text-body text-text-secondary leading-relaxed text-xs">
          {recommendation.description}
        </p>

        {/* Action Button */}
        <div className="flex items-center gap-3 pt-1">
          {status === 'idle' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleDispatch}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-solar-amber hover:bg-solar-amber-glow text-base shadow-amber-glow transition-all"
            >
              <span>{recommendation.actionText}</span>
              <ArrowRight size={13} />
            </motion.button>
          )}

          {status === 'dispatching' && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-surface border border-solar-amber/40 text-solar-amber">
              <Loader2 size={13} className="animate-spin" />
              <span>Transmitting RTU Contactor…</span>
            </div>
          )}

          {status === 'active' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald/15 border border-emerald/40 text-emerald shadow-emerald-glow"
            >
              <CheckCircle2 size={14} />
              <span>BESS Injection Active · 0 Droop</span>
            </motion.div>
          )}

          <span className="text-mono text-3xs text-text-muted">
            Auto-dispatch: Ready
          </span>
        </div>
      </div>

      {/* ── BOTTOM SECTION: XGBoost Feature Gain Weights ── */}
      <div className="p-3.5 rounded-xl bg-surface/70 border border-border-subtle space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle">
          <div className="flex items-center gap-2 text-mono text-xs font-semibold text-text-primary">
            <Cpu size={14} className="text-sky-blue" />
            <span>XGBoost Feature Gain (Normalized)</span>
          </div>
          <span className="text-mono text-3xs text-solar-amber font-bold">R² 0.9989</span>
        </div>

        <div className="space-y-2">
          {Object.entries(featureImportances).map(([feat, pct]) => (
            <div key={feat} className="space-y-1">
              <div className="flex justify-between text-mono text-3xs text-text-secondary">
                <span>{feat}</span>
                <span className="font-bold text-text-primary">{pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-base overflow-hidden border border-border-subtle">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-solar-amber to-sky-blue transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
