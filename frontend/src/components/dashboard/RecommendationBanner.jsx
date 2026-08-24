import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Loader2, BatteryCharging, X, Zap, AlertTriangle, Moon, Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { getRecommendations } from '../../api/forecastApi';

const TYPE_CONFIG = {
  RAMP_PHASE: {
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.12)',
    border: 'rgba(56,189,248,0.3)',
    icon: Activity,
    dot: '#38bdf8',
    pill: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
  PEAK_GENERATION: {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
    icon: Zap,
    dot: '#f59e0b',
    pill: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  ANOMALY_WARNING: {
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.12)',
    border: 'rgba(244,63,94,0.35)',
    icon: AlertTriangle,
    dot: '#f43f5e',
    pill: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  NIGHT_MODE: {
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.12)',
    border: 'rgba(129,140,248,0.3)',
    icon: Moon,
    dot: '#818cf8',
    pill: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  },
};

function useActionDispatch() {
  const [status, setStatus] = useState('idle');
  const dispatch = (label) => {
    if (status !== 'idle') return;
    setStatus('dispatching');
    setTimeout(() => setStatus('active'), 1200);
  };
  const reset = () => setStatus('idle');
  useEffect(() => {
    if (status === 'active') {
      const t = setTimeout(reset, 10000);
      return () => clearTimeout(t);
    }
  }, [status]);
  return { status, dispatch, reset };
}

export default function RecommendationBanner({ currentHourData, faultedPanels = {} }) {
  const recommendation = getRecommendations(currentHourData, faultedPanels);
  const { status, dispatch, reset } = useActionDispatch();
  const cfg = TYPE_CONFIG[recommendation.type] || TYPE_CONFIG.RAMP_PHASE;
  const TypeIcon = cfg.icon;
  const isActive = status === 'active';

  return (
    <div
      className="data-card rounded-2xl overflow-hidden transition-all shadow-xl"
      style={{ border: `1px solid ${isActive ? 'rgba(16,185,129,0.4)' : cfg.border}` }}
    >
      {/* Top Accent Neon Line */}
      <div
        className="h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent 5%, ${isActive ? '#10b981' : cfg.color} 50%, transparent 95%)` }}
      />

      {/* Main HUD Content Row */}
      <div className="flex items-center gap-4 px-6 py-4 flex-wrap">
        {/* Glowing Icon Shield */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{
            background: isActive ? 'rgba(16,185,129,0.15)' : cfg.bg,
            border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : cfg.border}`,
          }}
        >
          <TypeIcon size={21} style={{ color: isActive ? '#10b981' : cfg.color }} />
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
            <span
              className={`text-3xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border font-display ${cfg.pill}`}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.dot }} />
              {recommendation.type.replace('_', ' ')}
            </span>
            <span className="text-3xs text-slate-500 font-semibold tracking-wider uppercase font-display">
              SCADA Decision Engine · Automated Dispatch
            </span>
          </div>

          <div className="font-bold text-base text-white tracking-tight">{recommendation.title}</div>
          <div className="text-xs text-slate-400 line-clamp-1 max-w-3xl mt-0.5">{recommendation.description}</div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {status === 'idle' && (
            <button
              onClick={() => dispatch(recommendation.actionText)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md"
              style={{
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
                boxShadow: `0 0 16px ${cfg.color}25`,
              }}
            >
              <span>{recommendation.actionText}</span>
              <ArrowRight size={14} />
            </button>
          )}

          {status === 'dispatching' && (
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              <Loader2 size={14} className="animate-spin" />
              <span>Transmitting Command…</span>
            </div>
          )}

          {status === 'active' && (
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-glow-emerald"
            >
              <CheckCircle2 size={14} />
              <span>Dispatched to Inverter</span>
              <X size={12} className="text-slate-400 ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* BESS Active Telemetry Strip */}
      {status === 'active' && (
        <div
          className="px-6 pb-4 pt-3 flex flex-wrap items-center gap-3 border-t border-emerald-500/20 bg-emerald-500/[0.04] animate-fadeInFast"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 font-display">
            <BatteryCharging size={16} />
            <span>BESS Dynamic Dispatch Active</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="text-xs text-slate-300">
            50 kWh Storage buffer engaged · Diverting surplus generation to avoid grid peak curtailment penalty.
          </div>
        </div>
      )}
    </div>
  );
}
