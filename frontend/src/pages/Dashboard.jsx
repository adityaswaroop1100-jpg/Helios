import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Zap, Sun, Battery,
  CloudRain, Activity, ShieldCheck, Play, Square,
  Maximize2, RotateCcw, Layers, BarChart2, AlertTriangle,
  Cpu, Radio, Thermometer, CheckCircle2, X, Box, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { getFinancialMetrics } from '../api/forecastApi';
import { DEFAULT_LOCATION } from '../api/energyEngine';
import { toast } from '../components/ui/Toast';

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 1 }) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const parsed = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    const ctrl = animate(motionVal, parsed, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = motionVal.on('change', v => {
      setDisplay(decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString());
    });
    return () => { ctrl.stop(); unsub(); };
  }, [value, decimals, motionVal]);

  return <span>{display}</span>;
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
const ACCENT = {
  gold:    { color: '#c9973e', bg: 'rgba(201,151,62,0.09)', border: 'rgba(201,151,62,0.22)', glow: 'rgba(201,151,62,0.12)' },
  cyan:    { color: '#4dd0e1', bg: 'rgba(77,208,225,0.09)',  border: 'rgba(77,208,225,0.18)',  glow: 'rgba(77,208,225,0.10)' },
  jade:    { color: '#2dd4a8', bg: 'rgba(45,212,168,0.09)', border: 'rgba(45,212,168,0.18)', glow: 'rgba(45,212,168,0.10)' },
  crimson: { color: '#e5484d', bg: 'rgba(229,72,77,0.09)',   border: 'rgba(229,72,77,0.18)',   glow: 'rgba(229,72,77,0.10)' },
};

const KpiCard = ({ title, value, unit, icon: Icon, trend = 0, isPositive = true, accentColor = 'gold', delay = 0, demo = false, pulse = false }) => {
  const a = ACCENT[accentColor] || ACCENT.gold;
  const numVal = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  const decimals = String(value).includes('.') ? 1 : 0;

  return (
    <motion.div
      data-tour={`kpi-${accentColor}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      className="col-span-12 sm:col-span-6 lg:col-span-3"
    >
      <div
        className={`relative h-full min-h-[158px] rounded-xl p-5 flex flex-col justify-between overflow-hidden cursor-default transition-shadow duration-700 ${pulse ? 'gentle-highlight-pulse' : ''}`}
        style={{
          background: 'linear-gradient(135deg, rgba(12,20,40,0.97) 0%, rgba(8,14,26,0.97) 100%)',
          border: `1px solid ${a.border}`,
          borderLeft: `3px solid ${a.color}`,
          boxShadow: `0 20px 56px -12px rgba(0,0,0,0.9), 0 0 32px -12px ${a.glow}`,
        }}
      >
        {/* Ambient radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 15% 15%, ${a.glow} 0%, transparent 65%)` }} />
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-4 right-4 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${a.color}40, transparent)` }} />

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="label-uppercase">{title}</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: a.bg, border: `1px solid ${a.border}` }}>
              <Icon size={14} style={{ color: a.color }} />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold kpi-value" style={{ fontSize: '2.2rem', lineHeight: 1, color: a.color }}>
              {demo ? <AnimatedNumber value={numVal} decimals={decimals} /> : value}
            </span>
            <span className="text-xs text-text-muted font-mono">{unit}</span>
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-2xs">
          {trend !== 0 ? (
            isPositive
              ? <span className="flex items-center gap-1 font-mono font-semibold text-jade"><TrendingUp size={12} />+{trend}%</span>
              : <span className="flex items-center gap-1 font-mono font-semibold text-crimson"><TrendingDown size={12} />{trend}%</span>
          ) : <span className="text-text-muted font-mono">Nominal</span>}
          <span className="text-text-dim font-mono">vs STC rating</span>
        </div>
      </div>
    </motion.div>
  );
};

// ── SVG Gauge ─────────────────────────────────────────────────────────────────
function Gauge({ label, value, max, unit, color }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = 32, circ = Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="label-uppercase mb-2 text-center">{label}</div>
      <div className="relative w-[74px] h-[44px] overflow-hidden">
        <svg className="absolute top-0 left-0 -rotate-180 w-[74px] h-[74px]" viewBox="0 0 74 74">
          <circle cx="37" cy="37" r={r} fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={0} strokeLinecap="round" />
          <circle cx="37" cy="37" r={r} fill="transparent" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 5px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-0.5">
          <span className="font-mono font-bold text-sm text-text-primary">{value}</span>
        </div>
      </div>
      <span className="text-3xs text-text-muted font-mono mt-1">{unit}</span>
    </div>
  );
}

// ── Chart Tooltip ─────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="px-3 py-2.5 rounded-xl text-2xs min-w-[150px]"
      style={{ background: 'rgba(6,10,20,0.97)', border: '1px solid rgba(201,151,62,0.25)', backdropFilter: 'blur(20px)' }}>
      <div className="font-mono font-semibold text-text-primary mb-1">{d.hour}</div>
      <div className="flex justify-between gap-4"><span className="text-text-secondary">Yield</span><span className="font-mono text-gold font-bold">{d.expected} kW</span></div>
      {d.p90 && <div className="flex justify-between gap-4"><span className="text-text-muted">P90</span><span className="font-mono text-cyan">{d.p90} kW</span></div>}
    </div>
  );
};

// ── Guided Tour Step Tooltip ──────────────────────────────────────────────────
function TourTooltip({ step, total, onNext, onSkip }) {
  const STEPS = [
    { title: 'Real-Time KPI Dashboard', body: 'Live financial & carbon data: $17K/yr savings, 66.9T CO₂ avoided — updated every second.', target: 'kpi-row' },
    { title: 'AI Forecast (99.89% R²)', body: 'XGBoost predicts 24-hour solar yield within P10–P90 confidence bounds. Sub-12ms response.', target: 'chart-row' },
    { title: '32-Module String Heatmap', body: 'Click any cell to inspect voltage, temperature, and MPPT state of individual panels.', target: 'heatmap-row' },
    { title: 'SCADA Anomaly Audit', body: 'Sub-12ms edge AI flags faults and dispatches BESS compensation automatically.', target: 'anomaly-row' },
  ];
  const s = STEPS[step] || STEPS[0];
  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9990] max-w-sm w-full"
    >
      <div className="rounded-2xl p-5 shadow-premium"
        style={{
          background: 'rgba(6,10,20,0.97)',
          border: '1px solid rgba(201,151,62,0.30)',
          borderTop: '1px solid rgba(201,151,62,0.45)',
          backdropFilter: 'blur(28px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.95), 0 0 32px rgba(201,151,62,0.12)',
        }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="badge-gold">{step + 1}/{total}</span>
          <span className="font-bold text-sm text-text-primary">{s.title}</span>
        </div>
        <p className="text-2xs text-text-secondary font-mono leading-relaxed mb-4">{s.body}</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 flex-1">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full"
                style={{ background: i <= step ? '#c9973e' : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
          <button onClick={onSkip} className="text-2xs text-text-muted hover:text-text-secondary font-mono transition-colors px-2">Skip</button>
          <button onClick={onNext}
            className="px-4 py-1.5 rounded-lg text-2xs font-mono font-bold transition-all"
            style={{ background: 'rgba(201,151,62,0.15)', color: '#c9973e', border: '1px solid rgba(201,151,62,0.30)' }}>
            {step < total - 1 ? 'Next →' : 'Finish ✓'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}
      style={{ background: 'rgba(255,255,255,0.04)' }}>
      <motion.div
        className="h-full w-full"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,151,62,0.06) 50%, transparent 100%)' }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// ── Demo Mode Toast Intervals ─────────────────────────────────────────────────
const DEMO_MESSAGES = [
  '⚡ String #3 voltage anomaly detected — Auto-isolated in 9ms',
  '☁️ Simulated cloud pass — BESS dispatching 8.2 kW compensation',
  '🔄 MPPT re-locked to 641V after transient — Yield restored',
  '📊 XGBoost model: P90 confidence maintained — 99.89% R²',
  '🌡️ Cell temperature derate applied — NOCT model active',
  '✅ Grid synchronization nominal — 49.98 Hz · Zero droop',
];

// ── Live Module Telemetry Inspector Modal ──────────────────────────────────────
function ModuleInspectorModal({ panelId, fault, onClose, onSetFault, onViewIn3D }) {
  const isFault = fault === 'Offline';
  const isDegraded = fault === 'Underperforming';

  const voltage = isFault ? '4.2' : isDegraded ? '18.4' : '41.8';
  const current = isFault ? '0.0' : isDegraded ? '3.8' : '8.65';
  const powerW = isFault ? '0' : isDegraded ? '70' : Math.round(parseFloat(voltage) * parseFloat(current));
  const tempC = isFault ? '28.4' : isDegraded ? '56.2' : '44.2';

  const stringNum = Math.ceil(panelId / 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md rounded-2xl glass-premium p-6 border shadow-2xl space-y-4"
        style={{
          background: 'rgba(8, 14, 28, 0.96)',
          borderColor: isFault ? 'rgba(229,72,77,0.45)' : isDegraded ? 'rgba(201,151,62,0.4)' : 'rgba(77,208,225,0.3)',
          boxShadow: `0 24px 64px rgba(0,0,0,0.95), 0 0 32px ${isFault ? 'rgba(229,72,77,0.2)' : 'rgba(77,208,225,0.1)'}`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{
                background: isFault ? 'rgba(229,72,77,0.15)' : 'rgba(77,208,225,0.12)',
                borderColor: isFault ? 'rgba(229,72,77,0.3)' : 'rgba(77,208,225,0.25)',
                color: isFault ? '#e5484d' : '#4dd0e1'
              }}>
              <Cpu size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-base text-text-primary">Module A-{panelId}</h3>
                <span className="text-3xs font-mono font-bold px-2 py-0.5 rounded-full border uppercase"
                  style={{
                    background: isFault ? 'rgba(229,72,77,0.15)' : isDegraded ? 'rgba(201,151,62,0.15)' : 'rgba(45,212,168,0.12)',
                    borderColor: isFault ? 'rgba(229,72,77,0.3)' : isDegraded ? 'rgba(201,151,62,0.3)' : 'rgba(45,212,168,0.3)',
                    color: isFault ? '#e5484d' : isDegraded ? '#c9973e' : '#2dd4a8'
                  }}>
                  {fault || 'Nominal 100%'}
                </span>
              </div>
              <p className="text-2xs font-mono text-text-muted mt-0.5">
                String #{stringNum} · Smart Optimizer P1000 MLPE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* SunSpec RF Signal Status */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border"
          style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 text-2xs font-mono text-text-secondary">
            <Radio size={12} className={isFault ? 'text-crimson' : 'text-jade'} />
            <span>RF SunSpec Telemetry</span>
          </div>
          <span className="text-3xs font-mono font-bold" style={{ color: isFault ? '#e5484d' : '#2dd4a8' }}>
            {isFault ? 'CIRCUIT ISOLATED (<12ms)' : 'RSSI -62 dBm · 100% LQI'}
          </span>
        </div>

        {/* 4 Live Hardware Telemetry Tiles */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl border space-y-1"
            style={{ background: 'rgba(6,10,20,0.8)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-3xs font-mono uppercase text-text-muted">DC Bus Voltage</span>
            <div className="font-mono font-bold text-lg text-cyan">{voltage} <span className="text-2xs text-text-muted">V</span></div>
            <div className="text-3xs font-mono text-text-dim">Nominal: 41.8 V</div>
          </div>

          <div className="p-3 rounded-xl border space-y-1"
            style={{ background: 'rgba(6,10,20,0.8)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-3xs font-mono uppercase text-text-muted">String Current</span>
            <div className="font-mono font-bold text-lg text-gold">{current} <span className="text-2xs text-text-muted">A</span></div>
            <div className="text-3xs font-mono text-text-dim">STC Max: 9.1 A</div>
          </div>

          <div className="p-3 rounded-xl border space-y-1"
            style={{ background: 'rgba(6,10,20,0.8)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-3xs font-mono uppercase text-text-muted flex items-center gap-1">
              <Zap size={11} className="text-jade" /> Active Power
            </span>
            <div className="font-mono font-bold text-lg text-jade">{powerW} <span className="text-2xs text-text-muted">W</span></div>
            <div className="text-3xs font-mono text-text-dim">Rated: 375 W Mono</div>
          </div>

          <div className="p-3 rounded-xl border space-y-1"
            style={{ background: 'rgba(6,10,20,0.8)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-3xs font-mono uppercase text-text-muted flex items-center gap-1">
              <Thermometer size={11} className="text-gold" /> Cell Temp
            </span>
            <div className="font-mono font-bold text-lg text-text-primary">{tempC} <span className="text-2xs text-text-muted">°C</span></div>
            <div className="text-3xs font-mono text-text-dim">NOCT Benchmark</div>
          </div>
        </div>

        {/* Fault Simulation Action Controls for Evaluators */}
        <div className="pt-2 border-t border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-gold" /> SCADA Test Controls
            </span>
            <span className="text-3xs font-mono text-text-dim">Hardware Fault Injection</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {!isFault ? (
              <button
                onClick={() => {
                  onSetFault('Offline');
                  toast.warn(`Module A-${panelId} Diode Fault Injected — Auto-isolated in <12ms`);
                }}
                className="px-3 py-2 rounded-xl text-2xs font-mono font-bold border transition-all text-crimson hover:bg-crimson/15 active:scale-95 flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(229,72,77,0.1)', borderColor: 'rgba(229,72,77,0.3)' }}
              >
                <AlertTriangle size={12} />
                <span>Inject Fault</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onSetFault(null);
                  toast.success(`Module A-${panelId} cleared — 100% conductance restored`);
                }}
                className="px-3 py-2 rounded-xl text-2xs font-mono font-bold border transition-all text-jade hover:bg-jade/15 active:scale-95 flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(45,212,168,0.1)', borderColor: 'rgba(45,212,168,0.3)' }}
              >
                <CheckCircle2 size={12} />
                <span>Clear Fault</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onViewIn3D?.();
                toast.info(`Inspecting Module A-${panelId} in 3D Solar Twin`);
              }}
              className="px-3 py-2 rounded-xl text-2xs font-mono font-bold border transition-all text-cyan hover:bg-cyan/15 active:scale-95 flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(77,208,225,0.1)', borderColor: 'rgba(77,208,225,0.3)' }}
            >
              <Box size={12} />
              <span>Inspect in 3D</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
const Dashboard = ({
  hourlyData = [],
  currentHour = 12,
  onSelectHour,
  faultedPanels = {},
  onSelectPanel,
  onSetPanelFault,
  onNavigateTab,
  location = DEFAULT_LOCATION,
  demoMode = false,
  tourStep = null,
  onTourNext,
  onTourSkip,
}) => {
  const [inspectPanelId, setInspectPanelId] = useState(null);
  const currentHourData = hourlyData[currentHour] || {};
  const metrics = getFinancialMetrics(hourlyData, currentHour);
  const [demoHour, setDemoHour] = useState(currentHour);
  const [demoOffset, setDemoOffset] = useState(0);
  const [highlightPulse, setHighlightPulse] = useState(true);
  const demoIntervalRef = useRef(null);
  const toastIntervalRef = useRef(null);

  // Gentle one-time highlight pulse on first load (2.2s soft gold glow)
  useEffect(() => {
    const timer = setTimeout(() => setHighlightPulse(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-demo: cycle through hours + fluctuate KPIs
  useEffect(() => {
    if (demoMode) {
      demoIntervalRef.current = setInterval(() => {
        setDemoHour(h => (h + 1) % 24);
        setDemoOffset(o => (Math.random() - 0.5) * 1.5);
      }, 3000);
      // Toast every 12s
      let msgIdx = 0;
      toastIntervalRef.current = setInterval(() => {
        toast.scada(DEMO_MESSAGES[msgIdx % DEMO_MESSAGES.length], { duration: 5000 });
        msgIdx++;
      }, 12000);
      // Initial toast
      setTimeout(() => toast.success('🚀 Auto-Demo mode activated — HELIOS ORION 1.0', { duration: 4000 }), 300);
    } else {
      clearInterval(demoIntervalRef.current);
      clearInterval(toastIntervalRef.current);
      setDemoHour(currentHour);
      setDemoOffset(0);
    }
    return () => {
      clearInterval(demoIntervalRef.current);
      clearInterval(toastIntervalRef.current);
    };
  }, [demoMode, currentHour]);

  const activeHour  = demoMode ? demoHour : currentHour;
  const activeData  = hourlyData[activeHour] || currentHourData;
  const activePower = demoMode
    ? Math.max(0, (activeData.predictedKW || 0) + demoOffset).toFixed(2)
    : Math.max(0, (activeData.predictedKW ?? 0)).toFixed(2);
  const m           = getFinancialMetrics(hourlyData, activeHour);

  // Chart data
  const chartData = hourlyData.length > 0
    ? hourlyData.map(d => ({
        hour: d.timeLabel,
        expected: d.predictedKW,
        p90: d.p90UpperKW || +(d.predictedKW * 1.15).toFixed(1),
      }))
    : Array.from({ length: 24 }, (_, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        expected: +(Math.max(0, Math.sin((i - 6) * 0.38) * 24 + 2)).toFixed(1),
        p90: +(Math.max(0, Math.sin((i - 6) * 0.38) * 28 + 3)).toFixed(1),
      }));

  const featureImportance = [
    { label: 'Solar Zenith Angle (θz)', value: 49.2, color: '#c9973e' },
    { label: 'Global Irradiance (GHI)', value: 46.1, color: '#4dd0e1' },
    { label: 'NOCT Cell Temp (Tcell)',  value: 2.4,  color: '#2dd4a8' },
    { label: 'Ambient Air Temp',        value: 1.2,  color: '#a78bfa' },
    { label: 'Cloud Cover Index',       value: 1.1,  color: '#e5484d' },
  ];

  const anomalies = [
    { time: '14:32:21', string: 'String #3', issue: 'Bypass diode fault — auto-isolated in 9ms',     severity: 'CRITICAL' },
    { time: '13:15:09', string: 'String #7', issue: 'Voltage drop >5% — MPPT derated',              severity: 'WARNING'  },
    { time: '12:44:03', string: 'String #1', issue: 'Cloud transient — BESS compensation dispatched','severity': 'INFO'   },
  ];

  const sevStyle = (s) => {
    if (s === 'CRITICAL') return { c: '#e5484d', bg: 'rgba(229,72,77,0.10)', b: 'rgba(229,72,77,0.22)' };
    if (s === 'WARNING')  return { c: '#c9973e', bg: 'rgba(201,151,62,0.10)', b: 'rgba(201,151,62,0.22)' };
    return { c: '#4dd0e1', bg: 'rgba(77,208,225,0.08)', b: 'rgba(77,208,225,0.18)' };
  };

  const TOUR_TOTAL = 4;

  return (
    <div className="animate-fadeIn relative">
      {/* ── Guided Tour Overlay ── */}
      <AnimatePresence>
        {tourStep !== null && tourStep < TOUR_TOTAL && (
          <TourTooltip step={tourStep} total={TOUR_TOTAL} onNext={onTourNext} onSkip={onTourSkip} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-12 gap-5 auto-rows-min"
      >
        {/* ── ROW 1: Page Header ── */}
        <div className="col-span-12">
          <div className="flex items-center justify-between pb-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight mb-0.5">SCADA Control Overview</h1>
              <p className="text-2xs text-text-muted font-mono">
                {location.name} · {location.latitude}°N, {location.longitude}°E ·&nbsp;
                <span className="text-jade font-semibold">IEC 61724 · IEEE 1547</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {demoMode && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(229,72,77,0.12)', border: '1px solid rgba(229,72,77,0.25)' }}>
                  <span className="w-2 h-2 rounded-full bg-crimson" />
                  <span className="font-mono font-bold text-2xs text-crimson tracking-wider">AUTO-DEMO</span>
                </motion.div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(45,212,168,0.08)', border: '1px solid rgba(45,212,168,0.18)' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jade opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-jade" />
                </span>
                <span className="text-jade font-mono font-bold text-2xs tracking-wider">LIVE SCADA</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 2: KPI Cards ── */}
        <div className="col-span-12" data-tour="kpi-row">
          <div className="grid grid-cols-12 gap-5">
            <KpiCard title="Array Capacity"  value="48.0"              unit="kW"    icon={Sun}       accentColor="gold"   trend={0}    isPositive={true}  delay={0.05} demo={demoMode} pulse={highlightPulse} />
            <KpiCard title="Current Yield"   value={activePower}       unit="kW"    icon={Zap}       accentColor="gold"   trend={14.2} isPositive={true}  delay={0.10} demo={demoMode} pulse={highlightPulse} />
            <KpiCard title="Daily Energy"    value={m.totalDailyKWh || '93.1'} unit="kWh" icon={Battery}  accentColor="cyan"   trend={3.1}  isPositive={true}  delay={0.15} demo={demoMode} pulse={highlightPulse} />
            <KpiCard title="CO₂ Avoided"     value={m.co2AvoidedKg  || '65.8'} unit="kg"  icon={CloudRain} accentColor="jade"   trend={0}    isPositive={true}  delay={0.20} demo={demoMode} pulse={highlightPulse} />
          </div>
        </div>

        {/* ── ROW 3A: Main Chart (8 col) ── */}
        <div className="col-span-12 lg:col-span-8" data-tour="chart-row">
          <div className={`data-card rounded-xl2 p-5 h-[370px] flex flex-col transition-shadow duration-700 ${highlightPulse ? 'gentle-highlight-pulse' : ''}`}>
            <div className="flex items-center justify-between mb-2 pb-2"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div className="label-uppercase mb-1">24-Hour Generation Curve</div>
                <span className="text-jade font-mono font-semibold text-2xs">XGBoost · R² 0.9989 · P90 Confidence Band</span>
              </div>
              <div className="flex gap-2">
                {[['Yield kW', '#c9973e', 'rgba(201,151,62,0.10)', 'rgba(201,151,62,0.22)'],
                  ['P90 Band', '#4dd0e1', 'rgba(77,208,225,0.10)', 'rgba(77,208,225,0.22)']].map(([lbl, clr, bg, bd]) => (
                  <span key={lbl} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-3xs font-mono font-semibold"
                    style={{ background: bg, border: `1px solid ${bd}`, color: clr }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: clr }} />{lbl}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}
                  onClick={e => e?.activePayload?.length && onSelectHour?.(e.activeTooltipIndex)}>
                  <defs>
                    <linearGradient id="dash-gold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c9973e" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#c9973e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dash-cyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4dd0e1" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#4dd0e1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="transparent" fontSize={10} tickLine={false} axisLine={false}
                    tick={{ fill: '#4a5a72', fontFamily: 'JetBrains Mono' }} interval={2} />
                  <YAxis stroke="transparent" fontSize={10} tickLine={false} axisLine={false} unit=" kW" domain={[0, 52]}
                    tick={{ fill: '#4a5a72', fontFamily: 'JetBrains Mono' }} />
                  <Tooltip content={<ChartTooltip />}
                    cursor={{ stroke: 'rgba(201,151,62,0.35)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="p90" stroke="rgba(77,208,225,0.3)" strokeWidth={1}
                    fill="url(#dash-cyan)" isAnimationActive={false} />
                  <Area type="monotone" dataKey="expected" stroke="#c9973e" strokeWidth={2.5}
                    fill="url(#dash-gold)" dot={false}
                    activeDot={{ r: 5, fill: '#c9973e', stroke: '#060a14', strokeWidth: 2 }}
                    isAnimationActive={demoMode} />
                  {chartData[activeHour] && (
                    <ReferenceLine x={chartData[activeHour]?.hour} stroke="#c9973e" strokeWidth={1.5}
                      strokeDasharray="4 4" strokeOpacity={0.7}
                      label={{ value: '▼', fill: '#c9973e', fontSize: 10, position: 'top' }} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── ROW 3B: Gauge Cluster (4 col) ── */}
        <div className="col-span-12 lg:col-span-4">
          <div className="data-card rounded-xl2 p-5 h-[370px] flex flex-col">
            <div className="pb-2 mb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="label-uppercase mb-1">Kinematic Gauge Cluster</div>
              <span className="text-jade font-mono font-semibold text-2xs">RTU · 1.0 Hz Telemetry Feed</span>
            </div>
            <div className="flex-1 flex flex-col justify-evenly">
              <div className="flex items-center justify-around py-2">
                <Gauge label="Solar GHI"   value={activeData.irradiance || 540} max={1000} unit="W/m²" color="#c9973e" />
                <Gauge label="Cell Temp"   value={activeData.panelTemp  || 52}  max={75}   unit="°C"   color="#4dd0e1" />
                <Gauge label="BESS SOC"    value={84}                           max={100}  unit="%"    color="#2dd4a8" />
              </div>
              <div className="space-y-2">
                {[
                  { l: 'Active Power',   v: `${activePower} kW`,      c: '#c9973e' },
                  { l: 'DC Bus Voltage', v: '641.2 V',                c: '#4dd0e1' },
                  { l: 'String Current', v: '13.05 A',                c: '#2dd4a8' },
                  { l: 'Grid Frequency', v: '49.98 Hz',               c: '#c9973e' },
                ].map(({ l, v, c }) => (
                  <div key={l} className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-2xs text-text-muted font-mono">{l}</span>
                    <span className="font-mono font-bold text-xs" style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 mt-1 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-3xs text-text-dim font-mono">NOCT Thermal Model</span>
              <span className="text-jade font-mono font-bold text-3xs">Zero Droop</span>
            </div>
          </div>
        </div>

        {/* ── ROW 4A: Feature Importance ── */}
        <div className="col-span-12 lg:col-span-6">
          <div className="data-card rounded-xl2 p-5 h-full">
            <div className="flex items-center justify-between mb-4 pb-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div className="label-uppercase mb-1">XGBoost Feature Importance</div>
                <span className="font-mono font-bold text-gold text-sm">R² = 0.9989</span>
              </div>
              <span className="badge-jade flex items-center gap-1.5">
                <Activity size={10} />Sub-12ms
              </span>
            </div>
            <div className="space-y-3.5">
              {featureImportance.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5 text-2xs">
                    <span className="text-text-secondary font-medium">{item.label}</span>
                    <span className="font-mono font-bold" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{ background: item.color, boxShadow: `0 0 10px ${item.color}50` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 flex items-center gap-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
              </span>
              <span className="text-2xs font-mono text-gold/75 tracking-wider uppercase">Sub-12ms SCADA Engine · Active</span>
              <span className="text-2xs text-text-dim font-mono ml-auto">48.0 kW Nominal</span>
            </div>
          </div>
        </div>

        {/* ── ROW 4B: Anomaly Audit Feed ── */}
        <div className="col-span-12 lg:col-span-6" data-tour="anomaly-row">
          <div className="data-card rounded-xl2 p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div className="label-uppercase mb-1">Live SCADA Anomaly Audit</div>
                <span className="text-2xs text-text-muted font-mono">Firebase Real-Time Stream</span>
              </div>
              <span className="badge-cyan">12ms Response</span>
            </div>
            <div className="flex-1 space-y-2">
              {anomalies.map((a, i) => {
                const s = sevStyle(a.severity);
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-2 py-2 px-3 rounded-xl"
                    style={{ background: s.bg, border: `1px solid ${s.b}` }}>
                    <span className="font-mono text-2xs text-text-muted w-14 shrink-0">{a.time}</span>
                    <span className="font-mono font-semibold text-2xs shrink-0" style={{ color: s.c }}>{a.string}</span>
                    <span className="text-2xs text-text-secondary flex-1 truncate">{a.issue}</span>
                    <span className="font-mono font-bold text-3xs px-2 py-0.5 rounded-full shrink-0"
                      style={{ color: s.c, background: s.bg, border: `1px solid ${s.b}` }}>
                      {a.severity}
                    </span>
                  </motion.div>
                );
              })}
            </div>
            <div className="pt-2 mt-3 text-2xs text-text-dim font-mono"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              Auto-isolation: &lt;12ms solid-state DC breaker · BESS dispatch on detect
            </div>
          </div>
        </div>

        {/* ── ROW 5: String Health Heatmap ── */}
        <div className="col-span-12" data-tour="heatmap-row">
          <div className="data-card rounded-xl2 p-5">
            <div className="flex items-center justify-between mb-4 pb-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div className="label-uppercase mb-1">32-Module String Health Heatmap · 4×8 Array</div>
                <span className="text-jade font-mono font-semibold text-2xs">
                  {32 - Object.keys(faultedPanels).length}/32 Online · 98.4% Net Yield Factor
                </span>
              </div>
              <button
                onClick={() => setInspectPanelId(inspectPanelId || 14)}
                className="badge-gold hover:bg-gold/25 transition-all cursor-pointer active:scale-95"
                title="Open live telemetry inspector"
              >
                Click to Inspect
              </button>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: 32 }, (_, idx) => {
                const id   = idx + 1;
                const fault = faultedPanels[id];
                const isFault = fault === 'Offline';
                const isWarn  = fault === 'Underperforming';
                let bg = 'rgba(45,212,168,0.10)', border = 'rgba(45,212,168,0.22)', tc = '#2dd4a8', glow = '';
                if (isFault) { bg = 'rgba(229,72,77,0.14)'; border = 'rgba(229,72,77,0.30)'; tc = '#e5484d'; glow = '0 0 10px rgba(229,72,77,0.30)'; }
                if (isWarn)  { bg = 'rgba(201,151,62,0.14)'; border = 'rgba(201,151,62,0.28)'; tc = '#c9973e'; glow = '0 0 8px rgba(201,151,62,0.25)'; }
                return (
                  <motion.div key={id}
                    whileHover={{ scale: 1.10, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setInspectPanelId(id);
                      onSelectPanel?.(id);
                    }}
                    className="h-10 rounded-lg flex items-center justify-center cursor-pointer transition-shadow"
                    style={{ background: bg, border: `1px solid ${border}`, boxShadow: glow }}
                    title={`Module A-${id}: ${fault || 'Nominal (100%)'} · Click to Inspect Telemetry`}
                  >
                    <span className="text-3xs font-mono font-bold" style={{ color: tc }}>{id}</span>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-5 text-2xs text-text-secondary font-mono">
                {[['Nominal', 'rgba(45,212,168,0.35)', 'rgba(45,212,168,0.40)'],
                  ['Underperforming', 'rgba(201,151,62,0.35)', 'rgba(201,151,62,0.40)'],
                  ['Fault/Isolated', 'rgba(229,72,77,0.35)', 'rgba(229,72,77,0.40)']].map(([l, bg, b]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded" style={{ background: bg, border: `1px solid ${b}` }} />{l}
                  </span>
                ))}
              </div>
              <span className="text-3xs text-text-dim font-mono">Click any module cell to open hardware telemetry inspector</span>
            </div>
          </div>
        </div>

      </motion.div>

      {/* ── Live Module Telemetry Inspector Modal ── */}
      <AnimatePresence>
        {inspectPanelId !== null && (
          <ModuleInspectorModal
            panelId={inspectPanelId}
            fault={faultedPanels[inspectPanelId]}
            onClose={() => setInspectPanelId(null)}
            onSetFault={(type) => onSetPanelFault?.(inspectPanelId, type)}
            onViewIn3D={() => {
              onSelectPanel?.(inspectPanelId);
              onNavigateTab?.('3d');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export { Dashboard };
export default Dashboard;
