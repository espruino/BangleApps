
function roundRect (x1, y1, x2, y2, halfrad) {
  const fullrad = halfrad + halfrad
  const bgColor = g.getBgColor();
  const fgColor = g.getColor();
  g.fillRect(x1, y1, x2, y2);
  g.setColor(bgColor).fillRect(x1, y1, x1 + halfrad, y1 + halfrad);
  g.setColor(fgColor).fillEllipse(x1, y1, x1 + fullrad, y1 + fullrad);
  g.setColor(bgColor).fillRect(x2 - halfrad, y1, x2, y1 + halfrad);
  g.setColor(fgColor).fillEllipse(x2 - fullrad, y1, x2, y1 + fullrad);

  g.setColor(bgColor).fillRect(x1, y2-halfrad, x1 + halfrad, y2);
  g.setColor(fgColor).fillEllipse(x1, y2-fullrad, x1 + fullrad, y2);
  g.setColor(bgColor).fillRect(x2 - halfrad, y2-halfrad, x2, y2);
  g.setColor(fgColor).fillEllipse(x2 - fullrad, y2-fullrad, x2, y2);
}

function center(r) {
  return {x: r.x + (r.x2 - r.x)/2, y: r.y + (r.y2 - r.y)/2}
}
function inRect(r, xy) {
  return xy.x >= r.x && xy.x <= r.x2 && xy.y >= r.y && xy.y <= r.y2;
}

let restSeconds = 60;
let setsCount = 3;

let currentSet = 1;
let restUntil = 0;


const R = Bangle.appRect;
const spacing = 2;
const q1 = {x: R.x, y: R.y, x2: R.x2/2 - spacing, y2: R.y2 / 2 - spacing};
const q2 = {x: R.x2/2 + spacing, y: R.y, x2: R.x2, y2: R.y2 / 2 - spacing};
const q3 = {x: R.x, y: R.y2/2 + spacing, x2: R.x2/2 - spacing, y2: R.y2};
const q4 = {x: R.x2/2 + spacing, y: R.y2/2 + spacing, x2: R.x2, y2: R.y2};
const quadrants = [q1,q2,q3,q4];
const c1 = center(q1)
const c2 = center(q2)
const c3 = center(q3)
const c4 = center(q4)

const SET_COLOR = '#880088';
const REST_COLOR = '#008888';

function drawMainMenu() {
  g.setBgColor(-1).clear();
  g.setColor('#888888');
  roundRect(q1.x, q1.y, q1.x2, q1.y2, 20);
  g.setColor(SET_COLOR);
  roundRect(q2.x, q2.y, q2.x2, q2.y2, 20);
  g.setColor(REST_COLOR);
  roundRect(q3.x, q3.y, q3.x2, q3.y2, 20);
  g.setColor('#008800');
  roundRect(q4.x, q4.y, q4.x2, q4.y2, 20);
  g.setColor(-1)
  g.setFont("Vector:25").setFontAlign(0,0).drawString("Lift", c1.x, c1.y)
  g.setFont("6x8").drawString("Tap to\nConfigure", c2.x, c2.y-25)
  g.setFont("Vector:25").setFontAlign(0,0).drawString("Sets\n" + setsCount, c2.x, c2.y + 10)
  g.setFont("6x8").drawString("Tap to\nConfigure", c3.x, c3.y-25)
  g.setFont("Vector:25").setFontAlign(0,0).drawString("Rest\n" +restSeconds+ "s", c3.x, c3.y + 10)
  g.setFont("Vector:25").setFontAlign(0,0).drawString("Go", c4.x, c4.y)
}

function drawSetRest() {
  g.setBgColor(-1).clear();
  g.setColor('#888888');
  roundRect(q1.x, q1.y, q1.x2, q1.y2, 20);
  g.setColor(REST_COLOR);
  roundRect(q2.x, q2.y, q2.x2, q2.y2, 20);
  g.setColor('#880000');
  roundRect(q3.x, q3.y, q3.x2, q3.y2, 20);
  g.setColor('#008800');
  roundRect(q4.x, q4.y, q4.x2, q4.y2, 20);
  g.setColor(-1)
  g.setFont("Vector:25").setFontAlign(0,0).drawString("OK", c1.x, c1.y)
  g.setFont("Vector:25").setFontAlign(0,0).drawString("Rest\n" +restSeconds+ "s", c2.x, c2.y)
  g.setFont("Vector:25").setFontAlign(0,0).drawString("-", c3.x, c3.y)
  g.setFont("Vector:25").setFontAlign(0,0).drawString("+", c4.x, c4.y)
}

function drawSetSets() {
  g.setBgColor(-1).clear();
  g.setColor('#888888');
  roundRect(q1.x, q1.y, q1.x2, q1.y2, 20);
  g.setColor(SET_COLOR);
  roundRect(q2.x, q2.y, q2.x2, q2.y2, 20);
  g.setColor('#880000');
  roundRect(q3.x, q3.y, q3.x2, q3.y2, 20);
  g.setColor('#008800');
  roundRect(q4.x, q4.y, q4.x2, q4.y2, 20);
  g.setColor(-1)
  g.setFont("Vector:25").setFontAlign(0,0).drawString("OK", c1.x, c1.y)
  g.setFont("Vector:25").setFontAlign(0,0).drawString("Sets\n" +setsCount, c2.x, c2.y)
  g.setFont("Vector:25").setFontAlign(0,0).drawString("-", c3.x, c3.y)
  g.setFont("Vector:25").setFontAlign(0,0).drawString("+", c4.x, c4.y)
}

function drawExercise() {
  g.setBgColor(-1).clear();
  g.setColor('#000000');
  roundRect(q1.x, q1.y, q1.x2, q1.y2, 20);
  g.setColor(SET_COLOR);
  roundRect(q2.x, q2.y, q2.x2, q2.y2, 20);
  g.setColor('#000000');
  roundRect(q3.x, q3.y, q3.x2, q3.y2, 20);
  // g.setColor('#FF0000');
  // roundRect(q4.x, q4.y, q4.x2, q4.y2, 20);
  g.setColor(-1);
  g.setFont("Vector:15").setFontAlign(0,0).drawString("START", c1.x, c1.y)
  g.setColor(-1);
  g.setFont("Vector:25").setFontAlign(0,0).drawString("Set\n#"+currentSet, c2.x, c2.y)
  g.setColor(-1);
  g.setFont("Vector:15").setFontAlign(0,0).drawString("EXERCISE", c3.x, c3.y)
  g.setColor(0);
  g.setFont("6x8").drawString("Push button \nwhen done ->", c4.x, c4.y)
}

function circlePoints (cx, cy, r, points) {
  let circlePoints = [];
  for (let i=0; i<points; i++) {
    circlePoints.push(-Math.sin(i/points*Math.PI*2) * r + cx);
    circlePoints.push(Math.cos(i/points*Math.PI*2) * r + cy);
  }
  return circlePoints;
}

const smallQ3Circle = circlePoints(c3.x, c3.y, (q1.x - q1.x2)/2, 60);


function drawRest() {
  const start = Date.now();
  const secondsRemaining = Math.max(0, ((restUntil - Date.now()) / 1000) | 0);

  g.setBgColor(-1).clear();
  g.setColor('#888888');
  roundRect(q1.x, q1.y, q1.x2, q1.y2, 20);
  g.setColor(REST_COLOR);
  roundRect(q2.x, q2.y, q2.x2, q2.y2, 20);
  // g.setColor('#888888');
  // roundRect(q3.x, q3.y, q3.x2, q3.y2, 20);
  // g.setColor('#FFFFFF');
  // roundRect(q4.x, q4.y, q4.x2, q4.y2, 20);

  g.setColor(-1);
  g.setFont("Vector:25").setFontAlign(0,0).drawString("REST", c1.x, c1.y)
  g.setColor(-1);
  g.setFont("Vector:25").setFontAlign(0,0).drawString(secondsRemaining, c2.x, c2.y)

  const factor = 1 - secondsRemaining / restSeconds;
  const circleParts = (((factor * smallQ3Circle.length) | 0) >> 1) << 1
  const poly = [c3.x, c3.y].concat(smallQ3Circle.slice(0, circleParts))
  g.setColor(REST_COLOR);
  g.fillPoly(poly);

  g.setColor(0);
  g.setFont("6x8").drawString("Push button\nto skip ->", c4.x, c4.y);

  if (secondsRemaining > 0) {
    const renderTime = Date.now() - start;
    if (secondsRemaining < 3) {
      Bangle.buzz();
    }
    setTimeout(redrawApp, Math.max(10, 1000 - renderTime));
  } else {
    Bangle.buzz(1000);
    currentSet += 1;
    if (currentSet > setsCount) {
      currentSet = 1;
      mode = MAIN_MENU;
    } else {
      mode = EXERCISE;
    }
    redrawApp();
  }
}

function drawDoIt() {
  g.setBgColor('#00FF00').clear();
  g.drawImage(getImg(), 44, 44);
  g.setFont("Vector:25")
  g.setColor(0);
  g.drawString('just', 40, 20);
  Bangle.buzz(100, 0.5);
  setTimeout(() => {
    g.drawString('DO', 100, 20);
    Bangle.buzz(200);
  }, 1000);
  setTimeout(() => {
    g.drawString('IT', 150, 20);
    Bangle.buzz(200);
  },  1100);
  setTimeout(() => {
    mode = MAIN_MENU;
    redrawApp();
  }, 2000);
}

const MAIN_MENU = 'MAIN_MENU';
const SET_REST = 'SET_REST';
const SET_SETS = 'SET_SETS';
const EXERCISE = 'EXERCISE';
const REST = 'REST';
const DOIT = 'DOIT';

let mode = MAIN_MENU;

function getImg() {
  return require("heatshrink").decompress(atob("rFYwcBpMkyQCB6QFDmnStsk6dpmmatO2AoMm7VpkmapMm6Vp02TEAmSCIIFB2mbEYPbtu07VJmwFCzYRD0gdB0gmBEAgCCtoOBtIOBIIPTpo1BHwJQCAQMmydNI4RBFLIILDmnaps2L4Om7ZEBI4IgCAQNN0g+GJQKJDKwIaB0iJCJQQmBCgWmHAIdEHYKnFDQSbBkBcE0wOBFgImBSoMmQZJTE6VAbYMJPQRHBDQKMBmmTtoUCEBPSJQT8CgKPCcAJQEIILFHMohxDEAUANwZ9E0wdBUhDLGyAgDO4LIByYOBAQLpEL45KEm2AQIMkwEEYQZTB7Vt23TC4wCHCgOAgRUBEAL+CzVtkwRCHw4CJEANNm2QggXEX4jpBIJgCBgESOoKHB6RiByYCBDQSGCMoIdJHAQgCkmCgALCZALpCd4RiNYoKkCkESpC8CEYm2QByDDgEBkETpBWDtukKYZBOHAKkBgIGBIIRNC0wFEIKCDCyVEBASbLAReQEAXSghKCzQ7BQYIgUoAGBEARuDIKmSgAAByAgFASwgCgALFmikUEBRBYgggcwBBDtDrDASwfDgFIgAgYkAfDgVAgEJECw6BAAcSEAKGXDIUAhEgZIcEYS4ABAwwgUyAgFAwjIUDIifBdQggUDIkBZIjKBECYZEAA4gSHQogoRYIgQD5gghgIgQpAg/QeAgRQcNAggeLECQDBwAgryIgTxAgKwAgQpQgKgMhkmQIKcIIJEgEA+kEBNApMgdJBhBgkQIKFCpMAEBUAMQ+aIJUioAgKIItpIJkCEBEAIJIgKhIgMyRBFmikLMRMAgkEEAmTUhogRARlAhIggkAgLUiNIpMgD5AgWXQIgcpMJED8BEBmAED0kwIgRkAgLkAgSkMkwAhKxIgRkgggXIIcFgIEDaYIgRwggGgBKDECcEyVAgEQEIkSpIgUgADCQwzSBEC0gD4pBBkQdQDgYgIBAIgVHAJFBcYgMBgQgUPQIgFFINIBQQgQTYYgfXQIgFFYggPGgIVCgmQDogFCECr8CII4KCECUBED4AKFYQgOoAYFggIGEC4XDEDgLDkAgVD4kCBYgKEECsSBYmAEDILFEEGQEBYA=="));
}

const onTouchPerQuadrantPerMode = {
  // mode -> [[nextMode on touch, custom function], ... for all quadrants]
  MAIN_MENU: [
    [DOIT, null],
    [SET_SETS, null],
    [SET_REST, null],
    [EXERCISE, null]
  ],
  SET_REST: [
    [MAIN_MENU, Bangle.buzz],
    [null, null],
    [null, () => {
      restSeconds = Math.min(120, Math.max(0, restSeconds - 15));
    }],
    [null, () => {
      restSeconds = Math.min(120, Math.max(0, restSeconds + 15));
    }],
  ],
  SET_SETS: [
    [MAIN_MENU, Bangle.buzz],
    [null, null],
    [null, () => {
      setsCount = Math.min(15, Math.max(0, setsCount - 1));
    }],
    [null, () => {
      setsCount = Math.min(15, Math.max(0, setsCount + 1));
    }],
  ],
  EXERCISE: [
      [null, null],
      [null, null],
      [null, null],
      [null, null],
  ],
  REST: [
      [null, null],
      [null, null],
      [null, null],
      [null, null],
  ]
}

const drawFuncPerMode = {
  MAIN_MENU: drawMainMenu,
  SET_REST: drawSetRest,
  SET_SETS: drawSetSets,
  EXERCISE: drawExercise,
  REST: drawRest,
  DOIT: drawDoIt,
}

function redrawApp(){
  g.clear();
  drawFuncPerMode[mode]();
}

function buttonPress () {
  if (mode === EXERCISE) {
    mode = REST;
    restUntil = Date.now() + (restSeconds * 1000);
    redrawApp();
    return;
  }
  if (mode === REST) {
    restUntil = Date.now();  // skipping rest!
    redrawApp();
    return;
  }
}

setWatch(buttonPress, BTN, { repeat: true});

Bangle.on('touch', (button, xy) => {
  for (let qidx=0; qidx<4; qidx++) {
    if (inRect(quadrants[qidx], xy)) {
      const nextMode = onTouchPerQuadrantPerMode[mode][qidx][0];
      const func = onTouchPerQuadrantPerMode[mode][qidx][1];
      if (func) {
        func();
      }
      if (nextMode) {
        mode = nextMode;
        redrawApp();
      }
      return;
    }
  }
});

Bangle.loadWidgets();
redrawApp();

