// SolarSense AI Model & Forecast API Data Provider

export const generate24HourForecast = () => {
  const hours = [];
  const baseCapacityKW = 48.0; // 48 kW total array peak capacity (4x3 grid of 4kW strings)

  for (let h = 0; h < 24; h++) {
    let solarFactor = 0;
    if (h >= 6 && h <= 18) {
      solarFactor = Math.sin(((h - 6) / 12) * Math.PI);
      const cloudDip = h === 14 ? 0.65 : (h === 11 ? 0.95 : 1.0);
      solarFactor = Math.pow(solarFactor, 1.3) * cloudDip;
    }

    const predictedKW = Number((baseCapacityKW * solarFactor).toFixed(2));
    const p90UpperKW = Number((predictedKW * 1.12 + (solarFactor > 0 ? 1.5 : 0)).toFixed(2));
    const p10LowerKW = Number(Math.max(0, predictedKW * 0.88 - (solarFactor > 0 ? 1.2 : 0)).toFixed(2));

    const irradiance = Math.round(solarFactor * 980);
    const ambientTemp = 20 + Math.sin(((h - 8) / 12) * Math.PI) * 12;
    const panelTemp = Number((ambientTemp + solarFactor * 18).toFixed(1));
    const cloudCover = h === 14 ? 45 : (h >= 6 && h <= 18 ? 12 : 5);

    const isAnomaly = h === 14;

    hours.push({
      hour: h,
      timeLabel: `${String(h).padStart(2, '0')}:00`,
      predictedKW,
      p90UpperKW,
      p10LowerKW,
      irradiance,
      ambientTemp: Number(ambientTemp.toFixed(1)),
      panelTemp,
      cloudCover,
      isAnomaly,
      anomalySeverity: isAnomaly ? 'Medium' : 'None',
      anomalyDescription: isAnomaly ? 'Transient cloud cover caused 35% output drop below P10 confidence threshold' : null,
    });
  }

  return hours;
};

// Calculate exact output for fractional hour (e.g. 10.183 for 10:11 AM)
export const getExactOutputForFractionalHour = (fractionalHour) => {
  const baseCapacityKW = 48.0;
  let solarFactor = 0;

  if (fractionalHour >= 6 && fractionalHour <= 18) {
    solarFactor = Math.sin(((fractionalHour - 6) / 12) * Math.PI);
    solarFactor = Math.pow(solarFactor, 1.3);
  }

  const predictedKW = Number((baseCapacityKW * solarFactor).toFixed(2));
  const irradiance = Math.round(solarFactor * 980);

  return {
    predictedKW,
    irradiance,
    solarFactor
  };
};

export const getFeatureImportanceData = () => [
  { feature: 'Solar Irradiance (W/m²)', importance: 0.52, category: 'Atmospheric' },
  { feature: 'Hour of Day (Zenith Angle)', importance: 0.24, category: 'Astronomical' },
  { feature: 'Cloud Cover (%)', importance: 0.14, category: 'Atmospheric' },
  { feature: 'Panel Temperature (°C)', importance: 0.07, category: 'Hardware' },
  { feature: 'Relative Humidity (%)', importance: 0.03, category: 'Environmental' },
];

export const getFinancialMetrics = (hourlyData, currentHour) => {
  const currentPrediction = hourlyData[currentHour] ? hourlyData[currentHour].predictedKW : 0;
  const totalDailyKWh = hourlyData.reduce((acc, curr) => acc + curr.predictedKW, 0);
  
  const electricityRateUSD = 0.18;
  const dailySavingsUSD = (totalDailyKWh * electricityRateUSD).toFixed(2);
  const monthlySavingsUSD = (totalDailyKWh * 30 * electricityRateUSD).toFixed(2);
  const co2AvoidedKg = (totalDailyKWh * 0.707).toFixed(1);

  return {
    currentKW: currentPrediction,
    totalDailyKWh: totalDailyKWh.toFixed(1),
    dailySavingsUSD,
    monthlySavingsUSD,
    co2AvoidedKg,
    efficiencyScore: currentPrediction > 0 ? 94.2 : 0,
  };
};

export const getRecommendations = (currentHourData) => {
  if (currentHourData.isAnomaly) {
    return {
      type: 'ANOMALY_WARNING',
      title: 'Anomaly Detected: Atmospheric Transient at 14:00',
      description: 'Model detected a 35% output deviation from expected clear-sky baseline. Smart Inverter MPPT tracking active.',
      actionText: 'Optimize Inverter Tilt & Battery Buffer',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    };
  } else if (currentHourData.predictedKW > 30) {
    return {
      type: 'PEAK_GENERATION',
      title: 'Peak Solar Generation Phase Active',
      description: 'System operating at peak irradiance (>800 W/m²). Surplus power (>25 kW) recommended for EV Charging and Grid Arbitrage.',
      actionText: 'Route Surplus to Battery Storage',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };
  } else if (currentHourData.hour >= 18 || currentHourData.hour < 6) {
    return {
      type: 'NIGHT_MODE',
      title: 'Nocturnal Standby Mode',
      description: 'Zero solar irradiance. Battery energy storage system (BESS) handling facility load on off-peak rates.',
      actionText: 'Monitor BESS Discharge Rate',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
    };
  } else {
    return {
      type: 'RAMP_PHASE',
      title: 'Solar Generation Ramping Phase',
      description: 'Solar irradiance ramping up steadily. Predictive model confidence index at 98.4%.',
      actionText: 'Standard Grid Tie Active',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    };
  }
};

export const calculatePanelOutputs = (totalKW) => {
  const panels = [];
  const rows = 3;
  const cols = 4;
  const totalPanels = rows * cols;
  const avgKWPerPanel = totalKW / totalPanels;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c + 1;
      const variance = 1 + (Math.sin(id * 1.7) * 0.06);
      const panelKW = Number((avgKWPerPanel * variance).toFixed(2));
      const temp = 22 + (totalKW > 0 ? (totalKW / 48) * 16 + (r * 0.8) : 0);
      const efficiency = panelKW > 0 ? 94.5 - (temp - 25) * 0.35 : 0;

      panels.push({
        id,
        row: r + 1,
        col: c + 1,
        label: `Panel A-${r + 1}${c + 1}`,
        predictedKW: panelKW,
        temperatureC: Number(temp.toFixed(1)),
        efficiencyPct: Number(Math.max(0, Math.min(99.9, efficiency)).toFixed(1)),
        voltageV: panelKW > 0 ? Number((48.2 + variance).toFixed(1)) : 0,
        currentA: panelKW > 0 ? Number(((panelKW * 1000) / 48.2).toFixed(1)) : 0,
        status: panelKW > 0 ? (panelKW < avgKWPerPanel * 0.8 ? 'Underperforming' : 'Optimal') : 'Standby'
      });
    }
  }

  return panels;
};
