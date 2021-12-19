/* eslint-disable no-undef */
const Setter = {
  NONE: "none",
  UPPER: 'upper',
  LOWER: 'lower'
};

const shortBuzzTimeInMs = 80;
const longBuzzTimeInMs = 400;

let upperLimit = 130;
let upperLimitChanged = true;

let lowerLimit = 100;
let lowerLimitChanged = true;

let limitSetter = Setter.NONE;

let currentHeartRate = 0;
let hrConfidence = -1;
let hrChanged = true;
let confidenceChanged = true;

let setterHighlightTimeout;

const isB1 = process.env.HWVERSION==1;
const upperLshape = isB1 ? {
  minX: 125,
  maxX: 210,
  minY: 40,
  maxY: 210,
  rectWidth: 30,
  cornerRoundness: 5,
  orientation: -1,
  color: '#f00'
} : {
  minX: Bangle.appRect.x2-100,
  maxX: Bangle.appRect.x2,
  minY: 24,
  maxY: Bangle.appRect.y2,
  rectWidth: 26,
  cornerRoundness: 4,
  orientation: -1,
  color: '#f00'
};

const lowerLshape = {
  maxX: isB1 ? 10 : Bangle.appRect.x,
  minX: 100,
  minY: upperLshape.maxY,
  maxY: upperLshape.minY,
  rectWidth: upperLshape.rectWidth,
  cornerRoundness: upperLshape.cornerRoundness,
  orientation: 1,
  color: '#00f'
};

const centerBar = {
  minY: (upperLshape.minY + upperLshape.maxY - upperLshape.rectWidth)/2,
  maxY: (upperLshape.minY + upperLshape.maxY + upperLshape.rectWidth)/2,
  confidenceWidth: isB1 ? 10 : 8,
  minX: isB1 ? 55 : upperLshape.rectWidth + 14,
  maxX: isB1 ? 165 : Bangle.appRect.x2 - upperLshape.rectWidth - 14
};

const fontSizes = isB1 ? {
  limits: 13,
  heartRate: 24
} : {
  limits: 12,
  heartRate: 20
};

function fillEllipse(x, y, x2, y2) {
  g.fillEllipse(Math.min(x, x2),
                Math.min(y, y2),
                Math.max(x, x2),
                Math.max(y, y2));
}

function renderLshape(p) {
  g.setColor(p.color);

  g.fillRect(p.minX, p.minY, p.maxX, p.minY-p.orientation*p.rectWidth);
  g.fillRect(p.maxX+p.orientation*p.rectWidth,
             p.minY-p.orientation*p.rectWidth,
             p.maxX,
             p.maxY+p.orientation*p.cornerRoundness*2);

  //Round end of small line
  fillEllipse(p.minX+p.orientation*p.cornerRoundness*2,
              p.minY,
              p.minX-p.orientation*p.cornerRoundness*2,
              p.minY-p.orientation*p.rectWidth);

  //Round outer corner
  g.setColor(g.theme.bg);
  g.fillRect(p.maxX+p.orientation*p.cornerRoundness,
             p.minY,
             p.maxX,
             p.minY-p.orientation*p.cornerRoundness);
  g.setColor(p.color);
  fillEllipse(p.maxX+p.orientation*p.cornerRoundness*4,
              p.minY,
              p.maxX,
              p.minY-p.orientation*p.cornerRoundness*2);

  //Round inner corner
  g.fillRect(p.maxX+p.orientation*(p.rectWidth+p.cornerRoundness+1),
             p.minY-p.orientation*(p.rectWidth+1),
             p.maxX+p.orientation*(p.rectWidth+1),
             p.minY-p.orientation*(p.rectWidth+p.cornerRoundness-1));
  g.setColor(g.theme.bg);
  fillEllipse(p.maxX+p.orientation*(p.rectWidth+p.cornerRoundness*4),
              p.minY-p.orientation*(p.rectWidth+1),
              p.maxX+p.orientation*(p.rectWidth+1),
              p.minY-p.orientation*(p.rectWidth+p.cornerRoundness*3-1));

  //Round end of long line
  g.setColor(p.color);
  fillEllipse(p.maxX+p.orientation*p.rectWidth,
              p.maxY+p.orientation*p.cornerRoundness*4,
              p.maxX,
              p.maxY);
}

function drawTrainingHeartRate() {
  //Only redraw if the display is on
  if (Bangle.isLCDOn()) {
    renderUpperLimit();

    renderCurrentHeartRate();

    renderLowerLimit();

    renderConfidenceBars();
  }

  buzz();
}

function renderUpperLimit() {
  if(!upperLimitChanged) { return; }

  renderLshape(upperLshape);

  if(limitSetter === Setter.UPPER){
    g.setColor(1,1,0);
  } else {
    g.setColor(g.theme.fg);
  }
  g.setFontVector(fontSizes.limits).setFontAlign(-1, 0, 0);
  g.drawString("Upper: " + upperLimit,
               upperLshape.minX,
               upperLshape.minY+upperLshape.rectWidth/2);

  upperLimitChanged = false;
}

function renderCurrentHeartRate() {
  if(!hrChanged) { return; }

  g.setColor(g.theme.fg);
  g.fillRect(centerBar.minX, centerBar.minY,
             centerBar.maxX, centerBar.maxY);

  g.setColor(g.theme.bg);
  g.setFontVector(fontSizes.heartRate);
  g.setFontAlign(1, 0, 0);
  g.drawString(currentHeartRate,
               Math.max(upperLshape.minX+upperLshape.cornerRoundness,
                        lowerLshape.minX-lowerLshape.cornerRoundness),
               (centerBar.minY+centerBar.maxY)/2);

  //Reset alignment to defaults
  g.setFontAlign(-1, -1, 0);

  hrChanged = false;
}

function renderLowerLimit() {
  if(!lowerLimitChanged) { return; }

  renderLshape(lowerLshape);

  if(limitSetter === Setter.LOWER){
    g.setColor(1,1,0);
  } else {
    g.setColor(g.theme.fg);
  }
  g.setFontVector(fontSizes.limits).setFontAlign(-1, 0, 0);
  g.drawString("Lower: " + lowerLimit,
               lowerLshape.maxX + lowerLshape.rectWidth/2,
               lowerLshape.minY - lowerLshape.rectWidth/2);

  lowerLimitChanged = false;
}

function renderConfidenceBars(){
  if(!confidenceChanged) { return; }

  if(hrConfidence >= 85){
    g.setColor(0, 1, 0);
  } else if (hrConfidence >= 50) {
    g.setColor(1, 1, 0);
  } else if(hrConfidence >= 0){
    g.setColor(1, 0, 0);
  } else {
    g.setColor(g.theme.fg);
  }

  g.fillRect(centerBar.minX-centerBar.confidenceWidth, centerBar.minY, centerBar.minX, centerBar.maxY);
  g.fillRect(centerBar.maxX, centerBar.minY, centerBar.maxX+centerBar.confidenceWidth, centerBar.maxY);

  confidenceChanged = false;
}

function renderPlusMinusIcons() {
  if (limitSetter === Setter.NONE) {
    g.setColor(g.theme.bg);
  } else {
    g.setColor(g.theme.fg);
  }

  g.setFontVector(14);

  //+ for Btn1
  g.drawString("+", 222, 50);

  //- for Btn3
  g.drawString("-", 222,165);

  return;
}

function renderHomeIcon() {
  //Home for Btn2
  g.setColor(1, 1, 1);
  g.drawLine(220, 118, 227, 110);
  g.drawLine(227, 110, 234, 118);

  g.drawPoly([222,117,222,125,232,125,232,117], false);
  g.drawRect(226,120,229,125);
}

function buzz() {
  // Do not buzz if not confident
  if(hrConfidence < 85) { return; }

  if(currentHeartRate > upperLimit)
  {
    Bangle.buzz(shortBuzzTimeInMs);
    setTimeout(() => { Bangle.buzz(shortBuzzTimeInMs); }, shortBuzzTimeInMs * 2);
  }

  if(currentHeartRate < lowerLimit)
  {
    Bangle.buzz(longBuzzTimeInMs);
  }
}

function onHrm(hrm){
  if(currentHeartRate !== hrm.bpm){
    currentHeartRate = hrm.bpm;
    hrChanged = true;
  }

  if(hrConfidence !== hrm.confidence) {
    hrConfidence = hrm.confidence;
    confidenceChanged = true;
  }
}

function setLimitSetterToLower() {
  resetHighlightTimeout();

  limitSetter = Setter.LOWER;

  upperLimitChanged = true;
  lowerLimitChanged = true;

  renderUpperLimit();
  renderLowerLimit();
  renderPlusMinusIcons();
}

function setLimitSetterToUpper() {
  resetHighlightTimeout();

  limitSetter = Setter.UPPER;

  upperLimitChanged = true;
  lowerLimitChanged = true;

  renderLowerLimit();
  renderUpperLimit();
  renderPlusMinusIcons();
}

function setLimitSetterToNone() {
  limitSetter = Setter.NONE;

  upperLimitChanged = true;
  lowerLimitChanged = true;

  renderLowerLimit();
  renderUpperLimit();
  renderPlusMinusIcons();
}

function incrementLimit() {
  resetHighlightTimeout();

  if (limitSetter === Setter.UPPER) {
    upperLimit++;
    renderUpperLimit();
    upperLimitChanged = true;
  } else if(limitSetter === Setter.LOWER) {
    lowerLimit++;
    renderLowerLimit();
    lowerLimitChanged = true;
  }
}

function decrementLimit(){
  resetHighlightTimeout();

  if (limitSetter === Setter.UPPER) {
    upperLimit--;
    renderUpperLimit();
    upperLimitChanged = true;
  } else if(limitSetter === Setter.LOWER) {
    lowerLimit--;
    renderLowerLimit();
    lowerLimitChanged = true;
  }
}

function resetHighlightTimeout() {
  if (setterHighlightTimeout) {
    clearTimeout(setterHighlightTimeout);
  }

  setterHighlightTimeout = setTimeout(setLimitSetterToNone, 2000);
}

function switchOffApp(){
  Bangle.setHRMPower(0,"wohrm");
  Bangle.showLauncher();
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    g.clear();
    Bangle.drawWidgets();

    if (typeof(BTN5) !== typeof(undefined)) {
      renderHomeIcon();
    }
    renderLshape(lowerLshape);
    renderLshape(upperLshape);
    lowerLimitChanged = true;
    upperLimitChanged = true;
    drawTrainingHeartRate();
  }
});

Bangle.setHRMPower(1,"wohrm");
Bangle.on('HRM', onHrm);

g.setTheme({bg:"#000",fg:"#fff",dark:true}).clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

if (typeof(BTN5) !== typeof(undefined)) {
  renderHomeIcon();
  setWatch(incrementLimit, BTN1, {edge:"rising", debounce:50, repeat:true});
  setWatch(decrementLimit, BTN3, {edge:"rising", debounce:50, repeat:true});
  setWatch(setLimitSetterToLower, BTN4, {edge:"rising", debounce:50, repeat:true});
  setWatch(setLimitSetterToUpper, BTN5, { edge: "rising", debounce: 50, repeat: true });

  setWatch(switchOffApp, BTN2, {edge:"falling", debounce:50, repeat:true});
} else {
  setWatch(switchOffApp, BTN1, {edge:"falling", debounce:50, repeat:true});
}

setInterval(drawTrainingHeartRate, 1000);
