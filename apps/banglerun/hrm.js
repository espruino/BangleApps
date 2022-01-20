"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHrm = exports.initHrm = void 0;
function initHrm(state) {
    Bangle.on('HRM', (hrm) => updateHrm(state, hrm));
    Bangle.setHRMPower(1);
}
exports.initHrm = initHrm;
function updateHrm(state, hrm) {
    if (hrm.confidence === 0) {
        return;
    }
    const dHr = hrm.bpm - state.hr;
    const hrError = Math.abs(dHr) + 101 - hrm.confidence;
    const hrGain = (state.hrError / (state.hrError + hrError)) || 0;
    state.hr += dHr * hrGain;
    state.hrError += (hrError - state.hrError) * hrGain;
}
exports.updateHrm = updateHrm;
