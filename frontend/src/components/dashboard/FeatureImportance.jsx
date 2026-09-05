import React, { useState } from 'react';
import { BarChart2, Info } from 'lucide-react';
import { getFeatureImportanceData } from '../../api/forecastApi';

const FEATURE_COLORS = [
  { stroke: '#c9973e', fill: 'rgba(201,151,62,0.15)', text: '#c9973e', glow: 'rgba(201,151,62,0.3)' },
  { stroke: '#4dd0e1', fill: 'rgba(77,208,225,0.12)', text: '#4dd0e1', glow: 'rgba(77,208,225,0.25)' },
  { stroke: '#2dd4a8', fill: 'rgba(45,212,168,0.12)', text: '#2dd4a8', glow: 'rgba(45,212,168,0.25)' },
  { stroke: '#a78bfa', fill: 'rgba(167,139,250,0.12)', text: '#a78bfa', glow: 'rgba(167,139,250,0.25)' },
  { stroke: '#e5484d', fill: 'rgba(229,72,77,0.12)', text: '#e5484d', glow: 'rgba(229,72,77,0.25)' },
];

export default function FeatureImportance() {
  const [showInfo, setShowInfo] = useState(false);
  const features = getFeatureImportanceData();

  return (
    <div className="data-card rounded-xl2 p-5 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(201,151,62,0.12)', border: '1px solid rgba(201,151,62,0.25)' }}>
            <BarChart2 size={15} className="text-gold" />
          </div>
          <div>
            <span className="font-bold text-sm text-text-primary">Feature Importance</span>
            <p className="text-2xs text-text-muted font-mono mt-0.5">XGBoost SHAP Gain Analysis</p>
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
              <div className="absolute right-0 top-8 z-40 w-64 p-3.5 text-xs leading-relaxed rounded-xl shadow-2xl glass-panel animate-fadeInFast"
                style={{ color: '#7a8ba3', border: '1px solid rgba(201,151,62,0.15)' }}>
                <div className="font-semibold text-text-primary pb-1.5 mb-1.5 flex items-center justify-between"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span>XGBoost Regressor</span>
                  <span className="text-jade font-mono">R² 0.9989</span>
                </div>
                <p>Trained on 35,040 timestamped SCADA records at 15-minute resolution.</p>
                <div className="grid grid-cols-2 gap-2 pt-1.5 mt-1.5 font-mono text-2xs"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>RMSE: <span className="text-gold">0.334 kW</span></div>
                  <div>MAE: <span className="text-cyan">0.184 kW</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <span className="badge-jade flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-jade" />
          R² 0.9989
        </span>
      </div>

      {/* Feature Bars */}
      <div className="space-y-3.5">
        {features.map((item, idx) => {
          const pct = Math.round(item.importance * 100);
          const c = FEATURE_COLORS[idx % FEATURE_COLORS.length];
          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-2xs text-text-secondary font-medium group-hover:text-text-primary transition-colors duration-200">
                  {item.feature}
                </span>
                <span className="font-mono font-bold text-2xs" style={{ color: c.text }}>
                  {pct}%
                </span>
              </div>
              <div className="relative w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${c.stroke}, ${c.glow})`,
                    boxShadow: `0 0 10px ${c.glow}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-5 pt-3 grid grid-cols-3 gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {[
          { label: 'R²', value: '0.9989', color: 'text-jade' },
          { label: 'RMSE', value: '0.334 kW', color: 'text-gold' },
          { label: 'MAE', value: '0.184 kW', color: 'text-cyan' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center p-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="label-uppercase mb-1">{label}</div>
            <div className={`font-mono font-bold text-xs ${color}`}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
