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

function renderUpperLimitBackground() {
  g.setColor(1,0,0);
  g.fillRect(125,40, 210, 70);
  g.fillRect(180,70, 210, 200);

  //Round top left corner
  g.fillEllipse(115,40,135,70);

  //Round top right corner
  g.setColor(0,0,0);
  g.fillRect(205,40, 210, 45);
  g.setColor(1,0,0);
  g.fillEllipse(190,40,210,50);

  //Round inner corner
  g.fillRect(174,71, 179, 76);
  g.setColor(0,0,0);
  g.fillEllipse(160,71,179,82);

  //Round bottom
  g.setColor(1,0,0);
  g.fillEllipse(180,190, 210, 210);
}

function renderLowerLimitBackground() {
  g.setColor(0,0,1);
  g.fillRect(10, 180, 100, 210);
  g.fillRect(10, 50, 40, 180);

  //Rounded top
  g.setColor(0,0,1);
  g.fillEllipse(10,40, 40, 60);

  //Round bottom right corner
  g.setColor(0,0,1);
  g.fillEllipse(90,180,110,210);

  //Round inner corner
  g.setColor(0,0,1);
  g.fillRect(40,175,45,180);
  g.setColor(0,0,0);
  g.fillEllipse(41,170,60,179);

  //Round bottom left corner
  g.setColor(0,0,0);
  g.fillRect(10,205, 15, 210);
  g.setColor(0,0,1);
  g.fillEllipse(10,200,30,210);
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

  g.setColor(1,0,0);
  g.fillRect(125,40, 210, 70);

  if(limitSetter === Setter.UPPER){
    g.setColor(255,255, 0);
  } else {
    g.setColor(255,255,255);
  }
  g.setFontVector(13);
  g.drawString("Upper: " + upperLimit, 125, 50);

  upperLimitChanged = false;
}

function renderCurrentHeartRate() {
  if(!hrChanged) { return; }

  g.setColor(255,255,255);
  g.fillRect(55, 110, 165, 150);

  g.setColor(0,0,0);
  g.setFontVector(24);
  g.setFontAlign(1, -1, 0);
  g.drawString(currentHeartRate, 130, 117);

  //Reset alignment to defaults
  g.setFontAlign(-1, -1, 0);

  hrChanged = false;
}

function renderLowerLimit() {
  if(!lowerLimitChanged) { return; }

  g.setColor(0,0,1);
  g.fillRect(10, 180, 100, 210);

  if(limitSetter === Setter.LOWER){
    g.setColor(255,255, 0);
  } else {
    g.setColor(255,255,255);
  }
  g.setFontVector(13);
  g.drawString("Lower: " + lowerLimit, 20,190);

  lowerLimitChanged = false;
}

function renderConfidenceBars(){
  if(!confidenceChanged) { return; }

  if(hrConfidence >= 85){
    g.setColor(0, 255, 0);
  } else if (hrConfidence >= 50) {
    g.setColor(255, 255, 0);
  } else if(hrConfidence >= 0){
    g.setColor(255, 0, 0);
  } else {
    g.setColor(255, 255, 255);
  }

  g.fillRect(45, 110, 55, 150);
  g.fillRect(165, 110, 175, 150);

  confidenceChanged = false;
}

function renderPlusMinusIcons() {
  if (limitSetter === Setter.NONE) {
    g.setColor(0, 0, 0);
  } else {
    g.setColor(1, 1, 1);
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
  Bangle.setHRMPower(0);
  Bangle.showLauncher();
}

Bangle.on('lcdPower', (on) => {
  g.clear();
  if (on) {
    Bangle.drawWidgets();

    renderHomeIcon();
    renderLowerLimitBackground();
    renderUpperLimitBackground();
    lowerLimitChanged = true;
    upperLimitChanged = true;
    drawTrainingHeartRate();
  }
});

Bangle.setHRMPower(1);
Bangle.on('HRM', onHrm);

setWatch(incrementLimit, BTN1, {edge:"rising", debounce:50, repeat:true});
setWatch(decrementLimit, BTN3, {edge:"rising", debounce:50, repeat:true});
setWatch(setLimitSetterToLower, BTN4, {edge:"rising", debounce:50, repeat:true});
setWatch(setLimitSetterToUpper, BTN5, { edge: "rising", debounce: 50, repeat: true });

setWatch(switchOffApp, BTN2, {edge:"falling", debounce:50, repeat:true});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

renderHomeIcon();
renderLowerLimitBackground();
renderUpperLimitBackground();

setInterval(drawTrainingHeartRate, 1000);
