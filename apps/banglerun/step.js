import { ActivityStatus } from './state';
function initStep(state) {
    Bangle.on('step', () => updateStep(state));
}
function updateStep(state) {
    if (state.status === ActivityStatus.Running) {
        state.steps += 1;
    }
}
export { initStep, updateStep };
