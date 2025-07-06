let pollingInterval = 40;
let thresholdStart = 0.6;     // starting from top
let thresholdEnd = 0.2;       // ending low
let minInterval = 600;

let repCount = 0;
let inPush = false;
let lastRepTime = 0;
let tracking = false;

exports.start = function(onRep) {
  if (tracking) return;
  tracking = true;
  repCount = 0;
  inPush = false;
  lastRepTime = 0;

  Bangle.setPollInterval(pollingInterval);
  Bangle.on('accel', function handler(a) {
    let x = a.x;
    let now = getTime() * 1000;

    if (!inPush && x < thresholdEnd) inPush = true;

    if (inPush && x > thresholdStart && now - lastRepTime > minInterval) {
      lastRepTime = now;
      inPush = false;
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
