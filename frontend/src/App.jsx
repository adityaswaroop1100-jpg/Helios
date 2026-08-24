import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sun, Box, LayoutGrid, BarChart2, Clock, HelpCircle, LayoutDashboard, MapPin, Building2, Flame } from 'lucide-react';
import {
  generate24HourForecast,
  calculatePanelOutputs,
  getOutputFromHourlyData
} from './api/forecastApi';

import ForecastChart from './components/dashboard/ForecastChart';
import RecommendationBanner from './components/dashboard/RecommendationBanner';
import AnomalyPanel from './components/dashboard/AnomalyPanel';
import FeatureImportance from './components/dashboard/FeatureImportance';
import CostEstimate from './components/dashboard/CostEstimate';
import HistorianView from './components/dashboard/HistorianView';

import Solar3DScene from './components/3d/Solar3DScene';
import SceneControls from './components/3d/SceneControls';
import OnboardingModal from './components/onboarding/OnboardingModal';
import EnergyComputePanel from './components/dashboard/EnergyComputePanel';
import LocationModal from './components/dashboard/LocationModal';
import ControlRoomInterior3D from './components/3d/ControlRoomInterior3D';
import { fetchLiveIrradiance, fetch24HourMeteoForecast, DEFAULT_LOCATION } from './api/energyEngine';
import { streamTelemetryToCloud, streamEventToCloud } from './api/cloudScadaDatabase';

function getCityLocalTime(location) {
  try {
    const tz = location?.timezone && location.timezone !== 'auto' ? location.timezone : undefined;
    const str = new Date().toLocaleString('en-US', { timeZone: tz });
    return new Date(str);
  } catch (e) {
    return new Date();
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('3d');
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('helios_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch (e) {
      return DEFAULT_LOCATION;
    }
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showControlRoomModal, setShowControlRoomModal] = useState(false);
  const [meteoData, setMeteoData] = useState(null);
  const [hourlyData, setHourlyData] = useState(() => generate24HourForecast());

  // Fetch Open-Meteo weather whenever location changes
  const loadMeteo = useCallback(async () => {
    const [liveData, forecastData] = await Promise.all([
      fetchLiveIrradiance(location),
      fetch24HourMeteoForecast(location),
    ]);
    if (liveData) setMeteoData(liveData);
    if (forecastData && forecastData.hours) {
      setHourlyData(forecastData.hours);
    }
  }, [location]);

  useEffect(() => {
    loadMeteo();
    const interval = setInterval(loadMeteo, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadMeteo]);

  const handleSelectLocation = (newLoc) => {
    setLocation(newLoc);
    try {
      localStorage.setItem('helios_location', JSON.stringify(newLoc));
    } catch (e) {
      // ignore
    }
  };

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

  const [trackingMode, setTrackingMode] = useState('fixed');
  const [panelTiltDeg, setPanelTiltDeg] = useState(30);
  const [cloudInjection, setCloudInjection] = useState(null);
  const [faultedPanels, setFaultedPanels] = useState({});

  // Real-time clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date();
      setNow(current);

      setCloudInjection(prev => {
        if (!prev) return null;
        const elapsed = Date.now() - prev.startedAt;
        return elapsed >= prev.durationMs ? null : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute local time at the selected solar node
  const cityNow = useMemo(() => getCityLocalTime(location), [location, now]);

  const currentFractionalHour = isLiveClock
    ? cityNow.getHours() + cityNow.getMinutes() / 60 + cityNow.getSeconds() / 3600
    : hourOfDay;

  const currentActiveHour = isLiveClock ? cityNow.getHours() : hourOfDay;

  // Cloud shadow factor
  const cloudShadowFactor = useMemo(() => {
    if (!cloudInjection) return 0;
    const elapsed = Date.now() - cloudInjection.startedAt;
    const progress = Math.min(1, elapsed / cloudInjection.durationMs);
    return Math.sin(progress * Math.PI) * 0.72;
  }, [cloudInjection, now]);

  // Tilt efficiency factor
  const tiltEfficiencyFactor = useMemo(() => {
    const optimalTilt = 25;
    const delta = Math.abs(panelTiltDeg - optimalTilt);
    return Math.max(0.5, 1 - (delta / 100));
  }, [panelTiltDeg]);

  const currentHourData = useMemo(() => {
    const sunT = (currentFractionalHour - 5) / 14; 
    let sunX = 0, sunY = -1, sunZ = 0;
    if (sunT >= 0 && sunT <= 1) {
      const a = sunT * Math.PI;
      sunX = -Math.cos(a) * 26;
      sunY = Math.sin(a) * 20;
      sunZ = 10 + Math.sin(a) * 5;
    }
    const len = Math.sqrt(sunX*sunX + sunY*sunY + sunZ*sunZ) || 1;
    const Sx = sunX / len, Sy = sunY / len, Sz = sunZ / len;

    const theta = -Math.PI / 2 + (panelTiltDeg * Math.PI) / 180;
    const A = Sx;
    const B = Sz * Math.cos(theta) - Sy * Math.sin(theta);
    
    const cosFixed = Math.max(0, B);
    const cosTracked = Math.max(0, Math.sqrt(A*A + B*B));
    
    const rawGain = cosFixed > 0.05 ? (cosTracked / cosFixed) - 1 : 0;
    const gainPct = Math.min(0.25, Math.max(0, rawGain)); 
    const trackingMultiplier = 1 + gainPct;

    const buildData = (baseKW, base) => {
      const afterCloud = baseKW * (1 - cloudShadowFactor);
      const afterTilt  = afterCloud * tiltEfficiencyFactor;
      
      const fixedKW = Number(Math.max(0, afterTilt).toFixed(2));
      const trackedKW = Number(Math.max(0, afterTilt * trackingMultiplier).toFixed(2));
      const predictedKW = trackingMode === 'tracking' ? trackedKW : fixedKW;

      const isWeatherAnomaly = (base.cloudCover > 60 && base.irradiance < 300 && (currentFractionalHour >= 10 && currentFractionalHour <= 15));
      const isCloudInjectionAnomaly = cloudShadowFactor > 0.25;
      const isAnomaly = isCloudInjectionAnomaly || isWeatherAnomaly;

      return {
        ...base,
        predictedKW,
        fixedKW,
        trackedKW,
        gainPct: Math.round(gainPct * 100),
        irradiance: Math.round((base.irradiance || 0) * (1 - cloudShadowFactor) * tiltEfficiencyFactor * (trackingMode === 'tracking' ? trackingMultiplier : 1)),
        cloudCover: Math.round((base.cloudCover || 0) + cloudShadowFactor * 100),
        isAnomaly,
        anomalyDescription: isCloudInjectionAnomaly
          ? `Simulated cloud transient active — irradiance suppressed by ${Math.round(cloudShadowFactor * 100)}%`
          : (isWeatherAnomaly ? `Heavy atmospheric cloud occlusion (${base.cloudCover}%) suppressing solar yield in ${location.name}` : null),
      };
    };

    if (isLiveClock) {
      const exact = getOutputFromHourlyData(hourlyData, currentFractionalHour);
      const base = hourlyData[cityNow.getHours()] || hourlyData[12] || {};
      return buildData(exact.predictedKW, {
        ...base,
        predictedKW: exact.predictedKW,
        irradiance: exact.irradiance,
        timeLabel: cityNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }

    return buildData(
      hourlyData[hourOfDay]?.predictedKW ?? 0,
      hourlyData[hourOfDay] ?? {
        hour: hourOfDay,
        timeLabel: `${String(hourOfDay).padStart(2, '0')}:00`,
        predictedKW: 0,
        p90UpperKW: 0,
        p10LowerKW: 0,
        irradiance: 0,
        ambientTemp: 25,
        panelTemp: 25,
        cloudCover: 0,
        isAnomaly: false,
        anomalySeverity: 'None',
        anomalyDescription: null,
      }
    );
  }, [currentFractionalHour, hourlyData, isLiveClock, cityNow, hourOfDay, cloudShadowFactor, tiltEfficiencyFactor, trackingMode, panelTiltDeg, location.name]);

  const panelDataList = useMemo(() => {
    return calculatePanelOutputs(currentHourData.predictedKW, faultedPanels);
  }, [currentHourData.predictedKW, faultedPanels]);

  // Continuously stream live telemetry to Cloud Database (0 Bytes on local Mac disk)
  useEffect(() => {
    if (currentHourData && currentHourData.predictedKW !== undefined) {
      streamTelemetryToCloud({
        hour: hourOfDay,
        timeLabel: currentHourData.timeLabel,
        location,
        irradiance: currentHourData.irradiance,
        directW: currentHourData.directW,
        diffuseW: currentHourData.diffuseW,
        ambientTemp: currentHourData.ambientTemp,
        cellTemp: currentHourData.panelTemp,
        predictedKW: currentHourData.predictedKW,
        p90UpperKW: currentHourData.p90UpperKW,
        cloudCover: currentHourData.cloudCover,
        isAnomaly: currentHourData.isAnomaly,
        anomalyDescription: currentHourData.anomalyDescription,
      });
    }
  }, [currentHourData, hourOfDay, location]);

  const handleSelectPanel = useCallback((panel) => {
    setSelectedPanel(panel);
  }, []);

  const handleStartTour = useCallback(() => {
    setActiveTab('3d');
    setTourStep(0);
  }, []);

  const handleNextTourStep = useCallback(() => {
    setTourStep(prev => (prev < 5 ? prev + 1 : null));
  }, []);

  const handlePrevTourStep = useCallback(() => {
    setTourStep(prev => (prev > 0 ? prev - 1 : 0));
  }, []);

  const handleEndTour = useCallback(() => {
    setTourStep(null);
  }, []);

  const handleInjectCloud = useCallback(() => {
    setCloudInjection({ startedAt: Date.now(), durationMs: 30000 });
    streamEventToCloud({
      type: 'WEATHER_INJECTION',
      title: 'Transient Cloud Shadow Injected via SCADA Simulation',
      description: 'Simulated 30-second localized atmospheric occlusion. Array irradiance reduced by 50%. Stored in Cloud.',
      severity: 'WARNING',
      source: 'CLOUD_SCADA_ENGINE',
      activeKW: currentHourData.predictedKW,
      dispatched: true,
    });
  }, [currentHourData.predictedKW]);

  const handleClearCloud = useCallback(() => {
    setCloudInjection(null);
    streamEventToCloud({
      type: 'WEATHER_CLEARED',
      title: 'Cloud Dissipation - Irradiance Baseline Restored',
      description: 'Cloud attenuation factor cleared. Array returned to clear-sky MPPT curve. Stored in Cloud.',
      severity: 'INFO',
      source: 'CLOUD_SCADA_ENGINE',
      activeKW: currentHourData.predictedKW,
      dispatched: true,
    });
  }, [currentHourData.predictedKW]);

  const handleSetPanelFault = useCallback((panelId, faultType) => {
    setFaultedPanels(prev => {
      const next = { ...prev };
      if (!faultType) {
        delete next[panelId];
        streamEventToCloud({
          type: 'FAULT_CLEARED',
          title: `Module A-${panelId} Fault Cleared`,
          description: `String optimizer telemetry returned to nominal status. Normal string conductance restored.`,
          severity: 'SUCCESS',
          source: 'CLOUD_MLPE_GATEWAY',
          dispatched: true,
        });
      } else {
        next[panelId] = faultType;
        streamEventToCloud({
          type: 'FAULT_INJECTED',
          title: `Module A-${panelId} State Changed: ${faultType}`,
          description: `Diagnostic sensor triggered ${faultType} fault condition on String A, Unit ${panelId}.`,
          severity: faultType === 'Offline' ? 'CRITICAL' : 'WARNING',
          source: 'CLOUD_MLPE_GATEWAY',
          dispatched: true,
        });
      }
      return next;
    });
  }, []);

  const Scene = (
    <Solar3DScene
      hourOfDay={currentFractionalHour}
      panelDataList={panelDataList}
      selectedPanel={selectedPanel}
      onSelectPanel={handleSelectPanel}
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
      trackingMode={trackingMode}
      fixedKW={currentHourData.fixedKW}
      trackedKW={currentHourData.trackedKW}
      gainPct={currentHourData.gainPct}
      meteoData={meteoData}
      onOpenControlRoom={() => setShowControlRoomModal(true)}
    />
  );

  const Controls = (
    <SceneControls
      hourOfDay={currentActiveHour}
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
    <div className="min-h-screen text-slate-100 font-sans flex flex-col antialiased selection:bg-sky-500/30 selection:text-sky-200">
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onStartTour={handleStartTour}
      />

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={location}
        onSelectLocation={handleSelectLocation}
      />

      <ControlRoomInterior3D
        isOpen={showControlRoomModal}
        onClose={() => setShowControlRoomModal(false)}
        currentKW={currentHourData.predictedKW}
        irradiance={currentHourData.irradiance}
        location={location}
      />

      {/* ── Premium Floating Glass Header ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/[0.06] shadow-[0_4px_32px_rgba(0,0,0,0.5)]" style={{ position: 'relative' }}>
        {/* Glint accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(56,189,248,0.5) 30%,rgba(56,189,248,0.7) 50%,rgba(56,189,248,0.5) 70%,transparent)' }} />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between" style={{ height: '66px' }}>

          {/* ── Left: Brand ── */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.22),rgba(16,185,129,0.18))', border: '1px solid rgba(245,158,11,0.28)' }}>
              <Sun size={19} className="text-amber-400 animate-spin-slow" />
              <div className="absolute inset-0 rounded-xl" style={{ boxShadow: '0 0 18px rgba(245,158,11,0.2) inset' }} />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-display font-bold text-base tracking-widest text-white" style={{ letterSpacing: '0.18em' }}>HELIOS</span>
                <span className="text-2xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.28)' }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  LIVE SCADA
                </span>
              </div>

              <div className="text-2xs text-slate-500 font-medium hidden sm:flex items-center gap-2 mt-0.5">
                <span className="text-slate-600">48.0 kW Utility Array</span>
                <span className="text-slate-700">·</span>
                <button onClick={() => setShowLocationModal(true)}
                  className="flex items-center gap-1.5 text-sky-500 hover:text-sky-300 font-semibold transition-colors"
                  title="Change solar node location">
                  <MapPin size={10} />
                  <span>{location.name}, {location.country}</span>
                  <span className="text-slate-600">({location.latitude}°N)</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: Controls ── */}
          <div className="flex items-center gap-2 sm:gap-2.5">

            {/* Control Room button */}
            <button onClick={() => setShowControlRoomModal(true)}
              className="h-9 px-3.5 flex items-center gap-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(56,189,248,0.18)'; e.currentTarget.style.color='white'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(14,165,233,0.1)'; e.currentTarget.style.color='#38bdf8'; }}
              title="Open 3D SCADA NOC Control Center">
              <Building2 size={13} className="text-emerald-400" />
              <span className="hidden md:inline">Control Room</span>
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-800/80 hidden sm:block" />

            {/* Tracking toggle */}
            <div className="flex items-center p-1 rounded-xl gap-0.5" style={{ background: 'rgba(5,13,24,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {[['fixed', 'Fixed'], ['tracking', '⚡ Tracking']].map(([key, label]) => (
                <button key={key} onClick={() => setTrackingMode(key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={trackingMode === key
                    ? { color: '#f59e0b', background: 'rgba(245,158,11,0.18)', boxShadow: '0 0 12px rgba(245,158,11,0.15)' }
                    : { color: '#64748b' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* View tabs */}
            <div className="flex items-center p-1 rounded-xl gap-0.5" style={{ background: 'rgba(5,13,24,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                ['dashboard', LayoutDashboard, 'Dashboard'],
                ['3d', Box, '3D Twin'],
                ['2d', BarChart2, 'Forecast'],
                ['firebase', Flame, 'Firebase Sync'],
                ['split', LayoutGrid, 'Split'],
              ].map(([key, Icon, label]) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className="px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={activeTab === key
                    ? { color: '#fbbf24', background: 'rgba(245,158,11,0.18)', boxShadow: '0 0 12px rgba(245,158,11,0.15)' }
                    : { color: '#4d6278' }}>
                  <Icon size={13} /><span>{label}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-800/80 hidden sm:block" />

            {/* Live clock toggle */}
            <button onClick={() => { setIsLiveClock(!isLiveClock); if (!isLiveClock) setIsAutoPlay(false); }}
              className="h-9 px-3.5 flex items-center gap-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={isLiveClock
                ? { background: 'rgba(245,158,11,0.18)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.38)', boxShadow: '0 0 14px rgba(245,158,11,0.18)' }
                : { background: 'rgba(5,13,24,0.8)', color: '#4d6278', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Clock size={13} />
              <span className="hidden sm:inline">{isLiveClock ? 'Live' : 'Manual'}</span>
            </button>

            {/* Tour button */}
            <button onClick={handleStartTour}
              className="h-9 px-3 flex items-center gap-1.5 rounded-xl text-xs font-bold glass-panel border border-slate-800/70 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
              title="Start guided 3D farm tour">
              <HelpCircle size={13} />
              <span className="hidden md:inline">Tour</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-6 space-y-5 flex-1 w-full">
        <CostEstimate hourlyData={hourlyData} currentHour={currentActiveHour} />
        <RecommendationBanner currentHourData={currentHourData} faultedPanels={faultedPanels} />

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 animate-fadeIn">
            <EnergyComputePanel
              currentHourData={currentHourData}
              meteoData={meteoData}
              faultedPanels={faultedPanels}
              tiltDeg={panelTiltDeg}
              trackingRoll={0}
              location={location}
              onOpenLocationModal={() => setShowLocationModal(true)}
              onRefresh={loadMeteo}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <ForecastChart
                  hourlyData={hourlyData}
                  currentHour={currentActiveHour}
                  onSelectHour={h => { setIsLiveClock(false); setHourOfDay(h); }}
                  location={location}
                />
              </div>
              <div className="space-y-5">
                <AnomalyPanel currentHourData={currentHourData} />
                <FeatureImportance />
              </div>
            </div>
          </div>
        )}

        {/* ── 3D TWIN TAB ── */}
        {activeTab === '3d' && (
          <div className="space-y-4 animate-fadeIn">
            {Scene}
            {Controls}
          </div>
        )}

        {/* ── FORECAST TAB ── */}
        {activeTab === '2d' && (
          <div className="space-y-5 animate-fadeIn">
            <ForecastChart
              hourlyData={hourlyData}
              currentHour={currentActiveHour}
              onSelectHour={h => { setIsLiveClock(false); setHourOfDay(h); }}
              location={location}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AnomalyPanel currentHourData={currentHourData} />
              <FeatureImportance />
            </div>
          </div>
        )}

        {/* ── FIREBASE CLOUD SYNC TAB ── */}
        {activeTab === 'firebase' && (
          <HistorianView
            onSelectHour={h => {
              setIsLiveClock(false);
              setHourOfDay(h);
              setActiveTab('dashboard');
            }}
          />
        )}

        {/* ── SPLIT TAB ── */}
        {activeTab === 'split' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 animate-fadeIn">
            <div className="space-y-4">
              {Scene}
              {Controls}
            </div>
            <div className="space-y-5">
              <EnergyComputePanel
                currentHourData={currentHourData}
                meteoData={meteoData}
                faultedPanels={faultedPanels}
                tiltDeg={panelTiltDeg}
                trackingRoll={0}
                location={location}
                onOpenLocationModal={() => setShowLocationModal(true)}
                onRefresh={loadMeteo}
              />
              <ForecastChart
                hourlyData={hourlyData}
                currentHour={currentActiveHour}
                onSelectHour={h => { setIsLiveClock(false); setHourOfDay(h); }}
                location={location}
              />
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="py-5 border-t border-white/[0.05] mt-4">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Sun size={11} className="text-amber-500" />
            </div>
            <span className="font-semibold text-slate-500">HELIOS SCADA</span>
            <span className="text-slate-700">·</span>
            <span>48 kW Industrial Solar Platform</span>
            <span className="text-slate-700">·</span>
            <span>Open-Meteo Satellite Feed</span>
          </div>
          <div className="text-2xs text-slate-700 font-mono">
            Node: <span className="text-slate-500">{location.name}, {location.country}</span>
            &nbsp;·&nbsp;{location.latitude}°N {location.longitude}°E
          </div>
        </div>
      </footer>
    </div>
  );
}

