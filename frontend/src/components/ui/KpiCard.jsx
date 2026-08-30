import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function KpiCard({
  label,
  sub,
  value,
  unit,
  prefix = '',
  icon: Icon,
  sparklineData = [],
  trend = '+14.2%',
  trendDirection = 'up',
  badgeText = 'LIVE',
  accentColor = '#f59e0b',
  tooltipText,
  className,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const chartData = sparklineData.length > 0
    ? sparklineData
    : [
        { v: 38 }, { v: 42 }, { v: 40 }, { v: 45 }, { v: 48 },
        { v: 46 }, { v: 49 }, { v: 51 }, { v: 53 }, { v: 52 }
      ];

  const isUp = trendDirection === 'up';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'glass-panel relative flex flex-col justify-between p-5 overflow-hidden border-l-2 group cursor-default transition-all duration-300 min-h-[148px] h-full shadow-lg',
        className
      )}
      style={{
        borderLeftColor: accentColor,
      }}
    >
      {/* Top ambient glow bloom */}
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10 blur-xl pointer-events-none transition-opacity group-hover:opacity-25"
        style={{ background: accentColor }}
      />

      {/* Header Row: Icon + Label + Badge + Info */}
      <div className="flex items-center justify-between gap-2 mb-3 z-10">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                color: accentColor,
              }}
            >
              <Icon size={16} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight leading-none">{label}</h3>
            {sub && <p className="text-mono text-3xs text-text-muted mt-1">{sub}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {badgeText && (
            <span
              className="text-mono text-3xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border shadow-sm flex items-center gap-1"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                color: accentColor,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
              {badgeText}
            </span>
          )}

          {tooltipText && (
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-text-muted hover:text-text-secondary transition-colors p-1"
              >
                <Info size={13} />
              </button>
              {showTooltip && (
                <div
                  className="absolute right-0 top-6 z-50 w-60 p-3 text-xs leading-relaxed rounded-xl glass-panel text-text-secondary shadow-glass border border-border-glow animate-fadeInFast"
                >
                  {tooltipText}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Metric Figure */}
      <div className="flex items-baseline gap-1.5 my-auto z-10 py-1">
        <span
          className="text-display tabular-nums tracking-tight drop-shadow-sm font-display text-text-primary"
        >
          {prefix}{value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-text-secondary">{unit}</span>
        )}
      </div>

      {/* Footer Row: Sparkline + Trend Indicator */}
      <div className="flex items-end justify-between gap-3 pt-2.5 border-t border-border-subtle z-10 mt-2">
        {/* Trend Indicator */}
        <div className="flex items-center gap-1 text-mono text-2xs font-semibold">
          {isUp ? (
            <ArrowUpRight size={13} className="text-solar-amber" />
          ) : (
            <ArrowDownRight size={13} className="text-sky-blue" />
          )}
          <span className={isUp ? 'text-solar-amber' : 'text-sky-blue'}>{trend}</span>
        </div>

        {/* Mini Recharts Sparkline */}
        <div className="w-24 h-6 opacity-75 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 1, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${label.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={accentColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={accentColor}
                strokeWidth={1.5}
                fill={`url(#grad-${label.replace(/[^a-zA-Z0-9]/g, '')})`}
                isAnimationActive={true}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
