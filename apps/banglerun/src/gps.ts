import { draw } from './display';
import { updateLog } from './log';
import { ActivityStatus, AppState } from './state';

declare var Bangle: any;

const EARTH_RADIUS = 6371008.8;
const POS_ACCURACY = 2.5;
const VEL_ACCURACY = 0.05;

function initGps(state: AppState): void {
  Bangle.on('GPS-raw', (nmea: string) => parseNmea(state, nmea));
  Bangle.setGPSPower(1);
}

function parseCoordinate(coordinate: string): number {
  const pivot = coordinate.indexOf('.') - 2;
  const degrees = parseInt(coordinate.substr(0, pivot));
  const minutes = parseFloat(coordinate.substr(pivot)) / 60;
  return (degrees + minutes) * Math.PI / 180;
}

function parseNmea(state: AppState, nmea: string): void {
  const tokens = nmea.split(',');
  const sentence = tokens[0].substr(3, 3);

  switch (sentence) {
    case 'GGA':
      state.lat = parseCoordinate(tokens[2]) * (tokens[3] === 'N' ? 1 : -1);
      state.lon = parseCoordinate(tokens[4]) * (tokens[5] === 'E' ? 1 : -1);
      state.alt = parseFloat(tokens[9]);
      break;
    case 'VTG':
      state.vel = parseFloat(tokens[7]) / 3.6;
      break;
    case 'GSA':
      state.fix = parseInt(tokens[2]);
      state.dop = parseFloat(tokens[15]);
      break;
    case 'GLL':
      state.gpsValid = state.fix === 3 && state.dop <= 5;
      updateGps(state);
      draw(state);
      if (state.gpsValid && state.status === ActivityStatus.Running) {
        updateLog(state);
      }
      break;
    default:
      break;
  }
}

function updateGps(state: AppState): void {
  const t = Date.now();
  const dt = (t - state.t) / 1000;

  state.t = t;
  state.dt += dt;

  if (state.status === ActivityStatus.Running) {
    state.duration += dt;
  }

  if (!state.gpsValid) {
    return;
  }

  const r = EARTH_RADIUS + state.alt;
  const x = r * Math.cos(state.lat) * Math.cos(state.lon);
  const y = r * Math.cos(state.lat) * Math.sin(state.lon);
  const z = r * Math.sin(state.lat);
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

  const pGain = state.pError / (state.pError + pError);
  const vGain = state.vError / (state.vError + vError);

  state.x += dx * pGain;
  state.y += dy * pGain;
  state.z += dz * pGain;
  state.v += dv * vGain;
  state.pError += (pError - state.pError) * pGain;
  state.vError += (vError - state.vError) * vGain;

  const pMag = Math.sqrt(state.x * state.x + state.y * state.y + state.z * state.z);

  state.lat = Math.asin(state.z / pMag) * 180 / Math.PI;
  state.lon = (Math.atan2(state.y, state.x) * 180 / Math.PI) || 0;
  state.alt = pMag - EARTH_RADIUS;

  if (state.status === ActivityStatus.Running) {
    state.distance += dpMag * pGain;
    state.speed = (state.distance / state.duration) || 0;
    state.cadence = (60 * state.steps / state.duration) || 0;
  }
}

export { initGps, parseCoordinate, parseNmea, updateGps };
