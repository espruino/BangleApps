(() => {
function initState(){
  //cleanup volatile state here
  state = {};
  state.currentPos={};
  state.steps = 0;
  state.calibAltDiff = 0;
  state.numberOfSlices = 3;
  state.steps = 0;
  state.up = 0;
  state.down = 0;
  state.saved = 0;
}

const STORAGE=require('Storage');
let state = STORAGE.readJSON("gpstrek.state.json");
if (!state) {
  state = {};
  initState();
}
let bgChanged = false;

function saveState(){
  state.saved = Date.now();
  STORAGE.writeJSON("gpstrek.state.json", state);
}

function onKill(){
  if (bgChanged){
    saveState();
  }
}

E.on("kill", onKill);


function onPulse(e){
  state.bpm = e.bpm;
}

function onGPS(fix) {
  if(fix.fix) state.currentPos = fix;
}

function onMag(e) {
  if (!state.compassHeading) state.compassHeading = e.heading;

  //if (a+180)mod 360 == b then
  //return (a+b)/2 mod 360 and ((a+b)/2 mod 360) + 180 (they are both the solution, so you may choose one depending if you prefer counterclockwise or clockwise direction)
//else
  //return arctan(  (sin(a)+sin(b)) / (cos(a)+cos(b) )

  /*
  let average;
  let a = radians(compassHeading);
  let b = radians(e.heading);
  if ((a+180) % 360 == b){
    average = ((a+b)/2 % 360); //can add 180 depending on rotation
  } else {
    average = Math.atan( (Math.sin(a)+Math.sin(b))/(Math.cos(a)+Math.cos(b)) );
  }
  print("Angle",compassHeading,e.heading, average);
  compassHeading = (compassHeading + degrees(average)) % 360;
  */
  state.compassHeading = Math.round(e.heading);
}

function onStep(e) {
  state.steps++;
}

function onPressure(e) {
  state.pressure = e.pressure;

  if (!state.altitude){
    state.altitude = e.altitude;
    state.up = 0;
    state.down = 0;
  }
  let diff = state.altitude - e.altitude;
  if (Math.abs(diff) > 3){
    if (diff > 0){
      state.up += diff;
    } else {
      state.down -= diff;
    }
    state.altitude = e.altitude;
  }
}

function onAcc (e){
  state.acc = e;
}

function update(){
  if (state.active){
    start(false);
  }
  if (state.active == !(WIDGETS.gpstrek.width)) {
    if(WIDGETS.gpstrek) WIDGETS.gpstrek.width = state.active?24:0;
    Bangle.drawWidgets();
  }
}

function start(bg){
  Bangle.removeListener('GPS', onGPS);
  Bangle.removeListener("HRM", onPulse);
  Bangle.removeListener("mag", onMag);
  Bangle.removeListener("step", onStep);
  Bangle.removeListener("pressure", onPressure);
  Bangle.removeListener('accel', onAcc);
  Bangle.on('GPS', onGPS);
  Bangle.on("HRM", onPulse);
  Bangle.on("mag", onMag);
  Bangle.on("step", onStep);
  Bangle.on("pressure", onPressure);
  Bangle.on('accel', onAcc);

  Bangle.setGPSPower(1, "gpstrek");
  Bangle.setHRMPower(1, "gpstrek");
  Bangle.setCompassPower(1, "gpstrek");
  Bangle.setBarometerPower(1, "gpstrek");
  if (bg){
    if (!state.active) bgChanged = true;
    state.active = true;
    update();
    saveState();
  }
}

function stop(bg){
  if (bg){
    if (state.active) bgChanged = true;
    state.active = false;
  } else if (!state.active) {
    Bangle.setGPSPower(0, "gpstrek");
    Bangle.setHRMPower(0, "gpstrek");
    Bangle.setCompassPower(0, "gpstrek");
    Bangle.setBarometerPower(0, "gpstrek");
    Bangle.removeListener('GPS', onGPS);
    Bangle.removeListener("HRM", onPulse);
    Bangle.removeListener("mag", onMag);
    Bangle.removeListener("step", onStep);
    Bangle.removeListener("pressure", onPressure);
    Bangle.removeListener('accel', onAcc);
    E.removeListener("kill", onKill);
  }
  update();
  saveState();
}

if (state.active){
  start(false);
}

WIDGETS["gpstrek"]={
  area:"tl",
  width:state.active?24:0,
  resetState: initState,
  getState: function() {
    if (state.saved && Date.now() - state.saved > 60000 || !state){
      initState();
    }
    return state;
  },
  start:start,
  stop:stop,
  draw:function() {
    update();
    if (state.active){
      g.reset();
      g.drawImage(atob("GBiBAAAAAAAAAAAYAAAYAAAYAAA8AAA8AAB+AAB+AADbAADbAAGZgAGZgAMYwAMYwAcY4AYYYA5+cA3/sB/D+B4AeBAACAAAAAAAAA=="), this.x, this.y);
    }
  }
};
})();
