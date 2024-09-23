const big = g.getWidth()>200;
const locale = require('locale');
const pRad = Math.PI / 180;
let timer = null;
let currentDate = new Date();
const faceWidth = big?100:65; // watch face radius
let hourRadius = big?60:40;
let minRadius = big?80:55;
const centerX = g.getWidth() / 2;
const centerY = 24 + (g.getHeight()-24) / 2;
let colSecA = g.theme.dark ? "#00A" : "#58F"; // before the second
let colSecB = g.theme.dark ? "#58F" : "#00A"; // after the second
let colSec1 = g.theme.dark ? "#F83" : "#000"; // ON the second

const seconds = (angle) => {
  const a = angle * pRad;
  const x = centerX + Math.sin(a) * faceWidth;
  const y = centerY - Math.cos(a) * faceWidth;

  // if 15 degrees, make hour marker larger
  const radius = (angle % 15) ? 2 : 4;
  g.fillCircle(x, y, radius);
};

const hourDot = (angle,radius) => {
  const a = angle * pRad;
  const x = centerX + Math.sin(a) * hourRadius;
  const y = centerY - Math.cos(a) * hourRadius;
  g.fillCircle(x, y, radius);
};

const minDot = (angle,radius) => {
  const a = angle * pRad;
  const x = centerX + Math.sin(a) * minRadius;
  const y = centerY - Math.cos(a) * minRadius;
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
    g.setColor((i > currentSec) ? colSecA : colSecB);
    seconds((360 * i) / 60);
  }
  onSecond();
};

const resetSeconds = () => {
  g.setColor(colSecA);
  for (let i = 0; i < 60; i++) {
    seconds((360 * i) / 60);
  }
};

const drawMin = () => {
  g.setColor("#777");
  for (let i = 0; i < 60; i++) {
    minDot((360 * i) / 60,1);
  }
};

const drawHour = () => {
  g.setColor("#777");
  for (let i = 0; i < 12; i++) {
    hourDot((360 * 5 * i) / 60,1);
  }
};

const onSecond = () => {
  g.setColor(colSecB);
  seconds((360 * currentDate.getSeconds()) / 60);
  if (currentDate.getSeconds() === 59) {
    resetSeconds();
    onMinute();
  }
  g.setColor(colSec1);
  currentDate = new Date();
  seconds((360 * currentDate.getSeconds()) / 60);
  g.setColor(g.theme.fg);
};

const drawDate = () => {
  g.reset();
  g.setFont('6x8', big?2:1);

  const dayString = locale.dow(currentDate, true);
  // pad left date
  const dateString = ((currentDate.getDate() < 10) ? '0' : '') + currentDate.getDate().toString();
  const dateDisplay = `${dayString} ${dateString}`;
  // console.log(`${dayString}|${dateString}`);
  // center date
  const l = (g.getWidth() - g.stringWidth(dateDisplay)) / 2;
  const t = centerY - 6 ;
  g.drawString(dateDisplay, l, t);
  // console.log(l, t);
};
const onMinute = () => {
  if (currentDate.getHours() === 0 && currentDate.getMinutes() === 0) {
    g.clear();
    resetSeconds();
  }
  // clear existing hands
  g.setColor(g.theme.bg);
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
  g.setColor(g.theme.fg2);
  // Minute
  minDot((360 * currentDate.getMinutes()) / 60,3);
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
// Show launcher when button pressed
Bangle.setUI("clock");

Bangle.loadWidgets();
Bangle.drawWidgets();
