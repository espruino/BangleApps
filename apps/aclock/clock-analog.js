const version = '0.0.7';
const debug = false;

const p = Math.PI / 2;
const pRad = Math.PI / 180;
const faceWidth = 115; // watch face is 95 px wide (radius)
let timerInterval = null;
let currentDate = new Date();
const centerPx = 120;
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

let g;
let Bangle;

const seconds = (angle, r) => {
  const a = angle * pRad;
  const x = centerPx + Math.sin(a) * r;
  const y = centerPx - Math.cos(a) * r;

  // if 15 degrees, make hour marker larger
  const radius = (angle % 15) ? 2 : 4;
  g.fillCircle(x, y, radius);
};

const hand = (angle, r1, r2) => {
  const a = angle * pRad;
  const r3 = 3;

  g.fillPoly([
    Math.round(centerPx + Math.sin(a) * r1),
    Math.round(centerPx - Math.cos(a) * r1),
    Math.round(centerPx + Math.sin(a + p) * r3),
    Math.round(centerPx - Math.cos(a + p) * r3),
    Math.round(centerPx + Math.sin(a) * r2),
    Math.round(centerPx - Math.cos(a) * r2),
    Math.round(centerPx + Math.sin(a - p) * r3),
    Math.round(centerPx - Math.cos(a - p) * r3)
  ]);

  if (debug) {
    console.log(`made poly: ,
    x1: ${Math.round(centerPx + Math.sin(a) * r1)}, y1: ${Math.round(centerPx - Math.cos(a) * r1)},
    x2: ${Math.round(centerPx + Math.sin(a + p) * r3)}, y2: ${Math.round(centerPx - Math.cos(a + p) * r3)},
    x3: ${Math.round(centerPx + Math.sin(a) * r2)}, y3: ${Math.round(centerPx - Math.cos(a) * r2)},
    x4: ${Math.round(centerPx + Math.sin(a - p) * r3)}, y4: ${Math.round(centerPx - Math.cos(a - p) * r3)}`
    );
  }
};

const drawAll = () => {
  g.clear();
  currentDate = new Date();
  // draw hands first
  onMinute();
  // draw seconds
  g.setColor(0, 0, 0.6);
  for (let i = 0; i < 60; i++) {
    seconds((360 * i) / 60, faceWidth);
  }
  onSecond();
};

const resetSeconds = () => {
  g.setColor(0, 0, 0.6);
  for (let i = 0; i < 60; i++) {
    seconds((360 * i) / 60, faceWidth);
  }
};

const onSecond = () => {
  g.setColor(0.3, 0.3, 1);
  seconds((360 * currentDate.getSeconds()) / 60, faceWidth);
  if (currentDate.getSeconds() === 59) {
    resetSeconds();
    onMinute();
  }
  g.setColor(1, 0.7, 0.2);
  currentDate = new Date();
  seconds((360 * currentDate.getSeconds()) / 60, faceWidth);
  g.setColor(1, 1, 1);
};

const drawDate = () => {
  g.reset();
  g.setColor(0, 0, 0)
    .fillRect(
      centerPx + 12,
      centerPx + 35,
      centerPx + 90,
      centerPx + 55)
    .setColor(1, 1, 0)
    .drawRect(
      centerPx + 12,
      centerPx + 35,
      centerPx + 90,
      centerPx + 55);

  const dayString = days[currentDate.getDay()];
  let dateString = currentDate.getDate().toString();
  if (dateString.length === 1) {
    dateString = `0${dateString}`;
  }
  console.log(`${dayString}|${dateString}`);
  const l = centerPx + 15;
  const t = centerPx + 37;
  g
    .setColor(1, 0, 0)
    .setFont('6x8', 2)
    .drawString(`${dayString}-${dateString}`, l, t);
  console.log(l, t);
};
const onMinute = () => {
  if (currentDate.getHours() === 0 && currentDate.getMinutes() === 0) {
    console.log('midnight');
    g.clear();
    resetSeconds();
  }
  // clear existing hands
  g.setColor(0, 0, 0);
  // Hour
  hand((360 * (currentDate.getHours() + currentDate.getMinutes() / 60)) / 12, -8, faceWidth - 35);
  // Minute
  hand((360 * currentDate.getMinutes()) / 60, -8, faceWidth - 10);

  // get new date, then draw new hands
  currentDate = new Date();
  g.setColor(1, 0.3, 0.5);
  // Hour
  hand((360 * (currentDate.getHours() + currentDate.getMinutes() / 60)) / 12, -8, faceWidth - 35);
  g.setColor(1, 1, 0.4);
  // Minute
  hand((360 * currentDate.getMinutes()) / 60, -8, faceWidth - 10);
  if (currentDate.getHours() >= 0 && currentDate.getMinutes() === 0) {
    Bangle.buzz();
  }
  drawDate();
};


const clearTimers = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
};

const startTimers = () => {
  currentDate = new Date();
  timerInterval = setInterval(onSecond, 1000);
  drawAll();
};

Bangle.on('lcdPower', (on) => {
  if (on) {
    g.clear();
    Bangle.drawWidgets();
    startTimers();
  } else {
    clearTimers();
  }
});

Bangle.on('faceUp', (up) => {
  if (up && !Bangle.isLCDOn()) {
    Bangle.setLCDPower(true);
  }
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
console.log('Analog watch version ', version);
resetSeconds();
startTimers();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });