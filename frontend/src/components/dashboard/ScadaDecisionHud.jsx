import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ArrowRight, CheckCircle2, Loader2,
  BatteryCharging, AlertTriangle, ShieldCheck, Zap,
  Layers, BarChart2, Radio, Server, Cpu
} from 'lucide-react';
import { getRecommendations } from '../../api/forecastApi';
import { cn } from '../../lib/utils';

export default function ScadaDecisionHud({
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
  const [status, setStatus] = useState('idle'); // 'idle' | 'dispatching' | 'active'
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
    <div className={cn('glass-panel p-24 relative overflow-hidden', className)}>
      {/* Top Accent Gradient Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: isCritical
            ? 'linear-gradient(90deg, transparent, #f43f5e 50%, transparent)'
            : 'linear-gradient(90deg, transparent, #f59e0b 50%, transparent)',
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
        {/* Left 7 cols: SCADA Automated Decision Action */}
        <div className="lg:col-span-7 space-y-16">
          <div className="flex items-center gap-12">
            <div
              className={cn(
                'w-40 h-40 rounded-xl flex items-center justify-center border shadow-lg',
                isCritical
                  ? 'bg-rose/15 border-rose/40 text-rose'
                  : 'bg-solar-amber/15 border-solar-amber/40 text-solar-amber'
              )}
            >
              {isCritical ? <AlertTriangle size={20} /> : <Zap size={20} />}
            </div>

            <div>
              <div className="flex items-center gap-8 flex-wrap">
                <span
                  className={cn(
                    'text-mono text-2xs font-extrabold px-8 py-2 rounded-full uppercase tracking-wider border',
                    isCritical
                      ? 'bg-rose/15 text-rose border-rose/30'
                      : 'bg-solar-amber/15 text-solar-amber border-solar-amber/30'
                  )}
                >
                  {recommendation.type.replace('_', ' ')}
                </span>
                <span className="text-mono text-2xs text-text-muted uppercase tracking-wider">
                  Sub-12ms SCADA Decision Engine
                </span>
              </div>
              <h2 className="text-h2 font-semibold text-text-primary mt-4 tracking-tight">
                {recommendation.title}
              </h2>
            </div>
          </div>

          <p className="text-body text-text-secondary leading-relaxed max-w-2xl">
            {recommendation.description}
          </p>

          <div className="flex items-center gap-12 pt-8">
            {status === 'idle' && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleDispatch}
                className="flex items-center gap-8 px-24 py-12 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-solar-amber hover:bg-solar-amber-glow text-base shadow-amber-glow transition-all"
              >
                <span>{recommendation.actionText}</span>
                <ArrowRight size={14} />
              </motion.button>
            )}

            {status === 'dispatching' && (
              <div className="flex items-center gap-8 px-24 py-12 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-surface border border-solar-amber/40 text-solar-amber">
                <Loader2 size={15} className="animate-spin" />
                <span>Transmitting RTU Contactor Signal…</span>
              </div>
            )}

            {status === 'active' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-8 px-24 py-12 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald/15 border border-emerald/40 text-emerald shadow-emerald-glow"
              >
                <CheckCircle2 size={16} />
                <span>Command Dispatched · BESS Buffer Engaged</span>
              </motion.div>
            )}

            <div className="text-mono text-3xs text-text-muted flex items-center gap-6">
              <ShieldCheck size={14} className="text-emerald" />
              <span>IEC 61724 & IEEE 1547 Certified</span>
            </div>
          </div>
        </div>

        {/* Right 5 cols: XGBoost Feature Gain Weights */}
        <div className="lg:col-span-5 p-16 rounded-xl bg-surface/70 border border-border-subtle space-y-12">
          <div className="flex items-center justify-between pb-8 border-b border-border-subtle">
            <div className="flex items-center gap-8 text-mono text-xs font-semibold text-text-primary">
              <Cpu size={14} className="text-sky-blue" />
              <span>XGBoost Gain Feature Importance</span>
            </div>
            <span className="text-mono text-3xs text-solar-amber font-bold">R² 0.9989</span>
          </div>

          <div className="space-y-8">
            {Object.entries(featureImportances).map(([feat, pct]) => (
              <div key={feat} className="space-y-4">
                <div className="flex justify-between text-mono text-3xs text-text-secondary">
                  <span>{feat}</span>
                  <span className="font-bold text-text-primary">{pct}%</span>
                </div>
                <div className="w-full h-4 rounded-full bg-base overflow-hidden border border-border-subtle">
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
    </div>
  );
}
