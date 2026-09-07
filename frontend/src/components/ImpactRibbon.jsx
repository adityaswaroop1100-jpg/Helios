import React from 'react';

/**
 * ImpactRibbon — 60-Second Return on Investment (ROI) Header
 * Placed directly below the main navbar on the Dashboard page.
 * Delivers immediate project value props to hackathon judges within 1 second.
 */
export default function ImpactRibbon() {
  const metrics = [
    {
      icon: '💰',
      number: '$17,045',
      label: '/ Year Saved',
      subtext: 'Algorithmic Yield Optimization',
    },
    {
      icon: '🌍',
      number: '66.9',
      unit: 'Metric Tons',
      label: 'CO₂ Avoided',
      subtext: 'Clean Megawatt Generation',
    },
    {
      icon: '⚡',
      number: '<12ms',
      label: 'Sub-12ms Fault Response',
      subtext: 'Autonomous SCADA Edge Isolation',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-5 lg:px-8 pt-4 pb-0">
      <div className="glass-premium px-5 py-3 border border-white/10 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 bg-carbon/75 backdrop-blur-xl">
        {metrics.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 min-w-[220px] flex-1 justify-center sm:justify-start"
          >
            <span className="text-2xl filter drop-shadow select-none">{item.icon}</span>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl sm:text-2xl font-extrabold text-gold font-mono tracking-tight drop-shadow-sm">
                  {item.number}
                </span>
                {item.unit && (
                  <span className="text-xs font-bold text-gold font-mono tracking-wider">
                    {item.unit}
                  </span>
                )}
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  {item.label.startsWith('/') ? item.label : ` ${item.label}`}
                </span>
              </div>
              <span className="text-3xs text-text-secondary uppercase tracking-widest font-mono">
                {item.subtext}
              </span>
            </div>
            {idx < metrics.length - 1 && (
              <div className="hidden lg:block h-8 w-px bg-white/10 ml-auto" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
