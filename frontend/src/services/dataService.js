/**
 * HELIOS SCADA — Silent Firebase Circuit Breaker & Data Service
 * Abstracts all plant telemetry and meteo data fetching.
 * Pings Firebase Firestore with a 2-second timeout.
 * - If connected: Enables live Firebase synchronization and marks green dot indicator.
 * - If failure/timeout (>2s): Silently switches to high-fidelity local physics mock simulation.
 * - Zero white screens, zero unhandled errors, and NO "Offline Mode" banners.
 */

import { getFirebaseConfig, pushTelemetryToFirebase } from '../api/firebaseService';
import { generate24HourForecast, getOutputFromHourlyData } from '../api/forecastApi';
import { fetchLiveIrradiance, fetch24HourMeteoForecast, DEFAULT_LOCATION } from '../api/energyEngine';

let isFirebaseLive = false;
let pingCompleted = false;
const listeners = new Set();

export function subscribeFirebaseStatus(callback) {
  listeners.add(callback);
  callback(isFirebaseLive);
  return () => {
    listeners.delete(callback);
  };
}

function setFirebaseLive(status) {
  isFirebaseLive = Boolean(status);
  listeners.forEach(cb => {
    try {
      cb(isFirebaseLive);
    } catch {}
  });
}

/**
 * 2-Second Silent Circuit Breaker Firebase Ping
 */
export async function pingFirebaseCircuitBreaker() {
  if (pingCompleted) return isFirebaseLive;
  pingCompleted = true;

  try {
    const config = getFirebaseConfig();
    const projectId = config?.projectId || 'helios-scada-cloud';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    // Lightweight REST probe to Firestore documents collection
    const pingUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/telemetry_logs?pageSize=1`;

    const res = await fetch(pingUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    // 200 OK or 404 (valid project but empty collection) both indicate reachable Firestore backend
    if (res.ok || res.status === 404) {
      setFirebaseLive(true);
      return true;
    }
    setFirebaseLive(false);
    return false;
  } catch (err) {
    // Timeout or network blocked: fail silently, zero UI disturbance
    setFirebaseLive(false);
    return false;
  }
}

/**
 * High-fidelity local physics mock generator for realistic GHI, Power, and Cell Temp
 */
export function generateRealisticMockTelemetry(hour = new Date().getHours()) {
  const solarFactor = (hour >= 6 && hour <= 18)
    ? Math.pow(Math.sin(((hour - 6) / 12) * Math.PI), 1.25)
    : 0;

  const ghi = Math.round(solarFactor * 960);
  const powerKW = Number((48.0 * solarFactor).toFixed(2));
  const ambientTemp = Number((23 + Math.sin(((hour - 8) / 12) * Math.PI) * 11).toFixed(1));
  const cellTemp = Number((ambientTemp + solarFactor * 21.6).toFixed(1));

  return {
    hour,
    timestamp: new Date().toISOString(),
    irradianceW: ghi,
    activePowerKW: powerKW,
    ambientTempC: ambientTemp,
    cellTempC: cellTemp,
    inverterEfficiency: 98.4,
    status: 'NOMINAL',
  };
}

/**
 * Robust live irradiance fetcher with circuit breaker fallback
 */
export async function fetchLivePlantTelemetry(location = DEFAULT_LOCATION) {
  try {
    const livePromise = fetchLiveIrradiance(location);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
    const result = await Promise.race([livePromise, timeoutPromise]);

    if (result && result.ghi !== undefined) {
      return result;
    }
  } catch {
    // Silent catch
  }

  // Instant fallback to physics simulation
  const h = new Date().getHours();
  const mock = generateRealisticMockTelemetry(h);
  return {
    ghi: mock.irradianceW,
    dni: Math.round(mock.irradianceW * 0.82),
    dhi: Math.round(mock.irradianceW * 0.18),
    temp: mock.ambientTempC,
    cellTemp: mock.cellTempC,
    powerKW: mock.activePowerKW,
    cloudCover: 8,
    isDay: mock.irradianceW > 0,
    timestamp: mock.timestamp,
    isSimulated: true,
  };
}

/**
 * Robust 24-hour forecast fetcher with circuit breaker fallback
 */
export async function fetchPlant24HourForecast(location = DEFAULT_LOCATION) {
  try {
    const forecastPromise = fetch24HourMeteoForecast(location);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2500));
    const result = await Promise.race([forecastPromise, timeoutPromise]);

    if (result && result.hours && result.hours.length === 24) {
      return result;
    }
  } catch {
    // Silent catch
  }

  return {
    hours: generate24HourForecast(),
    isSimulated: true,
  };
}

export function isFirebaseConnected() {
  return isFirebaseLive;
}

export default {
  pingFirebaseCircuitBreaker,
  subscribeFirebaseStatus,
  generateRealisticMockTelemetry,
  fetchLivePlantTelemetry,
  fetchPlant24HourForecast,
  isFirebaseConnected,
};
