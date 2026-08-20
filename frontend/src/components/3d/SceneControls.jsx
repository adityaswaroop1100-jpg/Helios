import React from 'react';
import { Sun, Moon, Clock, Play, Pause, Activity, HelpCircle, Cloud, CloudOff, Gauge } from 'lucide-react';

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

  return (
    <div className="bg-[#141619] border border-[#2a2d32] rounded-sm p-4 shadow-none space-y-4 font-mono">

      {/* ── Row 1: Operational State + Tour Trigger ── */}
      <div className="bg-[#0b0c0e] border border-[#2a2d32] p-3 rounded-sm text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#c7ccd4]">
        <div className="flex items-start gap-2.5">
          <Activity size={16} className="text-[#f0a830] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
              <span>ARRAY OPERATIONAL STATE</span>
              <span className="text-[10px] text-[#f0a830] bg-[#1f2328] px-1.5 py-0.5 rounded-sm border border-[#2a2d32] tabular-nums">
                {String(hourOfDay).padStart(2, '0')}:00
              </span>
            </div>
            <p className="text-[#9ca3af] text-xs leading-relaxed font-sans">
              {getSceneExplanation(hourOfDay, currentHourData?.predictedKW || 0)}
            </p>
          </div>
        </div>

        <button
          onClick={onStartTour}
          className={`px-3.5 py-1.5 rounded-sm font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all uppercase tracking-wider ${
            isTourActive
              ? 'bg-[#f0a830] text-[#0b0c0e]'
              : 'bg-[#1f2328] hover:bg-[#2a2d32] text-[#c7ccd4] border border-[#2a2d32]'
          }`}
        >
          <HelpCircle size={14} className={isTourActive ? 'text-[#0b0c0e]' : 'text-[#f0a830]'} />
          <span>{isTourActive ? '3D TOUR ACTIVE' : 'START 3D TOUR'}</span>
        </button>
      </div>

      {/* ── Row 2: Panel Tilt + Cloud Injection Controls ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Panel Tilt Angle Slider */}
        <div className="bg-[#0b0c0e] border border-[#2a2d32] rounded-sm p-3 space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider">
            <div className="flex items-center gap-1.5 text-[#c7ccd4]">
              <Gauge size={14} className="text-[#f0a830]" />
              <span>PANEL TILT ANGLE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#f0a830] font-bold tabular-nums">{panelTiltDeg}°</span>
              <span className="text-[#9ca3af] tabular-nums text-[10px]">
                EFF: {(tiltEfficiencyFactor * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={panelTiltDeg}
            onChange={e => onChangeTilt(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-[#1f2328] border border-[#2a2d32] rounded-none appearance-none cursor-pointer accent-[#f0a830]"
          />
          <div className="flex justify-between text-[10px] text-[#9ca3af] uppercase tracking-wider">
            <span>10° FLAT</span>
            <span className={panelTiltDeg === 25 ? 'text-[#10b981] font-bold' : ''}>25° OPTIMAL</span>
            <span>60° STEEP</span>
          </div>
        </div>

        {/* Cloud Injection */}
        <div className="bg-[#0b0c0e] border border-[#2a2d32] rounded-sm p-3 space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider">
            <div className="flex items-center gap-1.5 text-[#c7ccd4]">
              <Cloud size={14} className={isCloudActive ? 'text-[#f59e0b]' : 'text-[#9ca3af]'} />
              <span>CLOUD INJECTION</span>
            </div>
            {isCloudActive && (
              <span className="text-[#f59e0b] font-bold tabular-nums text-[10px]">
                SHADOW: -{Math.round(cloudShadowFactor * 100)}%
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onInjectCloud}
              disabled={isCloudActive}
              className={`flex-1 py-1.5 text-xs font-bold rounded-sm border flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider ${
                isCloudActive
                  ? 'bg-[#1a1209] border-[#f59e0b]/30 text-[#f59e0b] cursor-not-allowed'
                  : 'bg-[#1f2328] border-[#2a2d32] text-[#c7ccd4] hover:bg-[#2a2d32] cursor-pointer'
              }`}
            >
              <Cloud size={13} />
              <span>{isCloudActive ? 'CLOUD ACTIVE' : 'INJECT CLOUD'}</span>
            </button>

            {isCloudActive && (
              <button
                onClick={onClearCloud}
                className="px-3 py-1.5 text-xs font-bold rounded-sm border border-[#2a2d32] bg-[#1f2328] text-[#9ca3af] hover:text-white hover:bg-[#2a2d32] flex items-center gap-1 transition-all uppercase tracking-wider"
              >
                <CloudOff size={13} />
                <span>CLEAR</span>
              </button>
            )}
          </div>

          {isCloudActive && (
            <div className="w-full bg-[#1f2328] h-1.5 rounded-none overflow-hidden border border-[#2a2d32]">
              <div
                className="bg-[#f59e0b] h-full transition-all duration-1000"
                style={{ width: `${Math.round(cloudShadowFactor * 100)}%` }}
              />
            </div>
          )}
          {!isCloudActive && (
            <p className="text-[10px] text-[#9ca3af] font-sans">
              Simulate a 30-second transient cloud shadow across the array — irradiance drops, anomaly triggers.
            </p>
          )}
        </div>
      </div>

      {/* ── Row 3: Time Slider ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-[#c7ccd4] uppercase tracking-wider">
          <Clock size={15} className="text-[#f0a830]" />
          <span>SIMULATION TIME:</span>
          <span className="font-mono text-[#f0a830] font-bold bg-[#0b0c0e] px-2 py-0.5 rounded-sm border border-[#2a2d32] tabular-nums">
            {String(hourOfDay).padStart(2, '0')}:00
          </span>
        </div>

        <div className="flex items-center gap-1.5 uppercase tracking-wider flex-wrap">
          {[['Dawn', 6], ['Noon', 12], ['Dusk', 18], ['Night', 22]].map(([label, h]) => (
            <button
              key={label}
              onClick={() => onChangeHour(h)}
              className={`px-2.5 py-1 rounded-sm border border-[#2a2d32] text-xs transition-colors ${
                h === 12
                  ? 'bg-[#1f2328] text-[#f0a830] hover:bg-[#2a2d32] font-bold'
                  : h === 22
                    ? 'bg-[#0b0c0e] text-[#9ca3af] hover:bg-[#1f2328]'
                    : 'bg-[#1f2328] text-[#c7ccd4] hover:bg-[#2a2d32]'
              }`}
            >
              {label.toUpperCase()} ({String(h).padStart(2, '0')}:00)
            </button>
          ))}
          <button
            onClick={onToggleAutoPlay}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-sm border font-bold text-xs transition-all ${
              isAutoPlay
                ? 'bg-[#f0a830] text-[#0b0c0e] border-[#f0a830]'
                : 'bg-[#1f2328] text-[#c7ccd4] border-[#2a2d32] hover:bg-[#2a2d32]'
            }`}
          >
            {isAutoPlay ? <Pause size={13} /> : <Play size={13} />}
            <span>{isAutoPlay ? 'PAUSE CYCLE' : 'PLAY 24H CYCLE'}</span>
          </button>
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <Moon size={16} className="text-[#9ca3af] shrink-0" />
        <input
          type="range"
          min="0"
          max="23"
          step="1"
          value={hourOfDay}
          onChange={e => onChangeHour(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-[#0b0c0e] border border-[#2a2d32] rounded-none appearance-none cursor-pointer accent-[#f0a830]"
        />
        <Sun size={18} className="text-[#f0a830] shrink-0" />
      </div>

      {/* ── Footer: selected panel info ── */}
      <div className="flex items-center justify-between text-[11px] text-[#9ca3af] pt-1 border-t border-[#2a2d32] uppercase tracking-wider">
        <span>CLICK ANY MODULE IN 3D TO INSPECT TELEMETRY & INJECT FAULTS.</span>
        <div className="font-mono text-[#c7ccd4]">
          {selectedPanel ? (
            <span className="text-[#f0a830] font-bold">
              SELECTED: {selectedPanel.label} ({selectedPanel.predictedKW} kW — {selectedPanel.status})
            </span>
          ) : (
            <span>NO MODULE SELECTED</span>
          )}
        </div>
      </div>
    </div>
  );
}
