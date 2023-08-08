(() => {
const SAMPLES=5;
function initState(){
  //cleanup volatile state here
  state = {};
  state.compassSamples = new Array(SAMPLES).fill(0);
  state.lastSample = 0;
  state.sampleIndex = 0;
  state.currentPos={};
  state.steps = 0;
  state.calibAltDiff = 0;
  state.numberOfSlices = 3;
  state.steps = 0;
  state.up = 0;
  state.down = 0;
  state.saved = 0;
  state.avgComp = 0;
}

const STORAGE=require('Storage');
let state = STORAGE.readJSON("gpstrek.state.json");
if (!state) {
  state = {};
  initState();
}
state.started = false;
let bgChanged = false;

function saveState(){
  state.saved = Date.now();
  if (state.route) delete state.route.indexToOffset;
  STORAGE.writeJSON("gpstrek.state.json", state);
}

function onKill(){
  if (bgChanged || state.route || state.waypoint){
    saveState();
  }
}

E.on("kill", onKill);

function onPulse(e){
  state.bpm = e.bpm;
}

function onGPS(fix) {
  if(fix.fix) {
    state.currentPos = fix;
    if (Bangle.isCompassOn()){
      Bangle.setCompassPower(0, "gpstrek");
      state.compassSamples = new Array(SAMPLES).fill(0)
    }
  } else {
    Bangle.setCompassPower(1, "gpstrek");
  }
}

let radians = function(a) {
  return a*Math.PI/180;
};

let degrees = function(a) {
  let d = a*180/Math.PI;
  return (d+360)%360;
};

function average(samples){
  let s = 0;
  let c = 0;
  for (let h of samples){
    s += Math.sin(radians(h));
    c += Math.cos(radians(h));
  }
  s /= samples.length;
  c /= samples.length;
  let result = degrees(Math.atan(s/c));

  if (c < 0) result += 180;
  if (s < 0 && c > 0) result += 360;

  result%=360;
  return result;
}
  
function onMag(e) {
  if (!isNaN(e.heading)){
    if (Bangle.isLocked() || (Bangle.getGPSFix() && Bangle.getGPSFix().lon))
      state.avgComp = e.heading;
    else {
      state.compassSamples[state.sampleIndex++] = e.heading;
      state.lastSample = Date.now();
      if (state.sampleIndex > SAMPLES - 1){
        state.sampleIndex = 0;
        let avg = average(state.compassSamples);
        state.avgComp = average([state.avgComp,avg]);
      }
    }
  }
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

  state.started = true;

  if (bg){
    if (!state.active) bgChanged = true;
    state.active = true;
    update();
    saveState();
  }
}

function stop(bg){
  state.started = true;
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

WIDGETS.gpstrek={
  area:"tl",
  width:state.active?24:0,
  resetState: initState,
  getState: function() {
    if (!state.started && state.saved && Date.now() - state.saved > 60000 || !state){
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
