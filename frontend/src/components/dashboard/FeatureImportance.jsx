import React, { useState } from 'react';
import { BarChart2, Info } from 'lucide-react';
import { getFeatureImportanceData } from '../../api/forecastApi';

export default function FeatureImportance() {
  const [showInfo, setShowInfo] = useState(false);
  const features = getFeatureImportanceData();

  return (
    <div className="bg-[#141619] border border-[#2a2d32] rounded-sm p-4 shadow-none font-mono relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-[#f0a830]" size={18} />
          <h3 className="font-bold text-xs text-white uppercase tracking-widest">XGBOOST FEATURE IMPORTANCE</h3>
        </div>

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
            <div className="absolute right-0 top-6 z-30 w-72 p-3 bg-[#141619] border border-[#2a2d32] rounded-sm text-xs text-[#c7ccd4] leading-relaxed font-sans select-none">
              <b>XGBoost Feature Importance</b>
              <p className="mt-1 text-[11px] text-[#9ca3af]">
                Percentage contribution of each environmental feature (Irradiance, Zenith Angle, Cloud Cover, Temp) on predicting total array generation.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {features.map((item, idx) => {
          const pct = Math.round(item.importance * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider">
                <span className="text-[#c7ccd4] font-medium truncate max-w-[200px]" title={item.feature}>
                  {item.feature}
                </span>
                <span className="font-mono text-[#f0a830] font-bold tabular-nums">{pct}%</span>
              </div>
              <div className="w-full bg-[#0b0c0e] border border-[#2a2d32] rounded-none h-1.5 overflow-hidden">
                <div
                  className="bg-[#f0a830] h-full rounded-none transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
