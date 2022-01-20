"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopActivity = exports.startActivity = exports.clearActivity = void 0;
const display_1 = require("./display");
const log_1 = require("./log");
const state_1 = require("./state");
function startActivity(state) {
    if (state.status === state_1.ActivityStatus.Stopped) {
        (0, log_1.initLog)(state);
    }
    if (state.status === state_1.ActivityStatus.Running) {
        state.status = state_1.ActivityStatus.Paused;
    }
    else {
        state.status = state_1.ActivityStatus.Running;
    }
    (0, display_1.draw)(state);
}
exports.startActivity = startActivity;
function stopActivity(state) {
    if (state.status === state_1.ActivityStatus.Paused) {
        clearActivity(state);
    }
    if (state.status === state_1.ActivityStatus.Running) {
        state.status = state_1.ActivityStatus.Paused;
    }
    else {
        state.status = state_1.ActivityStatus.Stopped;
    }
    (0, display_1.draw)(state);
}
exports.stopActivity = stopActivity;
function clearActivity(state) {
    state.duration = 0;
    state.distance = 0;
    state.speed = 0;
    state.steps = 0;
    state.cadence = 0;
}
exports.clearActivity = clearActivity;
