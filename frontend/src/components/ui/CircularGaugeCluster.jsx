import React from 'react';
import { Sun, Thermometer, BatteryCharging, Gauge } from 'lucide-react';
import { cn } from '../../lib/utils';

function ArcGauge({ value, max, label, unit, icon: Icon, color = '#f59e0b', sublabel }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * (circumference * 0.75);

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface/70 border border-border-subtle relative group transition-transform hover:scale-105 shadow-sm">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="7"
            strokeDasharray={circumference * 0.75}
            strokeLinecap="round"
          />
          {/* Glowing Arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: `drop-shadow(0 0 5px ${color}80)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Icon size={12} style={{ color }} className="mb-0.5 opacity-80" />
          <span className="font-display font-extrabold text-xs text-text-primary tabular-nums">
            {value}
          </span>
          <span className="text-mono text-3xs text-text-muted">{unit}</span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className="text-mono text-2xs font-semibold text-text-secondary">{label}</div>
        {sublabel && <div className="text-mono text-3xs text-text-muted">{sublabel}</div>}
      </div>
    </div>
  );
}

export default function CircularGaugeCluster({
  irradiance = 850,
  cellTemp = 42.5,
  bessSoc = 84,
  className,
}) {
  return (
    <div className={cn('glass-panel p-5 flex flex-col justify-between h-full shadow-lg', className)}>
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-surface border border-border-glow flex items-center justify-center text-solar-amber shadow-sm">
            <Gauge size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">Kinematic Gauge Cluster</h2>
            <p className="text-mono text-3xs text-text-muted mt-0.5">Real-Time Sensor Transducers</p>
          </div>
        </div>
        <span className="text-mono text-3xs font-bold px-2 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/30">
          RTU TELEMETRY
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 my-auto">
        <ArcGauge
          value={irradiance}
          max={1000}
          label="Solar GHI"
          unit="W/m²"
          icon={Sun}
          color="#f59e0b"
          sublabel="Satellite Feed"
        />
        <ArcGauge
          value={cellTemp}
          max={75}
          label="Cell Temp"
          unit="°C"
          icon={Thermometer}
          color="#38bdf8"
          sublabel="NOCT Derated"
        />
        <ArcGauge
          value={bessSoc}
          max={100}
          label="BESS SoC"
          unit="%"
          icon={BatteryCharging}
          color="#10b981"
          sublabel="Standing Buffer"
        />
      </div>

      <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-mono text-3xs text-text-muted">
        <span>Sampling: 1.0 Hz</span>
        <span className="text-emerald font-semibold">Zero Loss</span>
      </div>
    </div>
  );
}
