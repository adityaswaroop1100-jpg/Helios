import React from 'react';
import { Sun, Moon, Clock, Play, Pause, Activity, HelpCircle, Cloud, CloudOff, Gauge, Compass } from 'lucide-react';

export default function SceneControls({
  hourOfDay,
  onChangeHour,
  isAutoPlay,
  onToggleAutoPlay,
  selectedPanel,
  currentHourData,
  onStartTour,
  isTourActive,
  panelTiltDeg,
  onChangeTilt,
  cloudShadowFactor,
  onInjectCloud,
  onClearCloud,
  tiltEfficiencyFactor,
}) {
  const isCloudActive = cloudShadowFactor > 0;

  const getSceneExplanation = (hour, kw) => {
    if (hour >= 6 && hour <= 8)  return `Solar Irradiance Ramp (06:00–08:00): Sun rising on horizon. Array power ramping to ${kw} kW.`;
    if (hour >= 9 && hour <= 15) return currentHourData?.isAnomaly
      ? `Transient Cloud Anomaly (${hour}:00): Irradiance dip detected. Array output: ${kw} kW. Inverter MPPT tracking active.`
      : `Peak Irradiance Phase (${hour}:00): Sun at peak altitude angle. Array operating at peak capacity (${kw} kW).`;
    if (hour >= 16 && hour <= 18) return `Solar Irradiance Taper (${hour}:00): Sunset phase. Declining solar incidence angle (${kw} kW).`;
    return `Nocturnal Standby (${hour}:00): Zero solar irradiance. Array in standby mode (0 kW).`;
  };

  const isDay = hourOfDay >= 6 && hourOfDay <= 19;

  return (
    <div className="data-card rounded-2xl p-6 space-y-4 shadow-2xl">
      {/* ── Row 1: Array Status Banner ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all"
        style={{
          background: currentHourData?.isAnomaly
            ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(244,63,94,0.08))'
            : isDay
            ? 'linear-gradient(135deg, rgba(16,185,129,0.10), rgba(56,189,248,0.06))'
            : 'rgba(8,18,36,0.7)',
          borderColor: currentHourData?.isAnomaly
            ? 'rgba(245,158,11,0.35)'
            : isDay
            ? 'rgba(16,185,129,0.25)'
            : 'rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
              currentHourData?.isAnomaly ? 'bg-amber-500/20' : isDay ? 'bg-emerald-500/20' : 'bg-slate-800'
            }`}
          >
            <Activity
              size={18}
              className={currentHourData?.isAnomaly ? 'text-amber-400' : isDay ? 'text-emerald-400' : 'text-slate-500'}
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
              <span className="font-bold text-xs uppercase tracking-widest text-white font-display">Array Operational State</span>
              <span className="text-xs font-display font-bold px-2.5 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700/60 text-amber-400">
                {String(hourOfDay).padStart(2, '0')}:00
              </span>
              {currentHourData?.isAnomaly && (
                <span className="text-3xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider animate-pulse">
                  ⚡ Anomaly
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl mt-0.5">
              {getSceneExplanation(hourOfDay, currentHourData?.predictedKW || 0)}
            </p>
          </div>
        </div>

        <button
          onClick={onStartTour}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex-shrink-0 shadow-md hover:scale-105 active:scale-95 ${
            isTourActive
              ? 'bg-amber-500 text-slate-950 shadow-glow'
              : 'glass-panel border border-slate-700 text-slate-200 hover:text-white hover:border-slate-500'
          }`}
        >
          <HelpCircle size={15} />
          <span>{isTourActive ? '3D Tour Active' : 'Start 3D Tour'}</span>
        </button>
      </div>

      {/* ── Row 2: Tilt + Cloud Controls ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tilt Slider */}
        <div className="p-4 rounded-xl border border-white/[0.07] bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Gauge size={15} className="text-sky-400" />
              <span>Panel Tilt Angle</span>
            </div>
            <div className="flex items-center gap-2 font-display">
              <span className="font-bold text-sm text-amber-400">{panelTiltDeg}°</span>
              <span
                className={`text-3xs font-semibold px-2 py-0.5 rounded-full ${
                  Math.abs(panelTiltDeg - 25) < 4
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {(tiltEfficiencyFactor * 100).toFixed(1)}% Eff
              </span>
            </div>
          </div>

          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={panelTiltDeg}
            onChange={(e) => onChangeTilt(parseInt(e.target.value, 10))}
            className="w-full"
          />

          <div className="flex justify-between text-3xs text-slate-500 font-display uppercase tracking-wider">
            <span>10° Flat</span>
            <span className={panelTiltDeg === 25 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>25° Optimal ✓</span>
            <span>60° Steep</span>
          </div>
        </div>

        {/* Cloud Injection */}
        <div className="p-4 rounded-xl border border-white/[0.07] bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: isCloudActive ? '#f59e0b' : '#94a3b8' }}
            >
              <Cloud size={15} />
              <span>Cloud Occlusion Injection</span>
            </div>
            {isCloudActive && (
              <span className="text-3xs font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse font-display">
                −{Math.round(cloudShadowFactor * 100)}% IRR
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onInjectCloud}
              disabled={isCloudActive}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 uppercase tracking-wider transition-all shadow-sm ${
                isCloudActive
                  ? 'border-amber-500/30 text-amber-400 cursor-not-allowed bg-amber-500/10'
                  : 'glass-panel border-slate-700 text-slate-200 hover:text-white hover:border-slate-500 hover:scale-[1.02]'
              }`}
            >
              <Cloud size={14} />
              <span>{isCloudActive ? 'Cloud Active' : 'Inject Cloud'}</span>
            </button>
            {isCloudActive && (
              <button
                onClick={onClearCloud}
                className="px-3.5 py-2 text-xs font-bold rounded-xl glass-panel border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 flex items-center gap-1.5 transition-all"
              >
                <CloudOff size={14} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {isCloudActive ? (
            <div className="space-y-1">
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000"
                  style={{ width: `${Math.round(cloudShadowFactor * 100)}%` }}
                />
              </div>
              <div className="text-3xs text-amber-400/80 text-center font-display">Shadow dissipating…</div>
            </div>
          ) : (
            <p className="text-3xs text-slate-500 leading-relaxed font-display">
              Simulates a transient cloud passing across the 32-panel array to test real-time MPPT derating.
            </p>
          )}
        </div>
      </div>

      {/* ── Row 3: Time of Day Controls ── */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Clock size={15} className="text-amber-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-display">Simulation Time:</span>
            <span className="font-display font-bold text-sm text-amber-400 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700/60 shadow-sm">
              {String(hourOfDay).padStart(2, '0')}:00
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              ['Dawn', 6, '🌅'],
              ['Noon', 12, '☀'],
              ['Dusk', 18, '🌆'],
              ['Night', 22, '🌙'],
            ].map(([label, h, emoji]) => (
              <button
                key={label}
                onClick={() => onChangeHour(h)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                  hourOfDay === h
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-glow'
                    : 'glass-panel border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                }`}
              >
                {emoji} {label}
              </button>
            ))}
            <button
              onClick={onToggleAutoPlay}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95 ${
                isAutoPlay
                  ? 'bg-amber-500 text-slate-950 shadow-glow'
                  : 'glass-panel border border-slate-700 text-slate-200 hover:text-white hover:border-amber-500/40'
              }`}
            >
              {isAutoPlay ? <Pause size={13} /> : <Play size={13} />}
              <span>{isAutoPlay ? 'Pause' : 'Play 24h'}</span>
            </button>
          </div>
        </div>

        {/* Time slider */}
        <div className="flex items-center gap-3">
          <Moon size={16} className="text-slate-500 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={hourOfDay}
            onChange={(e) => onChangeHour(parseInt(e.target.value, 10))}
            className="flex-1"
          />
          <Sun size={18} className="text-amber-400 flex-shrink-0" />
        </div>
      </div>

      {/* ── Footer Status ── */}
      <div className="flex items-center justify-between text-3xs text-slate-500 pt-3 border-t border-white/[0.06] flex-wrap gap-2 font-display">
        <span>Interactive 3D View: Drag to rotate · Scroll to zoom · Click any module to inspect string voltage</span>
        <div>
          {selectedPanel ? (
            <span className="text-sky-400 font-semibold">
              Selected: {selectedPanel.label} · {selectedPanel.predictedKW} kW · {selectedPanel.status}
            </span>
          ) : (
            <span>No module selected</span>
          )}
        </div>
      </div>
    </div>
  );
}
