import { AppState } from './state';

interface HrmData {
  bpm: number;
  confidence: number;
  raw: string;
}

declare var Bangle: any;

function initHrm(state: AppState) {
  Bangle.on('HRM', (hrm: HrmData) => updateHrm(state, hrm));
  Bangle.setHRMPower(1);
}

function updateHrm(state: AppState, hrm: HrmData) {
  if (hrm.confidence === 0) {
    return;
  }

  const dHr = hrm.bpm - state.hr;
  const hrError = Math.abs(dHr) + 101 - hrm.confidence;
  const hrGain = (state.hrError / (state.hrError + hrError)) || 0;

  state.hr += dHr * hrGain;
  state.hrError += (hrError - state.hrError) * hrGain;
}

export { initHrm, updateHrm };
