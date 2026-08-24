/**
 * HELIOS — Physics & Meteorological Energy Engine (Multi-Location & GPS)
 * ======================================================================
 *
 * Real-time data pipeline connected to Open-Meteo Satellite & SCADA Telemetry API.
 * Dynamically supports GPS location tracking and worldwide solar node telemetry.
 */

export const DEFAULT_LOCATION = {
  name: 'Chennai',
  region: 'Tamil Nadu',
  country: 'India',
  latitude: 13.0827,
  longitude: 80.2707,
  timezone: 'Asia/Kolkata',
};

export const PRESET_SOLAR_NODES = [
  { name: 'Chennai', region: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata' },
  { name: 'Bengaluru', region: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' },
  { name: 'Hyderabad', region: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  { name: 'New Delhi', region: 'Delhi NCR', country: 'India', latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata' },
  { name: 'Mumbai', region: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Riyadh', region: 'Riyadh Province', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh' },
  { name: 'Phoenix', region: 'Arizona', country: 'United States', latitude: 33.4484, longitude: -112.0740, timezone: 'America/Phoenix' },
  { name: 'Madrid', region: 'Community of Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038, timezone: 'Europe/Madrid' },
  { name: 'Sydney', region: 'New South Wales', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
];

export const PANEL_SPECS = {
  rows: 4,
  cols: 8,
  totalPanels: 32,            // 8×4 array (matches 3D model)
  widthM: 1.95,               // module width (m)
  heightM: 1.15,              // module height (m)
  areaM2: 1.95 * 1.15,        // 2.2425 m² per module
  totalAreaM2: 32 * 2.2425,   // 71.76 m² total aperture
  efficiency: 0.205,          // 20.5% monocrystalline silicon
  tempCoeffPct: 0.0035,       // -0.35% / °C temperature loss
  nominalTempC: 25.0,         // STC standard test condition
  noctTempC: 45.0,            // Nominal Operating Cell Temperature
  totalCapacityKW: 48.0,      // 48.0 kW nameplate system capacity
  stringCapacityKW: 1.5,      // 1.5 kW per module at STC (48/32)
};

/**
 * Search global cities by name using Open-Meteo Geocoding API.
 */
export async function searchGlobalLocations(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map(r => ({
      name: r.name,
      region: r.admin1 || r.country,
      country: r.country,
      latitude: Number(r.latitude.toFixed(4)),
      longitude: Number(r.longitude.toFixed(4)),
      timezone: r.timezone || 'auto',
    }));
  } catch (err) {
    console.warn('Geocoding search failed:', err);
    return [];
  }
}

/**
 * Reverse geocode GPS coordinates to city name.
 */
export async function reverseGeocodeGPS(latitude, longitude) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.municipality || data.address?.county || 'GPS Location';
      const region = data.address?.state || data.address?.country || '';
      const country = data.address?.country || '';
      return {
        name: city,
        region: region,
        country: country,
        latitude: Number(latitude.toFixed(4)),
        longitude: Number(longitude.toFixed(4)),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
      };
    }
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
  }
  return {
    name: 'My GPS Location',
    region: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`,
    country: 'Live Node',
    latitude: Number(latitude.toFixed(4)),
    longitude: Number(longitude.toFixed(4)),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
  };
}

/**
 * Fetch live solar irradiance and ambient weather from Open-Meteo for any location.
 */
export async function fetchLiveIrradiance(location = DEFAULT_LOCATION) {
  const lat = location.latitude ?? DEFAULT_LOCATION.latitude;
  const lon = location.longitude ?? DEFAULT_LOCATION.longitude;
  const tz  = location.timezone && location.timezone !== 'auto' ? encodeURIComponent(location.timezone) : 'auto';

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,is_day,cloud_cover,surface_pressure,wind_speed_10m,shortwave_radiation,direct_radiation,direct_normal_irradiance,diffuse_radiation` +
    `&hourly=temperature_2m,relative_humidity_2m,cloud_cover,shortwave_radiation,direct_radiation,direct_normal_irradiance,diffuse_radiation` +
    `&timezone=${tz}&forecast_days=1`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Open-Meteo HTTP error: ${res.status}`);

    const json = await res.json();
    const current = json.current || {};
    const hourly = json.hourly || {};
    const now = new Date();
    const hour = now.getHours();

    const directW = Number((current.direct_radiation ?? hourly.direct_radiation?.[hour] ?? 0).toFixed(1));
    const diffuseW = Number((current.diffuse_radiation ?? hourly.diffuse_radiation?.[hour] ?? 0).toFixed(1));
    const dniW = Number((current.direct_normal_irradiance ?? hourly.direct_normal_irradiance?.[hour] ?? 0).toFixed(1));
    const totalW = Number((current.shortwave_radiation ?? (directW + diffuseW)).toFixed(1));

    const tempC = Number((current.temperature_2m ?? hourly.temperature_2m?.[hour] ?? 30.0).toFixed(1));
    const cloudPct = Math.round(current.cloud_cover ?? hourly.cloud_cover?.[hour] ?? 0);
    const humidityPct = Math.round(current.relative_humidity_2m ?? hourly.relative_humidity_2m?.[hour] ?? 50);
    const pressureHpa = Math.round(current.surface_pressure ?? 1010);
    const windSpeedKmh = Number((current.wind_speed_10m ?? 8.5).toFixed(1));
    const isDay = current.is_day !== undefined ? Boolean(current.is_day) : (hour >= 6 && hour <= 18);

    const noctFactor = (PANEL_SPECS.noctTempC - 20.0) / 800.0;
    const cellTempC = Number((tempC + noctFactor * totalW).toFixed(1));

    return {
      status: 'live',
      locationName: `${location.name}, ${location.country}`,
      latitude: lat,
      longitude: lon,
      totalW,
      directW,
      diffuseW,
      dniW,
      tempC,
      cellTempC,
      cloudPct,
      humidityPct,
      pressureHpa,
      windSpeedKmh,
      isDay,
      hourlyRaw: hourly,
      source: 'Open-Meteo Satellite Feed',
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn(`Live weather fetch failed for ${location.name}, using physics fallback:`, err.message);
    return getSyntheticPhysicsWeather(location);
  }
}

/**
 * Fetch 24-hour meteorological forecast for any dynamic location, calculating
 * realistic 48 kW utility array generation per hour.
 */
export async function fetch24HourMeteoForecast(location = DEFAULT_LOCATION) {
  const lat = location.latitude ?? DEFAULT_LOCATION.latitude;
  const lon = location.longitude ?? DEFAULT_LOCATION.longitude;
  const tz  = location.timezone && location.timezone !== 'auto' ? encodeURIComponent(location.timezone) : 'auto';

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,relative_humidity_2m,cloud_cover,shortwave_radiation,direct_radiation,diffuse_radiation` +
    `&timezone=${tz}&forecast_days=1`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const json = await res.json();
    const hourly = json.hourly || {};

    const hours = [];
    for (let h = 0; h < 24; h++) {
      const sw = hourly.shortwave_radiation?.[h] ?? 0;
      const direct = hourly.direct_radiation?.[h] ?? 0;
      const diffuse = hourly.diffuse_radiation?.[h] ?? 0;
      const tempC = hourly.temperature_2m?.[h] ?? 28;
      const cloud = hourly.cloud_cover?.[h] ?? 10;

      const physics = calculatePhysicsEnergy({
        irradianceTotalW: sw,
        ambientTempC: tempC,
        effectiveCount: 12,
        tiltDeg: 30,
        trackingRoll: 0,
      });

      const predictedKW = physics.powerKW;
      const p90UpperKW = Number((predictedKW * 1.1 + (sw > 10 ? 1.5 : 0)).toFixed(2));
      const p10LowerKW = Number(Math.max(0, predictedKW * 0.9 - (sw > 10 ? 1.0 : 0)).toFixed(2));

      hours.push({
        hour: h,
        timeLabel: `${String(h).padStart(2, '0')}:00`,
        predictedKW,
        p90UpperKW,
        p10LowerKW,
        irradiance: Math.round(sw),
        directW: Math.round(direct),
        diffuseW: Math.round(diffuse),
        ambientTemp: Number(tempC.toFixed(1)),
        panelTemp: physics.panelTempC,
        cloudCover: Math.round(cloud),
        isAnomaly: cloud > 65 && sw < 250 && h >= 10 && h <= 14,
        anomalyDescription: (cloud > 65 && sw < 250 && h >= 10 && h <= 14)
          ? `Severe cloud occlusion (${Math.round(cloud)}%) suppressing solar yield in ${location.name}`
          : null,
      });
    }

    return { hours, source: 'Open-Meteo API' };
  } catch (err) {
    console.warn('Hourly forecast fetch error:', err);
    return null;
  }
}

function getSyntheticPhysicsWeather(location) {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  let totalW = 0;
  let directW = 0;
  let diffuseW = 0;

  if (hour >= 6.0 && hour <= 18.0) {
    const angle = ((hour - 6.0) / 12.0) * Math.PI;
    const peakGHI = 920.0;
    totalW = Number((Math.sin(angle) * peakGHI).toFixed(1));
    directW = Number((totalW * 0.82).toFixed(1));
    diffuseW = Number((totalW * 0.18).toFixed(1));
  }

  const tempC = Number((24.0 + Math.sin(((hour - 8.0) / 12.0) * Math.PI) * 10.0).toFixed(1));
  const cellTempC = Number((tempC + 0.03125 * totalW).toFixed(1));

  return {
    status: 'fallback',
    locationName: `${location.name}, ${location.country}`,
    latitude: location.latitude,
    longitude: location.longitude,
    totalW,
    directW,
    diffuseW,
    dniW: Number((directW * 1.12).toFixed(1)),
    tempC,
    cellTempC,
    cloudPct: 15,
    humidityPct: 52,
    pressureHpa: 1012,
    windSpeedKmh: 9.2,
    isDay: hour >= 6 && hour <= 18,
    source: 'HELIOS Synthetic Physical Model',
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Calculates physical PV power output with angle of incidence, thermal derating, and inverter MPPT
 * scaled for the 48.0 kW nameplate utility array (1.5 kW per module × 32 modules).
 */
export function calculatePhysicsEnergy({
  irradianceTotalW,
  ambientTempC,
  effectiveCount = 12,
  tiltDeg = 30,
  trackingRoll = 0,
}) {
  const G = Math.max(0, irradianceTotalW ?? 0);
  const T_amb = ambientTempC ?? 25;

  const tiltRad = (tiltDeg * Math.PI) / 180;
  const aoiFactor = Math.max(0.0, Math.cos(tiltRad * 0.5));

  const T_cell = T_amb + ((PANEL_SPECS.noctTempC - 20.0) / 800.0) * G;

  const deltaT = Math.max(0, T_cell - PANEL_SPECS.nominalTempC);
  const tempDerate = Math.max(0.7, 1.0 - PANEL_SPECS.tempCoeffPct * deltaT);

  // 48.0 kW total array (1.5 kW capacity per module)
  const nominalCapacityKW = (effectiveCount / PANEL_SPECS.totalPanels) * PANEL_SPECS.totalCapacityKW;
  const eta_inv = 0.984;

  // Power output = Nominal Capacity * (G / 1000) * aoi * tempDerate * inverterEff
  const rawPowerKW = nominalCapacityKW * (G / 1000.0) * aoiFactor * tempDerate * eta_inv;
  const powerKW = Number(Math.max(0, rawPowerKW).toFixed(2));
  const powerW = Math.round(powerKW * 1000);
  const efficiencyPct = Number((PANEL_SPECS.efficiency * tempDerate * eta_inv * 100).toFixed(1));

  return {
    powerKW,
    powerW,
    panelTempC: Number(T_cell.toFixed(1)),
    efficiencyPct,
    tempDerate: Number(tempDerate.toFixed(3)),
    aoiFactor: Number(aoiFactor.toFixed(3)),
    effectivePanels: effectiveCount,
  };
}

export function countPanels(faultedPanels = {}) {
  let offline = 0;
  let underperforming = 0;
  let optimal = 0;

  for (let i = 1; i <= PANEL_SPECS.totalPanels; i++) {
    const fault = faultedPanels[i];
    if (fault === 'Offline') offline++;
    else if (fault === 'Underperforming') underperforming++;
    else optimal++;
  }

  const effectiveCount = optimal + underperforming * 0.45;

  return {
    total: PANEL_SPECS.totalPanels,
    active: optimal + underperforming,
    optimal,
    underperforming,
    offline,
    effectiveCount: Number(effectiveCount.toFixed(2)),
  };
}
