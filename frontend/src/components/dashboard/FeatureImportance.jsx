import React, { useState } from 'react';
import { BarChart2, Info } from 'lucide-react';
import { getFeatureImportanceData } from '../../api/forecastApi';

const COLORS = [
  { bar: 'linear-gradient(90deg, #f59e0b, #fbbf24)', text: '#f59e0b' },
  { bar: 'linear-gradient(90deg, #0284c7, #38bdf8)', text: '#38bdf8' },
  { bar: 'linear-gradient(90deg, #059669, #10b981)', text: '#10b981' },
  { bar: 'linear-gradient(90deg, #6366f1, #818cf8)', text: '#818cf8' },
  { bar: 'linear-gradient(90deg, #e11d48, #f43f5e)', text: '#f43f5e' },
];

export default function FeatureImportance() {
  const [showInfo, setShowInfo] = useState(false);
  const features = getFeatureImportanceData();

  return (
    <div className="data-card rounded-2xl p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <BarChart2 size={15} className="text-amber-400" />
          <span className="font-semibold text-sm text-slate-200">Feature Importance</span>
          <div className="relative">
            <button onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)}
              className="text-slate-600 hover:text-slate-400 transition-colors p-0.5">
              <Info size={12} />
            </button>
            {showInfo && (
              <div className="absolute right-0 top-6 z-40 w-64 p-3 text-xs leading-relaxed rounded-xl shadow-2xl glass-panel text-slate-400"
                style={{ border: '1px solid rgba(56,189,248,0.12)' }}>
                <div className="font-semibold text-slate-200 pb-1 mb-1.5 flex items-center justify-between"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span>XGBoost Regressor</span>
                  <span className="text-emerald-400 font-display">99.89% R²</span>
                </div>
                <p>35,040 timestamped samples (1-year 15-min SCADA logs).</p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 mt-1.5 font-display"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>RMSE: <span className="text-amber-400">0.334 kW</span></div>
                  <div>MAE: <span className="text-sky-400">0.184 kW</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <span className="text-2xs font-bold px-2.5 py-1 rounded-full font-display flex items-center gap-1.5"
          style={{ background: 'rgba(16,185,129,0.10)', color: '#10b981', border: '1px solid rgba(16,185,129,0.22)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          99.9% R²
        </span>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {features.map((item, idx) => {
          const pct = Math.round(item.importance * 100);
          const c = COLORS[idx % COLORS.length];
          return (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="text-slate-400 font-medium">{item.feature}</span>
                <span className="font-display font-bold" style={{ color: c.text }}>{pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: c.bar, boxShadow: `0 0 8px ${c.text}30` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
