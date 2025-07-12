let pollingInterval = 40;
let thresholdPull = 0.85;    // pulling motion
let thresholdRelease = 0.35; // return motion
let minInterval = 500;       // 0.5s between rep

let repCount = 0;
let inPull = false;
let lastRepTime = 0;
let tracking = false;

exports.start = function(onRep) {
  if (tracking) return;
  tracking = true;
  repCount = 0;
  inPull = false;
  lastRepTime = 0;

  Bangle.setPollInterval(pollingInterval);
  Bangle.on('accel', function handler(a) {
    let y = a.y;
    let now = getTime() * 1000;

    if (!inPull && y > thresholdPull) inPull = true;

    if (inPull && y < thresholdRelease && now - lastRepTime > minInterval) {
      lastRepTime = now;
      inPull = false;
      repCount++;
      onRep();
      Bangle.buzz();
    }
  });
};

exports.stop = function() {
  if (!tracking) return;
  tracking = false;
  Bangle.removeAllListeners('accel');
};

