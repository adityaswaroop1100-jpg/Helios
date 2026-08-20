import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { X, Zap, Thermometer, Gauge, AlertTriangle, WifiOff } from 'lucide-react';

export default function PanelInspectorHtml({ panel, onClose, onSetFault }) {
  if (!panel) return null;

  const currentFault = panel.status === 'Offline' ? 'Offline'
    : panel.status === 'Underperforming' ? 'Underperforming'
    : null;

  return (
    <Html
      position={[0, 1.6, 0]}
      center
      distanceFactor={10}
      zIndexRange={[100, 0]}
      className="pointer-events-auto select-none font-mono"
    >
      <div className="bg-[#141619] border border-[#f0a830] rounded-sm p-4 shadow-none w-80 text-[#c7ccd4] pointer-events-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a2d32] pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1.5 rounded-none bg-[#f0a830]" />
            <span className="font-bold text-white text-xs uppercase tracking-wider">{panel.label} TELEMETRY</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onClose(); }}
            className="p-1 rounded-sm bg-[#1f2328] hover:bg-[#2a2d32] text-[#9ca3af] hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Live Telemetry Metrics */}
        <div className="space-y-2 text-xs font-mono">
          <div className="bg-[#0b0c0e] border border-[#2a2d32] p-2.5 rounded-sm flex items-center justify-between">
            <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={13} className="text-[#f0a830]" /> MODULE POWER:
            </span>
            <span className={`font-bold text-sm tabular-nums ${panel.predictedKW === 0 ? 'text-[#9ca3af]' : 'text-[#f0a830]'}`}>
              {panel.predictedKW} kW
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0b0c0e] border border-[#2a2d32] p-2 rounded-sm">
              <div className="text-[#9ca3af] text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Thermometer size={11} className="text-[#f0a830]" /> CELL TEMP:
              </div>
              <div className="font-bold text-[#c7ccd4] mt-0.5 tabular-nums">{panel.temperatureC} °C</div>
            </div>
            <div className="bg-[#0b0c0e] border border-[#2a2d32] p-2 rounded-sm">
              <div className="text-[#9ca3af] text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Gauge size={11} className="text-[#10b981]" /> EFFICIENCY:
              </div>
              <div className="font-bold text-[#10b981] mt-0.5 tabular-nums">{panel.efficiencyPct}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0b0c0e] border border-[#2a2d32] p-2 rounded-sm">
              <div className="text-[#9ca3af] text-[10px] uppercase tracking-wider">DC VOLTAGE:</div>
              <div className="font-semibold text-[#c7ccd4] mt-0.5 tabular-nums">{panel.voltageV} V</div>
            </div>
            <div className="bg-[#0b0c0e] border border-[#2a2d32] p-2 rounded-sm">
              <div className="text-[#9ca3af] text-[10px] uppercase tracking-wider">DC CURRENT:</div>
              <div className="font-semibold text-[#c7ccd4] mt-0.5 tabular-nums">{panel.currentA} A</div>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center justify-between pt-1 border-t border-[#2a2d32] uppercase tracking-wider">
            <span className="text-[#9ca3af] text-[10px]">MODULE STATUS:</span>
            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
              panel.status === 'Optimal'        ? 'bg-[#062419] text-[#10b981] border border-[#10b981]/40' :
              panel.status === 'Underperforming'? 'bg-[#2e1d0c] text-[#f59e0b] border border-[#f59e0b]/40' :
              panel.status === 'Offline'        ? 'bg-[#1c0a0a] text-[#ef4444] border border-[#ef4444]/40' :
                                                  'bg-[#1f2328] text-[#9ca3af]'
            }`}>
              {panel.status}
            </span>
          </div>

          {/* ── FAULT INJECTION CONTROLS ── */}
          <div className="pt-2 border-t border-[#2a2d32] space-y-1.5">
            <div className="text-[10px] text-[#9ca3af] uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle size={11} className="text-[#f59e0b]" />
              FAULT INJECTION (SIMULATION)
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={e => {
                  e.stopPropagation();
                  onSetFault(panel.id, 'Underperforming');
                }}
                className={`py-1.5 text-[10px] font-bold rounded-sm border uppercase tracking-wider transition-all ${
                  currentFault === 'Underperforming'
                    ? 'bg-[#2e1d0c] text-[#f59e0b] border-[#f59e0b]/50'
                    : 'bg-[#1f2328] text-[#c7ccd4] border-[#2a2d32] hover:bg-[#2a2d32]'
                }`}
              >
                {currentFault === 'Underperforming' ? '✓ DEGRADED' : 'SET DEGRADED'}
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  onSetFault(panel.id, 'Offline');
                }}
                className={`py-1.5 text-[10px] font-bold rounded-sm border uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                  currentFault === 'Offline'
                    ? 'bg-[#1c0a0a] text-[#ef4444] border-[#ef4444]/50'
                    : 'bg-[#1f2328] text-[#c7ccd4] border-[#2a2d32] hover:bg-[#2a2d32]'
                }`}
              >
                <WifiOff size={11} />
                {currentFault === 'Offline' ? '✓ OFFLINE' : 'SET OFFLINE'}
              </button>
            </div>

            {currentFault && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onSetFault(panel.id, null);
                }}
                className="w-full py-1 text-[10px] font-bold text-[#9ca3af] hover:text-[#10b981] transition-colors uppercase tracking-wider"
              >
                ↺ CLEAR FAULT — RESTORE TO OPTIMAL
              </button>
            )}
          </div>
        </div>

      </div>
    </Html>
  );
}
