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
  const min = Math.floor(s / 60);
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
