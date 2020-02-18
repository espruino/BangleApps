const Setter = {
  UPPER: 'upper',
  LOWER: 'lower'
};

upperLimit = 130;
lowerLimit = 100;
limitSetter = Setter.LOWER;
currentHeartRate = 0;
hrConfidence = -1;

function drawTrainingHeartRate() {
    renderUpperLimit();

    renderCurrentHeartRate();

    renderLowerLimit();

    renderConfidenceBars();

    buzz();
}

function renderUpperLimit() {
    g.setColor(255,0,0);
    g.fillRect(140,40, 230, 70);
    g.fillRect(200,70, 230, 210);

    if(limitSetter === Setter.UPPER){
        g.setColor(255,255, 255);
        g.drawPoly([140,40,230,40,230,210,200,210,200,70,140,70], true);
    }

    g.setColor(255,255,255);
    g.setFontVector(10);
    g.drawString("Upper  : " + upperLimit, 150,50);
}

function renderCurrentHeartRate() {
    g.setColor(0,255,0);
    g.fillRect(55, 110, 175, 140);
    g.setColor(0,0,0);
    g.setFontVector(13);
    g.drawString("Current: " + currentHeartRate, 75,117);
}

function renderLowerLimit() {
    g.setColor(0,0,255);
    g.fillRect(10, 180, 100, 210);
    g.fillRect(10, 40, 40, 180); 

    if(limitSetter === Setter.LOWER){
        g.setColor(255,255, 255);
        g.drawPoly([10,40,40,40,40,180,100,180,100,210,10,210], true);
    }

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
        g.setColor(0, 0, 0);
    }

    g.fillRect(55, 110, 65, 140);
    g.fillRect(175, 110, 185, 140);
}

function buzz()
{
    if(currentHeartRate > upperLimit)
    {
        Bangle.buzz(70);
        setTimeout(() => { Bangle.buzz(70); }, 70);
        setTimeout(() => { Bangle.buzz(70); }, 70);
    }

    if(currentHeartRate < upperLimit)
    {
        Bangle.buzz(140);
        setTimeout(() => { Bangle.buzz(140); }, 140);
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
function switchOfWidget(){
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

setWatch(switchOfWidget, BTN2, {repeat:false,edge:"falling"});

setWatch(incrementLimit, BTN1, {edge:"rising", debounce:50, repeat:true});

setWatch(decrementLimit, BTN3, {edge:"rising", debounce:50, repeat:true});

setWatch(setLimitSetterToLower, BTN4, {edge:"rising", debounce:50, repeat:true});

setWatch(setLimitSetterToUpper, BTN5, {edge:"rising", debounce:50, repeat:true});
