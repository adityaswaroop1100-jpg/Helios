import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { Sun, Box, LayoutGrid, BarChart2, Clock, HelpCircle, LayoutDashboard, MapPin, Building2, Flame, Play, Square, Maximize2, Radio } from 'lucide-react';
import {
  generate24HourForecast,
  calculatePanelOutputs,
  getOutputFromHourlyData
} from './api/forecastApi';

import Dashboard from './pages/Dashboard';
import ForecastChart from './components/dashboard/ForecastChart';
import RecommendationBanner from './components/dashboard/RecommendationBanner';
import AnomalyPanel from './components/dashboard/AnomalyPanel';
import FeatureImportance from './components/dashboard/FeatureImportance';
import CostEstimate from './components/dashboard/CostEstimate';
import HistorianView from './components/dashboard/HistorianView';

import SceneControls from './components/3d/SceneControls';
import Scada3DLoader from './components/3d/Scada3DLoader';
import OnboardingModal from './components/onboarding/OnboardingModal';
import SplashScreen from './components/onboarding/SplashScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ToastProvider, toast } from './components/ui/Toast';
import EnergyComputePanel from './components/dashboard/EnergyComputePanel';
import LocationModal from './components/dashboard/LocationModal';
import { fetchLiveIrradiance, fetch24HourMeteoForecast, DEFAULT_LOCATION } from './api/energyEngine';
import { dispatchTelemetry, dispatchScadaEvent, getDataLayerStatus } from './services/dataLayer';

// Lazy load heavy Three.js 3D scenes for sub-second initial load performance
const Solar3DScene = lazy(() => import('./components/3d/Solar3DScene'));
const ControlRoomInterior3D = lazy(() => import('./components/3d/ControlRoomInterior3D'));

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [splashDone, setSplashDone] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [dashTourStep, setDashTourStep] = useState(null);
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

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Sync window.location.hash with activeTab for robust routing & zero broken links
  useEffect(() => {
    const handleHashSync = () => {
      const raw = (window.location.hash || '').replace(/^#\/?/, '').toLowerCase();
      if (['3d', 'twin'].includes(raw)) setActiveTab('3d');
      else if (['2d', 'forecast'].includes(raw)) setActiveTab('2d');
      else if (['firebase', 'cloud', 'sync'].includes(raw)) setActiveTab('firebase');
      else if (raw === 'split') setActiveTab('split');
      else if (['control-room', 'controlroom'].includes(raw)) setShowControlRoomModal(true);
      else if (raw === 'dashboard' || !raw) setActiveTab('dashboard');
      else {
        // Unknown route: safely fallback to dashboard
        setActiveTab('dashboard');
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  const handleTabChange = useCallback((newTab) => {
    setActiveTab(newTab);
    try {
      window.location.hash = `#${newTab}`;
    } catch {}
  }, []);

  const [dataLayerStatus, setDataLayerStatus] = useState(getDataLayerStatus);
  useEffect(() => {
    const timer = setInterval(() => setDataLayerStatus(getDataLayerStatus()), 3000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleDemo = useCallback(() => {
    setDemoMode(prev => !prev);
  }, []);

  const handleStartDashTour = useCallback(() => {
    handleTabChange('dashboard');
    setDashTourStep(0);
  }, [handleTabChange]);


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

  // Live clock: default initial visit to Dusk (18:00) so 3D twin renders the cinematic sunset twilight
  const [isLiveClock, setIsLiveClock] = useState(() => {
    try {
      const saved = localStorage.getItem('helios_live_clock');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [now, setNow] = useState(new Date());
  const [hourOfDay, setHourOfDay] = useState(() => {
    try {
      const saved = localStorage.getItem('helios_hour');
      return saved !== null ? Number(saved) : 18; // 18:00 Dusk preset
    } catch {
      return 18;
    }
  });
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

  // Continuously stream live telemetry to Cloud Database & Data Layer (0 Bytes on local Mac disk)
  useEffect(() => {
    if (currentHourData && currentHourData.predictedKW !== undefined) {
      dispatchTelemetry({
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
    handleTabChange('3d');
    setTourStep(0);
  }, [handleTabChange]);

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
    dispatchScadaEvent({
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
    dispatchScadaEvent({
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
        dispatchScadaEvent({
          type: 'FAULT_CLEARED',
          title: `Module A-${panelId} Fault Cleared`,
          description: `String optimizer telemetry returned to nominal status. Normal string conductance restored.`,
          severity: 'SUCCESS',
          source: 'CLOUD_MLPE_GATEWAY',
          dispatched: true,
        });
      } else {
        next[panelId] = faultType;
        dispatchScadaEvent({
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
    <Suspense fallback={<Scada3DLoader text="Compiling 3D Solar Twin PBR Shaders..." />}>
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
    </Suspense>
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
    <div className="min-h-screen text-text-primary font-sans flex flex-col antialiased selection:bg-gold/25 selection:text-text-primary archival-container">
      {/* ── Cinematic Splash ── */}
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

      {/* ── Toast Notifications ── */}
      <ToastProvider />

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

      {showControlRoomModal && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
            <Scada3DLoader text="Entering NASA/SCADA Mission Control Deck..." />
          </div>
        }>
          <ControlRoomInterior3D
            isOpen={showControlRoomModal}
            onClose={() => setShowControlRoomModal(false)}
            currentKW={currentHourData.predictedKW}
            irradiance={currentHourData.irradiance}
            location={location}
          />
        </Suspense>
      )}

      {/* ── Premium Floating Glass Header ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-premium shadow-[0_4px_32px_rgba(0,0,0,0.8)]" style={{ position: 'relative' }}>
        {/* Gold glint accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(201,151,62,0.4) 30%,rgba(201,151,62,0.8) 50%,rgba(201,151,62,0.4) 70%,transparent)' }} />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between" style={{ height: '66px' }}>

          {/* ── Left: Brand ── */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(201,151,62,0.22),rgba(45,212,168,0.18))', border: '1px solid rgba(201,151,62,0.35)' }}>
              <Sun size={19} className="text-gold animate-spin-slow" />
              <div className="absolute inset-0 rounded-xl" style={{ boxShadow: '0 0 18px rgba(201,151,62,0.2) inset' }} />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-base text-text-primary" style={{ letterSpacing: '0.18em' }}>HELIOS</span>
                <span className="text-2xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono"
                  style={{ background: 'rgba(45,212,168,0.12)', color: '#2dd4a8', border: '1px solid rgba(45,212,168,0.28)' }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jade opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-jade" />
                  </span>
                  LIVE SCADA
                </span>
              </div>
              <div className="text-2xs text-text-secondary font-medium hidden sm:flex items-center gap-2 mt-0.5">
                <span className="text-text-muted">48.0 kW</span>
                <span className="text-text-muted">·</span>
                <button onClick={() => setShowLocationModal(true)}
                  className="flex items-center gap-1.5 text-cyan hover:text-cyan/80 font-semibold transition-colors"
                  title="Change solar node location">
                  <MapPin size={10} />
                  <span>{location.name}, {location.country}</span>
                  <span className="text-text-muted">({location.latitude}°N)</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: Controls ── */}
          <div className="flex items-center gap-2 sm:gap-2.5">

            {/* 🚀 Auto-Demo Toggle */}
            <button
              onClick={handleToggleDemo}
              title={demoMode ? 'Exit Auto-Demo mode' : 'Start Auto-Demo for judges'}
              className="h-9 px-3.5 flex items-center gap-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={demoMode
                ? { background: 'rgba(229,72,77,0.18)', color: '#e5484d', border: '1px solid rgba(229,72,77,0.35)', boxShadow: '0 0 16px rgba(229,72,77,0.15)' }
                : { background: 'rgba(201,151,62,0.12)', color: '#c9973e', border: '1px solid rgba(201,151,62,0.28)' }}>
              {demoMode ? <Square size={12} /> : <Play size={12} />}
              <span className="hidden sm:inline">{demoMode ? 'Stop' : '🚀 Demo'}</span>
            </button>

            {/* Guided Tour */}
            <button
              onClick={handleStartDashTour}
              className="h-9 px-3 flex items-center gap-1.5 rounded-xl text-xs font-bold transition-all"
              title="Start guided dashboard tour"
              style={{ background: 'rgba(77,208,225,0.10)', color: '#4dd0e1', border: '1px solid rgba(77,208,225,0.22)' }}>
              <HelpCircle size={13} />
              <span className="hidden md:inline">Tour</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="h-9 px-3 flex items-center gap-1.5 rounded-xl text-xs font-semibold transition-all glass-premium border border-white/10 text-text-secondary hover:text-white"
              title="Fullscreen Presentation Mode">
              <Maximize2 size={13} />
              <span className="hidden md:inline">Present</span>
            </button>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            {/* Control Room */}
            <button onClick={() => setShowControlRoomModal(true)}
              className="h-9 px-3.5 flex items-center gap-1.5 rounded-xl text-xs font-semibold transition-all border border-cyan/30 text-cyan hover:bg-cyan/10"
              title="Open 3D SCADA NOC">
              <Building2 size={13} className="text-jade" />
              <span className="hidden md:inline">Control Room</span>
            </button>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            {/* Tracking toggle */}
            <div className="flex items-center p-1 rounded-xl gap-0.5 bg-carbon border border-white/[0.06]">
              {[['fixed', 'Fixed'], ['tracking', '⚡ Track']].map(([key, label]) => (
                <button key={key} onClick={() => setTrackingMode(key)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={trackingMode === key
                    ? { color: '#c9973e', background: 'rgba(201,151,62,0.18)', boxShadow: '0 0 12px rgba(201,151,62,0.15)' }
                    : { color: '#7a8ba3' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Data Layer Telemetry Status Chip */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-3xs font-mono border"
              style={{
                background: dataLayerStatus.isDemoFallbackActive ? 'rgba(201,151,62,0.12)' : 'rgba(45,212,168,0.10)',
                borderColor: dataLayerStatus.isDemoFallbackActive ? 'rgba(201,151,62,0.28)' : 'rgba(45,212,168,0.25)',
                color: dataLayerStatus.isDemoFallbackActive ? '#c9973e' : '#2dd4a8'
              }}>
              <Radio size={11} className="animate-pulse" />
              <span>{dataLayerStatus.statusText}</span>
            </div>

            {/* View tabs */}
            <div className="flex items-center p-1 rounded-xl gap-0.5 bg-carbon border border-white/[0.06]">
              {[
                ['dashboard', LayoutDashboard, 'Dashboard'],
                ['3d', Box, '3D Twin'],
                ['2d', BarChart2, 'Forecast'],
                ['firebase', Flame, 'Firebase'],
                ['split', LayoutGrid, 'Split'],
              ].map(([key, Icon, label]) => (
                <button key={key} onClick={() => handleTabChange(key)}
                  className="px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={activeTab === key
                    ? { color: '#c9973e', background: 'rgba(201,151,62,0.18)', boxShadow: '0 0 12px rgba(201,151,62,0.15)' }
                    : { color: '#7a8ba3' }}>
                  <Icon size={13} /><span className="hidden lg:inline">{label}</span>
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            {/* Live clock toggle */}
            <button onClick={() => { setIsLiveClock(!isLiveClock); if (!isLiveClock) setIsAutoPlay(false); }}
              className="h-9 px-3.5 flex items-center gap-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={isLiveClock
                ? { background: 'rgba(201,151,62,0.18)', color: '#c9973e', border: '1px solid rgba(201,151,62,0.38)', boxShadow: '0 0 14px rgba(201,151,62,0.18)' }
                : { background: 'rgba(6,10,20,0.8)', color: '#7a8ba3', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Clock size={13} />
              <span className="hidden sm:inline">{isLiveClock ? 'Live' : 'Manual'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <Dashboard
            hourlyData={hourlyData}
            currentHour={currentActiveHour}
            onSelectHour={h => { setIsLiveClock(false); setHourOfDay(h); }}
            faultedPanels={faultedPanels}
            onSelectPanel={id => setSelectedPanel(id)}
            onSetPanelFault={handleSetPanelFault}
            onNavigateTab={handleTabChange}
            location={location}
            demoMode={demoMode}
            tourStep={dashTourStep}
            onTourNext={() => setDashTourStep(prev => prev !== null && prev < 3 ? prev + 1 : null)}
            onTourSkip={() => setDashTourStep(null)}
          />
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
              handleTabChange('dashboard');
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

      <footer className="py-4 mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-xs text-text-muted">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(201,151,62,0.12)', border: '1px solid rgba(201,151,62,0.25)' }}>
              <Sun size={11} className="text-gold" />
            </div>
            <span className="font-semibold text-text-secondary font-mono">HELIOS SCADA</span>
            <span className="text-text-dim">·</span>
            <span className="font-mono">48 kW Industrial Solar Digital Twin</span>
            <span className="text-text-dim">·</span>
            <span className="font-mono">Open-Meteo Satellite Feed</span>
          </div>
          <div className="text-2xs text-text-muted font-mono">
            Node: <span className="text-text-secondary">{location.name}, {location.country}</span>
            &nbsp;·&nbsp;{location.latitude}°N {location.longitude}°E
          </div>
        </div>
      </footer>

    </div>
  );
}

