
const Setter = {
  NONE: "none",
  UPPER: 'upper',
  LOWER: 'lower'
};
const SETTINGS_FILE = "wohrm.setting.json";
var settings = require('Storage').readJSON(SETTINGS_FILE, 1) || {
  upperLimit: 130,
  lowerLimit: 100
};

const shortBuzzTimeInMs = 80;
const longBuzzTimeInMs = 400;

let upperLimitChanged = true;
let lowerLimitChanged = true;

let limitSetter = Setter.NONE;

let currentHeartRate = 0; //use for emuls
let hrConfidence = -1;
let hrChanged = true;
let confidenceChanged = true;

let setterHighlightTimeout;

const isB1 = process.env.HWVERSION==1;
const upperLshape = isB1 ? {
  right: 125,
  left: 210,
  bottom: 40,
  top: 210,
  rectWidth: 30,
  cornerRoundness: 5,
  orientation: -1,
  color: '#f00'
} : {
  right: Bangle.appRect.x2-100,
  left: Bangle.appRect.x2,
  bottom: 24,
  top: Bangle.appRect.y2-24, //for bottom widget
  rectWidth: 26,
  cornerRoundness: 4,
  orientation: -1,   // rotated 180°
  color: '#f00'
};

const lowerLshape = {
  left: isB1 ? 10 : Bangle.appRect.x,
  right: 100,
  bottom: upperLshape.top,
  top: upperLshape.bottom,
  rectWidth: upperLshape.rectWidth,
  cornerRoundness: upperLshape.cornerRoundness,
  orientation: 1,
  color: '#00f'
};

const centerBar = {
    //1.5 =height*2
  minY: (upperLshape.bottom + upperLshape.top - (upperLshape.rectWidth*1.5))/2,
  maxY: (upperLshape.bottom + upperLshape.top + (upperLshape.rectWidth*1.5))/2,
  confidenceWidth: isB1 ? 10 : 8,
  minX: isB1 ? 55 : upperLshape.rectWidth + 14,
  maxX: isB1 ? 165 : Bangle.appRect.x2 - upperLshape.rectWidth - 14
};

const fontSizes = isB1 ? {
  limits: 14,
  heartRate: 44
} : {
  limits: 16,
  heartRate: 34
};

function fillEllipse(x, y, x2, y2) {
  g.fillEllipse(Math.min(x, x2),
                Math.min(y, y2),
                Math.max(x, x2),
                Math.max(y, y2));
}

/**
 * @param p.left: the X coordinate of the left side of the L in its orientation
 * @param p.right: the X coordinate of the right side of the L in its orientation
 * @param p.top: the Y coordinate of the top side of the L in its orientation
 * @param p.bottom: the Y coordinate of the bottom side of the L in its orientation
 * @param p.strokeWidth: how thick we draw the letter.
 * @param p.cornerRoundness: how much the corners should be rounded
 * @param p.orientation: 1 == turned 0°; -1 == turned 180°
 * @param p.color: the color to draw the shape
 */
function renderLshape(p) {
  g.setColor(p.color);

  g.fillRect(p.right, p.bottom, p.left, p.bottom-p.orientation*p.rectWidth);
  g.fillRect(p.left+p.orientation*p.rectWidth,
             p.bottom-p.orientation*p.rectWidth,
             p.left,
             p.top+p.orientation*p.cornerRoundness*2);

  //Round end of small line
  fillEllipse(p.right+p.orientation*p.cornerRoundness*2,
              p.bottom,
              p.right-p.orientation*p.cornerRoundness*2,
              p.bottom-p.orientation*p.rectWidth);

  //Round outer corner
  g.setColor(g.theme.bg);
  g.fillRect(p.left+p.orientation*p.cornerRoundness,
             p.bottom,
             p.left,
             p.bottom-p.orientation*p.cornerRoundness);
  g.setColor(p.color);
  fillEllipse(p.left+p.orientation*p.cornerRoundness*4,
              p.bottom,
              p.left,
              p.bottom-p.orientation*p.cornerRoundness*2);

  //Round inner corner
  g.fillRect(p.left+p.orientation*(p.rectWidth+p.cornerRoundness+1),
             p.bottom-p.orientation*(p.rectWidth+1),
             p.left+p.orientation*(p.rectWidth+1),
             p.bottom-p.orientation*(p.rectWidth+p.cornerRoundness-1));
  g.setColor(g.theme.bg);
  fillEllipse(p.left+p.orientation*(p.rectWidth+p.cornerRoundness*4),
              p.bottom-p.orientation*(p.rectWidth+1),
              p.left+p.orientation*(p.rectWidth+1),
              p.bottom-p.orientation*(p.rectWidth+p.cornerRoundness*3-1));

  //Round end of long line
  g.setColor(p.color);
  fillEllipse(p.left+p.orientation*p.rectWidth,
              p.top+p.orientation*p.cornerRoundness*4,
              p.left,
              p.top);
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
  g.drawString("Upper: " + settings.upperLimit,
               upperLshape.right,
               upperLshape.bottom+upperLshape.rectWidth/2);

  upperLimitChanged = false;
}

function renderCurrentHeartRate() {
  if(!hrChanged) { return; }

  g.setColor(g.theme.fg);
  g.fillRect(centerBar.minX, centerBar.minY,
             centerBar.maxX, centerBar.maxY);

  g.setColor(g.theme.bg);
  g.setFontVector(fontSizes.heartRate);
  g.setFontAlign(0, 0, 0);//center
  g.drawString(currentHeartRate,
              // Math.max(upperLshape.right+upperLshape.cornerRoundness, lowerLshape.right-lowerLshape.cornerRoundness),
              // Math.max(upperLshape.right+upperLshape.cornerRoundness, lowerLshape.right-lowerLshape.cornerRoundness)-(g.stringWidth(currentHeartRate)/2),
               centerBar.minX+((centerBar.maxX-centerBar.minX)/2),
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
  g.drawString("Lower: " + settings.lowerLimit,
               lowerLshape.left + lowerLshape.rectWidth/2,
               lowerLshape.bottom - lowerLshape.rectWidth/2);

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

  if(currentHeartRate > settings.upperLimit)
  {
    Bangle.buzz(shortBuzzTimeInMs);
    setTimeout(() => { Bangle.buzz(shortBuzzTimeInMs); }, shortBuzzTimeInMs * 2);
  }

  if(currentHeartRate < settings.lowerLimit)
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
    settings.upperLimit++;
    renderUpperLimit();
    upperLimitChanged = true;
  } else if(limitSetter === Setter.LOWER) {
    settings.lowerLimit++;
    renderLowerLimit();
    lowerLimitChanged = true;
  }
}

function decrementLimit(){
  resetHighlightTimeout();

  if (limitSetter === Setter.UPPER) {
    settings.upperLimit--;
    renderUpperLimit();
    upperLimitChanged = true;
  } else if(limitSetter === Setter.LOWER) {
    settings.lowerLimit--;
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
  load();
}

Bangle.on('lcdPower', (on) => {
  if (on) {
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

g.setTheme({bg:"#000",fg:"#fff",dark:true});
g.reset();
g.clear();
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
