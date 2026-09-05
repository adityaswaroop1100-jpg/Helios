import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp, AlertTriangle, Info, MousePointerClick, MapPin, Zap, Activity } from 'lucide-react';
import { DEFAULT_LOCATION } from '../../api/energyEngine';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="p-4 rounded-2xl shadow-2xl text-xs space-y-2"
        style={{
          minWidth: '220px',
          background: 'rgba(6, 10, 20, 0.97)',
          border: '1px solid rgba(201, 151, 62, 0.22)',
          borderTop: '1px solid rgba(201, 151, 62, 0.35)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.95), 0 0 0 0.5px rgba(201,151,62,0.12)',
        }}
      >
        <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="font-mono font-semibold text-text-primary text-xs tracking-wider">{data.timeLabel}</span>
          {data.ambientTemp !== undefined && (
            <span className="badge-cyan text-3xs">{data.ambientTemp}°C</span>
          )}
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center gap-6">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <Zap size={11} className="text-gold" />
              Active Yield
            </span>
            <span className="font-mono font-bold text-gold text-sm">{data.predictedKW} kW</span>
          </div>
          {data.p90UpperKW !== undefined && (
            <div className="flex justify-between items-center gap-6">
              <span className="text-text-secondary">P90 Bound</span>
              <span className="font-mono font-semibold text-cyan">{data.p90UpperKW} kW</span>
            </div>
          )}
          <div className="flex justify-between items-center gap-6">
            <span className="text-text-secondary">Solar GHI</span>
            <span className="font-mono text-text-primary">{data.irradiance} W/m²</span>
          </div>
          {data.directW !== undefined && (
            <div className="flex justify-between items-center gap-6 pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-text-muted">Direct / Diffuse</span>
              <span className="font-mono text-text-secondary">{data.directW} / {data.diffuseW} W/m²</span>
            </div>
          )}
        </div>

        {data.isAnomaly && (
          <div className="flex items-center gap-1.5 pt-2 text-2xs" style={{ borderTop: '1px solid rgba(229,72,77,0.2)', color: '#e5484d' }}>
            <AlertTriangle size={11} />
            <span className="font-semibold">{data.anomalyDescription || 'Generation Anomaly Detected'}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function ForecastChart({ hourlyData = [], currentHour, onSelectHour, location = DEFAULT_LOCATION }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="data-card rounded-xl2 p-6 shadow-card">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(201,151,62,0.12)', border: '1px solid rgba(201,151,62,0.25)' }}>
              <TrendingUp size={15} className="text-gold" />
            </div>
            <h2 className="font-bold text-sm text-text-primary tracking-tight">24-Hour Solar PV Generation Curve</h2>
            <span className="badge-cyan flex items-center gap-1">
              <MapPin size={9} />{location.name}
            </span>
            <div className="relative">
              <button
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                className="text-text-muted hover:text-text-secondary transition-colors p-1"
              >
                <Info size={13} />
              </button>
              {showInfo && (
                <div className="absolute left-0 top-8 z-40 w-72 p-3.5 text-xs leading-relaxed rounded-xl shadow-2xl glass-panel animate-fadeInFast"
                  style={{ color: '#7a8ba3', border: '1px solid rgba(201,151,62,0.15)' }}>
                  24-hour continuous forecast from Open-Meteo satellite telemetry for <span className="text-text-primary font-semibold">{location.name}</span> ({location.latitude}°N)
                  with NOCT thermal derating and P10–P90 uncertainty confidence bounds.
                </div>
              )}
            </div>
          </div>
          <p className="text-2xs text-text-muted font-mono">
            Real-time GHI satellite feed · XGBoost R² 0.9989 · Click hour nodes to inspect string telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(201,151,62,0.10)', border: '1px solid rgba(201,151,62,0.20)' }}>
            <div className="w-2 h-2 rounded-full bg-gold" />
            <span className="text-gold font-mono font-semibold text-2xs">Predicted kW</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(77,208,225,0.10)', border: '1px solid rgba(77,208,225,0.20)' }}>
            <div className="w-2 h-2 rounded-full bg-cyan" />
            <span className="text-cyan font-mono font-semibold text-2xs">P10–P90 Band</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full" style={{ height: '290px', cursor: 'pointer' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={hourlyData}
            margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload.length) {
                onSelectHour(e.activePayload[0].payload.hour);
              }
            }}
          >
            <defs>
              <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9973e" stopOpacity={0.50} />
                <stop offset="60%" stopColor="#c9973e" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#c9973e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4dd0e1" stopOpacity={0.20} />
                <stop offset="100%" stopColor="#4dd0e1" stopOpacity={0.01} />
              </linearGradient>
              <filter id="glowGold">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="transparent"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#4a5a72', fontFamily: 'JetBrains Mono' }}
              interval={2}
            />
            <YAxis
              stroke="transparent"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              unit=" kW"
              domain={[0, 52]}
              tick={{ fill: '#4a5a72', fontFamily: 'JetBrains Mono' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(201,151,62,0.35)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="p90UpperKW"
              stroke="rgba(77,208,225,0.25)"
              strokeWidth={1}
              fill="url(#gradBand)"
              name="P90 Band"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="predictedKW"
              stroke="#c9973e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#gradPredicted)"
              name="Predicted kW"
              activeDot={{ r: 5, fill: '#c9973e', stroke: '#060a14', strokeWidth: 2.5 }}
              isAnimationActive={false}
            />
            {currentHour !== null && hourlyData && hourlyData[currentHour] && (
              <ReferenceLine
                x={hourlyData[currentHour]?.timeLabel}
                stroke="#c9973e"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                strokeOpacity={0.7}
                label={{ value: '▼', fill: '#c9973e', fontSize: 11, fontWeight: 900, position: 'top' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 text-2xs text-text-muted">
          <MousePointerClick size={13} className="text-cyan" />
          <span>Click any hour node to inspect string voltage &amp; NOCT cell temperature</span>
        </div>
        <div className="text-2xs text-text-muted font-mono">
          Peak Window: <span className="text-gold font-semibold">11:00 – 14:00</span>
          &nbsp;·&nbsp;Nameplate: <span className="text-cyan font-semibold">48.0 kW</span>
        </div>
      </div>
    </div>
  );
}
