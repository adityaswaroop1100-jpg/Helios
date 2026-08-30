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

  // Sparkline telemetry arrays
  const powerSparkline = hourlyData.slice(8, 18).map((d) => ({ v: d.predictedKW }));
  const yieldSparkline = hourlyData.slice(0, 12).map((d) => ({ v: d.predictedKW }));
  const savingsSparkline = hourlyData.slice(8, 18).map((d) => ({ v: +(d.predictedKW * 0.18).toFixed(2) }));
  const co2Sparkline = hourlyData.slice(8, 18).map((d) => ({ v: +(d.predictedKW * 0.707).toFixed(2) }));

  return (
    <div className="p-6 h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-12 gap-6 grid-rows-[auto_420px_1fr] h-full"
      >
        {/* ── ROW 1: KPIs (Auto height, enforced by min-h-[140px] on cards) ── */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            className="min-h-[140px]"
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
            className="min-h-[140px]"
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
            className="min-h-[140px]"
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
            className="min-h-[140px]"
          />
        </div>

        {/* ── ROW 2: Chart + Gauges (Fixed 420px height) ── */}
        <div className="col-span-12 lg:col-span-8 h-[420px]">
          <GlassChart
            data={hourlyData}
            currentHour={currentHour}
            onSelectHour={onSelectHour}
            locationName={location.name}
            className="h-full flex flex-col justify-between"
          />
        </div>

        <div className="col-span-12 lg:col-span-4 h-[420px]">
          <CircularGaugeCluster
            irradiance={currentHourData.irradiance || 850}
            cellTemp={currentHourData.panelTemp || 42.5}
            bessSoc={84}
            className="h-full flex flex-col justify-between"
          />
        </div>

        {/* ── ROW 3: Bottom Section (1fr takes the rest, cards use flex-col h-full) ── */}
        <div className="col-span-12 space-y-6">
          <ScadaDecisionHud
            currentHourData={currentHourData}
            faultedPanels={faultedPanels}
            className="w-full"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="col-span-12 lg:col-span-8">
              <AnomalyAlertFeed className="h-full flex flex-col justify-between" />
            </div>

            <div className="col-span-12 lg:col-span-4">
              <StringHealthMatrix
                faultedPanels={faultedPanels}
                onSelectPanel={onSelectPanel}
                className="h-full flex flex-col justify-between"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
