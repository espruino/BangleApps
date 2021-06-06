import { ActivityStatus, AppState } from './state';

declare var Bangle: any;
declare var g: any;

const STATUS_COLORS = {
  'STOP': 0xF800,
  'PAUSE': 0xFFE0,
  'RUN': 0x07E0,
}

function initDisplay(state: AppState): void {
  Bangle.loadWidgets();
  Bangle.on('lcdPower', (on: boolean) => {
    state.drawing = on;
    if (on) {
      drawAll(state);
    }
  });
  drawAll(state);
}

function drawBackground(): void {
  g.clear();
  g.setColor(0xC618);
  g.setFont('6x8', 2);
  g.setFontAlign(0, -1, 0);
  g.drawString('DIST (KM)', 60, 32);
  g.drawString('TIME', 172, 32);
  g.drawString('PACE', 60, 92);
  g.drawString('HEART', 172, 92);
  g.drawString('STEPS', 60, 152);
  g.drawString('CADENCE', 172, 152);
}

function drawValue(value: string, x: number, y: number) {
  g.setColor(0x0000);
  g.fillRect(x - 60, y, x + 60, y + 30);
  g.setColor(0xFFFF);
  g.drawString(value, x, y);
}

function draw(state: AppState): void {
  g.setFontVector(30);
  g.setFontAlign(0, -1, 0);

  drawValue(formatDistance(state.distance), 60, 55);
  drawValue(formatTime(state.duration), 172, 55);
  drawValue(formatPace(state.speed), 60, 115);
  drawValue(state.hr.toFixed(0), 172, 115);
  drawValue(state.steps.toFixed(0), 60, 175);
  drawValue(state.cadence.toFixed(0), 172, 175);

  g.setFont('6x8', 2);

  g.setColor(state.gpsValid ? 0x07E0 : 0xF800);
  g.fillRect(0, 216, 80, 240);
  g.setColor(0x0000);
  g.drawString('GPS', 40, 220);

  g.setColor(0xFFFF);
  g.fillRect(80, 216, 160, 240);
  g.setColor(0x0000);
  g.drawString(formatClock(new Date()), 120, 220);

  g.setColor(STATUS_COLORS[state.status]);
  g.fillRect(160, 216, 230, 240);
  g.setColor(0x0000);
  g.drawString(state.status, 200, 220);

  g.setFont("6x8").setFontAlign(0,0,1).setColor(-1);
  if (state.status === ActivityStatus.Paused) {
    g.drawString("START",236,60,1).drawString(" CLEAR ",236,180,1);
  } else if (state.status === ActivityStatus.Running) {
    g.drawString(" PAUSE ",236,60,1).drawString(" PAUSE ",236,180,1);
  } else {
    g.drawString("START",236,60,1).drawString("      ",236,180,1);
  }
}

function drawAll(state: AppState) {
  drawBackground();
  draw(state);
  Bangle.drawWidgets();
}

function formatClock(date: Date): string {
  return ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2);
}

function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(2);
}

function formatPace(speed: number): string {
  if (speed < 0.1667) {
    return `__'__"`;
  }
  const pace = Math.round(1000 / speed);
  const min = Math.floor(pace / 60);
  const sec = pace % 60;
  return ('0' + min).substr(-2) + `'` + ('0' + sec).substr(-2) + `"`;
}

function formatTime(time: number): string {
  const seconds = Math.round(time);
  const hrs = Math.floor(seconds / 3600);
  const min = Math.floor(seconds / 60) % 60;
  const sec = seconds % 60;
  return (hrs ? hrs + ':' : '') + ('0' + min).substr(-2) + `:` + ('0' + sec).substr(-2);
}

export {
  draw,
  drawAll,
  drawBackground,
  drawValue,
  formatClock,
  formatDistance,
  formatPace,
  formatTime,
  initDisplay,
};
