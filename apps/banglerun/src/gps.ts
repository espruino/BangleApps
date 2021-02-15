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
const POS_ACCURACY = 2.5;
const VEL_ACCURACY = 0.05;

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

  state.gpsValid = state.fix > 0 && state.dop <= 5;

  updateGps(state);
  draw(state);

  if (state.gpsValid && state.status === ActivityStatus.Running) {
    updateLog(state);
  }
}

function updateGps(state: AppState): void {
  const t = Date.now();
  let dt = (t - state.t) / 1000;
  if (!isFinite(dt)) dt=0;

  state.t = t;
  state.dt += dt;

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
  const v = state.vel;

  if (!state.x) {
    state.x = x;
    state.y = y;
    state.z = z;
    state.v = v;
    state.pError = state.dop * POS_ACCURACY;
    state.vError = state.dop * VEL_ACCURACY;
    return;
  }

  const dx = x - state.x;
  const dy = y - state.y;
  const dz = z - state.z;
  const dv = v - state.v;
  const dpMag = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const dvMag = Math.abs(dv);

  state.pError += state.v * state.dt;
  state.dt = 0;

  const pError = dpMag + state.dop * POS_ACCURACY;
  const vError = dvMag + state.dop * VEL_ACCURACY;

  const pGain = (state.pError / (state.pError + pError)) || 0;
  const vGain = (state.vError / (state.vError + vError)) || 0;

  state.x += dx * pGain;
  state.y += dy * pGain;
  state.z += dz * pGain;
  state.v += dv * vGain;
  state.pError += (pError - state.pError) * pGain;
  state.vError += (vError - state.vError) * vGain;

/*// we're not currently updating lat/lon with the kalman filter
  // as it seems not to update them correctly at the moment
  // and we only use them for logging (where it makes sense to use
  // raw GPS coordinates)
  const pMag = Math.sqrt(state.x * state.x + state.y * state.y + state.z * state.z);
  state.lat = (Math.asin(state.z / pMag) * 180 / Math.PI) || 0;
  state.lon = (Math.atan2(state.y, state.x) * 180 / Math.PI) || 0;
  state.alt = pMag - EARTH_RADIUS;*/

  if (state.status === ActivityStatus.Running) {
    state.distance += dpMag * pGain;
    state.speed = (state.distance / state.duration) || 0;
    state.cadence = (60 * state.steps / state.duration) || 0;
  }
}

export { initGps, readGps, updateGps };
