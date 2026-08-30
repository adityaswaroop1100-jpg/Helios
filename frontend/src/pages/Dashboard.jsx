import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, DollarSign, Leaf } from 'lucide-react';
import KpiCard from '../components/ui/KpiCard';
import GlassChart from '../components/ui/GlassChart';
import CircularGaugeCluster from '../components/ui/CircularGaugeCluster';
import XgboostScadaCard from '../components/dashboard/XgboostScadaCard';
import AnomalyAlertFeed from '../components/dashboard/AnomalyAlertFeed';
import StringHealthMatrix from '../components/dashboard/StringHealthMatrix';
import StatusBadge from '../components/ui/StatusBadge';
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

  // Sparkline telemetry trends
  const powerSparkline = hourlyData.slice(8, 18).map((d) => ({ v: d.predictedKW }));
  const yieldSparkline = hourlyData.slice(0, 12).map((d) => ({ v: d.predictedKW }));
  const savingsSparkline = hourlyData.slice(8, 18).map((d) => ({ v: +(d.predictedKW * 0.18).toFixed(2) }));
  const co2Sparkline = hourlyData.slice(8, 18).map((d) => ({ v: +(d.predictedKW * 0.707).toFixed(2) }));

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-12 gap-6 auto-rows-min">

        {/* ── ROW 1: Header Row (col-span-12) ── */}
        <div className="col-span-12 flex items-center justify-between pb-3 border-b border-border-subtle flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-sm text-text-secondary">
              {location.name} Utility Farm • {location.latitude}° N, {location.longitude}° E
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="online" label="LIVE SCADA" />
            <span className="font-mono text-xs text-text-muted">IEC 61724 • IEEE 1547</span>
          </div>
        </div>

        {/* ── ROW 2: 4 Hero KPI Cards (col-span-3 each) ── */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <KpiCard
            label="Array Capacity"
            sub="32 Monocrystalline Modules"
            value="48.0"
            unit="kW"
            icon={Zap}
            badgeText="NAMEPLATE"
            accentColor="#f59e0b"
            trend="+100% Online"
            trendDirection="up"
            tooltipText="Rated utility peak DC generation capacity for the 32 monocrystalline PV module array."
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <KpiCard
            label="Current Power"
            sub="Real-Time String Yield"
            value={metrics.currentKW}
            unit="kW"
            icon={Zap}
            badgeText="LIVE YIELD"
            accentColor="#fbbf24"
            trend="+14.2% vs STC"
            trendDirection="up"
            sparklineData={powerSparkline}
            tooltipText="Aggregated real-time active power output with NOCT dynamic cell temperature derating."
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <KpiCard
            label="Daily Energy"
            sub="XGBoost Predicted Total"
            value={metrics.totalDailyKWh}
            unit="kWh"
            icon={TrendingUp}
            badgeText="99.9% R²"
            accentColor="#38bdf8"
            trend="P90 High Conf."
            trendDirection="up"
            sparklineData={yieldSparkline}
            tooltipText="Integrated 24-hour total energy generation predicted by the trained XGBoost ML regression model."
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <KpiCard
            label="CO₂ Avoided"
            sub="0.707 kg/kWh Benchmark"
            value={metrics.co2AvoidedKg}
            unit="kg"
            icon={Leaf}
            badgeText="SCOPE 2"
            accentColor="#10b981"
            trend="Net Zero Asset"
            trendDirection="up"
            sparklineData={co2Sparkline}
            tooltipText="Scope-2 greenhouse gas emissions avoided relative to regional fossil-fuel electricity benchmarks."
          />
        </div>

        {/* ── ROW 3: Chart + Gauges (Fixed Height 420px) ── */}
        <div className="col-span-12 lg:col-span-8 row-span-1 h-[420px]">
          <GlassChart
            data={hourlyData}
            currentHour={currentHour}
            onSelectHour={onSelectHour}
            locationName={location.name}
            className="h-full"
          />
        </div>

        <div className="col-span-12 lg:col-span-4 row-span-1 h-[420px]">
          <CircularGaugeCluster
            irradiance={currentHourData.irradiance || 850}
            cellTemp={currentHourData.panelTemp || 42.5}
            bessSoc={84}
            className="h-full"
          />
        </div>

        {/* ── ROW 4: Feature Importance + SCADA Engine (Left) | Anomaly Audit (Right) ── */}
        <div className="col-span-12 lg:col-span-6">
          <XgboostScadaCard
            currentHourData={currentHourData}
            faultedPanels={faultedPanels}
            className="h-full"
          />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <AnomalyAlertFeed className="h-full" />
        </div>

        {/* ── ROW 5: String Health Heatmap (Full Width) ── */}
        <div className="col-span-12">
          <StringHealthMatrix
            faultedPanels={faultedPanels}
            onSelectPanel={onSelectPanel}
            className="w-full"
          />
        </div>

      </div>
    </div>
  );
}
