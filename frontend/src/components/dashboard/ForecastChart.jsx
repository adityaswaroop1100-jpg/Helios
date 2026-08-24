import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp, AlertTriangle, Info, MousePointerClick, MapPin, Zap } from 'lucide-react';
import { DEFAULT_LOCATION } from '../../api/energyEngine';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="p-4 rounded-xl shadow-2xl text-xs space-y-2.5 glass-panel border border-sky-500/30 backdrop-blur-2xl"
        style={{ minWidth: '220px' }}
      >
        <div className="font-bold pb-2 flex items-center justify-between text-white border-b border-white/[0.08]">
          <span className="font-display tracking-wide">{data.timeLabel}</span>
          {data.ambientTemp !== undefined && (
            <span className="text-2xs text-sky-400 font-display font-semibold bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
              {data.ambientTemp}°C
            </span>
          )}
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-slate-400 flex items-center gap-1.5"><Zap size={13} className="text-amber-400" /> Active PV Yield</span>
          <span className="font-display font-extrabold text-amber-400 text-sm">{data.predictedKW} kW</span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-slate-400">P90 Upper Bound</span>
          <span className="font-display text-sky-400 font-bold">{data.p90UpperKW} kW</span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-slate-400">Solar GHI</span>
          <span className="font-display text-slate-200 font-semibold">{data.irradiance} W/m²</span>
        </div>
        {data.directW !== undefined && (
          <div className="flex justify-between items-center gap-6 text-2xs text-slate-500 border-t border-white/[0.05] pt-1.5 font-display">
            <span>Direct / Diffuse</span>
            <span className="text-slate-300">{data.directW} / {data.diffuseW} W/m²</span>
          </div>
        )}
        {data.isAnomaly && (
          <div className="flex items-center gap-1.5 pt-2 font-semibold text-2xs text-rose-400 border-t border-rose-500/30">
            <AlertTriangle size={12} />
            <span>{data.anomalyDescription || 'Generation Anomaly'}</span>
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
    <div className="data-card rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <TrendingUp size={16} className="text-amber-400" />
            </div>
            <h2 className="font-bold text-base text-white tracking-tight">24-Hour Solar PV Generation Curve</h2>
            <span
              className="text-2xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1.5"
              style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.28)' }}
            >
              <MapPin size={10} />
              <span>{location.name}</span>
            </span>
            <div className="relative">
              <button
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                <Info size={14} />
              </button>
              {showInfo && (
                <div
                  className="absolute left-0 top-8 z-40 w-72 p-3.5 text-xs leading-relaxed rounded-xl shadow-2xl glass-panel text-slate-300 border border-sky-500/20 animate-fadeInFast"
                >
                  24-hour continuous forecast from satellite telemetry for {location.name} ({location.latitude}°N) with NOCT thermal derating and P10–P90 uncertainty confidence bounds.
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Real-time satellite GHI solar forecasting · Interactive hour selection
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-glow" />
            <span className="text-amber-300 font-display font-semibold text-2xs">Predicted kW</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-sky-300 font-display font-semibold text-2xs">P10–P90 Band</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full" style={{ height: '300px', cursor: 'pointer' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={hourlyData}
            margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload.length) {
                onSelectHour(e.activePayload[0].payload.hour);
              }
            }}
          >
            <defs>
              <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="transparent"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b' }}
            />
            <YAxis
              stroke="transparent"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit=" kW"
              domain={[0, 52]}
              tick={{ fill: '#64748b' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#38bdf8', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />
            <Area type="monotone" dataKey="p90UpperKW" stroke="none" fill="url(#gradBand)" name="Confidence" />
            <Area
              type="monotone"
              dataKey="predictedKW"
              stroke="#f59e0b"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#gradPredicted)"
              name="Predicted"
              activeDot={{ r: 6, fill: '#f59e0b', stroke: '#020712', strokeWidth: 3 }}
            />
            {currentHour !== null && hourlyData && hourlyData[currentHour] && (
              <ReferenceLine
                x={hourlyData[currentHour]?.timeLabel}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{ value: '▼ LIVE', fill: '#f59e0b', fontSize: 10, fontWeight: 900, position: 'top' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <MousePointerClick size={14} className="text-sky-400" />
          <span>Click any hour node to inspect string voltage &amp; cell temperature</span>
        </div>
        <div className="text-2xs text-slate-500 font-display">
          Peak Window: <span className="text-amber-400 font-semibold">11:00 – 14:00</span> · Nameplate: <span className="text-sky-400 font-semibold">48.0 kW</span>
        </div>
      </div>
    </div>
  );
}
