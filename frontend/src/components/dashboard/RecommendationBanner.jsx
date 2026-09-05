import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Loader2, BatteryCharging, X, Zap, AlertTriangle, Moon, Activity } from 'lucide-react';
import { getRecommendations } from '../../api/forecastApi';

const TYPE_CONFIG = {
  RAMP_PHASE: {
    color: '#4dd0e1',
    bg: 'rgba(77,208,225,0.10)',
    border: 'rgba(77,208,225,0.25)',
    icon: Activity,
    activeBg: 'rgba(45,212,168,0.12)',
    activeBorder: 'rgba(45,212,168,0.30)',
    activeColor: '#2dd4a8',
  },
  PEAK_GENERATION: {
    color: '#c9973e',
    bg: 'rgba(201,151,62,0.10)',
    border: 'rgba(201,151,62,0.25)',
    icon: Zap,
    activeBg: 'rgba(45,212,168,0.12)',
    activeBorder: 'rgba(45,212,168,0.30)',
    activeColor: '#2dd4a8',
  },
  ANOMALY_WARNING: {
    color: '#e5484d',
    bg: 'rgba(229,72,77,0.10)',
    border: 'rgba(229,72,77,0.28)',
    icon: AlertTriangle,
    activeBg: 'rgba(45,212,168,0.12)',
    activeBorder: 'rgba(45,212,168,0.30)',
    activeColor: '#2dd4a8',
  },
  NIGHT_MODE: {
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.10)',
    border: 'rgba(167,139,250,0.25)',
    icon: Moon,
    activeBg: 'rgba(45,212,168,0.12)',
    activeBorder: 'rgba(45,212,168,0.30)',
    activeColor: '#2dd4a8',
  },
};

function useActionDispatch() {
  const [status, setStatus] = useState('idle');
  const dispatch = () => {
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

  const activeCfg = isActive
    ? { color: cfg.activeColor, bg: cfg.activeBg, border: cfg.activeBorder }
    : cfg;

  return (
    <div
      className="data-card rounded-xl2 overflow-hidden transition-all"
      style={{ border: `1px solid ${activeCfg.border}` }}
    >
      {/* Top accent line */}
      <div className="h-px"
        style={{ background: `linear-gradient(90deg, transparent 5%, ${activeCfg.color} 50%, transparent 95%)` }} />

      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: activeCfg.bg, border: `1px solid ${activeCfg.border}` }}>
          <TypeIcon size={18} style={{ color: activeCfg.color }} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-3xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5"
              style={{ background: activeCfg.bg, color: activeCfg.color, border: `1px solid ${activeCfg.border}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: activeCfg.color }} />
              {recommendation.type?.replace('_', ' ') || 'SYSTEM'}
            </span>
            <span className="text-3xs text-text-muted font-mono uppercase tracking-wider">
              SCADA Decision Engine · Automated Dispatch
            </span>
          </div>
          <div className="font-bold text-sm text-text-primary tracking-tight">{recommendation.title}</div>
          <div className="text-2xs text-text-secondary line-clamp-1 mt-0.5 font-mono">{recommendation.description}</div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {status === 'idle' && (
            <button
              onClick={dispatch}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-2xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 font-mono"
              style={{ background: activeCfg.bg, color: activeCfg.color, border: `1px solid ${activeCfg.border}`, boxShadow: `0 0 16px ${activeCfg.color}20` }}
            >
              <span>{recommendation.actionText}</span>
              <ArrowRight size={13} />
            </button>
          )}

          {status === 'dispatching' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-2xs font-bold uppercase tracking-wider font-mono"
              style={{ background: activeCfg.bg, color: activeCfg.color, border: `1px solid ${activeCfg.border}` }}>
              <Loader2 size={13} className="animate-spin" />
              <span>Transmitting…</span>
            </div>
          )}

          {status === 'active' && (
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-2xs font-bold uppercase tracking-wider font-mono transition-all"
              style={{ background: 'rgba(45,212,168,0.12)', color: '#2dd4a8', border: '1px solid rgba(45,212,168,0.28)' }}
            >
              <CheckCircle2 size={13} />
              <span>Dispatched</span>
              <X size={11} className="text-text-muted ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* BESS strip */}
      {isActive && (
        <div className="px-5 pb-3 pt-2.5 flex flex-wrap items-center gap-3 animate-fadeIn"
          style={{ borderTop: '1px solid rgba(45,212,168,0.15)', background: 'rgba(45,212,168,0.04)' }}>
          <div className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-jade font-mono">
            <BatteryCharging size={14} />
            <span>BESS Dynamic Dispatch Active</span>
          </div>
          <span className="text-text-muted">·</span>
          <div className="text-2xs text-text-secondary font-mono">
            50 kWh buffer engaged · Surplus diverted to avoid grid curtailment penalty.
          </div>
        </div>
      )}
    </div>
  );
}
