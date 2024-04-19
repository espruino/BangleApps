
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
  return {x: r.x + (r.x2 - r.x)/2 + 1, y: r.y + (r.y2 - r.y)/2 + 1}
}
function inRect(r, xy) {
  return xy.x >= r.x && xy.x <= r.x2 && xy.y >= r.y && xy.y <= r.y2;
}

let restSeconds = 60;
let setsCount = 3;

let currentSet = 1;
let restUntil = 0;

Bangle.loadWidgets();

const m = 2; // margin
const R = Bangle.appRect;
const r = {x:R.x+m, x2:R.x2-m, y:R.y+m, y2:R.y2-m};
const s = 2; // spacing
const h = r.y2 - r.y;
const w = r.x2 - r.x;
const cx = r.x + w/2; // center x
const cy = r.y + h/2; // center y
const q1 = {x: r.x,    y: r.y,    x2: cx - s,  y2: cy - s};
const q2 = {x: cx + s, y: r.y,    x2: r.x2,    y2: cy - s};
const q3 = {x: r.x,    y: cy + s, x2: cx - s,  y2: r.y2};
const q4 = {x: cx + s, y: cy + s, x2: r.x2,    y2: r.y2};
const quadrants = [q1,q2,q3,q4];
const c1 = center(q1)
const c2 = center(q2)
const c3 = center(q3)
const c4 = center(q4)

const GREY_COLOR = '#CCCCCC';
const SET_COLOR = '#FF00FF';
const SET_COLOR_MUTED = '#FF88FF';
const REST_COLOR = '#00FFFF';
const REST_COLOR_MUTED = '#88FFFF';
const RED_COLOR = '#FF0000';
const GREEN_COLOR = '#00FF00';
const GREEN_COLOR_MUTED = '#88FF88';
const BIG_FONT = "6x8:2x2";
const HUGE_FONT = "6x8:3x3";
const BIGHUGE_FONT = "6x8:6x6";

function drawMainMenu(splash) {
  g.setColor(REST_COLOR);
  roundRect(q1.x, q1.y, q1.x2, q1.y2, 20);
  g.setColor(SET_COLOR);
  roundRect(q2.x, q2.y, q2.x2, q2.y2, 20);
  g.setColor(GREY_COLOR);
  roundRect(q3.x, q3.y, q3.x2, q3.y2, 20);
  g.setColor(GREEN_COLOR);
  roundRect(q4.x, q4.y, q4.x2, q4.y2, 20);
  g.setColor(-1)

  if (splash) {
    g.setFont(BIGHUGE_FONT).setFontAlign(0,0).drawString("R", c1.x, c1.y)
    g.setFont(BIGHUGE_FONT).setFontAlign(0,0).drawString("E", c2.x, c2.y)
    g.setFont(BIGHUGE_FONT).setFontAlign(0,0).drawString("S", c3.x, c3.y)
    g.setFont(BIGHUGE_FONT).setFontAlign(0,0).drawString("T", c4.x, c4.y)
  } else {
    g.setFont("6x8").setFontAlign(0,0).drawString("Tap to\nConfigure", c1.x, c1.y-25)
    g.setFont(HUGE_FONT).setFontAlign(0,0).drawString(restSeconds+ "s", c1.x, c1.y)
    g.setFont(BIG_FONT).setFontAlign(0,0).drawString("REST", c1.x, c1.y + 25)

    g.setFont("6x8").setFontAlign(0,0).drawString("Tap to\nConfigure", c2.x, c2.y-25)
    g.setFont(HUGE_FONT).setFontAlign(0,0).drawString(setsCount, c2.x, c2.y)
    g.setFont(BIG_FONT).setFontAlign(0,0).drawString("SETS", c2.x, c2.y + 25)

    g.setFont(BIG_FONT).setFontAlign(0,0).drawString("JUST\nDO\nIT", c3.x, c3.y)
    g.setFont(HUGE_FONT).setFontAlign(0,0).drawString("GO", c4.x, c4.y)
  }
}

function drawSetRest() {
  g.setColor(REST_COLOR);
  roundRect(q1.x, q1.y, q1.x2, q1.y2, 20);
  g.setColor(RED_COLOR);
  roundRect(q3.x, q3.y, q3.x2, q3.y2, 20);
  g.setColor(GREEN_COLOR);
  roundRect(q4.x, q4.y, q4.x2, q4.y2, 20);
  g.setColor(-1)
  g.setFont("6x8").setFontAlign(0,0).drawString("Tap to\nConfirm", c1.x, c1.y-25)
  g.setFont(HUGE_FONT).setFontAlign(0,0).drawString(restSeconds+ "s", c1.x, c1.y)
  g.setFont(BIG_FONT).setFontAlign(0,0).drawString("REST", c1.x, c1.y + 25)
  // g.setFont(BIG_FONT).setFontAlign(0,0).drawString("OK", c2.x, c2.y)
  g.setFont(BIG_FONT).setFontAlign(0,0).drawString("-", c3.x, c3.y)
  g.setFont(BIG_FONT).setFontAlign(0,0).drawString("+", c4.x, c4.y)
}

function drawSetSets() {
  g.setColor(SET_COLOR);
  roundRect(q2.x, q2.y, q2.x2, q2.y2, 20);
  g.setColor(RED_COLOR);
  roundRect(q3.x, q3.y, q3.x2, q3.y2, 20);
  g.setColor(GREEN_COLOR);
  roundRect(q4.x, q4.y, q4.x2, q4.y2, 20);
  g.setColor(-1)
  g.setFont("6x8").setFontAlign(0,0).drawString("Tap to\nConfirm", c2.x, c2.y-25)
  g.setFont(HUGE_FONT).setFontAlign(0,0).drawString(setsCount, c2.x, c2.y)
  g.setFont(BIG_FONT).setFontAlign(0,0).drawString("SETS", c2.x, c2.y + 25)
  g.setFont(BIG_FONT).setFontAlign(0,0).drawString("-", c3.x, c3.y)
  g.setFont(BIG_FONT).setFontAlign(0,0).drawString("+", c4.x, c4.y)
}

function drawExercise() {
  g.setColor(REST_COLOR_MUTED);
  roundRect(q1.x, q1.y, q1.x2, q1.y2, 20);
  g.setColor(SET_COLOR);
  roundRect(q2.x, q2.y, q2.x2, q2.y2, 20);
  g.setColor(GREEN_COLOR_MUTED);
  roundRect(q4.x, q4.y, q4.x2, q4.y2, 20);
  g.setColor(-1);
  g.setFont(BIG_FONT).setFontAlign(0,0).drawString("SET", c2.x, c2.y-25)
  g.setFont(HUGE_FONT).setFontAlign(0,0).drawString("#"+currentSet, c2.x, c2.y)
  g.setFont(BIG_FONT).setFontAlign(0,0).drawString("PUSH >\nBUTTON\nWHEN\nDONE", c4.x, c4.y)
}

function circlePoints (cx, cy, r, points) {
  let circlePoints = [];
  for (let i=0; i<points; i++) {
    circlePoints.push(-Math.sin(i/points*Math.PI*2) * r + cx);
    circlePoints.push(Math.cos(i/points*Math.PI*2) * r + cy);
  }
  return circlePoints;
}

const smallQ3Circle = [c2.x, c2.y].concat(circlePoints(c2.x, c2.y, ((q2.y - q2.y2)/2) + 10, 60));


function drawRest() {
  const start = Date.now();
  const secondsRemaining = Math.max(0, ((restUntil - Date.now()) / 1000) | 0);

  g.setColor(REST_COLOR);
  roundRect(q1.x, q1.y, q1.x2, q1.y2, 20);
  g.setColor(-1).setFont(HUGE_FONT).setFontAlign(0,0).drawString(secondsRemaining, c1.x, c1.y)

  g.setColor(SET_COLOR_MUTED);
  roundRect(q2.x, q2.y, q2.x2, q2.y2, 20);
  const factor = 1 - secondsRemaining / restSeconds;
  const circleParts = (((factor * smallQ3Circle.length) | 0) >> 1) << 1
  const poly = smallQ3Circle.slice(0, circleParts + 2)
  g.setColor(SET_COLOR);
  g.fillPoly(poly);

  g.setColor(GREY_COLOR);
  roundRect(q3.x, q3.y, q3.x2, q3.y2, 20);
  g.setColor(-1).setFont(BIG_FONT).setFontAlign(0,0).drawString("REST", c3.x, c3.y)

  g.setColor(0);
  g.setFont("6x8").drawString("Push button\nto skip ->", c4.x, c4.y);

  if (secondsRemaining > 0) {
    if (secondsRemaining < 5) {
      if (secondsRemaining > 1) {
        Bangle.buzz(100);
      } else {
        Bangle.buzz(1000);
      }
    }
    const renderTime = Date.now() - start;
    setTimeout(redrawApp, Math.max(10, 1000 - renderTime));
  } else {
    currentSet += 1;
    if (currentSet > setsCount) {
      currentSet = 1;
      setMode(MAIN_MENU);
    } else {
      setMode(EXERCISE);
    }
    redrawApp();
  }
}

function drawDoIt() {
  const oldBgColor = g.getBgColor();
  g.setBgColor('#00FF00').clear();
  g.drawImage(getImg(), 44, 44);
  g.setFont(BIG_FONT)
  g.setColor(0);
  setTimeout(() => {
    g.setFontAlign(0, 0)
    g.drawString('just      ', R.x2/2, 20);
    Bangle.buzz(150, 0.5);
  }, 200);
  setTimeout(() => {
    g.drawImage(getImg(), 22, 44, {scale: 1.5});
    g.drawString('     DO   ', R.x2/2, 20);
    Bangle.buzz(200);
  }, 1000);
  setTimeout(() => {
    g.drawString('        IT', R.x2/2, 20);
    Bangle.buzz(200);
  },  1400);
  setTimeout(() => {
    setMode(MAIN_MENU);
    g.setBgColor(oldBgColor);
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

function setMode(newMode){
  mode = newMode;
}

function getImg() {
  return require("heatshrink").decompress(atob("rFYwcBpMkyQCB6QFDmnStsk6dpmmatO2AoMm7VpkmapMm6Vp02TEAmSCIIFB2mbEYPbtu07VJmwFCzYRD0gdB0gmBEAgCCtoOBtIOBIIPTpo1BHwJQCAQMmydNI4RBFLIILDmnaps2L4Om7ZEBI4IgCAQNN0g+GJQKJDKwIaB0iJCJQQmBCgWmHAIdEHYKnFDQSbBkBcE0wOBFgImBSoMmQZJTE6VAbYMJPQRHBDQKMBmmTtoUCEBPSJQT8CgKPCcAJQEIILFHMohxDEAUANwZ9E0wdBUhDLGyAgDO4LIByYOBAQLpEL45KEm2AQIMkwEEYQZTB7Vt23TC4wCHCgOAgRUBEAL+CzVtkwRCHw4CJEANNm2QggXEX4jpBIJgCBgESOoKHB6RiByYCBDQSGCMoIdJHAQgCkmCgALCZALpCd4RiNYoKkCkESpC8CEYm2QByDDgEBkETpBWDtukKYZBOHAKkBgIGBIIRNC0wFEIKCDCyVEBASbLAReQEAXSghKCzQ7BQYIgUoAGBEARuDIKmSgAAByAgFASwgCgALFmikUEBRBYgggcwBBDtDrDASwfDgFIgAgYkAfDgVAgEJECw6BAAcSEAKGXDIUAhEgZIcEYS4ABAwwgUyAgFAwjIUDIifBdQggUDIkBZIjKBECYZEAA4gSHQogoRYIgQD5gghgIgQpAg/QeAgRQcNAggeLECQDBwAgryIgTxAgKwAgQpQgKgMhkmQIKcIIJEgEA+kEBNApMgdJBhBgkQIKFCpMAEBUAMQ+aIJUioAgKIItpIJkCEBEAIJIgKhIgMyRBFmikLMRMAgkEEAmTUhogRARlAhIggkAgLUiNIpMgD5AgWXQIgcpMJED8BEBmAED0kwIgRkAgLkAgSkMkwAhKxIgRkgggXIIcFgIEDaYIgRwggGgBKDECcEyVAgEQEIkSpIgUgADCQwzSBEC0gD4pBBkQdQDgYgIBAIgVHAJFBcYgMBgQgUPQIgFFINIBQQgQTYYgfXQIgFFYggPGgIVCgmQDogFCECr8CII4KCECUBED4AKFYQgOoAYFggIGEC4XDEDgLDkAgVD4kCBYgKEECsSBYmAEDILFEEGQEBYA=="));
}

const onTouchPerQuadrantPerMode = {
  // mode -> [[nextMode on touch, custom function], ... for all quadrants]
  MAIN_MENU: [
    [SET_REST, null], [SET_SETS, null],
    [DOIT, null], [EXERCISE, null]
  ],
  SET_REST: [
    [MAIN_MENU, Bangle.buzz], [null, null],
    [null, () => {
      restSeconds = Math.min(120, Math.max(0, restSeconds - 15));
      Bangle.buzz(100);
    }],
    [null, () => {
      restSeconds = Math.min(120, Math.max(0, restSeconds + 15));
      Bangle.buzz(100);
    }],
  ],
  SET_SETS: [
    [null, null], [MAIN_MENU, Bangle.buzz],
    [null, () => {
      setsCount = Math.min(15, Math.max(0, setsCount - 1));
      Bangle.buzz(100);
    }],
    [null, () => {
      setsCount = Math.min(15, Math.max(0, setsCount + 1));
      Bangle.buzz(100);
    }],
  ],
  EXERCISE: [
      [null, null], [null, null],
      [null, null], [null, null],
  ],
  REST: [
      [null, null], [null, null],
      [null, null], [null, null],
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
  Bangle.drawWidgets();
  drawFuncPerMode[mode]();
}

function buttonPress () {
  if (mode === EXERCISE) {
    setMode(REST);
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

setWatch(buttonPress, BTN, { repeat: true, debounce: 25, edge:"falling"});

Bangle.on('touch', (button, xy) => {
  for (let qidx=0; qidx<4; qidx++) {
    if (inRect(quadrants[qidx], xy)) {
      const nextMode = onTouchPerQuadrantPerMode[mode][qidx][0];
      const func = onTouchPerQuadrantPerMode[mode][qidx][1];
      if (func) func();
      if (nextMode) setMode(nextMode);
      redrawApp();
    }
  }
});

g.clear();
drawMainMenu(true);
setTimeout(redrawApp, 1000);

