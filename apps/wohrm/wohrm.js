/* eslint-disable no-undef */
const Setter = {
    NONE: "none",
    UPPER: 'upper',
    LOWER: 'lower'
  };
  
const shortBuzzTimeInMs = 100;
const longBuzzTimeInMs = 200;

let upperLimit = 130;
let lowerLimit = 100;
let limitSetter = Setter.NONE;
let currentHeartRate = 0;
let hrConfidence = -1;

function drawTrainingHeartRate() {
    renderButtonIcons();
  
    renderUpperLimit();

    renderCurrentHeartRate();

    renderLowerLimit();

    renderConfidenceBars();

    buzz();
}

function renderUpperLimit() {
    g.setColor(255,0,0);
    g.fillRect(125,40, 210, 70);
    g.fillRect(180,70, 210, 200);

    //Round top left corner
    g.setColor(255,0,0);
    g.fillEllipse(115,40,135,70);

    //Round top right corner
    g.setColor(0,0,0);
    g.fillRect(205,40, 210, 45);
    g.setColor(255,0,0);
    g.fillEllipse(190,40,210,50);

    //Round inner corner
    g.setColor(255,0,0);
    g.fillRect(174,71, 179, 76);
    g.setColor(0,0,0);
    g.fillEllipse(160,71,179,82);

    //Round bottom
    g.setColor(255,0,0);
    g.fillEllipse(180,190, 210, 210);

    // if(limitSetter === Setter.UPPER){
    //     g.setColor(255,255, 255);
    //     g.drawPoly([140,40,230,40,230,210,200,210,200,70,140,70], false);
    // }

    g.setColor(255,255,255);
    g.setFontVector(10);
    g.drawString("Upper  : " + upperLimit, 130,50);
}

function renderCurrentHeartRate() {
    g.setColor(255,255,255);
    g.fillRect(45, 110, 165, 140);
    g.setColor(0,0,0);
    g.setFontVector(13);
    g.drawString("Current: " + currentHeartRate, 65,117);
}

function renderLowerLimit() {
    g.setColor(0,0,255);
    g.fillRect(10, 180, 100, 210);
    g.fillRect(10, 50, 40, 180);

    //Rounded top
    g.setColor(0,0,255);
    g.fillEllipse(10,40, 40, 60);

    //Round bottom right corner
    g.setColor(0,0,255);
    g.fillEllipse(90,180,110,210);

    //Round inner corner
    g.setColor(0,0,255);
    g.fillRect(40,175,45,180);
    g.setColor(0,0,0);
    g.fillEllipse(41,170,60,179);
  
    //Round bottom left corner
    g.setColor(0,0,0);
    g.fillRect(10,205, 15, 210);
    g.setColor(0,0,255);
    g.fillEllipse(10,200,30,210);

    // if(limitSetter === Setter.LOWER){
    //     g.setColor(255,255, 255);
    //     g.drawPoly([10,40,40,40,40,180,100,180,100,210,10,210], true);
    // }

    g.setColor(255,255,255);
    g.setFontVector(10);
    g.drawString("Lower  : " + lowerLimit, 20,190);
}

function renderConfidenceBars(){
    if(hrConfidence >= 85){
        g.setColor(0, 255, 0);
    } else if (hrConfidence >= 50) {
        g.setColor(255, 255, 0);
    } else if(hrConfidence >= 0){
        g.setColor(255, 0, 0);
    } else {
        g.setColor(255, 255, 255);
    }

    g.fillRect(45, 110, 55, 140);
    g.fillRect(165, 110, 175, 140);
}

function renderButtonIcons() {
  g.setColor(255,255,255);
  g.setFontVector(14);
  
  // + for Btn1
  g.drawString("+", 222,50);
  
  // Home for Btn2
  g.drawLine(220, 118, 227, 110);
  g.drawLine(227, 110, 234, 118);
  
  g.drawPoly([222,117,222,125,232,125,232,117], false);
  g.drawRect(226,120,229,125);
  
  // - for Btn3
  g.drawString("-", 222,165);
}

function buzz()
{
    if(currentHeartRate > upperLimit)
    {
        Bangle.buzz(shortBuzzTimeInMs);
        setTimeout(() => { Bangle.buzz(shortBuzzTimeInMs); }, shortBuzzTimeInMs);
        setTimeout(() => { Bangle.buzz(shortBuzzTimeInMs); }, shortBuzzTimeInMs);
    }

    if(currentHeartRate < upperLimit)
    {
        Bangle.buzz(longBuzzTimeInMs);
        setTimeout(() => { Bangle.buzz(longBuzzTimeInMs); }, longBuzzTimeInMs);
    }
}

function onHrm(hrm){
    currentHeartRate = hrm.bpm;
    hrConfidence = hrm.confidence;
}

function setLimitSetterToLower() {
    limitSetter = Setter.LOWER;
    console.log("Limit setter is lower");
    renderUpperLimit();
    renderLowerLimit();
}

function setLimitSetterToUpper() {
    limitSetter = Setter.UPPER;
    console.log("Limit setter is upper");
    renderLowerLimit();
    renderUpperLimit();
}

function incrementLimit(){
    if(limitSetter === Setter.UPPER){
        upperLimit++;
        renderUpperLimit();
        console.log("Upper limit: " + upperLimit);
    } else {
        lowerLimit++;
        renderLowerLimit();
        console.log("Lower limit: " + lowerLimit);
    }
}

function decrementLimit(){
    if(limitSetter === Setter.UPPER){
        upperLimit--;
        renderUpperLimit();
        console.log("Upper limit: " + upperLimit);
    } else {
        lowerLimit--;
        renderLowerLimit();
        console.log("Lower limit: " + lowerLimit);
    }
}

// Show launcher when middle button pressed
function switchOffApp(){
    Bangle.setHRMPower(0);
    Bangle.showLauncher();
}

// special function to handle display switch on
Bangle.on('lcdPower', (on) => {
    g.clear();
    if (on) {
        Bangle.drawWidgets();
        // call your app function here
        drawTrainingHeartRate();
    }
});

Bangle.setHRMPower(1);
Bangle.on('HRM', onHrm);

// refesh every sec
setInterval(drawTrainingHeartRate, 1000);

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawTrainingHeartRate();

setWatch(switchOffApp, BTN2, {repeat:false,edge:"falling"});

setWatch(incrementLimit, BTN1, {edge:"rising", debounce:50, repeat:true});

setWatch(decrementLimit, BTN3, {edge:"rising", debounce:50, repeat:true});

setWatch(setLimitSetterToLower, BTN4, {edge:"rising", debounce:50, repeat:true});

setWatch(setLimitSetterToUpper, BTN5, {edge:"rising", debounce:50, repeat:true});
