import React, { useState } from 'react';
import { DollarSign, Leaf, Zap, TrendingUp, Info, ArrowUpRight } from 'lucide-react';
import { getFinancialMetrics } from '../../api/forecastApi';

const CARDS = [
  {
    key: 'gen',
    label: 'Active AC Generation',
    sub: 'Real-time string telemetry · MPPT locked',
    icon: Zap,
    valueKey: 'currentKW',
    unit: 'kW',
    badge: 'LIVE SCADA',
    trend: '+12.4% vs STC',
    tip: 'Real-time aggregated power from all 32 monocrystalline PV modules with NOCT thermal dynamics applied.',
    accentColor: 'gold',
  },
  {
    key: 'daily',
    label: '24h Yield Forecast',
    sub: 'XGBoost ML predicted total',
    icon: TrendingUp,
    valueKey: 'totalDailyKWh',
    unit: 'kWh',
    badge: 'R² 0.9989',
    trend: 'P90 High Conf.',
    tip: 'Integrated 24-hour total energy generation predicted by the trained XGBoost ML model with P10–P90 confidence band.',
    accentColor: 'cyan',
  },
  {
    key: 'savings',
    label: 'Grid Cost Offset',
    sub: '₹8.50/kWh commercial peak rate',
    icon: DollarSign,
    valueKey: 'dailySavingsUSD',
    unit: '/day',
    prefix: '$',
    badge: 'ARBITRAGE',
    trend: '+$46.70 today',
    tip: 'Direct financial cost avoidance by replacing grid peak power tariffs with self-generated solar energy.',
    accentColor: 'jade',
  },
  {
    key: 'co2',
    label: 'Scope-2 CO₂ Avoided',
    sub: '0.707 kg/kWh regional benchmark',
    icon: Leaf,
    valueKey: 'co2AvoidedKg',
    unit: 'kg CO₂',
    badge: 'ESG OFFSET',
    trend: 'Net Zero',
    tip: 'Greenhouse gas emissions avoided relative to the regional fossil-fuel grid intensity benchmark (IEA India 2023).',
    accentColor: 'jade',
  },
];

const ACCENT = {
  gold:   { color: '#c9973e', bg: 'rgba(201,151,62,0.10)', border: 'rgba(201,151,62,0.22)', glow: 'rgba(201,151,62,0.12)' },
  cyan:   { color: '#4dd0e1', bg: 'rgba(77,208,225,0.10)', border: 'rgba(77,208,225,0.20)', glow: 'rgba(77,208,225,0.08)' },
  jade:   { color: '#2dd4a8', bg: 'rgba(45,212,168,0.10)', border: 'rgba(45,212,168,0.20)', glow: 'rgba(45,212,168,0.08)' },
};

export default function CostEstimate({ hourlyData, currentHour }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const metrics = getFinancialMetrics(hourlyData, currentHour);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, sub, icon: Icon, valueKey, unit, prefix = '', badge, trend, tip, accentColor }, idx) => {
        const a = ACCENT[accentColor] || ACCENT.gold;
        return (
          <div
            key={key}
            className="relative rounded-xl2 p-5 overflow-hidden group cursor-default"
            style={{
              background: 'linear-gradient(135deg, rgba(12,20,40,0.95) 0%, rgba(8,14,26,0.95) 100%)',
              border: `1px solid ${a.border}`,
              borderLeft: `3px solid ${a.color}`,
              boxShadow: `0 16px 48px -12px rgba(0,0,0,0.85), 0 0 28px -10px ${a.glow}`,
              animationDelay: `${idx * 60}ms`,
            }}
          >
            {/* Background radial glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 20% 20%, ${a.glow} 0%, transparent 70%)` }}
            />

            {/* Top stripe accent */}
            <div className="absolute top-0 left-4 right-4 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${a.color}50, transparent)` }} />

            <div className="relative">
              {/* Header row */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: a.bg, border: `1px solid ${a.border}` }}>
                  <Icon size={16} style={{ color: a.color }} />
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className="text-3xs font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-widest"
                    style={{ background: a.bg, color: a.color, border: `1px solid ${a.border}` }}
                  >
                    {badge}
                  </span>

                  <div className="relative">
                    <button
                      onMouseEnter={() => setActiveTooltip(key)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      className="text-text-muted hover:text-text-secondary transition-colors p-0.5"
                    >
                      <Info size={12} />
                    </button>
                    {activeTooltip === key && (
                      <div className="absolute right-0 top-7 z-50 w-64 p-3.5 text-xs leading-relaxed shadow-2xl rounded-xl glass-panel text-text-secondary animate-fadeInFast"
                        style={{ border: `1px solid ${a.border}` }}>
                        {tip}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Value */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-mono font-bold text-text-primary"
                  style={{ fontSize: '2rem', lineHeight: 1, color: a.color }}>
                  {prefix}{metrics[valueKey]}
                </span>
                <span className="text-2xs text-text-muted font-mono">{unit}</span>
              </div>

              {/* Sub + trend */}
              <div className="flex items-center justify-between text-2xs mb-4">
                <span className="text-text-muted font-mono">{sub}</span>
                <span className="font-mono font-semibold" style={{ color: a.color }}>{trend}</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-2xs font-semibold text-text-secondary">{label}</span>
                <ArrowUpRight size={14} className="text-text-dim group-hover:text-text-secondary transition-colors" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
