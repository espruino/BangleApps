import { draw } from './display';
import { updateLog } from './log';
import { ActivityStatus, AppState } from './state';

declare var Bangle: any;

interface GpsEvent {
  lat: number;
  lon: number;
  alt: number;
  speed: number;
  hdop: number;
  fix: number;
}

const EARTH_RADIUS = 6371008.8;

function initGps(state: AppState): void {
  Bangle.on('GPS', (gps: GpsEvent) => readGps(state, gps));
  Bangle.setGPSPower(1);
}

function readGps(state: AppState, gps: GpsEvent): void {
  state.lat = gps.lat;
  state.lon = gps.lon;
  state.alt = gps.alt;
  state.vel = gps.speed / 3.6;
  state.fix = gps.fix;
  state.dop = gps.hdop;
  state.gpsValid = state.fix > 0;

  updateGps(state);
  draw(state);

  /* Only log GPS data every 5 secs if we
  have a fix and we're running. */
  if (state.gpsValid &&
      state.status === ActivityStatus.Running &&
      state.timeSinceLog > 5) {
    state.timeSinceLog = 0;
    updateLog(state);
  }
}

function updateGps(state: AppState): void {
  const t = Date.now();
  let dt = (t - state.t) / 1000;
  if (!isFinite(dt)) dt=0;
  state.t = t;
  state.timeSinceLog += dt;

  if (state.status === ActivityStatus.Running) {
    state.duration += dt;
  }

  if (!state.gpsValid) {
    return;
  }

  const r = EARTH_RADIUS + state.alt;
  const lat = state.lat * Math.PI / 180;
  const lon = state.lon * Math.PI / 180;
  const x = r * Math.cos(lat) * Math.cos(lon);
  const y = r * Math.cos(lat) * Math.sin(lon);
  const z = r * Math.sin(lat);

  if (!state.x) {
    state.x = x;
    state.y = y;
    state.z = z;
    return;
  }

  const dx = x - state.x;
  const dy = y - state.y;
  const dz = z - state.z;
  const dpMag = Math.sqrt(dx * dx + dy * dy + dz * dz);

  state.x = x;
  state.y = y;
  state.z = z;

  if (state.status === ActivityStatus.Running) {
    state.distance += dpMag;
    state.speed = (state.distance / state.duration) || 0;
    state.cadence = (60 * state.steps / state.duration) || 0;
  }
}

export { initGps, readGps, updateGps };
