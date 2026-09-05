/**
 * EnergyComputePanel — Industrial SCADA Energy & Weather Cockpit
 */
import React, { useState } from 'react';
import { Zap, RefreshCw, Sun, Layers, Thermometer, ChevronDown, ChevronUp, MapPin, Gauge, ShieldCheck, Activity } from 'lucide-react';
import {
  countPanels,
  calculatePhysicsEnergy,
  PANEL_SPECS,
  DEFAULT_LOCATION,
} from '../../api/energyEngine';

export default function EnergyComputePanel({
  currentHourData = {},
  meteoData = null,
  faultedPanels = {},
  tiltDeg = 30,
  trackingRoll = 0,
  location = DEFAULT_LOCATION,
  onOpenLocationModal,
  onRefresh,
}) {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const panelCount = countPanels(faultedPanels);
  const activeIrradiance = currentHourData.irradiance ?? meteoData?.totalW ?? 0;
  const activeTempC = currentHourData.ambientTemp ?? meteoData?.tempC ?? 32;
  const activeCloudPct = currentHourData.cloudCover ?? meteoData?.cloudPct ?? 0;

  const physics = calculatePhysicsEnergy({
    irradianceTotalW: activeIrradiance,
    ambientTempC: activeTempC,
    effectiveCount: panelCount.effectiveCount,
    tiltDeg,
    trackingRoll,
  });

  const displayPowerKW = currentHourData.predictedKW !== undefined
    ? currentHourData.predictedKW
    : physics.powerKW;

  const isNominal = panelCount.offline === 0 && panelCount.underperforming === 0;

  const handleRefreshClick = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  return (
    <div className="data-card rounded-2xl overflow-hidden shadow-2xl">
      {/* ── Top Header Bar ── */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-wrap gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5, 14, 28, 0.65)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <Zap size={17} className="text-gold" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <span className="font-bold text-sm text-white tracking-wide">Live Energy Compute Engine</span>
              <div className="text-3xs text-slate-500 font-display">NOCT Dynamic Cell Derating · STC 1000 W/m² Baseline</div>
            </div>
            <button
              onClick={onOpenLocationModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-2xs text-cyan hover:text-cyan font-semibold transition-all hover:bg-cyan-dim"
              style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}
            >
              <MapPin size={11} />
              <span>{location.name}, {location.country}</span>
              <span className="text-slate-500 font-display">({location.latitude}°N)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-2xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 font-display"
            style={{ background: 'rgba(45,212,168,0.10)', color: '#2dd4a8', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
            Satellite Synced
          </span>
          {onRefresh && (
            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
              title="Refresh Satellite Weather Feed"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>

      {/* ── Three Telemetry Columns ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
        {/* Column 1: Array Health */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Layers size={15} className="text-cyan" />
              <span>Solar Array Health</span>
            </div>
            <span
              className={`text-3xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-display ${
                isNominal ? 'text-jade' : 'text-crimson'
              }`}
              style={{
                background: isNominal ? 'rgba(45,212,168,0.10)' : 'rgba(244,63,94,0.12)',
                border: isNominal ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(244,63,94,0.25)',
              }}
            >
              {isNominal ? '100% Online' : `${panelCount.offline} Offline`}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-white tracking-tight">
                {panelCount.active}
              </span>
              <span className="text-sm text-slate-400 font-semibold">/ {panelCount.total} Modules Active</span>
            </div>
            <p className="text-2xs text-slate-500 font-display mt-1">
              8×4 Mono-Si Array · {panelCount.effectiveCount} Equivalent Generating Units
            </p>
          </div>

          {/* 32-Module Interactive Grid */}
          <div className="grid grid-cols-8 gap-1.5 pt-1">
            {Array.from({ length: PANEL_SPECS.totalPanels }, (_, i) => {
              const panelId = i + 1;
              const fault = faultedPanels[panelId];
              return (
                <div
                  key={panelId}
                  className="h-4 rounded-md transition-all hover:scale-110 cursor-pointer shadow-sm"
                  style={{
                    background:
                      fault === 'Offline'
                        ? 'linear-gradient(135deg, #f43f5e, #be123c)'
                        : fault === 'Underperforming'
                        ? 'linear-gradient(135deg, #c9973e, #a07828)'
                        : 'linear-gradient(135deg, #0ea5e9, #0369a1)',
                    opacity: fault === 'Offline' ? 0.9 : 0.85,
                    boxShadow: fault ? '0 0 10px rgba(244,63,94,0.4)' : 'none',
                  }}
                  title={`Module A-${panelId}: ${fault || 'Optimal Conductance'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Column 2: Irradiance */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Sun size={15} className="text-gold" />
              <span>Solar Irradiance (GHI)</span>
            </div>
            <span
              className="text-3xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-display"
              style={{
                background: 'rgba(245,158,11,0.12)',
                color: '#c9973e',
                border: '1px solid rgba(245,158,11,0.25)',
              }}
            >
              {activeCloudPct}% Cloud Index
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-gold tracking-tight">
                {activeIrradiance}
              </span>
              <span className="text-sm text-slate-400 font-semibold">W/m²</span>
            </div>
            <p className="text-2xs text-slate-500 font-display mt-1">
              Direct DNI: <span className="text-slate-300 font-bold">{meteoData?.directW ?? Math.round(activeIrradiance * 0.8)}</span> ·
              Diffuse DHI: <span className="text-slate-300 font-bold">{meteoData?.diffuseW ?? Math.round(activeIrradiance * 0.2)}</span> W/m²
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2 rounded-full overflow-hidden bg-slate-900 border border-white/[0.05]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (activeIrradiance / 1000) * 100)}%`,
                  background: 'linear-gradient(90deg, #c9973e, #dbb060)',
                  boxShadow: '0 0 14px rgba(245,158,11,0.4)',
                }}
              />
            </div>
            <div className="flex justify-between text-3xs text-slate-500 font-display">
              <span>0 W/m²</span>
              <span>500</span>
              <span>1000 W/m² STC</span>
            </div>
          </div>
        </div>

        {/* Column 3: AC Yield */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Thermometer size={15} className="text-jade" />
              <span>Calculated AC Yield</span>
            </div>
            <span
              className="text-3xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-display"
              style={{
                background: 'rgba(45,212,168,0.10)',
                color: '#2dd4a8',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              {physics.efficiencyPct}% Net Eff.
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-jade tracking-tight">
                {displayPowerKW}
              </span>
              <span className="text-sm text-slate-400 font-semibold">kW Active</span>
            </div>
            <p className="text-2xs text-slate-500 font-display mt-1">
              Cell Temp: <span className="text-slate-300 font-bold">{currentHourData.panelTemp ?? physics.panelTempC}°C</span> ·
              Ambient: <span className="text-slate-300 font-bold">{activeTempC}°C</span>
            </p>
          </div>

          <button
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 transition-all hover:text-white hover:bg-white/[0.04] border border-white/[0.06]"
          >
            <span>{showFormulaDetails ? 'Hide Physics Equations' : 'View Photovoltaic Formulas'}</span>
            {showFormulaDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Formula Physics Details Drawer */}
      {showFormulaDetails && (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 pb-6 pt-4 animate-fadeInFast border-t border-white/[0.06] bg-slate-950/40"
        >
          {[
            ['Aperture Total Area', `${PANEL_SPECS.totalAreaM2.toFixed(2)} m²`, 'text-white'],
            ['Angle of Incidence (AOI)', physics.aoiFactor, 'text-cyan'],
            ['NOCT Thermal Derate', physics.tempDerate, 'text-gold'],
            ['Central Inverter MPPT', '98.4%', 'text-jade'],
          ].map(([label, val, color]) => (
            <div
              key={label}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1 shadow-sm"
            >
              <div className="text-3xs text-slate-400 font-semibold uppercase tracking-wider">{label}</div>
              <div className={`font-display font-extrabold text-sm ${color}`}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
