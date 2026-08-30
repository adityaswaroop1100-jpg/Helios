import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, DollarSign, Leaf } from 'lucide-react';
import KpiCard from '../components/ui/KpiCard';
import GlassChart from '../components/ui/GlassChart';
import CircularGaugeCluster from '../components/ui/CircularGaugeCluster';
import ScadaDecisionHud from '../components/dashboard/ScadaDecisionHud';
import AnomalyAlertFeed from '../components/dashboard/AnomalyAlertFeed';
import StringHealthMatrix from '../components/dashboard/StringHealthMatrix';
import { getFinancialMetrics } from '../api/forecastApi';
import { DEFAULT_LOCATION } from '../api/energyEngine';

export default function Dashboard({
  hourlyData = [],
  currentHour = 12,
  onSelectHour,
  faultedPanels = {},
  onSelectPanel,
  location = DEFAULT_LOCATION,
}) {
  const currentHourData = hourlyData[currentHour] || {};
  const metrics = getFinancialMetrics(hourlyData, currentHour);

  // Sparkline arrays from forecast points
  const powerSparkline = hourlyData.slice(8, 18).map(d => ({ v: d.predictedKW }));
  const yieldSparkline = hourlyData.slice(0, 12).map(d => ({ v: d.predictedKW }));
  const savingsSparkline = hourlyData.slice(8, 18).map(d => ({ v: (d.predictedKW * 0.18).toFixed(2) }));
  const co2Sparkline = hourlyData.slice(8, 18).map(d => ({ v: (d.predictedKW * 0.707).toFixed(2) }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-24"
    >
      {/* ── ROW 1: 4 HERO KPI CARDS (4 COLS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24">
        <KpiCard
          label="Active Generation"
          sub="Real-Time 32-Module Yield"
          value={metrics.currentKW}
          unit="kW"
          icon={Zap}
          sparklineData={powerSparkline}
          trend="+14.2% vs STC"
          trendDirection="up"
          badgeText="LIVE SCADA"
          accentColor="#f59e0b"
          tooltipText="Real-time aggregated power from all 32 monocrystalline PV modules with dynamic NOCT temperature derating."
        />

        <KpiCard
          label="24h Yield Forecast"
          sub="XGBoost Predictive Total"
          value={metrics.totalDailyKWh}
          unit="kWh"
          icon={TrendingUp}
          sparklineData={yieldSparkline}
          trend="99.9% R² Conf."
          trendDirection="up"
          badgeText="P90 BOUND"
          accentColor="#38bdf8"
          tooltipText="Integrated 24-hour total energy generation predicted by the trained XGBoost ML regression model."
        />

        <KpiCard
          label="Grid Cost Offset"
          sub="$0.18/kWh Commercial Rate"
          value={metrics.dailySavingsUSD}
          unit="/day"
          prefix="$"
          icon={DollarSign}
          sparklineData={savingsSparkline}
          trend="+$46.70 / day"
          trendDirection="up"
          badgeText="ARBITRAGE"
          accentColor="#10b981"
          tooltipText="Direct financial cost avoidance by replacing grid peak power tariffs with self-generated solar energy."
        />

        <KpiCard
          label="Scope-2 Carbon Avoided"
          sub="0.707 kg/kWh Grid Intensity"
          value={metrics.co2AvoidedKg}
          unit="kg CO₂"
          icon={Leaf}
          sparklineData={co2Sparkline}
          trend="Net Zero Asset"
          trendDirection="up"
          badgeText="ESG IMPACT"
          accentColor="#22c55e"
          tooltipText="Greenhouse gas emissions avoided relative to the regional fossil-fuel grid electricity benchmark."
        />
      </div>

      {/* ── ROW 2: 24H FORECAST (8 COLS) + CIRCULAR GAUGE CLUSTER (4 COLS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-stretch">
        <GlassChart
          data={hourlyData}
          currentHour={currentHour}
          onSelectHour={onSelectHour}
          locationName={location.name}
          className="lg:col-span-8"
        />

        <CircularGaugeCluster
          irradiance={currentHourData.irradiance || 850}
          cellTemp={currentHourData.panelTemp || 42.5}
          bessSoc={84}
          className="lg:col-span-4"
        />
      </div>

      {/* ── ROW 3: FULL WIDTH SCADA DECISION HUD & FEATURE IMPORTANCE ── */}
      <ScadaDecisionHud
        currentHourData={currentHourData}
        faultedPanels={faultedPanels}
      />

      {/* ── ROW 4: ANOMALY ALERT FEED (8 COLS) + STRING HEALTH MATRIX (4 COLS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-stretch">
        <AnomalyAlertFeed
          className="lg:col-span-8"
        />

        <StringHealthMatrix
          faultedPanels={faultedPanels}
          onSelectPanel={onSelectPanel}
          className="lg:col-span-4"
        />
      </div>
    </motion.div>
  );
}
