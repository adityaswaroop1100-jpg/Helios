import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sun, Box, LayoutGrid, BarChart2, Clock, HelpCircle } from 'lucide-react';
import {
  generate24HourForecast,
  calculatePanelOutputs,
  getExactOutputForFractionalHour
} from './api/forecastApi';

import ForecastChart from './components/dashboard/ForecastChart';
import RecommendationBanner from './components/dashboard/RecommendationBanner';
import AnomalyPanel from './components/dashboard/AnomalyPanel';
import FeatureImportance from './components/dashboard/FeatureImportance';
import CostEstimate from './components/dashboard/CostEstimate';

import Solar3DScene from './components/3d/Solar3DScene';
import SceneControls from './components/3d/SceneControls';
import OnboardingModal from './components/onboarding/OnboardingModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('3d');

  // Live clock
  const [isLiveClock, setIsLiveClock] = useState(true);
  const [now, setNow] = useState(new Date());
  const [hourOfDay, setHourOfDay] = useState(() => new Date().getHours());
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // Panel selection
  const [selectedPanel, setSelectedPanel] = useState(null);

  // Tour / formula highlights / onboarding
  const [tourStep, setTourStep] = useState(null);
  const [activeFormulaHighlight, setActiveFormulaHighlight] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // ── PART 2: new interactivity state ─────────────────────────────────────
  // Panel tilt angle (degrees, 10–60) — drives both 3D geometry and output calc
  const [panelTiltDeg, setPanelTiltDeg] = useState(30);

  // Cloud injection: null = none, or { startedAt: ms, durationMs }
  const [cloudInjection, setCloudInjection] = useState(null);

  // Faulted panels: Map<id, 'Underperforming' | 'Offline'>
  const [faultedPanels, setFaultedPanels] = useState({});
  // ────────────────────────────────────────────────────────────────────────

  // Live clock interval — single interval, batched updates
  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date();
      setNow(current);
      if (isLiveClock) setHourOfDay(current.getHours());

      // Auto-expire cloud injection after its duration
      setCloudInjection(prev => {
        if (!prev) return null;
        const elapsed = Date.now() - prev.startedAt;
        return elapsed >= prev.durationMs ? null : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLiveClock]);

  const hourlyData = useMemo(() => generate24HourForecast(), []);

  const currentFractionalHour = isLiveClock
    ? now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600
    : hourOfDay;

  // Cloud shadow factor (0 = no cloud, up to 0.72 at peak injection)
  const cloudShadowFactor = useMemo(() => {
    if (!cloudInjection) return 0;
    const elapsed = Date.now() - cloudInjection.startedAt;
    const progress = Math.min(1, elapsed / cloudInjection.durationMs);
    // Bell-curve shadow: rises to peak at 40%, falls back to 0 by end
    return Math.sin(progress * Math.PI) * 0.72;
  }, [cloudInjection, now]); // `now` causes re-eval every second

  // Tilt efficiency factor: cos(tilt - optimal) simplified
  const tiltEfficiencyFactor = useMemo(() => {
    const optimalTilt = 25; // degrees for this latitude
    const delta = Math.abs(panelTiltDeg - optimalTilt);
    return Math.max(0.5, 1 - (delta / 100));
  }, [panelTiltDeg]);

  const currentHourData = useMemo(() => {
    const buildData = (baseKW, base) => {
      const afterCloud = baseKW * (1 - cloudShadowFactor);
      const afterTilt  = afterCloud * tiltEfficiencyFactor;
      const predictedKW = Number(Math.max(0, afterTilt).toFixed(2));
      return {
        ...base,
        predictedKW,
        irradiance: Math.round((base.irradiance || 0) * (1 - cloudShadowFactor) * tiltEfficiencyFactor),
        cloudCover: Math.round((base.cloudCover || 0) + cloudShadowFactor * 100),
        isAnomaly: base.isAnomaly || cloudShadowFactor > 0.25,
        anomalyDescription: cloudShadowFactor > 0.25
          ? `Cloud injection active — irradiance suppressed by ${Math.round(cloudShadowFactor * 100)}%`
          : base.anomalyDescription,
      };
    };

    if (isLiveClock) {
      const exact = getExactOutputForFractionalHour(currentFractionalHour);
      const base = hourlyData[now.getHours()] || hourlyData[10];
      return buildData(exact.predictedKW, {
        ...base,
        predictedKW: exact.predictedKW,
        irradiance: exact.irradiance,
        timeLabel: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }
    return buildData(
      hourlyData[hourOfDay]?.predictedKW ?? 0,
      hourlyData[hourOfDay] || hourlyData[10]
    );
  }, [isLiveClock, currentFractionalHour, hourOfDay, hourlyData, now, cloudShadowFactor, tiltEfficiencyFactor]);

  // Panel outputs — also apply per-panel faults
  const panelDataList = useMemo(() => {
    const base = calculatePanelOutputs(currentHourData.predictedKW);
    return base.map(p => {
      const fault = faultedPanels[p.id];
      if (fault === 'Offline') {
        return { ...p, predictedKW: 0, voltageV: 0, currentA: 0, status: 'Offline' };
      }
      if (fault === 'Underperforming') {
        return {
          ...p,
          predictedKW: Number((p.predictedKW * 0.45).toFixed(2)),
          status: 'Underperforming',
        };
      }
      return p;
    });
  }, [currentHourData.predictedKW, faultedPanels]);

  // Auto-play diurnal cycle
  useEffect(() => {
    let interval = null;
    if (isAutoPlay && !isLiveClock) {
      interval = setInterval(() => setHourOfDay(prev => (prev + 1) % 24), 1500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isAutoPlay, isLiveClock]);

  // Tour handlers
  const handleStartTour   = useCallback(() => { setActiveTab('3d'); setTourStep(0); setIsLiveClock(false); }, []);
  const handleNextTourStep = useCallback(() => setTourStep(s => (s !== null && s < 4 ? s + 1 : s)), []);
  const handlePrevTourStep = useCallback(() => setTourStep(s => (s !== null && s > 0 ? s - 1 : s)), []);
  const handleEndTour      = useCallback(() => setTourStep(null), []);

  // Cloud injection handler
  const handleInjectCloud = useCallback(() => {
    setCloudInjection({ startedAt: Date.now(), durationMs: 30000 }); // 30-second event
    setIsLiveClock(false);
  }, []);

  const handleClearCloud = useCallback(() => setCloudInjection(null), []);

  // Panel fault handler
  const handleSetPanelFault = useCallback((panelId, faultType) => {
    setFaultedPanels(prev => {
      const next = { ...prev };
      if (!faultType || next[panelId] === faultType) {
        delete next[panelId]; // toggle off
      } else {
        next[panelId] = faultType;
      }
      return next;
    });
  }, []);

  const Scene3D = (
    <Solar3DScene
      hourOfDay={isLiveClock ? currentFractionalHour : hourOfDay}
      panelDataList={panelDataList}
      selectedPanel={selectedPanel}
      onSelectPanel={setSelectedPanel}
      currentKW={currentHourData.predictedKW}
      tourStep={tourStep}
      onNextTourStep={handleNextTourStep}
      onPrevTourStep={handlePrevTourStep}
      onEndTour={handleEndTour}
      activeFormulaHighlight={activeFormulaHighlight}
      onFormulaHover={setActiveFormulaHighlight}
      panelTiltDeg={panelTiltDeg}
      cloudShadowFactor={cloudShadowFactor}
      faultedPanels={faultedPanels}
      onSetPanelFault={handleSetPanelFault}
    />
  );

  const Controls = (
    <SceneControls
      hourOfDay={isLiveClock ? now.getHours() : hourOfDay}
      onChangeHour={h => { setIsLiveClock(false); setHourOfDay(h); }}
      isAutoPlay={isAutoPlay}
      onToggleAutoPlay={() => { setIsLiveClock(false); setIsAutoPlay(!isAutoPlay); }}
      selectedPanel={selectedPanel}
      currentHourData={currentHourData}
      onStartTour={handleStartTour}
      isTourActive={tourStep !== null}
      panelTiltDeg={panelTiltDeg}
      onChangeTilt={setPanelTiltDeg}
      cloudShadowFactor={cloudShadowFactor}
      onInjectCloud={handleInjectCloud}
      onClearCloud={handleClearCloud}
      tiltEfficiencyFactor={tiltEfficiencyFactor}
    />
  );

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-[#c7ccd4] font-sans flex flex-col antialiased">
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onStartTour={handleStartTour}
      />

      {/* Navbar */}
      <header className="border-b border-[#2a2d32] bg-[#141619] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-[#1f2328] border border-[#2a2d32] text-[#f0a830]">
              <Sun size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-bold tracking-widest text-[#f9fafb] uppercase font-mono">
                  HELIOS <span className="text-[#9ca3af] font-sans text-[11px] tracking-wider">— 48.0 kW PHOTOVOLTAIC SCADA</span>
                </h1>
                <span className="text-[10px] font-mono font-bold bg-[#1f2328] text-[#f0a830] border border-[#2a2d32] px-2 py-0.5 rounded-sm flex items-center gap-1">
                  <span className="w-2 h-1 rounded-none bg-[#f0a830]" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-[#9ca3af] font-mono tracking-wider">
                SYSTEM CLOCK SYNC: AUG 20, {now.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center bg-[#0b0c0e] p-1 rounded-sm border border-[#2a2d32] text-xs font-mono">
            {[['3d', Box, '3D ARRAY'], ['2d', BarChart2, '2D CHART'], ['split', LayoutGrid, 'SPLIT']].map(([key, Icon, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm font-semibold transition-all ${
                  activeTab === key
                    ? 'bg-[#1f2328] text-[#f0a830] border border-[#2a2d32] font-bold'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => { setIsLiveClock(!isLiveClock); if (!isLiveClock) setIsAutoPlay(false); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border font-bold text-xs transition-all ${
                isLiveClock
                  ? 'bg-[#1f2328] text-[#f0a830] border-[#2a2d32]'
                  : 'bg-[#141619] text-[#9ca3af] border-[#2a2d32] hover:bg-[#1f2328]'
              }`}
            >
              <Clock size={13} className="text-[#f0a830]" />
              <span>{isLiveClock ? `LIVE: ${now.toLocaleTimeString()}` : 'ENABLE LIVE CLOCK'}</span>
            </button>

            <button
              onClick={handleStartTour}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2328] hover:bg-[#2a2d32] text-[#c7ccd4] border border-[#2a2d32] rounded-sm font-bold transition-all text-xs"
            >
              <HelpCircle size={13} />
              <span>3D TOUR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6 flex-1 w-full">
        <CostEstimate hourlyData={hourlyData} currentHour={isLiveClock ? now.getHours() : hourOfDay} />
        <RecommendationBanner currentHourData={currentHourData} />

        {activeTab === '3d' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#c7ccd4] uppercase tracking-widest font-mono flex items-center gap-2">
                <Box size={16} className="text-[#f0a830]" />
                PHOTOVOLTAIC SYSTEM & SUBSTATION SCADA
              </h2>
              <span className="text-[11px] text-[#9ca3af] font-mono">
                DRAG TO ROTATE • CLICK MODULE FOR TELEMETRY • HOVER METRICS FOR FORMULAS
              </span>
            </div>
            {Scene3D}
            {Controls}
          </div>
        )}

        {activeTab === '2d' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ForecastChart
                hourlyData={hourlyData}
                currentHour={isLiveClock ? now.getHours() : hourOfDay}
                onSelectHour={h => { setIsLiveClock(false); setHourOfDay(h); }}
              />
            </div>
            <div className="space-y-6">
              <AnomalyPanel currentHourData={currentHourData} />
              <FeatureImportance />
            </div>
          </div>
        )}

        {activeTab === 'split' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#c7ccd4] uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Box size={14} className="text-[#f0a830]" /> 3D PHOTOVOLTAIC SCADA
                  </h3>
                  <span className="text-xs font-mono text-[#f0a830] font-bold">
                    OUTPUT: {currentHourData.predictedKW} kW
                  </span>
                </div>
                {Scene3D}
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#c7ccd4] uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <BarChart2 size={14} className="text-[#f0a830]" /> 24H PREDICTION CHART
                </h3>
                <ForecastChart
                  hourlyData={hourlyData}
                  currentHour={isLiveClock ? now.getHours() : hourOfDay}
                  onSelectHour={h => { setIsLiveClock(false); setHourOfDay(h); }}
                />
              </div>
            </div>
            {Controls}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnomalyPanel currentHourData={currentHourData} />
              <FeatureImportance />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#2a2d32] bg-[#0b0c0e] py-3 text-center text-[11px] font-mono text-[#9ca3af] uppercase tracking-wider">
        HELIOS PHOTOVOLTAIC SCADA • REACT THREE FIBER ENGINE • GOOGLE CLOUD PIPELINE
      </footer>
    </div>
  );
}
