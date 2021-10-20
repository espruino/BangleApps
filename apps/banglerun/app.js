<<<<<<< HEAD
/** Global constants */
const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS = 6371008.8;

/** Utilities for handling vectors */
class Vector {
  static magnitude(a) {
    let sum = 0;
    for (const key of Object.keys(a)) {
      sum += a[key] * a[key];
    }
    return Math.sqrt(sum);
  }

  static add(a, b) {
    const result = {};
    for (const key of Object.keys(a)) {
      result[key] = a[key] + b[key];
    }
    return result;
  }

  static sub(a, b) {
    const result = {};
    for (const key of Object.keys(a)) {
      result[key] = a[key] - b[key];
    }
    return result;
  }

  static multiplyScalar(a, x) {
    const result = {};
    for (const key of Object.keys(a)) {
      result[key] = a[key] * x;
    }
    return result;
  }

  static divideScalar(a, x) {
    const result = {};
    for (const key of Object.keys(a)) {
      result[key] = a[key] / x;
    }
    return result;
  }
}

/** Interquartile range filter, to detect outliers */
class IqrFilter {
  constructor(size, threshold) {
    const q = Math.floor(size / 4);
    this._buffer = [];
    this._size = 4 * q + 2;
    this._i1 = q;
    this._i3 = 3 * q + 1;
    this._threshold = threshold;
  }

  isReady() {
    return this._buffer.length === this._size;
  }

  isOutlier(point) {
    let result = true;
    if (this._buffer.length === this._size) {
      result = false;
      for (const key of Object.keys(point)) {
        const data = this._buffer.map(item => item[key]);
        data.sort((a, b) => (a - b) / Math.abs(a - b));
        const q1 = data[this._i1];
        const q3 = data[this._i3];
        const iqr = q3 - q1;
        const lower = q1 - this._threshold * iqr;
        const upper = q3 + this._threshold * iqr;
        if (point[key] < lower || point[key] > upper) {
          result = true;
          break;
        }
      }
    }
    this._buffer.push(point);
    this._buffer = this._buffer.slice(-this._size);
    return result;
  }
}

/** Process GPS data */
class Gps {
  constructor() {
    this._lastCall = Date.now();
    this._lastValid = 0;
    this._coords = null;
    this._filter = new IqrFilter(10, 1.5);
    this._shift = { x: 0, y: 0, z: 0 };
  }

  isReady() {
    return this._filter.isReady();
  }

  getDistance(gps) {
    const time = Date.now();
    const interval = (time - this._lastCall) / 1000;
    this._lastCall = time;

    if (!gps.fix) {
      return { t: interval, d: 0 };
    }

    const p = gps.lat * DEG_TO_RAD;
    const q = gps.lon * DEG_TO_RAD;
    const coords = {
      x: EARTH_RADIUS * Math.sin(p) * Math.cos(q),
      y: EARTH_RADIUS * Math.sin(p) * Math.sin(q),
      z: EARTH_RADIUS * Math.cos(p),
    };

    if (!this._coords) {
      this._coords = coords;
      this._lastValid = time;
      return { t: interval, d: 0 };
    }

    const ds = Vector.sub(coords, this._coords);
    const dt = (time - this._lastValid) / 1000;
    const v = Vector.divideScalar(ds, dt);

    if (this._filter.isOutlier(v)) {
      return { t: interval, d: 0 };
    }

    this._shift = Vector.add(this._shift, ds);
    const length = Vector.magnitude(this._shift);
    const remainder = length % 10;
    const distance = length - remainder;

    this._coords = coords;
    this._lastValid = time;
    if (distance > 0) {
      this._shift = Vector.multiplyScalar(this._shift, remainder / length);
    }

    return { t: interval, d: distance };
  }
}

/** Process step counter data */
class Step {
  constructor(size) {
    this._buffer = [];
    this._size = size;
  }

  getCadence() {
    this._buffer.push(Date.now() / 1000);
    this._buffer = this._buffer.slice(-this._size);
    const interval = this._buffer[this._buffer.length - 1] - this._buffer[0];
    return interval ? Math.round(60 * (this._buffer.length - 1) / interval) : 0;
  }
}

const gps = new Gps();
const step = new Step(10);

let totDist = 0;
let totTime = 0;
let totSteps = 0;

let speed = 0;
let cadence = 0;
let heartRate = 0;

let gpsReady = false;
let hrmReady = false;
let running = false;

function formatClock(date) {
  return ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2);
}

function formatDistance(m) {
  return ('0' + (m / 1000).toFixed(2) + ' km').substr(-7);
}

function formatTime(s) {
  const hrs = Math.floor(s / 3600);
  const min = Math.floor(s / 60) % 60;
  const sec = Math.floor(s % 60);
  return (hrs ? hrs + ':' : '') + ('0' + min).substr(-2) + `:` + ('0' + sec).substr(-2);
}

function formatSpeed(kmh) {
  if (kmh <= 0.6) {
    return `__'__"`;
  }
  const skm = 3600 / kmh;
  const min = Math.floor(skm / 60);
  const sec = Math.floor(skm % 60);
  return ('0' + min).substr(-2) + `'` + ('0' + sec).substr(-2) + `"`;
}

function drawBackground() {
  g.setColor(running ? 0x00E0 : 0x0000);
  g.fillRect(0, 30, 240, 240);

  g.setColor(0xFFFF);
  g.setFontAlign(0, -1, 0);
  g.setFont('6x8', 2);

  g.drawString('DISTANCE', 120, 50);
  g.drawString('TIME', 60, 100);
  g.drawString('PACE', 180, 100);
  g.drawString('STEPS', 60, 150);
  g.drawString('STP/m', 180, 150);
  g.drawString('SPEED', 40, 200);
  g.drawString('HEART', 120, 200);
  g.drawString('CADENCE', 200, 200);
}

function draw() {
  const totSpeed = totTime ? 3.6 * totDist / totTime : 0;
  const totCadence = totTime ? Math.round(60 * totSteps / totTime) : 0;

  g.setColor(running ? 0x00E0 : 0x0000);
  g.fillRect(0, 30, 240, 50);
  g.fillRect(0, 70, 240, 100);
  g.fillRect(0, 120, 240, 150);
  g.fillRect(0, 170, 240, 200);
  g.fillRect(0, 220, 240, 240);

  g.setFont('6x8', 2);

  g.setFontAlign(-1, -1, 0);
  g.setColor(gpsReady ? 0x07E0 : 0xF800);
  g.drawString(' GPS', 6, 30);

  g.setFontAlign(1, -1, 0);
  g.setColor(0xFFFF);
  g.drawString(formatClock(new Date()), 234, 30);

  g.setFontAlign(0, -1, 0);
  g.setFontVector(20);
  g.drawString(formatDistance(totDist), 120, 70);
  g.drawString(formatTime(totTime), 60, 120);
  g.drawString(formatSpeed(totSpeed), 180, 120);
  g.drawString(totSteps, 60, 170);
  g.drawString(totCadence, 180, 170);

  g.setFont('6x8', 2);
  g.drawString(formatSpeed(speed), 40, 220);

  g.setColor(hrmReady ? 0x07E0 : 0xF800);
  g.drawString(heartRate, 120, 220);

  g.setColor(0xFFFF);
  g.drawString(cadence, 200, 220);
}

function handleGps(coords) {
  const step = gps.getDistance(coords);
  gpsReady = coords.fix > 0 && gps.isReady();
  speed = isFinite(gps.speed) ? gps.speed : 0;
  if (running) {
    totDist += step.d;
    totTime += step.t;
  }
}

function handleHrm(hrm) {
  hrmReady = hrm.confidence > 50;
  heartRate = hrm.bpm;
}

function handleStep() {
  cadence = step.getCadence();
  if (running) {
    totSteps += 1;
  }
}

function start() {
  running = true;
  drawBackground();
  draw();
}

function stop() {
  if (!running) {
    totDist = 0;
    totTime = 0;
    totSteps = 0;
  }
  running = false;
  drawBackground();
  draw();
}

Bangle.on('GPS', handleGps);
Bangle.on('HRM', handleHrm);
Bangle.on('step', handleStep);

Bangle.setGPSPower(1);
Bangle.setHRMPower(1);

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawBackground();
draw();

setInterval(draw, 500);

setWatch(start, BTN1, { repeat: true });
setWatch(stop, BTN3, { repeat: true });
=======
!function(){"use strict";var t;!function(t){t.Stopped="STOP",t.Paused="PAUSE",t.Running="RUN"}(t||(t={}));const n={STOP:63488,PAUSE:65504,RUN:2016};function e(t,n,e){g.setColor(0),g.fillRect(n-60,e,n+60,e+30),g.setColor(65535),g.drawString(t,n,e)}function i(i){var s;g.setFontVector(30),g.setFontAlign(0,-1,0),e((i.distance/1e3).toFixed(2),60,55),e(function(t){const n=Math.round(t),e=Math.floor(n/3600),i=Math.floor(n/60)%60,s=n%60;return(e?e+":":"")+("0"+i).substr(-2)+":"+("0"+s).substr(-2)}(i.duration),172,55),e(function(t){if(t<.1667)return"__'__\"";const n=Math.round(1e3/t),e=Math.floor(n/60),i=n%60;return("0"+e).substr(-2)+"'"+("0"+i).substr(-2)+'"'}(i.speed),60,115),e(i.hr.toFixed(0),172,115),e(i.steps.toFixed(0),60,175),e(i.cadence.toFixed(0),172,175),g.setFont("6x8",2),g.setColor(i.gpsValid?2016:63488),g.fillRect(0,216,80,240),g.setColor(0),g.drawString("GPS",40,220),g.setColor(65535),g.fillRect(80,216,160,240),g.setColor(0),g.drawString(("0"+(s=new Date).getHours()).substr(-2)+":"+("0"+s.getMinutes()).substr(-2),120,220),g.setColor(n[i.status]),g.fillRect(160,216,230,240),g.setColor(0),g.drawString(i.status,200,220),g.setFont("6x8").setFontAlign(0,0,1).setColor(-1),i.status===t.Paused?g.drawString("START",236,60,1).drawString(" CLEAR ",236,180,1):i.status===t.Running?g.drawString(" PAUSE ",236,60,1).drawString(" PAUSE ",236,180,1):g.drawString("START",236,60,1).drawString("      ",236,180,1)}function s(t){g.clear(),g.setColor(50712),g.setFont("6x8",2),g.setFontAlign(0,-1,0),g.drawString("DIST (KM)",60,32),g.drawString("TIME",180,32),g.drawString("PACE",60,92),g.drawString("HEART",180,92),g.drawString("STEPS",60,152),g.drawString("CADENCE",180,152),i(t),Bangle.drawWidgets()}function a(n){n.status===t.Stopped&&function(t){const n=(new Date).toISOString().replace(/[-:]/g,""),e=`banglerun_${n.substr(2,6)}_${n.substr(9,6)}`;t.file=require("Storage").open(e,"w"),t.fileWritten=!1}(n),n.status===t.Running?n.status=t.Paused:n.status=t.Running,i(n)}const r={fix:NaN,lat:NaN,lon:NaN,alt:NaN,vel:NaN,dop:NaN,gpsValid:!1,x:NaN,y:NaN,z:NaN,t:NaN,timeSinceLog:0,hr:60,hrError:100,file:null,fileWritten:!1,drawing:!1,status:t.Stopped,duration:0,distance:0,speed:0,steps:0,cadence:0};var o;o=r,Bangle.on("GPS",n=>function(n,e){n.lat=e.lat,n.lon=e.lon,n.alt=e.alt,n.vel=e.speed/3.6,n.fix=e.fix,n.dop=e.hdop,n.gpsValid=n.fix>0,function(n){const e=Date.now();let i=(e-n.t)/1e3;if(isFinite(i)||(i=0),n.t=e,n.timeSinceLog+=i,n.status===t.Running&&(n.duration+=i),!n.gpsValid)return;const s=6371008.8+n.alt,a=n.lat*Math.PI/180,r=n.lon*Math.PI/180,o=s*Math.cos(a)*Math.cos(r),g=s*Math.cos(a)*Math.sin(r),d=s*Math.sin(a);if(!n.x)return n.x=o,n.y=g,void(n.z=d);const u=o-n.x,l=g-n.y,c=d-n.z,f=Math.sqrt(u*u+l*l+c*c);n.x=o,n.y=g,n.z=d,n.status===t.Running&&(n.distance+=f,n.speed=n.distance/n.duration||0,n.cadence=60*n.steps/n.duration||0)}(n),i(n),n.gpsValid&&n.status===t.Running&&n.timeSinceLog>5&&(n.timeSinceLog=0,function(t){t.fileWritten||(t.file.write(["timestamp","latitude","longitude","altitude","duration","distance","heartrate","steps"].join(",")+"\n"),t.fileWritten=!0),t.file.write([Date.now().toFixed(0),t.lat.toFixed(6),t.lon.toFixed(6),t.alt.toFixed(2),t.duration.toFixed(0),t.distance.toFixed(2),t.hr.toFixed(0),t.steps.toFixed(0)].join(",")+"\n")}(n))}(o,n)),Bangle.setGPSPower(1),function(t){Bangle.on("HRM",n=>function(t,n){if(0===n.confidence)return;const e=n.bpm-t.hr,i=Math.abs(e)+101-n.confidence,s=t.hrError/(t.hrError+i)||0;t.hr+=e*s,t.hrError+=(i-t.hrError)*s}(t,n)),Bangle.setHRMPower(1)}(r),function(n){Bangle.on("step",()=>function(n){n.status===t.Running&&(n.steps+=1)}(n))}(r),function(t){Bangle.loadWidgets(),Bangle.on("lcdPower",n=>{t.drawing=n,n&&s(t)}),s(t)}(r),setWatch(()=>a(r),BTN1,{repeat:!0,edge:"falling"}),setWatch(()=>function(n){n.status===t.Paused&&function(t){t.duration=0,t.distance=0,t.speed=0,t.steps=0,t.cadence=0}(n),n.status===t.Running?n.status=t.Paused:n.status=t.Stopped,i(n)}(r),BTN3,{repeat:!0,edge:"falling"})}();
>>>>>>> 1cc7674aa7f990f88644e78d9d19cd981ea34324
