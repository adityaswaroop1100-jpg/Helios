import React, { useState } from 'react';
import { DollarSign, Leaf, Zap, Info } from 'lucide-react';
import { getFinancialMetrics } from '../../api/forecastApi';

export default function CostEstimate({ hourlyData, currentHour }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const metrics = getFinancialMetrics(hourlyData, currentHour);

  return (
    <div className="bg-[#141619] border border-[#2a2d32] rounded-sm divide-y sm:divide-y-0 sm:divide-x divide-[#2a2d32] grid grid-cols-2 sm:grid-cols-4 font-mono shadow-none">
      
      {/* Metric 1: Current Generation */}
      <div className="p-3.5 relative">
        <div className="flex items-center justify-between text-[#9ca3af] text-[10px] uppercase tracking-wider mb-1">
          <div className="flex items-center gap-1">
            <span>ACTIVE GENERATION</span>
            <button
              onMouseEnter={() => setActiveTooltip('gen')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="text-[#9ca3af] hover:text-[#f0a830] transition-colors p-0.5"
            >
              <Info size={12} />
            </button>
          </div>
          <Zap size={13} className="text-[#f0a830]" />
        </div>
        {activeTooltip === 'gen' && (
          <div className="absolute left-2 top-10 z-30 w-60 p-2.5 bg-[#141619] border border-[#2a2d32] rounded-sm text-[11px] text-[#c7ccd4] leading-relaxed font-sans shadow-none">
            Real-time power output from all 12 photovoltaic modules combined.
          </div>
        )}
        <div className="text-xl font-bold text-[#f0a830] tabular-nums">
          {metrics.currentKW} <span className="text-xs font-normal text-[#9ca3af]">kW</span>
        </div>
        <div className="text-[10px] text-[#9ca3af] mt-1 uppercase tracking-wider">REAL-TIME ARRAY YIELD</div>
      </div>

      {/* Metric 2: Estimated Daily Generation */}
      <div className="p-3.5 relative">
        <div className="flex items-center justify-between text-[#9ca3af] text-[10px] uppercase tracking-wider mb-1">
          <div className="flex items-center gap-1">
            <span>PREDICTED DAILY TOTAL</span>
            <button
              onMouseEnter={() => setActiveTooltip('daily')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="text-[#9ca3af] hover:text-[#f0a830] transition-colors p-0.5"
            >
              <Info size={12} />
            </button>
          </div>
          <Zap size={13} className="text-[#c7ccd4]" />
        </div>
        {activeTooltip === 'daily' && (
          <div className="absolute left-2 top-10 z-30 w-60 p-2.5 bg-[#141619] border border-[#2a2d32] rounded-sm text-[11px] text-[#c7ccd4] leading-relaxed font-sans shadow-none">
            Total integrated kilowatt-hours (kWh) predicted across 24 hours.
          </div>
        )}
        <div className="text-xl font-bold text-[#c7ccd4] tabular-nums">
          {metrics.totalDailyKWh} <span className="text-xs font-normal text-[#9ca3af]">kWh</span>
        </div>
        <div className="text-[10px] text-[#9ca3af] mt-1 uppercase tracking-wider">24H FORECAST YIELD</div>
      </div>

      {/* Metric 3: Daily Financial Savings */}
      <div className="p-3.5 relative">
        <div className="flex items-center justify-between text-[#9ca3af] text-[10px] uppercase tracking-wider mb-1">
          <div className="flex items-center gap-1">
            <span>GRID COST OFFSET</span>
            <button
              onMouseEnter={() => setActiveTooltip('savings')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="text-[#9ca3af] hover:text-[#f0a830] transition-colors p-0.5"
            >
              <Info size={12} />
            </button>
          </div>
          <DollarSign size={13} className="text-[#10b981]" />
        </div>
        {activeTooltip === 'savings' && (
          <div className="absolute left-2 top-10 z-30 w-60 p-2.5 bg-[#141619] border border-[#2a2d32] rounded-sm text-[11px] text-[#c7ccd4] leading-relaxed font-sans shadow-none">
            Financial value of avoided grid power based on standard $0.18/kWh offset rates.
          </div>
        )}
        <div className="text-xl font-bold text-[#10b981] tabular-nums">
          ${metrics.dailySavingsUSD} <span className="text-xs font-normal text-[#9ca3af]">/ DAY</span>
        </div>
        <div className="text-[10px] text-[#9ca3af] mt-1 uppercase tracking-wider">${metrics.monthlySavingsUSD}/MO @ $0.18/KWH</div>
      </div>

      {/* Metric 4: CO2 Avoided */}
      <div className="p-3.5 relative">
        <div className="flex items-center justify-between text-[#9ca3af] text-[10px] uppercase tracking-wider mb-1">
          <div className="flex items-center gap-1">
            <span>AVOIDED CO₂</span>
            <button
              onMouseEnter={() => setActiveTooltip('co2')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="text-[#9ca3af] hover:text-[#f0a830] transition-colors p-0.5"
            >
              <Info size={12} />
            </button>
          </div>
          <Leaf size={13} className="text-[#10b981]" />
        </div>
        {activeTooltip === 'co2' && (
          <div className="absolute left-2 top-10 z-30 w-60 p-2.5 bg-[#141619] border border-[#2a2d32] rounded-sm text-[11px] text-[#c7ccd4] leading-relaxed font-sans shadow-none">
            Kilograms of greenhouse gas emissions offset vs standard regional fossil fuel grid generation.
          </div>
        )}
        <div className="text-xl font-bold text-[#c7ccd4] tabular-nums">
          {metrics.co2AvoidedKg} <span className="text-xs font-normal text-[#9ca3af]">KG</span>
        </div>
        <div className="text-[10px] text-[#9ca3af] mt-1 uppercase tracking-wider">EMISSION OFFSET</div>
      </div>

    </div>
  );
}
