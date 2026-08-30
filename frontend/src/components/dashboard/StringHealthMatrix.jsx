import React, { useState } from 'react';
import { Layers, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function StringHealthMatrix({
  faultedPanels = {},
  onSelectPanel,
  className,
}) {
  const [hoveredPanel, setHoveredPanel] = useState(null);
  const totalPanels = 32;

  return (
    <div className={cn('glass-panel p-5 flex flex-col justify-between w-full shadow-lg', className)}>
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-surface border border-border-glow flex items-center justify-center text-sky-blue shadow-sm">
            <Layers size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">String Health Heatmap</h2>
            <p className="text-mono text-3xs text-text-muted mt-0.5">4×8 Monocrystalline Array · 32 Modules</p>
          </div>
        </div>
        <span className="text-mono text-3xs font-bold px-2 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/30">
          32 MODULES ONLINE
        </span>
      </div>

      {/* 4x8 Grid Heatmap */}
      <div className="grid grid-cols-8 sm:grid-cols-16 lg:grid-cols-32 gap-2 my-auto p-3 rounded-xl bg-surface/50 border border-border-subtle">
        {Array.from({ length: totalPanels }, (_, idx) => {
          const panelId = idx + 1;
          const fault = faultedPanels[panelId];
          const isFault = fault === 'Offline';
          const isUnderperforming = fault === 'Underperforming';

          return (
            <div
              key={panelId}
              onMouseEnter={() => setHoveredPanel(panelId)}
              onMouseLeave={() => setHoveredPanel(null)}
              onClick={() => onSelectPanel && onSelectPanel(panelId)}
              className={cn(
                'h-9 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center font-mono text-3xs font-bold shadow-sm relative group',
                isFault
                  ? 'bg-rose text-base shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse'
                  : isUnderperforming
                  ? 'bg-solar-amber text-base shadow-amber-glow'
                  : 'bg-sky-blue/80 hover:bg-sky-blue text-base hover:scale-105 hover:shadow-sky-glow'
              )}
            >
              <span>{panelId}</span>

              {/* Hover Tooltip */}
              {hoveredPanel === panelId && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-44 p-2.5 rounded-lg glass-panel text-xs text-text-primary border border-border-glow shadow-glass whitespace-nowrap animate-fadeInFast">
                  <div className="font-bold text-solar-amber font-display text-3xs">Module A-{panelId}</div>
                  <div className="text-mono text-3xs text-text-secondary mt-0.5">
                    Status: {fault || 'Optimal (100%)'}
                  </div>
                  <div className="text-mono text-3xs text-text-muted">
                    Voltage: {isFault ? '4.2 V' : '41.8 V'} · 44.2°C
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend & Summary */}
      <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-mono text-3xs flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-sky-blue" />
            <span className="text-text-muted">Optimal (100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-solar-amber" />
            <span className="text-text-muted">Derating</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-rose" />
            <span className="text-text-muted">Isolated</span>
          </div>
        </div>

        <span className="text-emerald font-semibold">Array Conductance: 98.4%</span>
      </div>
    </div>
  );
}
