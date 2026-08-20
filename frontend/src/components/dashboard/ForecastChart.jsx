import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#141619] border border-[#2a2d32] p-3 rounded-sm text-xs space-y-1 font-mono text-[#c7ccd4]">
        <p className="font-bold text-white text-xs border-b border-[#2a2d32] pb-1 uppercase tracking-wider">
          TIME: {data.timeLabel}
        </p>
        <div className="flex items-center justify-between gap-4 text-[#f0a830]">
          <span>OUTPUT:</span>
          <span className="font-bold text-xs tabular-nums">{data.predictedKW} kW</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[#9ca3af]">
          <span>P90 BOUND:</span>
          <span className="tabular-nums">{data.p90UpperKW} kW</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[#9ca3af]">
          <span>P10 BOUND:</span>
          <span className="tabular-nums">{data.p10LowerKW} kW</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[#c7ccd4]">
          <span>IRRADIANCE:</span>
          <span className="tabular-nums">{data.irradiance} W/m²</span>
        </div>
        {data.isAnomaly && (
          <div className="mt-1 pt-1 border-t border-[#f59e0b]/40 text-[#f59e0b] flex items-center gap-1 font-bold">
            <AlertTriangle size={12} />
            <span>ANOMALY DETECTED</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function ForecastChart({ hourlyData, currentHour, onSelectHour }) {
  const [showInfo, setShowInfo] = useState(false);
  const currentData = hourlyData[currentHour] || {};

  return (
    <div className="bg-[#141619] border border-[#2a2d32] rounded-sm p-5 shadow-none flex flex-col h-full relative font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-[#f0a830]" size={18} />
            <h2 className="text-xs font-bold text-white tracking-widest uppercase">24-HOUR GENERATION PREDICTION</h2>
            <div className="relative">
              <button
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                onClick={() => setShowInfo(!showInfo)}
                className="text-[#9ca3af] hover:text-[#f0a830] transition-colors p-0.5"
              >
                <Info size={14} />
              </button>
              {showInfo && (
                <div className="absolute left-0 top-6 z-30 w-72 p-3 bg-[#141619] border border-[#2a2d32] rounded-sm text-xs text-[#c7ccd4] leading-relaxed font-sans select-none">
                  <b>Confidence Band</b>
                  <p className="mt-1 text-[11px] text-[#9ca3af]">
                    Shaded area represents P10–P90 (80%) confidence interval from XGBoost model accounting for atmospheric variations.
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="text-[11px] text-[#9ca3af] mt-0.5 uppercase tracking-wider">
            XGBoost ML model predictions with 80% confidence interval band (P10–P90)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-none bg-[#f0a830] inline-block"></span>
            <span className="text-[#c7ccd4]">PREDICTED (KW)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-none bg-[#374151] border border-[#4b5563] inline-block"></span>
            <span className="text-[#9ca3af]">CONFIDENCE BAND</span>
          </div>
        </div>
      </div>

      {/* Recharts Chart Container */}
      <div className="w-full h-72 sm:h-80 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={hourlyData}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload.length) {
                onSelectHour(e.activePayload[0].payload.hour);
              }
            }}
          >
            <defs>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f0a830" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f0a830" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4b5563" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4b5563" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="2 2" stroke="#2a2d32" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#2a2d32' }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#2a2d32' }}
              unit=" kW"
              domain={[0, 60]}
            />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="p90UpperKW"
              stroke="none"
              fill="url(#colorBand)"
              name="Confidence Upper"
            />
            
            <Area
              type="monotone"
              dataKey="predictedKW"
              stroke="#f0a830"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPredicted)"
              name="Predicted Output"
              activeDot={{ r: 5, fill: '#f0a830', stroke: '#ffffff', strokeWidth: 2 }}
            />

            {currentHour !== null && (
              <ReferenceLine
                x={hourlyData[currentHour]?.timeLabel}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: 'ACTIVE',
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'top'
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-[#2a2d32] flex items-center justify-between text-xs font-mono uppercase tracking-wider">
        <span className="text-[#9ca3af]">CLICK GRAPH POINT TO SELECT ACTIVE HOUR:</span>
        <span className="text-[#f0a830] font-bold bg-[#0b0c0e] border border-[#2a2d32] px-2 py-0.5 rounded-sm tabular-nums">
          ACTIVE: {currentData.timeLabel} ({currentData.predictedKW} kW)
        </span>
      </div>
    </div>
  );
}
