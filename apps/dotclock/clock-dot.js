let g;
let Bangle;

const locale = require('locale');
const p = Math.PI / 2;
const pRad = Math.PI / 180;
const faceWidth = 100; // watch face radius
let timer = null;
let currentDate = new Date();
let hourRadius = 60;
let minRadius = 80;
const centerPx = g.getWidth() / 2;

const seconds = (angle) => {
  const a = angle * pRad;
  const x = centerPx + Math.sin(a) * faceWidth;
  const y = centerPx - Math.cos(a) * faceWidth;

  // if 15 degrees, make hour marker larger
  const radius = (angle % 15) ? 2 : 4;
  g.fillCircle(x, y, radius);
};

const hourDot = (angle,radius) => {
  const a = angle * pRad;
  const x = centerPx + Math.sin(a) * hourRadius;
  const y = centerPx - Math.cos(a) * hourRadius;
  g.fillCircle(x, y, radius);
};

const minDot = (angle,radius) => {
  const a = angle * pRad;
  const x = centerPx + Math.sin(a) * minRadius;
  const y = centerPx - Math.cos(a) * minRadius;
  g.fillCircle(x, y, radius);
};

const drawAll = () => {
  g.clear();
  currentDate = new Date();
  // draw hands first
  onMinute();
  // draw seconds
  const currentSec = currentDate.getSeconds();
  // draw all secs

  for (let i = 0; i < 60; i++) {
    if (i > currentSec) {
      g.setColor(0, 0, 0.6);
    } else {
      g.setColor(0.3, 0.3, 1);
    }
    seconds((360 * i) / 60);
  }
  onSecond();
};

const resetSeconds = () => {
  g.setColor(0, 0, 0.6);
  for (let i = 0; i < 60; i++) {
    seconds((360 * i) / 60);
  }
};

const drawMin = () => {
  g.setColor(0.5, 0.5, 0.5);
  for (let i = 0; i < 60; i++) {
    minDot((360 * i) / 60,1);
  }
};

const drawHour = () => {
  g.setColor(0.5, 0.5, 0.5);
  for (let i = 0; i < 12; i++) {
    hourDot((360 * 5 * i) / 60,1);
  }
};

const onSecond = () => {
  g.setColor(0.3, 0.3, 1);
  seconds((360 * currentDate.getSeconds()) / 60);
  if (currentDate.getSeconds() === 59) {
    resetSeconds();
    onMinute();
  }
  g.setColor(1, 0.7, 0.2);
  currentDate = new Date();
  seconds((360 * currentDate.getSeconds()) / 60);
  g.setColor(1, 1, 1);
};

const drawDate = () => {
  g.reset();
  g.setColor(1, 1, 1);
  g.setFont('6x8', 2);

  const dayString = locale.dow(currentDate, true);
  // pad left date
  const dateString = ((currentDate.getDate() < 10) ? '0' : '') + currentDate.getDate().toString();
  const dateDisplay = `${dayString} ${dateString}`;
  // console.log(`${dayString}|${dateString}`);
  // center date
  const l = (g.getWidth() - g.stringWidth(dateDisplay)) / 2;
  const t = centerPx - 6 ;
  g.drawString(dateDisplay, l, t);
  // console.log(l, t);
};
const onMinute = () => {
  if (currentDate.getHours() === 0 && currentDate.getMinutes() === 0) {
    g.clear();
    resetSeconds();
  }
  // clear existing hands
  g.setColor(0, 0, 0);
  hourDot((360 * currentDate.getHours()) / 12,4);
  minDot((360 * currentDate.getMinutes()) / 60,3);

  // Hour
  drawHour();
  // Minute
  drawMin();

  // get new date, then draw new hands
  currentDate = new Date();
  g.setColor(1, 0, 0);
  // Hour
  hourDot((360 * currentDate.getHours()) / 12,4);
  g.setColor(1, 0.9, 0.9);
  // Minute
  minDot((360 * currentDate.getMinutes()) / 60,3);
  if (currentDate.getHours() >= 0 && currentDate.getMinutes() === 0) {
    Bangle.buzz();
  }
  drawDate();
};

const startTimers = () => {
  timer = setInterval(onSecond, 1000);
};

Bangle.on('lcdPower', (on) => {
  if (on) {
    // g.clear();
    drawAll();
    startTimers();
    Bangle.drawWidgets();
  } else {
    if (timer) {
      clearInterval(timer);
    }
  }
});

g.clear();
resetSeconds();
startTimers();
drawAll();
Bangle.loadWidgets();
Bangle.drawWidgets();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
