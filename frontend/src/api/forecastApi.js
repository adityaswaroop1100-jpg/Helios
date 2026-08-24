// SolarSense AI Model & Forecast API Data Provider
import { XGBOOST_METADATA } from './xgboostModel';

export const generate24HourForecast = () => {
  const hours = [];
  const baseCapacityKW = 48.0;

  for (let h = 0; h < 24; h++) {
    let solarFactor = 0;
    if (h >= 6 && h <= 18) {
      solarFactor = Math.sin(((h - 6) / 12) * Math.PI);
      const cloudDip = h === 14 ? 0.85 : (h === 11 ? 0.95 : 1.0);
      solarFactor = Math.pow(solarFactor, 1.3) * cloudDip;
    }

    const predictedKW = Number((baseCapacityKW * solarFactor).toFixed(2));
    const p90UpperKW = Number((predictedKW * 1.12 + (solarFactor > 0 ? 1.5 : 0)).toFixed(2));
    const p10LowerKW = Number(Math.max(0, predictedKW * 0.88 - (solarFactor > 0 ? 1.2 : 0)).toFixed(2));

    const irradiance = Math.round(solarFactor * 980);
    const ambientTemp = 20 + Math.sin(((h - 8) / 12) * Math.PI) * 12;
    const panelTemp = Number((ambientTemp + solarFactor * 18).toFixed(1));
    const cloudCover = h === 14 ? 25 : (h >= 6 && h <= 18 ? 10 : 5);

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
      isAnomaly: false,
      anomalySeverity: 'None',
      anomalyDescription: null,
    });
  }

  return hours;
};

/**
 * Interpolate output dynamically from active hourly series at fractional hour
 */
export const getOutputFromHourlyData = (hourlyData, fractionalHour) => {
  if (!hourlyData || hourlyData.length === 0) return { predictedKW: 0, irradiance: 0, solarFactor: 0 };
  const h = Math.floor(fractionalHour) % 24;
  const nextH = (h + 1) % 24;
  const frac = fractionalHour - Math.floor(fractionalHour);

  const currPoint = hourlyData[h] || { predictedKW: 0, irradiance: 0 };
  const nextPoint = hourlyData[nextH] || { predictedKW: 0, irradiance: 0 };

  const predictedKW = Number((currPoint.predictedKW * (1 - frac) + nextPoint.predictedKW * frac).toFixed(2));
  const irradiance = Math.round((currPoint.irradiance || 0) * (1 - frac) + (nextPoint.irradiance || 0) * frac);
  const solarFactor = Math.min(1.0, Math.max(0, predictedKW / 48.0));

  return {
    predictedKW,
    irradiance,
    solarFactor,
  };
};

export const getRecommendations = (currentHourData = {}, faultedPanels = {}) => {
  const kw = currentHourData.predictedKW ?? 0;
  const faultCount = Object.keys(faultedPanels).length;
  const isAnomaly = currentHourData.isAnomaly || faultCount > 0;

  if (isAnomaly) {
    const desc = currentHourData.anomalyDescription
      || (faultCount > 0 ? `${faultCount} module strings experiencing sub-optimal performance or open-circuit fault` : 'Irradiance imbalance detected');
    return {
      type: 'ANOMALY_WARNING',
      title: faultCount > 0 ? `String Fault Detected (${faultCount} Modules Affected)` : 'Telemetry Anomaly Detected',
      message: `${desc}. Dispatching bypass isolation and SCADA field diagnostics.`,
      action: 'ISOLATE FAULT & RUN DIAGNOSTICS',
    };
  }

  if (kw > 25) {
    return {
      type: 'PEAK_GENERATION',
      title: `Peak Solar Generation Phase Active (${kw.toFixed(1)} kW)`,
      message: `Array operating at high irradiance (${currentHourData.irradiance || 850} W/m²). Surplus power (>25 kW) recommended for Battery Energy Storage dispatch.`,
      action: 'ROUTE SURPLUS TO BATTERY STORAGE',
    };
  }

  if (kw > 5) {
    return {
      type: 'RAMP_PHASE',
      title: `Nominal Generation Phase (${kw.toFixed(1)} kW)`,
      message: `Array generating at ${kw.toFixed(1)} kW with optimal MPPT tracking and cell temperature ${currentHourData.panelTemp || 45}°C.`,
      action: 'OPTIMIZE MPPT TRACKER ANGLE',
    };
  }

  return {
    type: 'NIGHT_MODE',
    title: 'Standby / Low Irradiance Mode',
    message: 'Array in nocturnal stow position. Inverter in standby mode with minimal parasitic load.',
    action: 'INITIATE NOCTURNAL HEALTH CHECK',
  };
};

export const getFeatureImportanceData = () => [
  { feature: 'Solar Zenith Angle (Deg)', importance: 0.49, category: 'Astronomical' },
  { feature: 'Global Horizontal Irradiance (GHI)', importance: 0.46, category: 'Atmospheric' },
  { feature: 'Diurnal Hour Angle', importance: 0.03, category: 'Astronomical' },
  { feature: 'Solar Elevation Angle', importance: 0.02, category: 'Astronomical' },
  { feature: 'Direct Normal Irradiance (DNI)', importance: 0.01, category: 'Atmospheric' },
];

export const getModelMetrics = () => XGBOOST_METADATA;

export const getFinancialMetrics = (hourlyData = [], currentHour = 12) => {
  const safeData = Array.isArray(hourlyData) ? hourlyData : [];
  const currentPrediction = safeData[currentHour] ? safeData[currentHour].predictedKW : 0;
  const totalDailyKWh = safeData.reduce((acc, curr) => acc + (curr?.predictedKW || 0), 0);
  
  const electricityRateUSD = 0.18;
  const dailySavingsUSD = (totalDailyKWh * electricityRateUSD).toFixed(2);
  const monthlySavingsUSD = (totalDailyKWh * 30 * electricityRateUSD).toFixed(2);
  const co2AvoidedKg = (totalDailyKWh * 0.707).toFixed(1);

  return {
    currentKW: currentPrediction,
    currentPrediction,
    totalDailyKWh: Number(totalDailyKWh.toFixed(1)),
    dailySavingsUSD,
    monthlySavingsUSD,
    co2AvoidedKg,
    electricityRateUSD,
  };
};

export const calculatePanelOutputs = (totalKW, faultedPanels = {}) => {
  const TOTAL_PANELS = 32;
  const baseKWPerPanel = (totalKW || 0) / TOTAL_PANELS;

  return Array.from({ length: TOTAL_PANELS }, (_, i) => {
    const panelId = i + 1;
    const fault = faultedPanels[panelId];

    let factor = 1.0;
    let status = 'Optimal';

    if (fault === 'Offline') {
      factor = 0.0;
      status = 'Offline';
    } else if (fault === 'Underperforming') {
      factor = 0.45;
      status = 'Underperforming';
    }

    const predictedKW = Number((baseKWPerPanel * factor).toFixed(2));
    const isDegraded = status === 'Underperforming';
    const isOffline = status === 'Offline';

    const voltageV = isOffline ? 0 : isDegraded ? 18.5 : Number((38.0 + (predictedKW / 4.0) * 4.5).toFixed(1));
    const currentA = isOffline ? 0 : isDegraded ? 3.8 : Number((predictedKW > 0 ? (predictedKW * 1000) / voltageV : 0).toFixed(1));

    return {
      id: panelId,
      label: `Module A-${panelId}`,
      status,
      predictedKW,
      voltageV,
      currentA,
      temperatureC: isOffline ? 28.0 : isDegraded ? 48.2 : Number((34.0 + factor * 24.7).toFixed(1)),
      efficiencyPct: isOffline ? 0.0 : isDegraded ? 9.2 : Number((20.5 * factor).toFixed(1)),
    };
  });
};
