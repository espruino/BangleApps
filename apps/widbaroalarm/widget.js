(function() {
let medianPressure;
let threeHourAvrPressure;
let currentPressures = [];
let stop = false; // semaphore

const LOG_FILE = "widbaroalarm.log.json";
const SETTINGS_FILE = "widbaroalarm.json";
const storage = require('Storage');

let settings;

function loadSettings() {
  settings =
      Object.assign(storage.readJSON("widbaroalarm.default.json", true) || {},
                    storage.readJSON(SETTINGS_FILE, true) || {});
}

loadSettings();

function setting(key) { return settings[key]; }

function saveSetting(key, value) {
  settings[key] = value;
  storage.write(SETTINGS_FILE, settings);
}

const interval = setting("interval");

let history3 =
    storage.readJSON(LOG_FILE, true) || []; // history of recent 3 hours

function showAlarm(body, key, type) {
  if (body == undefined)
    return;
  stop = true;

  E.showPrompt(body, {
     title : "Pressure " + (type != undefined ? type : "alarm"),
     buttons : {"Ok" : 1, "Dismiss" : 2, "Pause" : 3}
   }).then(function(v) {
    const tsNow = Math.round(Date.now() / 1000); // seconds

    if (v == 1) {
      saveSetting(key, tsNow);
    }
    if (v == 2) {
      // save timestamp of the future so that we do not warn again for the same
      // event until then
      saveSetting(key, tsNow + 60 * setting('dismissDelayMin'));
    }
    if (v == 3) {
      // save timestamp of the future so that we do not warn again for the same
      // event until then
      saveSetting(key, tsNow + 60 * setting('pauseDelayMin'));
    }
    stop = false;
    load();
  });

  if (setting("buzz") && !(storage.readJSON('setting.json', 1) || {}).quiet) {
    Bangle.buzz();
  }

  setTimeout(function() {
    stop = false;
    load();
  }, 20000);
}

/*
 * returns true if an alarm should be triggered
 */
function doWeNeedToAlarm(key) {
  const tsNow = Math.round(Date.now() / 1000); // seconds
  return setting(key) == undefined || setting(key) == 0 || tsNow > setting(key);
}

function isValidPressureValue(pressure) {
  if (pressure == undefined || pressure <= 0)
    return false;
  return pressure > 800 && pressure < 1200; // very rough values
}

function handlePressureValue(pressure) {
  if (pressure == undefined || pressure <= 0)
    return;

  const ts = Math.round(Date.now() / 1000); // seconds
  const d = {"ts" : ts, "p" : pressure};

  history3.push(d);

  // delete oldest entries until we have max 50
  while (history3.length > 50) {
    history3.shift();
  }

  // delete entries older than 3h
  for (let i = 0; i < history3.length; i++) {
    if (history3[i]["ts"] < ts - (3 * 60 * 60)) {
      history3.shift();
    } else {
      break;
    }
  }

  // write data to storage
  storage.writeJSON(LOG_FILE, history3);

  calculcate3hAveragePressure();

  if (setting("lowalarm") || setting("highalarm") || setting("drop3halarm") ||
      setting("raise3halarm")) {
    checkForAlarms(pressure, ts);
  }
}

function checkForAlarms(pressure, ts) {
  let alreadyWarned = false;

  if (setting("lowalarm")) {
    // Is below the alarm threshold?
    if (pressure <= setting("min")) {
      if (!doWeNeedToAlarm("lowWarnTs")) {
        showAlarm("Pressure low: " + Math.round(pressure) + " hPa", "lowWarnTs",
                  "low");
        alreadyWarned = true;
      }
    } else {
      saveSetting("lowWarnTs", 0);
    }
  }

  if (setting("highalarm")) {
    // Is above the alarm threshold?
    if (pressure >= setting("max")) {
      if (doWeNeedToAlarm("highWarnTs")) {
        showAlarm("Pressure high: " + Math.round(pressure) + " hPa",
                  "highWarnTs", "high");
        alreadyWarned = true;
      }
    } else {
      saveSetting("highWarnTs", 0);
    }
  }

  if (history3.length > 0 && !alreadyWarned) {
    // 3h change detection
    const drop3halarm = setting("drop3halarm");
    const raise3halarm = setting("raise3halarm");
    if (drop3halarm > 0 || raise3halarm > 0) {
      // we need at least 30 minutes of data for reliable detection
      const diffDateAge = Math.abs(history3[0]["ts"] - ts);
      if (diffDateAge > 30 * 60) {
        // Get oldest entry:
        const oldestPressure = history3[0]["p"];
        if (oldestPressure != undefined && oldestPressure > 0) {
          const diffPressure = Math.abs(oldestPressure - pressure);

          // drop alarm
          if (drop3halarm > 0 && oldestPressure > pressure) {
            if (diffPressure >= drop3halarm) {
              if (doWeNeedToAlarm("dropWarnTs")) {
                showAlarm((Math.round(diffPressure * 10) / 10) +
                              " hPa/3h from " + Math.round(oldestPressure) +
                              " to " + Math.round(pressure) + " hPa",
                          "dropWarnTs", "drop");
              }
            } else {
              if (ts > setting("dropWarnTs"))
                saveSetting("dropWarnTs", 0);
            }
          } else {
            if (ts > setting("dropWarnTs"))
              saveSetting("dropWarnTs", 0);
          }

          // raise alarm
          if (raise3halarm > 0 && oldestPressure < pressure) {
            if (diffPressure >= raise3halarm) {
              if (doWeNeedToAlarm("raiseWarnTs")) {
                showAlarm((Math.round(diffPressure * 10) / 10) +
                              " hPa/3h from " + Math.round(oldestPressure) +
                              " to " + Math.round(pressure) + " hPa",
                          "raiseWarnTs", "raise");
              }
            } else {
              if (ts > setting("raiseWarnTs"))
                saveSetting("raiseWarnTs", 0);
            }
          } else {
            if (ts > setting("raiseWarnTs"))
              saveSetting("raiseWarnTs", 0);
          }
        }
      }
    }
  }
}

function calculcate3hAveragePressure() {
  if (history3 != undefined && history3.length > 0) {
    let sum = 0;
    for (let i = 0; i < history3.length; i++) {
      sum += history3[i]["p"];
    }
    threeHourAvrPressure = sum / history3.length;
  } else {
    threeHourAvrPressure = undefined;
  }
}

function barometerPressureHandler(e) {
  const MEDIANLENGTH = 20;
  while (currentPressures.length > MEDIANLENGTH)
    currentPressures.pop();

  const pressure = e.pressure;
  if (isValidPressureValue(pressure)) {
    currentPressures.unshift(pressure);
    let median = currentPressures.slice().sort();

    if (median.length > 10) {
      var mid = median.length >> 1;
      medianPressure = Math.round(E.sum(median.slice(mid - 4, mid + 5)) / 9);
      if (medianPressure > 0) {
        turnOff();
        WIDGETS.baroalarm.draw();
        handlePressureValue(medianPressure);
      }
    }
  }
}

/*
 turn on barometer power
 take multiple measurements
 sort the results
 take the middle one (median)
 turn off barometer power
*/
function getPressureValue() {
  if (stop) return;
  Bangle.setBarometerPower(true, "widbaroalarm");
  Bangle.on('pressure', barometerPressureHandler);
  setTimeout(turnOff, 30000);
}

function turnOff() {
  Bangle.removeListener('pressure', barometerPressureHandler);
  Bangle.setBarometerPower(false, "widbaroalarm");
}

function draw() {
  g.reset();

  if (this.x == undefined || this.y != 0)
    return; // widget not yet there

  g.clearRect(this.x, this.y, this.x + this.width - 1, this.y + 23);

  if (setting("show")) {
    g.setFont("6x8", 1).setFontAlign(1, 0);
    if (medianPressure == undefined) {
      // lets load last value from log (if available)
      if (history3.length > 0) {
        medianPressure = history3[history3.length - 1]["p"];
        g.drawString(Math.round(medianPressure), this.x + 24, this.y + 6);
      } else {
        g.drawString("...", this.x + 24, this.y + 6);
      }
    } else {
      g.drawString(Math.round(medianPressure), this.x + 24, this.y + 6);
    }

    if (threeHourAvrPressure == undefined) {
      calculcate3hAveragePressure();
    }
    if (threeHourAvrPressure != undefined) {
      if (medianPressure != undefined) {
        const diff = Math.round(medianPressure - threeHourAvrPressure);
        g.drawString((diff > 0 ? "+" : "") + diff, this.x + 24,
                     this.y + 6 + 10);
      }
    }
  }
}

WIDGETS["baroalarm"] = {
  width : setting("show") ? 24 : 0,
  area : "tr",
  draw : draw
};

// delay pressure measurement by interval-lastrun
const lastRun = history3.length > 0 ? history3[history3.length-1].ts : 0;
const lastRunAgo = Math.round(Date.now() / 1000) - lastRun;
let diffNextRun = interval*60-lastRunAgo;
if (diffNextRun < 0) {
  diffNextRun = 0; // run asap
}
setTimeout(() => {
  if (interval > 0) {
    setInterval(getPressureValue, interval * 60000);
  }
  getPressureValue();
}, diffNextRun*1000);

})();
