import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, CloudRain, Sun, Info } from 'lucide-react';

export default function AnomalyPanel({ currentHourData }) {
  const [showInfo, setShowInfo] = useState(false);
  const isAnomaly = currentHourData.isAnomaly;

  return (
    <div className={`border rounded-sm p-4 shadow-none relative font-mono ${
      isAnomaly
        ? 'bg-[#1a1209] border-[#f59e0b]/50 text-[#fcd34d]'
        : 'bg-[#141619] border-[#2a2d32] text-[#c7ccd4]'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isAnomaly ? (
            <AlertOctagon className="text-[#f59e0b]" size={18} />
          ) : (
            <CheckCircle2 className="text-[#10b981]" size={18} />
          )}
          <h3 className="font-bold text-xs text-white uppercase tracking-widest">SYSTEM ANOMALY MONITOR</h3>
          
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
                <b>Anomaly Thresholds</b>
                <p className="mt-1 text-[11px] text-[#9ca3af]">
                  Triggered when solar power output drops more than 20% below the expected clear-sky baseline.
                </p>
              </div>
            )}
          </div>
        </div>

        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
          isAnomaly ? 'bg-[#2e1d0c] text-[#f59e0b] border border-[#f59e0b]/40' : 'bg-[#062419] text-[#10b981] border border-[#10b981]/40'
        }`}>
          {isAnomaly ? 'ANOMALY DETECTED' : 'SYSTEM NOMINAL'}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-[#9ca3af] uppercase tracking-wider">
          <span>ACTIVE HOUR:</span>
          <span className="font-mono text-white font-semibold tabular-nums">{currentHourData.timeLabel}</span>
        </div>

        <div className="flex items-center justify-between text-[#9ca3af] uppercase tracking-wider">
          <span>CLOUD COVER INDEX:</span>
          <span className="font-mono text-white flex items-center gap-1 tabular-nums">
            <CloudRain size={12} className="text-[#c7ccd4]" />
            {currentHourData.cloudCover}%
          </span>
        </div>

        <div className="flex items-center justify-between text-[#9ca3af] uppercase tracking-wider">
          <span>IRRADIANCE LEVEL:</span>
          <span className="font-mono text-white flex items-center gap-1 tabular-nums">
            <Sun size={12} className="text-[#f0a830]" />
            {currentHourData.irradiance} W/m²
          </span>
        </div>

        {isAnomaly ? (
          <div className="mt-2 pt-2 border-t border-[#f59e0b]/30 text-[11px] text-[#fcd34d] leading-snug font-sans">
            ⚠️ {currentHourData.anomalyDescription}
          </div>
        ) : (
          <div className="mt-2 pt-2 border-t border-[#2a2d32] text-[11px] text-[#9ca3af] font-sans">
            ✅ Telemetry aligns within expected P10–P90 confidence boundaries.
          </div>
        )}
      </div>
    </div>
  );
}
