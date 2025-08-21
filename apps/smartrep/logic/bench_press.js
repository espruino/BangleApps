
let alpha = 0.2;
let ema = null;
let win = [];
let windowSize = 20;

let repCount = 0;
let state = "down";
let lastPeakT = 0, lastValleyT = 0;
let lastPeakV = 0, lastValleyV = 0;

let minRepTime = 300;
let minAmplitude = 15;
let tracking = false;

exports.start = function(onRep) {
  repCount = 0;
  ema = null;
  state = "down";
  lastPeakT = lastValleyT = (getTime() * 1000) | 0;
  lastPeakV = lastValleyV = 0;
  win = [];
  tracking = true;

  Bangle.setPollInterval(40);
  Bangle.on("accel", function handler(a) {
    let angle = Math.atan2(a.x, a.z) * 180 / Math.PI;
    if (ema === null) ema = angle;
    ema = alpha * angle + (1 - alpha) * ema;

    win.push(ema);
    if (win.length > windowSize) win.shift();
    let mx = Math.max(...win);
    let mn = Math.min(...win);
    let mean = win.reduce((a, b) => a + b) / win.length;

    let upTh = mean + 0.3 * (mx - mn);
    let downTh = mean - 0.3 * (mx - mn);
    let now = (getTime() * 1000) | 0;

    if (state === "down" && ema > upTh && now - lastValleyT > minRepTime) {
      state = "up";
      lastPeakT = now;
      lastPeakV = ema;
    } else if (state === "up" && ema < downTh && now - lastPeakT > minRepTime) {
      state = "down";
      lastValleyT = now;
      lastValleyV = ema;
      let amp = Math.abs(lastPeakV - lastValleyV);
      if (amp >= minAmplitude) {
        repCount++;
        onRep();
        Bangle.buzz();
      }
    }
  });
};

exports.stop = function() {
  tracking = false;
  Bangle.removeAllListeners("accel");
};
