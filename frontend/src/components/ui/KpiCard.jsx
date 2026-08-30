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
  trend = '+12.4%',
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  badgeText = 'LIVE',
  accentColor = '#f59e0b',
  tooltipText,
  className,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Generate fallback sparkline if none provided
  const chartData = sparklineData.length > 0
    ? sparklineData
    : [
        { v: 38 }, { v: 42 }, { v: 40 }, { v: 45 }, { v: 48 },
        { v: 46 }, { v: 49 }, { v: 51 }, { v: 53 }, { v: 52 }
      ];

  const isUp = trendDirection === 'up';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'glass-panel relative flex flex-col justify-between p-24 overflow-hidden border-l-2 group cursor-default transition-all duration-300 min-h-[140px] h-full',
        className
      )}
      style={{
        borderLeftColor: accentColor,
      }}
    >
      {/* Top ambient glow bloom */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none transition-opacity group-hover:opacity-20"
        style={{ background: accentColor }}
      />

      {/* Header Row: Label + Badge + Info */}
      <div className="flex items-center justify-between gap-2 mb-16 z-10">
        <div className="flex items-center gap-12">
          {Icon && (
            <div
              className="w-32 h-32 rounded-lg flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                color: accentColor,
              }}
            >
              <Icon size={16} />
            </div>
          )}
          <div>
            <h3 className="text-h2 font-semibold text-text-primary tracking-tight leading-none">{label}</h3>
            {sub && <p className="text-mono text-xs text-text-muted mt-4">{sub}</p>}
          </div>
        </div>

        <div className="flex items-center gap-8">
          {badgeText && (
            <span
              className="text-mono text-2xs font-bold px-8 py-4 rounded-full uppercase tracking-wider border shadow-sm flex items-center gap-4"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                color: accentColor,
              }}
            >
              <span className="w-4 h-4 rounded-full animate-pulse" style={{ background: accentColor }} />
              {badgeText}
            </span>
          )}

          {tooltipText && (
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-text-muted hover:text-text-secondary transition-colors p-4"
              >
                <Info size={13} />
              </button>
              {showTooltip && (
                <div
                  className="absolute right-0 top-32 z-50 w-64 p-12 text-xs leading-relaxed rounded-xl glass-panel text-text-secondary shadow-glass border border-border-glow animate-fadeInFast"
                >
                  {tooltipText}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Metric Figure */}
      <div className="flex items-baseline gap-8 mb-16 z-10">
        <span
          className="text-display tabular-nums tracking-tight drop-shadow-sm font-display text-text-primary"
        >
          {prefix}{value}
        </span>
        {unit && (
          <span className="text-body font-medium text-text-secondary">{unit}</span>
        )}
      </div>

      {/* Footer Row: Sparkline + Trend Indicator */}
      <div className="flex items-end justify-between gap-12 pt-12 border-t border-border-subtle z-10">
        {/* Trend Indicator */}
        <div className="flex items-center gap-4 text-mono text-xs font-semibold">
          {isUp ? (
            <ArrowUpRight size={14} className="text-solar-amber" />
          ) : (
            <ArrowDownRight size={14} className="text-sky-blue" />
          )}
          <span className={isUp ? 'text-solar-amber' : 'text-sky-blue'}>{trend}</span>
        </div>

        {/* Mini Recharts Sparkline */}
        <div className="w-32 h-16 opacity-75 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={accentColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={accentColor}
                strokeWidth={1.8}
                fill={`url(#grad-${label.replace(/\s+/g, '')})`}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
