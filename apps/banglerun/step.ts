import { ActivityStatus, AppState } from './state';

declare var Bangle: any;

function initStep(state: AppState) {
  Bangle.on('step', () => updateStep(state));
}

function updateStep(state: AppState) {
  if (state.status === ActivityStatus.Running) {
    state.steps += 1;
  }
}

export { initStep, updateStep };
