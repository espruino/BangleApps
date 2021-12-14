import { startActivity, stopActivity } from './activity';
import { initDisplay } from './display';
import { initGps } from './gps';
import { initHrm } from './hrm';
import { initState } from './state';
import { initStep } from './step';

declare var BTN1: any;
declare var BTN3: any;
declare var setWatch: any;

const appState = initState();

initGps(appState);
initHrm(appState);
initStep(appState);
initDisplay(appState);

setWatch(() => startActivity(appState), BTN1, { repeat: true, edge: 'falling' });
setWatch(() => stopActivity(appState), BTN3, { repeat: true, edge: 'falling' });
