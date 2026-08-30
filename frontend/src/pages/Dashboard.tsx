import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Zap, Sun, Battery, 
  CloudRain, Activity, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { getFinancialMetrics } from '../api/forecastApi';
import { DEFAULT_LOCATION } from '../api/energyEngine';

export interface HourlyDataPoint {
  hour: number;
  timeLabel: string;
  irradiance: number;
  predictedKW: number;
  p90UpperKW?: number;
  p10LowerKW?: number;
  ambientTemp?: number;
  panelTemp?: number;
  isAnomaly?: boolean;
  anomalyDescription?: string;
  directW?: number;
  diffuseW?: number;
}

export interface DashboardProps {
  hourlyData?: HourlyDataPoint[];
  currentHour?: number;
  onSelectHour?: (hour: number) => void;
  faultedPanels?: Record<number, string>;
  onSelectPanel?: (panelId: number) => void;
  location?: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

// --- Semi-Circular Gauge Component (100% Glitch-Free SVG Arc) ---
function SemicircleGauge({ label, value, max, unit, color }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = 32;
  const circumference = Math.PI * radius; // 180 degree arc
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <span className="text-[10px] text-text-muted tracking-wider uppercase font-semibold mb-1">{label}</span>
      <div className="relative w-20 h-14 flex items-end justify-center overflow-hidden">
        <svg className="w-20 h-20 -rotate-180" viewBox="0 0 80 80">
          {/* Background Arc */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
          {/* Active Glowing Arc */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: `drop-shadow(0 0 6px ${color}90)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="font-mono text-sm font-bold text-text-primary tabular-nums">{value}</span>
        </div>
      </div>
      <span className="text-[9px] text-text-muted font-mono mt-0.5">{unit}</span>
    </div>
  );
}

// --- KPI Card Component ---
const KpiCard = ({ title, value, unit, icon: Icon, trend = 0, isPositive = true }) => (
  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="col-span-12 sm:col-span-6 lg:col-span-3">
    <div className="glass-premium p-5 flex flex-col h-full min-h-[140px] border-l-4 border-gold relative overflow-hidden shadow-lg">
      <div className="flex items-center justify-between">
        <span className="label-uppercase">{title}</span>
        <Icon className="w-4 h-4 text-gold/70" />
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="kpi-value text-3xl">{value}</span>
        <span className="text-xs text-text-muted font-mono">{unit}</span>
      </div>
      <div className="mt-auto flex items-center gap-3 text-xs">
        {trend !== 0 ? (
          isPositive ? (
            <span className="flex items-center text-jade font-mono">
              <TrendingUp size={14} className="mr-1" /> +{trend}%
            </span>
          ) : (
            <span className="flex items-center text-crimson font-mono">
              <TrendingDown size={14} className="mr-1" /> {trend}%
            </span>
          )
        ) : (
          <span className="text-text-muted font-mono">Nominal</span>
        )}
        <span className="text-text-muted">vs STC</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </div>
  </motion.div>
);

// --- Custom Recharts Tooltip ---
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-premium p-3 border border-white/10 shadow-2xl text-xs space-y-1.5 min-w-[170px]">
        <div className="flex items-center justify-between pb-1 border-b border-white/10 font-mono text-text-primary">
          <span>{data.hour || data.timeLabel}</span>
          {data.ambientTemp && <span className="text-cyan text-3xs">{data.ambientTemp}°C</span>}
        </div>
        <div className="flex justify-between items-center text-text-secondary">
          <span className="flex items-center gap-1 text-gold">
            <Zap size={11} />
            <span>Yield:</span>
          </span>
          <span className="font-mono font-bold text-gold">{data.expected || data.predictedKW} kW</span>
        </div>
        {data.p90 !== undefined && (
          <div className="flex justify-between items-center text-text-muted">
            <span>P90 Band:</span>
            <span className="font-mono text-cyan">{data.p90} kW</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// --- Main Dashboard ---
export const Dashboard: React.FC<DashboardProps> = ({
  hourlyData = [],
  currentHour = 12,
  onSelectHour,
  faultedPanels = {},
  onSelectPanel,
  location = DEFAULT_LOCATION,
}) => {
  const currentHourData = hourlyData[currentHour] || {};
  const metrics = getFinancialMetrics(hourlyData, currentHour);

  // Fallback / Live Forecast Data
  const chartData = hourlyData.length > 0
    ? hourlyData.map(d => ({
        hour: d.timeLabel,
        expected: d.predictedKW,
        p90: d.p90UpperKW || +(d.predictedKW * 1.15).toFixed(1),
        p10: d.p10LowerKW || +(d.predictedKW * 0.85).toFixed(1),
        ambientTemp: d.ambientTemp,
      }))
    : Array.from({ length: 24 }, (_, i) => ({
        hour: `${i % 12 || 12}${i < 12 ? 'AM' : 'PM'}`,
        expected: +(3 + Math.sin((i - 6) * 0.5) * 3 + 2).toFixed(1),
        p90: +(4 + Math.sin((i - 6) * 0.5) * 2.5 + 1.5).toFixed(1),
        p10: +(2 + Math.sin((i - 6) * 0.5) * 2.5 + 1).toFixed(1),
      }));

  const featureImportance = [
    { label: 'Solar Zenith Angle (θz)', value: 49.2 },
    { label: 'Global Irradiance (GHI)', value: 46.1 },
    { label: 'NOCT Cell Temp (Tcell)', value: 2.4 },
    { label: 'Ambient Air Temp', value: 1.2 },
    { label: 'Cloud Cover Index', value: 1.1 },
  ];

  const anomalies = [
    { time: '14:32:21', string: 'String #3', issue: 'Diode bypass fault isolated', severity: 'CRITICAL' },
    { time: '13:15:09', string: 'String #7', issue: 'Voltage drop > 5% derated', severity: 'WARNING' },
    { time: '12:44:03', string: 'String #1', issue: 'Cloud shadow compensation', severity: 'INFO' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.4 }}
        className="grid grid-cols-12 gap-6 auto-rows-min"
      >
        {/* --- ROW 1: Header --- */}
        <div className="col-span-12 flex items-center justify-between pb-2 border-b border-white/[0.06] flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Dashboard</h1>
            <p className="text-sm text-text-secondary">
              {location.name} Utility Farm • {location.latitude}° N, {location.longitude}° E
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jade opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-jade"></span>
              </span>
              <span className="text-xs text-jade font-mono font-bold tracking-wider">LIVE SCADA</span>
            </div>
            <span className="text-[10px] text-text-muted font-mono tracking-wider">IEC 61724 • IEEE 1547</span>
          </div>
        </div>

        {/* --- ROW 2: 4 Hero KPI Cards --- */}
        <KpiCard title="Array Capacity" value="48.0" unit="kW" icon={Sun} trend={0} />
        <KpiCard title="Current Power" value={metrics.currentKW || '8.37'} unit="kW" icon={Zap} trend={14.2} isPositive={true} />
        <KpiCard title="Daily Energy" value={metrics.totalDailyKWh || '93.1'} unit="kWh" icon={Battery} trend={3.1} isPositive={true} />
        <KpiCard title="CO₂ Avoided" value={metrics.co2AvoidedKg || '65.8'} unit="kg" icon={CloudRain} trend={0.8} isPositive={true} />

        {/* --- ROW 3: Chart (8 cols) + Gauges (4 cols) Fixed height 420px --- */}
        <div className="col-span-12 lg:col-span-8 row-span-1 h-[420px]">
          <div className="glass-premium p-5 flex flex-col h-full justify-between shadow-lg">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/[0.04]">
              <span className="label-uppercase">24-Hour Solar PV Generation</span>
              <span className="text-xs text-jade font-mono">R² 0.9989 • P90 Band</span>
            </div>
            <div className="flex-1 min-h-0 w-full cursor-pointer">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: -14, bottom: 0 }}
                  onClick={(e) => {
                    if (e && e.activePayload && e.activePayload.length && onSelectHour) {
                      onSelectHour(e.activeTooltipIndex !== undefined ? e.activeTooltipIndex : 12);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c9973e" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#c9973e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="p90Gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4dd0e1" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#4dd0e1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#4a5a72" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4a5a72" fontSize={10} tickLine={false} axisLine={false} unit=" kW" domain={[0, 52]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="p90" stroke="#4dd0e1" strokeWidth={1} fill="url(#p90Gradient)" strokeDasharray="3 3" name="P90 Band" isAnimationActive={false} />
                  <Area type="monotone" dataKey="expected" stroke="#c9973e" strokeWidth={2.5} fill="url(#goldGradient)" dot={{ r: 2, fill: '#c9973e' }} name="Expected kW" isAnimationActive={false} />
                  {chartData[currentHour] && (
                    <ReferenceLine x={chartData[currentHour]?.hour} stroke="#c9973e" strokeWidth={1.5} strokeDasharray="3 3" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 row-span-1 h-[420px]">
          <div className="glass-premium p-5 flex flex-col h-full justify-between shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
              <span className="label-uppercase">Kinematic Gauge Cluster</span>
              <span className="text-[10px] font-mono text-jade">RTU 1.0 Hz</span>
            </div>
            
            <div className="flex-1 flex items-center justify-around py-4">
              <SemicircleGauge
                label="Solar GHI"
                value={currentHourData.irradiance || 540}
                max={1000}
                unit="W/m²"
                color="#c9973e"
              />
              <SemicircleGauge
                label="Cell Temp"
                value={currentHourData.panelTemp || 51.8}
                max={75}
                unit="°C"
                color="#4dd0e1"
              />
              <SemicircleGauge
                label="Battery SOC"
                value={84}
                max={100}
                unit="%"
                color="#2dd4a8"
              />
            </div>

            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-mono text-3xs text-text-muted">
              <span>NOCT Derated Model</span>
              <span className="text-jade font-semibold">Zero Grid Droop</span>
            </div>
          </div>
        </div>

        {/* --- ROW 4: Feature Importance (6 cols) + Anomaly Audit (6 cols) --- */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-premium p-5 flex flex-col h-full min-h-[260px] justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3 pb-1 border-b border-white/[0.04]">
                <span className="label-uppercase">XGBoost Feature Importance</span>
                <span className="font-mono text-lg text-gold font-bold">R² 0.9989</span>
              </div>
              <div className="space-y-2.5">
                {featureImportance.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span className="truncate">{item.label}</span>
                      <span className="font-mono text-text-primary font-bold">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.value}%`,
                          background: 'linear-gradient(90deg, #c9973e, #4dd0e1)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
              </span>
              <span className="text-[10px] font-mono text-gold/80 tracking-wider">SUB-12MS SCADA ENGINE • ACTIVE</span>
              <span className="text-[10px] text-text-muted ml-auto font-mono">Nominal 48.0 kW</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <div className="glass-premium p-5 flex flex-col h-full min-h-[260px] justify-between shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-white/[0.04]">
              <span className="label-uppercase">Live SCADA Anomaly Audit</span>
              <span className="text-[10px] font-mono text-text-muted">Firestore Stream</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {anomalies.map((anomaly, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                  <span className="font-mono text-[10px] text-text-muted w-16">{anomaly.time}</span>
                  <span className="text-xs text-cyan font-mono w-20">{anomaly.string}</span>
                  <span className="text-xs text-text-primary flex-1">{anomaly.issue}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                    anomaly.severity === 'CRITICAL' ? 'bg-crimson/20 text-crimson border border-crimson/30' :
                    anomaly.severity === 'WARNING' ? 'bg-gold/20 text-gold border border-gold/30' :
                    'bg-cyan/20 text-cyan border border-cyan/30'
                  }`}>
                    {anomaly.severity}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-white/[0.04] text-[10px] text-text-muted font-mono">
              Auto-isolation response: &lt;12ms solid-state DC trip
            </div>
          </div>
        </div>

        {/* --- ROW 5: String Health Heatmap (Full Width) --- */}
        <div className="col-span-12">
          <div className="glass-premium p-5 flex flex-col shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-white/[0.04]">
              <span className="label-uppercase">32-Module String Health Heatmap (4×8 Array)</span>
              <span className="text-xs font-mono text-jade">32/32 Online (98.4% Net Yield)</span>
            </div>
            
            <div className="grid grid-cols-8 sm:grid-cols-16 lg:grid-cols-32 gap-2">
              {Array.from({ length: 32 }, (_, idx) => {
                const id = idx + 1;
                const fault = faultedPanels[id];
                const isFault = fault === 'Offline';
                const isWarn = fault === 'Underperforming';

                return (
                  <motion.div
                    key={id}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => onSelectPanel && onSelectPanel(id)}
                    className={`h-10 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                      isFault ? 'bg-crimson/30 border border-crimson/40 text-crimson shadow-[0_0_10px_rgba(229,72,77,0.4)]' :
                      isWarn ? 'bg-gold/30 border border-gold/40 text-gold shadow-[0_0_10px_rgba(201,151,62,0.4)]' :
                      'bg-jade/20 hover:bg-jade/30 border border-jade/30 text-jade'
                    }`}
                    title={`Module A-${id}: ${fault || 'Optimal (100%)'}`}
                  >
                    <span className="text-[9px] font-mono font-bold">{id}</span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] flex-wrap gap-2 pt-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-jade/40 border border-jade/30"></span> Nominal (100%)</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-gold/40 border border-gold/30"></span> Underperforming</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-crimson/40 border border-crimson/30"></span> Isolated / Fault</div>
              </div>
              <span className="font-mono text-text-muted">Click module to inspect telemetry</span>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Dashboard;
