import React, { useState } from 'react';
import { Layers, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function StringHealthMatrix({ faultedPanels = {}, onSelectPanel, className = '' }) {
  const [hoveredPanel, setHoveredPanel] = useState(null);
  const totalPanels = 32;

  const faultCount = Object.values(faultedPanels).filter(v => v === 'Offline').length;
  const warnCount  = Object.values(faultedPanels).filter(v => v === 'Underperforming').length;
  const onlineCount = totalPanels - faultCount - warnCount;

  return (
    <div className={`data-card rounded-xl2 p-5 flex flex-col w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(77,208,225,0.10)', border: '1px solid rgba(77,208,225,0.20)' }}>
            <Layers size={15} className="text-cyan" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary tracking-tight">String Health Heatmap</h2>
            <p className="text-3xs text-text-muted font-mono mt-0.5">4×8 Monocrystalline Array · 32 Modules</p>
          </div>
        </div>
        <span className="badge-jade flex items-center gap-1.5">
          <ShieldCheck size={10} /> {onlineCount}/{totalPanels} Online
        </span>
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-8 gap-2 my-auto p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        {Array.from({ length: totalPanels }, (_, idx) => {
          const panelId = idx + 1;
          const fault   = faultedPanels[panelId];
          const isFault = fault === 'Offline';
          const isWarn  = fault === 'Underperforming';

          let bg = 'rgba(45,212,168,0.10)';
          let border = 'rgba(45,212,168,0.22)';
          let textColor = '#2dd4a8';
          let boxShadow = '';

          if (isFault) {
            bg = 'rgba(229,72,77,0.14)';
            border = 'rgba(229,72,77,0.32)';
            textColor = '#e5484d';
            boxShadow = '0 0 10px rgba(229,72,77,0.30)';
          } else if (isWarn) {
            bg = 'rgba(201,151,62,0.14)';
            border = 'rgba(201,151,62,0.30)';
            textColor = '#c9973e';
            boxShadow = '0 0 8px rgba(201,151,62,0.22)';
          }

          const isHovered = hoveredPanel === panelId;

          return (
            <div
              key={panelId}
              onMouseEnter={() => setHoveredPanel(panelId)}
              onMouseLeave={() => setHoveredPanel(null)}
              onClick={() => onSelectPanel?.(panelId)}
              className="relative h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150 select-none"
              style={{
                background: bg,
                border: `1px solid ${border}`,
                boxShadow,
                transform: isHovered ? 'scale(1.10)' : 'scale(1)',
                zIndex: isHovered ? 10 : 1,
              }}
              title={`Module A-${panelId}: ${fault || 'Nominal (100%)'}`}
            >
              <span className="text-3xs font-mono font-bold" style={{ color: textColor }}>{panelId}</span>

              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-44 p-2.5 rounded-xl text-xs text-text-primary animate-fadeInFast whitespace-nowrap"
                  style={{
                    background: 'rgba(6,10,20,0.97)',
                    border: `1px solid ${border}`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.9)',
                  }}
                >
                  <div className="font-mono font-bold text-2xs" style={{ color: textColor }}>Module A-{panelId}</div>
                  <div className="font-mono text-3xs text-text-secondary mt-0.5">
                    Status: {fault || 'Optimal (100%)'}
                  </div>
                  <div className="font-mono text-3xs text-text-muted">
                    V: {isFault ? '4.2V ⚡' : '41.8V'} · T: 44.2°C
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend & summary */}
      <div className="mt-4 pt-2.5 flex items-center justify-between flex-wrap gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-4 font-mono text-3xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded" style={{ background: 'rgba(45,212,168,0.35)', border: '1px solid rgba(45,212,168,0.40)' }} />
            Nominal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded" style={{ background: 'rgba(201,151,62,0.35)', border: '1px solid rgba(201,151,62,0.40)' }} />
            Derating
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded" style={{ background: 'rgba(229,72,77,0.35)', border: '1px solid rgba(229,72,77,0.40)' }} />
            Isolated
          </span>
        </div>
        <span className="font-mono text-2xs text-jade font-semibold">Array Conductance: 98.4%</span>
      </div>
    </div>
  );
}
