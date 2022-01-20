"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGps = exports.readGps = exports.initGps = void 0;
const display_1 = require("./display");
const log_1 = require("./log");
const state_1 = require("./state");
const EARTH_RADIUS = 6371008.8;
function initGps(state) {
    Bangle.on('GPS', (gps) => readGps(state, gps));
    Bangle.setGPSPower(1);
}
exports.initGps = initGps;
function readGps(state, gps) {
    state.lat = gps.lat;
    state.lon = gps.lon;
    state.alt = gps.alt;
    state.vel = gps.speed / 3.6;
    state.fix = gps.fix;
    state.dop = gps.hdop;
    state.gpsValid = state.fix > 0;
    updateGps(state);
    (0, display_1.draw)(state);
    /* Only log GPS data every 5 secs if we
    have a fix and we're running. */
    if (state.gpsValid &&
        state.status === state_1.ActivityStatus.Running &&
        state.timeSinceLog > 5) {
        state.timeSinceLog = 0;
        (0, log_1.updateLog)(state);
    }
}
exports.readGps = readGps;
function updateGps(state) {
    const t = Date.now();
    let dt = (t - state.t) / 1000;
    if (!isFinite(dt))
        dt = 0;
    state.t = t;
    state.timeSinceLog += dt;
    if (state.status === state_1.ActivityStatus.Running) {
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
    if (state.status === state_1.ActivityStatus.Running) {
        state.distance += dpMag;
        state.speed = (state.distance / state.duration) || 0;
        state.cadence = (60 * state.steps / state.duration) || 0;
    }
}
exports.updateGps = updateGps;
