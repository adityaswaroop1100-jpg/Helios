import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Zap, Sun, Battery, 
  CloudRain, Activity, AlertTriangle 
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend, LineChart, Line
} from 'recharts';

// --- Mock Data ---
const kpiData = {
  capacity: '48.0 kW',
  currentPower: '8.37 kW',
  dailyEnergy: '93.1 kWh',
  co2Avoided: '65.8 kg'
};

const forecastData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i % 12 || 12}${i < 12 ? 'AM' : 'PM'}`,
  expected: 3 + Math.sin((i - 6) * 0.5) * 3 + 2,
  p90: 4 + Math.sin((i - 6) * 0.5) * 2.5 + 1.5,
  p10: 2 + Math.sin((i - 6) * 0.5) * 2.5 + 1,
}));

const heatmapData = Array.from({ length: 4 }, (_, row) =>
  Array.from({ length: 8 }, (_, col) => ({
    id: `S${row + 1}-M${col + 1}`,
    status: Math.random() > 0.85 ? 'fault' : Math.random() > 0.7 ? 'warn' : 'nominal'
  }))
);

const anomalies = [
  { time: '14:32:21', string: 'String #3', issue: 'Diode bypass fault', severity: 'CRITICAL' },
  { time: '13:15:09', string: 'String #7', issue: 'Voltage drop > 5%', severity: 'WARNING' },
  { time: '12:44:03', string: 'String #1', issue: 'Cloud pass-through', severity: 'INFO' },
];

const featureImportance = [
  { label: 'Solar Zenith Angle (θz)', value: 49.2 },
  { label: 'Global Irradiance (GHI)', value: 46.1 },
  { label: 'NOCT Cell Temp (Tcell)', value: 2.4 },
  { label: 'Ambient Air Temp', value: 1.2 },
  { label: 'Cloud Cover Index', value: 1.1 },
];

// --- KPI Card Component ---
const KpiCard = ({ title, value, unit, change, icon: Icon, trend }) => (
  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="col-span-12 sm:col-span-6 lg:col-span-3">
    <div className="glass-premium p-5 flex flex-col h-full min-h-[140px] border-l-4 border-gold relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="label-uppercase">{title}</span>
        <Icon className="w-4 h-4 text-gold/60" />
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="kpi-value text-3xl">{value}</span>
        <span className="text-xs text-text-muted font-mono">{unit}</span>
      </div>
      <div className="mt-auto flex items-center gap-3 text-xs">
        {trend > 0 ? (
          <span className="flex items-center text-jade">
            <TrendingUp size={14} className="mr-1" /> +{trend}%
          </span>
        ) : (
          <span className="flex items-center text-crimson">
            <TrendingDown size={14} className="mr-1" /> {trend}%
          </span>
        )}
        <span className="text-text-muted">vs STC</span>
      </div>
      {/* Subtle glow line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </div>
  </motion.div>
);

// --- Main Dashboard ---
export default function Dashboard() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="grid grid-cols-12 gap-6 auto-rows-min"
      >
        {/* --- ROW 1: Header --- */}
        <div className="col-span-12 flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Dashboard</h1>
            <p className="text-sm text-text-secondary">Chengalpattu Utility Farm • 12.82° N, 80.04° E</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jade opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-jade"></span>
              </span>
              <span className="text-xs text-text-secondary font-mono">LIVE</span>
            </div>
            <span className="text-[10px] text-text-muted font-mono tracking-wider">IEC 61724 • IEEE 1547</span>
          </div>
        </div>

        {/* --- ROW 2: 4 KPI Cards --- */}
        <KpiCard title="Array Capacity" value="48.0" unit="kW" icon={Sun} trend={0} />
        <KpiCard title="Current Power" value="8.37" unit="kW" icon={Zap} trend={14.2} />
        <KpiCard title="Daily Energy" value="93.1" unit="kWh" icon={Battery} trend={3.1} />
        <KpiCard title="CO₂ Avoided" value="65.8" unit="kg" icon={CloudRain} trend={0.8} />

        {/* --- ROW 3: Chart (8 cols) + Gauges (4 cols) Fixed height 420px --- */}
        <div className="col-span-12 lg:col-span-8 row-span-1 h-[420px]">
          <div className="glass-premium p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="label-uppercase">24-Hour Solar PV Generation</span>
              <span className="text-xs text-jade font-mono">R² 0.9989 • P90 Band</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9973e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#c9973e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="p90Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4dd0e1" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#4dd0e1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#4a5a72" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4a5a72" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(6,10,20,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', backdropFilter: 'blur(16px)' }}
                  labelStyle={{ color: '#7a8ba3', fontSize: 10 }}
                  itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="p90" stroke="#4dd0e1" strokeWidth={1} fill="url(#p90Gradient)" strokeDasharray="3 3" name="P90 Band" />
                <Area type="monotone" dataKey="expected" stroke="#c9973e" strokeWidth={3} fill="url(#goldGradient)" dot={{ r: 2, fill: '#c9973e' }} name="Expected kW" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 row-span-1 h-[420px]">
          <div className="glass-premium p-5 flex flex-col h-full">
            <span className="label-uppercase mb-2">Kinematic Gauge Cluster</span>
            <div className="flex-1 flex items-center justify-around">
              {[
                { label: 'GHI', value: 540, unit: 'W/m²', color: '#c9973e' },
                { label: 'Cell Temp', value: 51.8, unit: '°C', color: '#4dd0e1' },
                { label: 'Battery SOC', value: 84, unit: '%', color: '#2dd4a8' },
              ].map((gauge) => (
                <div key={gauge.label} className="flex flex-col items-center">
                  <span className="text-[10px] text-text-muted tracking-wider uppercase">{gauge.label}</span>
                  <div className="relative w-20 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: gauge.value }]} startAngle={180} endAngle={0}>
                        <RadialBar dataKey="value" fill={gauge.color} cornerRadius={50} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-sm text-text-primary">{gauge.value}</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-text-muted font-mono">{gauge.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- ROW 4: Feature Importance (6 cols) + Anomaly Audit (6 cols) --- */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-premium p-5 flex flex-col h-full min-h-[260px]">
            <div className="flex items-center justify-between mb-3">
              <span className="label-uppercase">XGBoost Feature Importance</span>
              <span className="font-mono text-lg text-gold">R² 0.9989</span>
            </div>
            <div className="space-y-3">
              {featureImportance.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary w-36 truncate">{item.label}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: 'linear-gradient(90deg, #c9973e, #fbbf24)' }} />
                  </div>
                  <span className="text-xs font-mono text-text-primary w-12 text-right">{item.value}%</span>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-3 border-t border-white/5 flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
              </span>
              <span className="text-[10px] font-mono text-gold/70 tracking-wider">SUB-12MS SCADA ENGINE • ACTIVE</span>
              <span className="text-[10px] text-text-muted ml-auto">Nominal 8.4 kW</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <div className="glass-premium p-5 flex flex-col h-full min-h-[260px]">
            <span className="label-uppercase mb-3">Live SCADA Anomaly Audit</span>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {anomalies.map((anomaly, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-white/3 rounded-xl border border-white/5">
                  <span className="font-mono text-[10px] text-text-muted w-16">{anomaly.time}</span>
                  <span className="text-xs text-text-secondary w-20">{anomaly.string}</span>
                  <span className="text-xs text-text-primary flex-1">{anomaly.issue}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    anomaly.severity === 'CRITICAL' ? 'bg-crimson/20 text-crimson' :
                    anomaly.severity === 'WARNING' ? 'bg-gold/20 text-gold' :
                    'bg-cyan/20 text-cyan'
                  }`}>
                    {anomaly.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- ROW 5: String Health Heatmap (Full Width) --- */}
        <div className="col-span-12">
          <div className="glass-premium p-5 flex flex-col">
            <span className="label-uppercase mb-4">String Health Heatmap</span>
            <div className="grid grid-cols-8 gap-2">
              {heatmapData.flat().map((cell) => (
                <motion.div
                  key={cell.id}
                  whileHover={{ scale: 1.1 }}
                  className={`h-10 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                    cell.status === 'nominal' ? 'bg-jade/30 border border-jade/30' :
                    cell.status === 'warn' ? 'bg-gold/30 border border-gold/30' :
                    'bg-crimson/30 border border-crimson/30'
                  }`}
                >
                  <span className="text-[8px] font-mono text-text-secondary opacity-60">{cell.id}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-6 text-[10px]">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-jade/40 border border-jade/30"></span> Nominal</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-gold/40 border border-gold/30"></span> Underperforming</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-crimson/40 border border-crimson/30"></span> Fault</div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
