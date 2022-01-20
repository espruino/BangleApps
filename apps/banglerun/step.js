"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStep = exports.initStep = void 0;
const state_1 = require("./state");
function initStep(state) {
    Bangle.on('step', () => updateStep(state));
}
exports.initStep = initStep;
function updateStep(state) {
    if (state.status === state_1.ActivityStatus.Running) {
        state.steps += 1;
    }
}
exports.updateStep = updateStep;
