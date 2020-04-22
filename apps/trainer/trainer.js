g.clearRect(0, 0, 239, 239);

Bangle.setHRMPower(1);
const MAX_BPM = (require("Storage").readJSON("app.json", 1) || { maxbpm: 115 })
  .maxbpm;
g.drawString(`Max BPM: ${MAX_BPM}`, 15, 10);

let bpms = [];
Bangle.on("HRM", function(hrm) {
  /*hrm is an object containing:
    { "bpm": number,             // Beats per minute
      "confidence": number,      // 0-100 percentage confidence in the heart rate
      "raw": Uint8Array,         // raw samples from heart rate monitor
   */
  console.log("confidence", hrm.confidence, "bpm", hrm.bpm);
  g.setColor(1, 0, 0);
  g.setFontVector(40);
  g.clearRect(0, 20, 220, 70);
  const bpm = hrm.bpm ? hrm.bpm : "0";
  if (hrm.confidence > 50) bpms.push(bpm);
  if (bpms.length > 4) bpms.splice(0, 1);
  console.log(bpms);
  const avg =
    bpms.length > 0
      ? Math.round(bpms.reduce((tot, bpm) => tot + bpm, 0) / bpms.length)
      : 0;
  const str = avg.toString();
  console.log(avg);
  const strWidth = g.stringWidth(str);
  var px = 148 - strWidth;
  g.drawString(str, px, 45);
  px += strWidth;
  g.setFont("6x8");
  g.drawString("BPM", px + 10, 65);
  g.setColor(1, 1, 1);
  if (avg > MAX_BPM) {
    Bangle.buzz(500, 1)
      .then(() => Bangle.buzz(500, 0.5))
      .then(() => Bangle.buzz(500, 1));
  }
});

//////////

var tTotal = Date.now();
var tStart = Date.now();
var tCurrent = Date.now();
var started = false;
var timeY = 95;
var hsXPos = 0;
var TtimeY = 125;
var ThsXPos = 0;
var lapTimes = [];
var displayInterval;

function timeToText(t) {
  var secs = Math.floor(t / 1000) % 60;
  var mins = Math.floor(t / 60000);
  var hs = Math.floor(t / 10) % 100;
  return mins + ":" + ("0" + secs).substr(-2) + "." + ("0" + hs).substr(-2);
}

function updateLabels() {
  g.reset(1);
  g.clearRect(220, 23, g.getWidth() - 1, g.getHeight() - 24);
  g.setFont("6x8", 2);
  g.setFontAlign(0, 0, 3);
  g.drawString(started ? "STOP" : "GO", 230, 120);
  if (!started) g.drawString("RESET", 230, 180);
  g.drawString(started ? "LAP" : "SAVE", 230, 50);
  g.setFont("6x8", 1);
  g.setFontAlign(-1, -1);
  g.clearRect(0, timeY + 40, g.getWidth() - 20, g.getHeight() - 24);
  for (var i in lapTimes) {
    if (i < 10) {
      g.drawString(
        lapTimes.length - i + ": " + timeToText(lapTimes[i]),
        35,
        timeY + 40 + i * 8
      );
    } else if (i < 20) {
      g.drawString(
        lapTimes.length - i + ": " + timeToText(lapTimes[i]),
        125,
        timeY + 40 + (i - 10) * 8
      );
    }
  }
  drawsecs();
}

function drawsecs() {
  var t = tCurrent - tStart;
  var Tt = tCurrent - tTotal;
  var secs = Math.floor(t / 1000) % 60;
  var mins = Math.floor(t / 60000);
  var txt = mins + ":" + ("0" + secs).substr(-2);
  var Tsecs = Math.floor(Tt / 1000) % 60;
  var Tmins = Math.floor(Tt / 60000);
  var Ttxt = Tmins + ":" + ("0" + Tsecs).substr(-2);
  var x = 100;
  var Tx = 125;
  g.reset(1);
  g.setFont("Vector", 38);
  g.setFontAlign(0, 0);
  g.clearRect(0, timeY - 21, 200, timeY + 21);
  g.drawString(Ttxt, x, timeY);
  hsXPos = 5 + x + g.stringWidth(txt) / 2;
  g.setFont("6x8", 2);
  g.clearRect(0, TtimeY - 7, 200, TtimeY + 7);
  g.drawString(txt, Tx, TtimeY);
  ThsXPos = 5 + Tx + g.stringWidth(Ttxt) / 2;
  drawms();
}

function drawms() {
  var t = tCurrent - tStart;
  var hs = Math.floor(t / 10) % 100;
  var Tt = tCurrent - tTotal;
  var Ths = Math.floor(Tt / 10) % 100;
  g.setFontAlign(-1, 0);
  g.setFont("6x8", 2);
  g.clearRect(hsXPos, timeY, 220, timeY + 20);
  g.drawString("." + ("0" + Ths).substr(-2), hsXPos - 5, timeY + 14);
  g.setFont("6x8", 1);
  g.clearRect(ThsXPos, TtimeY, 220, TtimeY + 5);
  g.drawString("." + ("0" + hs).substr(-2), ThsXPos - 5, TtimeY + 3);
  g.flip();
}

function getLapTimesArray() {
  lapTimes.push(tCurrent - tTotal);
  return lapTimes.map(timeToText).reverse();
}

setWatch(
  function() {
    // Start/stop
    started = !started;
    Bangle.beep();
    if (started) tStart = Date.now() + tStart - tCurrent;
    tTotal = Date.now() + tTotal - tCurrent;
    tCurrent = Date.now();
    if (displayInterval) {
      clearInterval(displayInterval);
      displayInterval = undefined;
    }
    updateLabels();
    if (started)
      displayInterval = setInterval(function() {
        var last = tCurrent;
        if (started) tCurrent = Date.now();
        if (Math.floor(last / 1000) != Math.floor(tCurrent / 1000)) drawsecs();
        else drawms();
      }, 20);
  },
  BTN2,
  { repeat: true }
);

setWatch(
  function() {
    // Lap
    Bangle.beep();
    if (started) {
      tCurrent = Date.now();
      lapTimes.unshift(tCurrent - tStart);
    }
    if (!started) {
      // save
      var filename =
        "swatch-" +
        new Date()
          .toISOString()
          .substr(0, 16)
          .replace("T", "_") +
        ".json";
      if (tCurrent != tStart) lapTimes.unshift(tCurrent - tStart);
      // this maxes out the 28 char maximum
      require("Storage").writeJSON(filename, getLapTimesArray());
      tStart = tCurrent = tTotal = Date.now();
      lapTimes = [];
      E.showMessage("Laps Saved", "Stopwatch");
      setTimeout(updateLabels, 1000);
    } else {
      tStart = tCurrent;
      updateLabels();
    }
  },
  BTN1,
  { repeat: true }
);
setWatch(
  function() {
    // Reset
    if (!started) {
      Bangle.beep();
      tStart = tCurrent = tTotal = Date.now();
      lapTimes = [];
    }
    updateLabels();
  },
  BTN3,
  { repeat: true }
);

updateLabels();
