
const version = '0.03';

const p = Math.PI / 2;
const pRad = Math.PI / 180;
const faceWidth = 95; // watch face is 95 px wide (radius)
let timerInterval = null;
let currentDate = new Date();
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
let g;

const seconds = (angle, r) => {
  const a = angle * pRad;
  const x = 120 + Math.sin(a) * r;
  const y = 120 - Math.cos(a) * r;
  
  // if 15 degrees, make hour marker larger
  if (angle % 15 === 0) {
    g.fillCircle(x, y, 4);
  } else {
    g.fillCircle(x, y, 2);
  }
};

const hand = (angle, r1, r2) => {
  const a = angle * pRad;
  const r3 = 3;

  g.fillPoly([
    120 + Math.sin(a) * r1,
    120 - Math.cos(a) * r1,
    120 + Math.sin(a + p) * r3,
    120 - Math.cos(a + p) * r3,
    120 + Math.sin(a) * r2,
    120 - Math.cos(a) * r2,
    120 + Math.sin(a - p) * r3,
    120 - Math.cos(a - p) * r3
  ]);
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

const onMinute = () => {
  g.setColor(0, 0, 0);
  // Minute hand
  hand((360 * (currentDate.getHours() + currentDate.getMinutes() / 60)) / 12, -8, faceWidth - 40);
  // Hour hand
  hand((360 * currentDate.getMinutes()) / 60, -8, faceWidth - 10);
  currentDate = new Date();
  g.setColor(1, 0.7, 0.7);
  // Minute hand
  hand((360 * (currentDate.getHours() + currentDate.getMinutes() / 60)) / 12, -8, faceWidth - 40);
  g.setColor(1, 1, 0.8);
  // Hour hand
  hand((360 * currentDate.getMinutes()) / 60, -8, faceWidth - 10);
  if (currentDate.getHours() >= 0 && currentDate.getMinutes() === 0) {
    Bangle.buzz();
  }
  g.setColor(1, 1, 1);
  const dayString = days[currentDate.getDay()];
  let dateString = currentDate.getDate().toString();
  if (dateString.length == 1) {
    dateString = `0${dateString}`;
  }
  console.log(`${dayString}-${dateString}`);

  g.drawString(`${dayString}-${dateString}`, g.getWidth() / 2 + 30, g.getHeight() / 2 + 40);
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
console.log('Nik\'s watch version ', version);
resetSeconds();
startTimers();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });