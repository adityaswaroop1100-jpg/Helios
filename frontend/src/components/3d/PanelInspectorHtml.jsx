import React from 'react';
import { Html } from '@react-three/drei';
import { X, Zap, Thermometer, Gauge, AlertTriangle, Cpu, Radio, CheckCircle2 } from 'lucide-react';

export default function PanelInspectorHtml({ panel, onClose, onSetFault }) {
  if (!panel) return null;

  const currentFault = panel.status === 'Offline' ? 'Offline'
    : panel.status === 'Underperforming' ? 'Underperforming'
    : null;

  const isOffline = panel.status === 'Offline';
  const isDegraded = panel.status === 'Underperforming';

  const voltage = isOffline ? '0.0' : isDegraded ? '18.4' : (panel.voltageV || '42.1');
  const current = isOffline ? '0.0' : isDegraded ? '3.8' : (panel.currentA || '8.5');
  const powerW = isOffline ? '0' : isDegraded ? '70' : Math.round(parseFloat(voltage) * parseFloat(current));

  return (
    <Html
      position={[0, 1.4, 0]}
      center
      distanceFactor={10}
      zIndexRange={[100, 0]}
      className="pointer-events-auto select-none font-display tabular-nums"
    >
      <div className="glass-panel p-4 rounded-2xl w-80 text-white shadow-2xl border border-sky-500/40 backdrop-blur-xl">

        {/* Hardware Header with Smart Sensor Badge */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              <Cpu size={15} className="text-sky-400" />
            </div>
            <div>
              <div className="font-bold text-xs text-white uppercase tracking-wider">{panel.label || `Module A-${panel.id}`}</div>
              <div className="text-2xs text-sky-400 font-medium">Smart Optimizer P1000 · MLPE</div>
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onClose(); }}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Live Optimizer Sensor Reading */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-2.5">
          <div className="flex items-center justify-between mb-1.5 text-2xs text-slate-400">
            <span className="flex items-center gap-1">
              <Radio size={11} className={isOffline ? 'text-rose-500' : 'text-emerald-400'} />
              <span>RF SunSpec Telemetry</span>
            </span>
            <span className="text-emerald-400 font-semibold">{isOffline ? 'NO SIGNAL' : 'RSSI -62 dBm (100%)'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-2xs uppercase">DC Voltage</span>
              <div className="text-sm font-bold text-sky-400 mt-0.5">{voltage} V</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-2xs uppercase">DC Current</span>
              <div className="text-sm font-bold text-amber-400 mt-0.5">{current} A</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-2xs">
            <span className="text-slate-400">Calculated Active Power:</span>
            <span className="font-bold text-xs text-emerald-400">{powerW} W</span>
          </div>
        </div>

        {/* Operating Conditions */}
        <div className="grid grid-cols-2 gap-2 mb-2.5 text-xs">
          <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-slate-400 text-2xs flex items-center gap-1">
              <Thermometer size={12} className="text-amber-400" /> Cell Temp
            </div>
            <div className="font-bold text-slate-200 mt-0.5">{panel.temperatureC || '58.7'} °C</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-slate-400 text-2xs flex items-center gap-1">
              <Gauge size={12} className="text-emerald-400" /> MPPT Eff.
            </div>
            <div className="font-bold text-emerald-400 mt-0.5">{isOffline ? '0.0%' : '99.5%'}</div>
          </div>
        </div>

        {/* Fault Simulation Controls */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <div className="text-2xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle size={11} className="text-amber-400" />
            <span>Simulate Sensor / String Fault</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={e => {
                e.stopPropagation();
                onSetFault(panel.id, 'Underperforming');
              }}
              className={`py-1.5 text-2xs font-bold rounded-lg border uppercase tracking-wider transition-all ${
                currentFault === 'Underperforming'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900/80 text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
              }`}
            >
              Degrade (45%)
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onSetFault(panel.id, 'Offline');
              }}
              className={`py-1.5 text-2xs font-bold rounded-lg border uppercase tracking-wider transition-all ${
                currentFault === 'Offline'
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-slate-900/80 text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
              }`}
            >
              Open Circuit
            </button>
          </div>

          {currentFault && (
            <button
              onClick={e => {
                e.stopPropagation();
                onSetFault(panel.id, null);
              }}
              className="w-full py-1 text-2xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg flex items-center justify-center gap-1 transition-all"
            >
              <CheckCircle2 size={11} /> Reset to Nominal (100%)
            </button>
          )}
        </div>
      </div>
    </Html>
  );
}
