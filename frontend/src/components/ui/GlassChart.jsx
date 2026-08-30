import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp, AlertTriangle, Zap, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

export const CustomChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel p-3.5 shadow-glass border border-border-glow text-xs space-y-2 min-w-[190px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle font-display font-semibold text-text-primary">
          <span>{data.timeLabel}</span>
          {data.ambientTemp !== undefined && (
            <span className="text-3xs text-sky-blue px-1.5 py-0.5 rounded bg-surface border border-border-subtle">
              {data.ambientTemp}°C
            </span>
          )}
        </div>
        <div className="flex justify-between items-center text-text-secondary">
          <span className="flex items-center gap-1.5">
            <Zap size={12} className="text-solar-amber" />
            <span>Predicted PV</span>
          </span>
          <span className="font-display font-bold text-solar-amber text-sm">
            {data.predictedKW} kW
          </span>
        </div>
        {data.p90UpperKW !== undefined && (
          <div className="flex justify-between items-center text-text-secondary">
            <span>P90 Bound</span>
            <span className="font-display text-sky-blue font-semibold">{data.p90UpperKW} kW</span>
          </div>
        )}
        <div className="flex justify-between items-center text-text-secondary">
          <span>Irradiance</span>
          <span className="font-display text-text-primary">{data.irradiance} W/m²</span>
        </div>
        {data.isAnomaly && (
          <div className="flex items-center gap-1.5 pt-1 text-rose font-medium border-t border-rose/20 text-3xs">
            <AlertTriangle size={11} />
            <span>{data.anomalyDescription || 'Fault Detected'}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function GlassChart({
  data = [],
  currentHour,
  onSelectHour,
  locationName = 'Chengalpattu',
  title = '24-Hour Solar PV Generation Curve',
  subtitle = 'XGBoost ML R² 0.9989 Predictive Ensemble',
  className,
}) {
  return (
    <div className={cn('glass-panel p-5 relative flex flex-col justify-between h-full shadow-lg', className)}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface border border-border-glow flex items-center justify-center text-solar-amber shadow-sm">
            <TrendingUp size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h2>
              <span className="text-mono text-3xs px-2 py-0.5 rounded-full border border-sky-blue/30 text-sky-blue bg-sky-blue/10 flex items-center gap-1">
                <MapPin size={9} />
                <span>{locationName}</span>
              </span>
            </div>
            <p className="text-mono text-3xs text-text-muted mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-mono text-3xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-solar-amber shadow-amber-glow" />
            <span className="text-text-secondary">Expected kW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full border border-sky-blue bg-sky-blue/20" />
            <span className="text-text-muted">P90 Band</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="flex-1 min-h-0 w-full cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 12, left: -14, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload.length && onSelectHour) {
                onSelectHour(e.activePayload[0].payload.hour);
              }
            }}
          >
            <defs>
              <linearGradient id="solarAmberGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.65} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="skyConfidenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />

            <XAxis
              dataKey="timeLabel"
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#475569', strokeWidth: 1 }}
              tick={{ fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
            />

            <YAxis
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#475569', strokeWidth: 1 }}
              unit=" kW"
              domain={[0, 52]}
              tick={{ fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
            />

            <Tooltip
              content={<CustomChartTooltip />}
              cursor={{ stroke: '#38bdf8', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />

            <Area
              type="monotone"
              dataKey="p90UpperKW"
              stroke="none"
              fill="url(#skyConfidenceGrad)"
              name="Confidence Interval"
              isAnimationActive={true}
              animationDuration={500}
            />

            <Area
              type="monotone"
              dataKey="predictedKW"
              stroke="#f59e0b"
              strokeWidth={2.2}
              fill="url(#solarAmberGrad)"
              name="Predicted Yield"
              activeDot={{ r: 5, fill: '#f59e0b', stroke: '#080c1a', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={500}
            />

            {currentHour !== null && currentHour !== undefined && data[currentHour] && (
              <ReferenceLine
                x={data[currentHour]?.timeLabel}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{ value: '▼ SCADA', fill: '#f59e0b', fontSize: 9, fontWeight: 700, position: 'top' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
