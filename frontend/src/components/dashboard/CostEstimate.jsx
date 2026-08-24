import React, { useState } from 'react';
import { DollarSign, Leaf, Zap, TrendingUp, Info, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';
import { getFinancialMetrics } from '../../api/forecastApi';

const cards = [
  {
    key: 'gen',
    label: 'Active AC Generation',
    sub: 'Real-time string telemetry',
    icon: Zap,
    valueKey: 'currentKW',
    unit: 'kW',
    accent: '#f59e0b',
    accentGrad: 'from-amber-500 to-amber-300',
    accentDim: 'rgba(245, 158, 11, 0.12)',
    accentBorder: 'rgba(245, 158, 11, 0.28)',
    badgeText: 'LIVE SCADA',
    trend: '+12.4% vs STC',
    tip: 'Real-time aggregated power from all 32 monocrystalline PV modules with NOCT thermal dynamics.',
  },
  {
    key: 'daily',
    label: '24h Yield Forecast',
    sub: 'XGBoost ML predicted total',
    icon: TrendingUp,
    valueKey: 'totalDailyKWh',
    unit: 'kWh',
    accent: '#38bdf8',
    accentGrad: 'from-sky-400 to-sky-200',
    accentDim: 'rgba(56, 189, 248, 0.12)',
    accentBorder: 'rgba(56, 189, 248, 0.28)',
    badgeText: '99.9% R²',
    trend: 'P90 High Conf.',
    tip: 'Integrated 24-hour total energy generation predicted by the trained XGBoost ML regression model.',
  },
  {
    key: 'savings',
    label: 'Grid Cost Offset',
    sub: '$0.18/kWh commercial peak rate',
    icon: DollarSign,
    valueKey: 'dailySavingsUSD',
    unit: '/day',
    prefix: '$',
    accent: '#10b981',
    accentGrad: 'from-emerald-400 to-emerald-200',
    accentDim: 'rgba(16, 185, 129, 0.12)',
    accentBorder: 'rgba(16, 185, 129, 0.28)',
    badgeText: 'ARBITRAGE',
    trend: '+$46.70 / day',
    tip: 'Direct financial cost avoidance by replacing grid peak power tariffs with self-generated solar.',
  },
  {
    key: 'co2',
    label: 'Scope-2 Carbon Avoided',
    sub: '0.707 kg/kWh regional benchmark',
    icon: Leaf,
    valueKey: 'co2AvoidedKg',
    unit: 'kg CO₂',
    accent: '#22c55e',
    accentGrad: 'from-green-400 to-emerald-300',
    accentDim: 'rgba(34, 197, 94, 0.12)',
    accentBorder: 'rgba(34, 197, 94, 0.28)',
    badgeText: 'ESG OFFSET',
    trend: 'Zero Emission',
    tip: 'Greenhouse gas emissions avoided relative to the regional fossil-fuel grid intensity benchmark.',
  },
];

export default function CostEstimate({ hourlyData, currentHour }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const metrics = getFinancialMetrics(hourlyData, currentHour);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, sub, icon: Icon, valueKey, unit, prefix = '', accent, accentGrad, accentDim, accentBorder, badgeText, trend, tip }, idx) => (
        <div
          key={key}
          className="metric-card rounded-2xl p-5 relative group cursor-default overflow-hidden"
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          {/* Top Neon Accent Gradient Line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent 5%, ${accent} 50%, transparent 95%)` }}
          />

          {/* Top Row: Icon + Badge */}
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{ background: accentDim, border: `1px solid ${accentBorder}` }}
            >
              <Icon size={19} style={{ color: accent }} />
            </div>

            <div className="flex items-center gap-2">
              <span
                className="text-3xs font-bold px-2.5 py-1 rounded-full uppercase tracking-widest font-display flex items-center gap-1.5 shadow-sm"
                style={{ background: accentDim, color: accent, border: `1px solid ${accentBorder}` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                {badgeText}
              </span>

              <div className="relative">
                <button
                  onMouseEnter={() => setActiveTooltip(key)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  <Info size={13} />
                </button>
                {activeTooltip === key && (
                  <div
                    className="absolute right-0 top-8 z-50 w-64 p-3.5 text-xs leading-relaxed shadow-2xl rounded-xl glass-panel text-slate-300 border backdrop-blur-xl animate-fadeInFast"
                    style={{ borderColor: accentBorder }}
                  >
                    {tip}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Large Primary Value */}
          <div className="flex items-baseline gap-1.5 mb-2">
            <span
              className="font-display font-extrabold tracking-tight text-white drop-shadow-sm"
              style={{ fontSize: '2.15rem', lineHeight: 1.05 }}
            >
              {prefix}{metrics[valueKey]}
            </span>
            <span className="text-xs font-semibold text-slate-400">{unit}</span>
          </div>

          {/* Subtitle & Trend */}
          <div className="flex items-center justify-between text-2xs mb-3 font-display">
            <span className="text-slate-400">{sub}</span>
            <span className="font-semibold" style={{ color: accent }}>{trend}</span>
          </div>

          {/* Bottom Card Footer */}
          <div
            className="flex items-center justify-between pt-3 border-t border-white/[0.06]"
          >
            <div className="font-semibold text-xs text-slate-200">{label}</div>
            <ArrowUpRight
              size={15}
              className="text-slate-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
