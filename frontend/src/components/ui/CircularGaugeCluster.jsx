import React from 'react';
import { Sun, Thermometer, BatteryCharging, Gauge } from 'lucide-react';
import { cn } from '../../lib/utils';

function ArcGauge({ value, max, label, unit, icon: Icon, color = '#f59e0b', sublabel }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * (circumference * 0.75); // 270 degree arc

  return (
    <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-surface/70 border border-border-subtle relative group transition-transform hover:scale-105">
      <div className="relative w-24 h-24 flex items-center justify-center">
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
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Icon size={14} style={{ color }} className="mb-2 opacity-80" />
          <span className="font-display font-extrabold text-sm text-text-primary tabular-nums">
            {value}
          </span>
          <span className="text-mono text-3xs text-text-muted">{unit}</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-mono text-xs font-semibold text-text-secondary">{label}</div>
        {sublabel && <div className="text-mono text-3xs text-text-muted mt-1">{sublabel}</div>}
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
    <div className={cn('glass-panel p-24 flex flex-col justify-between', className)}>
      <div className="flex items-center justify-between pb-12 mb-16 border-b border-border-subtle">
        <div className="flex items-center gap-8">
          <div className="w-32 h-32 rounded-lg bg-surface border border-border-glow flex items-center justify-center text-solar-amber shadow-sm">
            <Gauge size={16} />
          </div>
          <div>
            <h2 className="text-h2 font-semibold text-text-primary tracking-tight">Kinematic Gauge Cluster</h2>
            <p className="text-mono text-xs text-text-muted mt-2">Real-Time Sensor Transducers</p>
          </div>
        </div>
        <span className="text-mono text-2xs font-bold px-8 py-4 rounded-full bg-emerald/10 text-emerald border border-emerald/30">
          RTU TELEMETRY
        </span>
      </div>

      <div className="grid grid-cols-3 gap-12 my-auto">
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

      <div className="mt-16 pt-12 border-t border-border-subtle flex items-center justify-between text-mono text-xs text-text-muted">
        <span>Sampling Frequency: 1.0 Hz</span>
        <span className="text-emerald font-semibold">Zero Transmission Loss</span>
      </div>
    </div>
  );
}
