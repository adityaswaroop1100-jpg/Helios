import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, CloudRain, Sun, Info, Activity } from 'lucide-react';

export default function AnomalyPanel({ currentHourData }) {
  const [showInfo, setShowInfo] = useState(false);
  const isAnomaly = currentHourData.isAnomaly;

  return (
    <div className="data-card rounded-2xl p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Activity size={15} style={{ color: isAnomaly ? '#f59e0b' : '#10b981' }} />
          <span className="font-semibold text-sm text-slate-200">Anomaly Monitor</span>
          <div className="relative">
            <button onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)}
              className="text-slate-600 hover:text-slate-400 transition-colors p-0.5">
              <Info size={12} />
            </button>
            {showInfo && (
              <div className="absolute left-0 top-6 z-40 w-60 p-3 text-xs leading-relaxed rounded-xl shadow-2xl glass-panel text-slate-400"
                style={{ border: '1px solid rgba(56,189,248,0.12)' }}>
                <b className="text-slate-200">Real-Time Engine</b>
                <p className="mt-1">Monitors irradiance against clear-sky baseline and detects string imbalances.</p>
              </div>
            )}
          </div>
        </div>
        <span className="text-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5"
          style={isAnomaly
            ? { background: 'rgba(245,158,11,0.10)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.22)' }
            : { background: 'rgba(16,185,129,0.10)', color: '#10b981', border: '1px solid rgba(16,185,129,0.22)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: isAnomaly ? '#f59e0b' : '#10b981' }} />
          {isAnomaly ? 'Alert' : 'Nominal'}
        </span>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        {[
          { label: 'Active Hour', value: currentHourData.timeLabel, icon: <Sun size={13} className="text-amber-400" /> },
          { label: 'Cloud Cover', value: `${currentHourData.cloudCover}%`, icon: <CloudRain size={13} className="text-sky-400" /> },
          { label: 'Irradiance', value: `${currentHourData.irradiance} W/m²`, icon: <Sun size={13} className="text-amber-400" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex items-center justify-between py-2 px-3 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">{icon}<span>{label}</span></div>
            <span className="font-display font-bold text-sm text-slate-200">{value}</span>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="mt-3 p-3 rounded-lg text-xs leading-relaxed"
        style={isAnomaly
          ? { background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', color: '#fde68a' }
          : { background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', color: '#a7f3d0' }}>
        {isAnomaly
          ? `⚠ ${currentHourData.anomalyDescription}`
          : '✓ Telemetry within P10–P90 clear-sky baseline.'}
      </div>
    </div>
  );
}
