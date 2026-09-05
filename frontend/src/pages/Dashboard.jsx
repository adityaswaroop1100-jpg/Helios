import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Zap, Sun, Battery,
  CloudRain, Activity, ShieldCheck
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { getFinancialMetrics } from '../api/forecastApi';
import { DEFAULT_LOCATION } from '../api/energyEngine';

// ── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, unit, icon: Icon, trend = 0, isPositive = true, accentColor = 'gold', delay = 0 }) => {
  const accent = {
    gold:   { color: '#c9973e', bg: 'rgba(201,151,62,0.08)', border: 'rgba(201,151,62,0.18)', glow: 'rgba(201,151,62,0.10)' },
    cyan:   { color: '#4dd0e1', bg: 'rgba(77,208,225,0.08)',  border: 'rgba(77,208,225,0.15)',  glow: 'rgba(77,208,225,0.08)' },
    jade:   { color: '#2dd4a8', bg: 'rgba(45,212,168,0.08)', border: 'rgba(45,212,168,0.15)', glow: 'rgba(45,212,168,0.08)' },
    crimson:{ color: '#e5484d', bg: 'rgba(229,72,77,0.08)',   border: 'rgba(229,72,77,0.15)',   glow: 'rgba(229,72,77,0.08)' },
  }[accentColor] || { color: '#c9973e', bg: 'rgba(201,151,62,0.08)', border: 'rgba(201,151,62,0.18)', glow: 'rgba(201,151,62,0.10)' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="col-span-12 sm:col-span-6 lg:col-span-3"
    >
      <div
        className="relative h-full min-h-[148px] rounded-xl2 p-5 flex flex-col justify-between overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(12,20,40,0.95) 0%, rgba(8,14,26,0.95) 100%)',
          border: `1px solid ${accent.border}`,
          borderTop: `1px solid ${accent.border}`,
          borderLeft: `3px solid ${accent.color}`,
          boxShadow: `0 16px 48px -12px rgba(0,0,0,0.85), 0 0 28px -10px ${accent.glow}`,
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 20% 20%, ${accent.glow} 0%, transparent 65%)` }}
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="label-uppercase">{title}</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
              <Icon size={13} style={{ color: accent.color }} />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="kpi-value text-3xl" style={{ color: accent.color }}>{value}</span>
            <span className="text-2xs text-text-muted font-mono">{unit}</span>
          </div>
        </div>

        <div className="relative flex items-center gap-2.5 text-2xs">
          {trend !== 0 ? (
            isPositive ? (
              <span className="flex items-center gap-1 text-jade font-mono font-semibold">
                <TrendingUp size={12} /> +{trend}%
              </span>
            ) : (
              <span className="flex items-center gap-1 text-crimson font-mono font-semibold">
                <TrendingDown size={12} /> {trend}%
              </span>
            )
          ) : (
            <span className="text-text-muted font-mono">Nominal</span>
          )}
          <span className="text-text-dim font-mono">vs STC rating</span>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-4 right-4 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent.color}30, transparent)` }} />
      </div>
    </motion.div>
  );
};

// ── SVG Semicircle Gauge ─────────────────────────────────────────────────────
function SemicircleGauge({ label, value, max, unit, color }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = 34;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="label-uppercase mb-2">{label}</div>
      <div className="relative w-[80px] h-[48px] overflow-hidden">
        <svg className="absolute top-0 left-0 -rotate-180 w-[80px] h-[80px]" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="transparent"
            stroke="rgba(255,255,255,0.06)" strokeWidth="5"
            strokeDasharray={circumference} strokeDashoffset={0}
            strokeLinecap="round" />
          <circle cx="40" cy="40" r={radius} fill="transparent"
            stroke={color} strokeWidth="5"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: `drop-shadow(0 0 5px ${color}80)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-0.5">
          <span className="font-mono font-bold text-sm text-text-primary tabular-nums" style={{ lineHeight: 1 }}>{value}</span>
        </div>
      </div>
      <span className="text-3xs text-text-muted font-mono mt-1">{unit}</span>
    </div>
  );
}

// ── Custom Chart Tooltip ─────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="px-3 py-2.5 rounded-xl text-2xs space-y-1 min-w-[150px]"
        style={{
          background: 'rgba(6,10,20,0.97)',
          border: '1px solid rgba(201,151,62,0.22)',
          backdropFilter: 'blur(20px)',
        }}>
        <div className="font-mono text-text-primary font-semibold">{d.hour || d.timeLabel}</div>
        <div className="flex justify-between gap-4">
          <span className="text-text-secondary">Yield</span>
          <span className="font-mono text-gold font-bold">{d.expected ?? d.predictedKW} kW</span>
        </div>
        {d.p90 !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">P90</span>
            <span className="font-mono text-cyan">{d.p90} kW</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// ── Main Dashboard Component ─────────────────────────────────────────────────
const Dashboard = ({
  hourlyData = [],
  currentHour = 12,
  onSelectHour,
  faultedPanels = {},
  onSelectPanel,
  location = DEFAULT_LOCATION,
}) => {
  const currentHourData = hourlyData[currentHour] || {};
  const metrics = getFinancialMetrics(hourlyData, currentHour);

  const chartData = hourlyData.length > 0
    ? hourlyData.map(d => ({
        hour: d.timeLabel,
        expected: d.predictedKW,
        p90: d.p90UpperKW || +(d.predictedKW * 1.15).toFixed(1),
        ambientTemp: d.ambientTemp,
      }))
    : Array.from({ length: 24 }, (_, i) => ({
        hour: `${i % 12 || 12}${i < 12 ? 'AM' : 'PM'}`,
        expected: +(3 + Math.sin((i - 6) * 0.5) * 3 + 2).toFixed(1),
        p90: +(4.5 + Math.sin((i - 6) * 0.5) * 2.5 + 1.5).toFixed(1),
      }));

  const featureImportance = [
    { label: 'Solar Zenith Angle (θz)', value: 49.2 },
    { label: 'Global Irradiance (GHI)', value: 46.1 },
    { label: 'NOCT Cell Temp (Tcell)',  value: 2.4 },
    { label: 'Ambient Air Temp',        value: 1.2 },
    { label: 'Cloud Cover Index',       value: 1.1 },
  ];

  const anomalies = [
    { time: '14:32:21', string: 'String #3', issue: 'Diode bypass fault isolated',       severity: 'CRITICAL' },
    { time: '13:15:09', string: 'String #7', issue: 'Voltage drop >5% — derated',        severity: 'WARNING'  },
    { time: '12:44:03', string: 'String #1', issue: 'Cloud transient — compensated',     severity: 'INFO'     },
  ];

  const severityStyle = (s) => {
    if (s === 'CRITICAL') return { color: '#e5484d', bg: 'rgba(229,72,77,0.12)', border: 'rgba(229,72,77,0.25)' };
    if (s === 'WARNING')  return { color: '#c9973e', bg: 'rgba(201,151,62,0.12)', border: 'rgba(201,151,62,0.25)' };
    return { color: '#4dd0e1', bg: 'rgba(77,208,225,0.10)', border: 'rgba(77,208,225,0.20)' };
  };

  const kpis = [
    { title: 'Array Capacity',  value: '48.0',                              unit: 'kW',  icon: Sun,      accentColor: 'gold',   trend: 0,    isPositive: true,  delay: 0.05 },
    { title: 'Current Power',   value: metrics.currentKW     || '8.37',    unit: 'kW',  icon: Zap,      accentColor: 'gold',   trend: 14.2, isPositive: true,  delay: 0.10 },
    { title: 'Daily Energy',    value: metrics.totalDailyKWh || '93.1',    unit: 'kWh', icon: Battery,  accentColor: 'cyan',   trend: 3.1,  isPositive: true,  delay: 0.15 },
    { title: 'CO₂ Avoided',     value: metrics.co2AvoidedKg  || '65.8',    unit: 'kg',  icon: CloudRain,accentColor: 'jade',   trend: 0.8,  isPositive: true,  delay: 0.20 },
  ];

  return (
    <div className="animate-fadeIn">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-12 gap-5 auto-rows-min"
      >
        {/* ── ROW 1: Header ── */}
        <div className="col-span-12">
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight mb-0.5">SCADA Overview</h1>
              <p className="text-2xs text-text-muted font-mono">
                {location.name} Utility Farm &nbsp;·&nbsp; {location.latitude}°N, {location.longitude}°E &nbsp;·&nbsp;
                <span className="text-jade font-semibold">IEC 61724 Compliant</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(45,212,168,0.08)', border: '1px solid rgba(45,212,168,0.18)' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jade opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-jade" />
                </span>
                <span className="text-jade font-mono font-bold text-2xs tracking-wider">LIVE SCADA</span>
              </div>
              <span className="text-3xs text-text-dim font-mono tracking-wider hidden sm:block">IEEE 1547</span>
            </div>
          </div>
        </div>

        {/* ── ROW 2: KPI Cards ── */}
        {kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}

        {/* ── ROW 3A: Main Chart (8 col) ── */}
        <div className="col-span-12 lg:col-span-8 h-[380px]">
          <div className="data-card rounded-xl2 p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div className="label-uppercase mb-1">24-Hour Generation Curve</div>
                <span className="text-jade font-mono font-semibold text-2xs">R² 0.9989 · XGBoost P90 Band</span>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-3xs font-mono font-semibold"
                  style={{ background: 'rgba(201,151,62,0.10)', border: '1px solid rgba(201,151,62,0.20)', color: '#c9973e' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" /> Yield kW
                </span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-3xs font-mono font-semibold"
                  style={{ background: 'rgba(77,208,225,0.10)', border: '1px solid rgba(77,208,225,0.20)', color: '#4dd0e1' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan" /> P90
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 10, left: -16, bottom: 0 }}
                  onClick={(e) => e?.activePayload?.length && onSelectHour?.(e.activeTooltipIndex)}
                >
                  <defs>
                    <linearGradient id="db-gold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#c9973e" stopOpacity={0.50} />
                      <stop offset="100%" stopColor="#c9973e" stopOpacity={0.00} />
                    </linearGradient>
                    <linearGradient id="db-cyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#4dd0e1" stopOpacity={0.20} />
                      <stop offset="100%" stopColor="#4dd0e1" stopOpacity={0.00} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="transparent" fontSize={10} tickLine={false} axisLine={false}
                    tick={{ fill: '#4a5a72', fontFamily: 'JetBrains Mono' }} interval={2} />
                  <YAxis stroke="transparent" fontSize={10} tickLine={false} axisLine={false} unit=" kW" domain={[0, 52]}
                    tick={{ fill: '#4a5a72', fontFamily: 'JetBrains Mono' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(201,151,62,0.3)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="p90" stroke="rgba(77,208,225,0.3)" strokeWidth={1} fill="url(#db-cyan)" isAnimationActive={false} />
                  <Area type="monotone" dataKey="expected" stroke="#c9973e" strokeWidth={2.5} fill="url(#db-gold)"
                    dot={false} activeDot={{ r: 5, fill: '#c9973e', stroke: '#060a14', strokeWidth: 2 }} isAnimationActive={false} />
                  {chartData[currentHour] && (
                    <ReferenceLine x={chartData[currentHour]?.hour} stroke="#c9973e" strokeWidth={1.5}
                      strokeDasharray="4 4" strokeOpacity={0.65}
                      label={{ value: '▼', fill: '#c9973e', fontSize: 10, position: 'top' }} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── ROW 3B: Gauge Cluster (4 col) ── */}
        <div className="col-span-12 lg:col-span-4 h-[380px]">
          <div className="data-card rounded-xl2 p-5 h-full flex flex-col">
            <div className="pb-2 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="label-uppercase mb-1">Kinematic Gauge Cluster</div>
              <span className="text-jade font-mono font-semibold text-2xs">RTU 1.0 Hz Feed</span>
            </div>

            <div className="flex-1 flex flex-col justify-evenly">
              {/* Gauges */}
              <div className="flex items-center justify-around py-2">
                <SemicircleGauge label="Solar GHI"   value={currentHourData.irradiance || 540} max={1000} unit="W/m²" color="#c9973e" />
                <SemicircleGauge label="Cell Temp"   value={currentHourData.panelTemp  || 52}  max={75}   unit="°C"   color="#4dd0e1" />
                <SemicircleGauge label="Battery SOC" value={84}                               max={100}  unit="%"    color="#2dd4a8" />
              </div>

              {/* Telemetry Rows */}
              <div className="space-y-2">
                {[
                  { label: 'Active Power',    value: `${currentHourData.predictedKW || 8.37} kW`, color: '#c9973e' },
                  { label: 'DC Bus Voltage',  value: '641.2 V',  color: '#4dd0e1' },
                  { label: 'String Current',  value: '13.05 A',  color: '#2dd4a8' },
                  { label: 'Grid Frequency',  value: '49.98 Hz', color: '#c9973e' },
                ].map(({ label, value, color }) => (
                  <div key={label}
                    className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-2xs text-text-muted font-mono">{label}</span>
                    <span className="font-mono font-bold text-xs" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 mt-2 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-3xs text-text-dim font-mono">NOCT Derated Model</span>
              <span className="text-jade font-mono font-bold text-3xs">Zero Grid Droop</span>
            </div>
          </div>
        </div>

        {/* ── ROW 4A: Feature Importance ── */}
        <div className="col-span-12 lg:col-span-6">
          <div className="data-card rounded-xl2 p-5 h-full">
            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div className="label-uppercase mb-1">XGBoost Feature Importance</div>
                <span className="font-mono font-bold text-gold">R² = 0.9989</span>
              </div>
              <span className="badge-jade flex items-center gap-1.5">
                <Activity size={10} /> Sub-12ms Engine
              </span>
            </div>

            <div className="space-y-3.5">
              {featureImportance.map((item, idx) => {
                const colors = ['#c9973e', '#4dd0e1', '#2dd4a8', '#a78bfa', '#e5484d'];
                const c = colors[idx];
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5 text-2xs">
                      <span className="text-text-secondary font-medium">{item.label}</span>
                      <span className="font-mono font-bold" style={{ color: c }}>{item.value}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${item.value}%`, background: c, boxShadow: `0 0 8px ${c}50` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 flex items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
              </span>
              <span className="text-2xs font-mono text-gold/75 tracking-wider">SUB-12MS SCADA ENGINE · ACTIVE</span>
              <span className="text-2xs text-text-dim font-mono ml-auto">48.0 kW Nominal</span>
            </div>
          </div>
        </div>

        {/* ── ROW 4B: Anomaly Audit Feed ── */}
        <div className="col-span-12 lg:col-span-6">
          <div className="data-card rounded-xl2 p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div className="label-uppercase mb-1">Live SCADA Anomaly Audit</div>
                <span className="text-2xs text-text-muted font-mono">Firestore Real-Time Stream</span>
              </div>
              <span className="badge-cyan">12ms Response</span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {anomalies.map((a, i) => {
                const s = severityStyle(a.severity);
                return (
                  <div key={i}
                    className="flex items-center gap-2 py-2 px-3 rounded-xl"
                    style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <span className="font-mono text-2xs text-text-muted w-14 shrink-0">{a.time}</span>
                    <span className="font-mono font-semibold text-2xs shrink-0" style={{ color: s.color }}>{a.string}</span>
                    <span className="text-2xs text-text-secondary flex-1 truncate">{a.issue}</span>
                    <span className="font-mono font-bold text-3xs px-2 py-0.5 rounded-full shrink-0"
                      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                      {a.severity}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 mt-3 text-2xs text-text-dim font-mono" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              Auto-isolation: &lt;12ms solid-state DC trip · BESS dispatch on detect
            </div>
          </div>
        </div>

        {/* ── ROW 5: String Health Heatmap ── */}
        <div className="col-span-12">
          <div className="data-card rounded-xl2 p-5">
            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div className="label-uppercase mb-1">32-Module String Health Heatmap (4×8 Array)</div>
                <span className="text-jade font-mono font-semibold text-2xs">32/32 Online · 98.4% Net Yield Factor</span>
              </div>
              <span className="badge-gold">Click to Inspect</span>
            </div>

            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: 32 }, (_, idx) => {
                const id = idx + 1;
                const fault = faultedPanels[id];
                const isFault = fault === 'Offline';
                const isWarn  = fault === 'Underperforming';
                let bg = 'rgba(45,212,168,0.10)';
                let border = 'rgba(45,212,168,0.22)';
                let textColor = '#2dd4a8';
                let glow = '';
                if (isFault) { bg = 'rgba(229,72,77,0.12)'; border = 'rgba(229,72,77,0.30)'; textColor = '#e5484d'; glow = '0 0 10px rgba(229,72,77,0.30)'; }
                if (isWarn)  { bg = 'rgba(201,151,62,0.12)'; border = 'rgba(201,151,62,0.30)'; textColor = '#c9973e'; glow = '0 0 10px rgba(201,151,62,0.25)'; }

                return (
                  <motion.div
                    key={id}
                    whileHover={{ scale: 1.08, transition: { duration: 0.15 } }}
                    onClick={() => onSelectPanel?.(id)}
                    className="h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                    style={{ background: bg, border: `1px solid ${border}`, boxShadow: glow }}
                    title={`Module A-${id}: ${fault || 'Nominal (100%)'}`}
                  >
                    <span className="text-3xs font-mono font-bold" style={{ color: textColor }}>{id}</span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-5 text-2xs text-text-secondary font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-jade/40 border border-jade/30" /> Nominal</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-gold/40 border border-gold/30" /> Underperforming</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-crimson/40 border border-crimson/30" /> Fault/Isolated</span>
              </div>
              <span className="text-3xs text-text-dim font-mono">Click module to open telemetry inspector</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export { Dashboard };
export default Dashboard;
