import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, CloudRain, Sun, Info, Activity, ShieldCheck, Zap } from 'lucide-react';

export default function AnomalyPanel({ currentHourData }) {
  const [showInfo, setShowInfo] = useState(false);
  const isAnomaly = currentHourData.isAnomaly;

  const severityConfig = isAnomaly
    ? { color: '#e5484d', bg: 'rgba(229,72,77,0.08)', border: 'rgba(229,72,77,0.20)', label: 'ALERT', Icon: AlertOctagon }
    : { color: '#2dd4a8', bg: 'rgba(45,212,168,0.08)', border: 'rgba(45,212,168,0.20)', label: 'NOMINAL', Icon: ShieldCheck };

  const metrics = [
    {
      label: 'Active Hour',
      value: currentHourData.timeLabel || '--:--',
      icon: <Zap size={12} className="text-gold" />,
      valueColor: 'text-text-primary',
    },
    {
      label: 'Cloud Cover',
      value: `${currentHourData.cloudCover ?? 0}%`,
      icon: <CloudRain size={12} className="text-cyan" />,
      valueColor: currentHourData.cloudCover > 60 ? 'text-crimson' : 'text-text-primary',
    },
    {
      label: 'GHI Irradiance',
      value: `${currentHourData.irradiance ?? 0} W/m²`,
      icon: <Sun size={12} className="text-gold" />,
      valueColor: 'text-text-primary',
    },
  ];

  return (
    <div className="data-card rounded-xl2 p-5 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: isAnomaly ? 'rgba(229,72,77,0.12)' : 'rgba(45,212,168,0.12)', border: `1px solid ${severityConfig.border}` }}>
            <Activity size={15} style={{ color: severityConfig.color }} />
          </div>
          <div>
            <span className="font-bold text-sm text-text-primary">Anomaly Monitor</span>
            <p className="text-2xs text-text-muted font-mono mt-0.5">Real-Time Engine Telemetry</p>
          </div>
          <div className="relative">
            <button
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              className="text-text-muted hover:text-text-secondary transition-colors p-1"
            >
              <Info size={12} />
            </button>
            {showInfo && (
              <div className="absolute left-0 top-8 z-40 w-60 p-3.5 text-xs leading-relaxed rounded-xl shadow-2xl glass-panel animate-fadeInFast"
                style={{ color: '#7a8ba3', border: '1px solid rgba(77,208,225,0.15)' }}>
                <b className="text-text-primary">SCADA Real-Time Engine</b>
                <p className="mt-1">Continuously compares live irradiance against clear-sky baseline. Detects string imbalances, diode failures, and cloud transients within 12ms.</p>
              </div>
            )}
          </div>
        </div>

        <span
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-mono font-bold uppercase tracking-widest"
          style={{ background: severityConfig.bg, color: severityConfig.color, border: `1px solid ${severityConfig.border}` }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: severityConfig.color, boxShadow: `0 0 6px ${severityConfig.color}` }} />
          {severityConfig.label}
        </span>
      </div>

      {/* Metrics */}
      <div className="space-y-2 mb-4">
        {metrics.map(({ label, value, icon, valueColor }) => (
          <div
            key={label}
            className="flex items-center justify-between py-2 px-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center gap-2 text-2xs text-text-muted font-mono">
              {icon}
              <span>{label}</span>
            </div>
            <span className={`font-mono font-bold text-sm ${valueColor}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Status Banner */}
      <div
        className="p-3.5 rounded-xl text-2xs leading-relaxed font-mono"
        style={{
          background: severityConfig.bg,
          border: `1px solid ${severityConfig.border}`,
          color: isAnomaly ? '#fca5a5' : '#86efac',
        }}
      >
        <div className="flex items-start gap-2">
          <severityConfig.Icon size={13} style={{ color: severityConfig.color, flexShrink: 0, marginTop: 1 }} />
          <span>
            {isAnomaly
              ? currentHourData.anomalyDescription || 'Irradiance deviation detected outside P10–P90 confidence bounds.'
              : 'All string telemetry within P10–P90 clear-sky baseline. MPPT operating at nominal conductance.'}
          </span>
        </div>
      </div>
    </div>
  );
}
