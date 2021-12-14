import { draw } from './display';
import { initLog } from './log';
import { ActivityStatus, AppState } from './state';

function startActivity(state: AppState): void {
  if (state.status === ActivityStatus.Stopped) {
    initLog(state);
  }

  if (state.status === ActivityStatus.Running) {
    state.status = ActivityStatus.Paused;
  } else {
    state.status = ActivityStatus.Running;
  }

  draw(state);
}

function stopActivity(state: AppState): void {
  if (state.status === ActivityStatus.Paused) {
    clearActivity(state);
  }

  if (state.status === ActivityStatus.Running) {
    state.status = ActivityStatus.Paused;
  } else {
    state.status = ActivityStatus.Stopped;
  }

  draw(state);
}

function clearActivity(state: AppState): void {
  state.duration = 0;
  state.distance = 0;
  state.speed = 0;
  state.steps = 0;
  state.cadence = 0;
}

export { clearActivity, startActivity, stopActivity };
