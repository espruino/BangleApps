const version = '0.09';
const debug = false;

const p = Math.PI / 2;
const pRad = Math.PI / 180;
const faceWidth = 100; // watch face radius
let timerInterval = null;
let currentDate = new Date();
const centerPx = 120;
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

let g;
let Bangle;

const seconds = (angle) => {
  const a = angle * pRad;
  const x = centerPx + Math.sin(a) * faceWidth;
  const y = centerPx - Math.cos(a) * faceWidth;

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
};

const drawAll = () => {
  g.clear();
  currentDate = new Date();
  // draw hands first
  onMinute();
  // draw seconds
  g.setColor(0, 0, 0.6);
  for (let i = 0; i < 60; i++) {
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
  g.setColor(1, 0, 0);
  g.setFont('6x8', 2)

  const dayString = days[currentDate.getDay()];
  // pad left date
  let dateString =  (currentDate.getDate() < 10) ? '0' : '' + currentDate.getDate().toString();
 
  const dateDisplay = `${dayString}-${dateString}`;
  // console.log(`${dayString}|${dateString}`);
  // center date
  const l = (g.getWidth() - g.stringWidth(dateDisplay))/2;
  const t = centerPx + 37;
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

const startTimers = () => {

  
  timerInterval = setInterval(onSecond, 1000);
  
};

Bangle.on('lcdPower', (on) => {
  if (on) {
    // g.clear();
    Bangle.drawWidgets();
    drawAll();
    startTimers();
  } else {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  }
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
console.log('Analog watch version ', version);
drawAll();
resetSeconds();
startTimers();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });