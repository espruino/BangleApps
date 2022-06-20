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
    settings = Object.assign(
      storage.readJSON("widbaroalarm.default.json", true) || {},
      storage.readJSON(SETTINGS_FILE, true) || {}
    );
  }

  loadSettings();


  function setting(key) {
    return settings[key];
  }

  function saveSetting(key, value) {
    settings[key] = value;
    storage.write(SETTINGS_FILE, settings);
  }

  const interval = setting("interval");

  let history3 = storage.readJSON(LOG_FILE, true) || []; // history of recent 3 hours

  function showAlarm(body, key) {
    if (body == undefined) return;
    stop = true;

    E.showPrompt(body, {
      title: "Pressure alarm",
      buttons: {
        "Ok": 1,
        "Dismiss": 2,
        "Pause": 3
      }
    }).then(function(v) {
      const tsNow = Math.round(Date.now() / 1000); // seconds

      if (v == 1) {
        saveSetting(key, tsNow);
      }
      if (v == 2) {
        // save timestamp of the future so that we do not warn again for the same event until then
        saveSetting(key, tsNow + 60 * setting('dismissDelayMin'));
      }
      if (v == 3) {
        // save timestamp of the future so that we do not warn again for the same event until then
        saveSetting(key, tsNow + 60 * setting('pauseDelayMin'));
      }
      stop = false;
      load();
    });

    if (setting("buzz") &&
      !(storage.readJSON('setting.json', 1) || {}).quiet) {
      Bangle.buzz();
    }

    setTimeout(function() {
      stop = false;
      load();
    }, 20000);
  }


  function doWeNeedToWarn(key) {
    const tsNow = Math.round(Date.now() / 1000); // seconds
    return setting(key) == 0 || setting(key) < tsNow;
  }

  function checkForAlarms(pressure) {
    if (pressure == undefined || pressure <= 0) return;

    let alreadyWarned = false;

    const ts = Math.round(Date.now() / 1000); // seconds
    const d = {
      "ts": ts,
      "p": pressure
    };

    // delete entries older than 3h
    for (let i = 0; i < history3.length; i++) {
      if (history3[i]["ts"] < ts - (3 * 60 * 60)) {
        history3.shift();
      }
    }
    // delete oldest entries until we have max 50
    while (history3.length > 50) {
      history3.shift();
    }

    if (setting("lowalarm")) {
      // Is below the alarm threshold?
      if (pressure <= setting("min")) {
        if (!doWeNeedToWarn("lastLowWarningTs")) {
          showAlarm("Pressure low: " + Math.round(pressure) + " hPa", "lastLowWarningTs");
          alreadyWarned = true;
        }
      } else {
        saveSetting("lastLowWarningTs", 0);
      }
    }

    if (setting("highalarm")) {
      // Is above the alarm threshold?
      if (pressure >= setting("max")) {
        if (doWeNeedToWarn("lastHighWarningTs")) {
          showAlarm("Pressure high: " + Math.round(pressure) + " hPa", "lastHighWarningTs");
          alreadyWarned = true;
        }
      } else {
        saveSetting("lastHighWarningTs", 0);
      }
    }

    if (history3.length > 0 && !alreadyWarned) {
      // 3h change detection
      const drop3halarm = setting("drop3halarm");
      const raise3halarm = setting("raise3halarm");
      if (drop3halarm > 0 || raise3halarm > 0) {
        // we need at least 30min of data for reliable detection
        const diffDateAge = Math.abs(history3[0]["ts"] - ts);
        if (diffDateAge < 10 * 60) { // todo change to 1800
          return;
        }

        // Get oldest entry:
        const oldestPressure = history3[0]["p"];
        if (oldestPressure != undefined && oldestPressure > 0) {
          const diffPressure = Math.abs(oldestPressure - pressure);

          // drop alarm
          if (drop3halarm > 0 && oldestPressure > pressure) {
            if (diffPressure > drop3halarm) {
              if (doWeNeedToWarn("lastDropWarningTs")) {
                showAlarm((Math.round(diffPressure * 10) / 10) + " hPa/3h from " +
                  Math.round(oldestPressure) + " to " + Math.round(pressure) + " hPa", "lastDropWarningTs");
              }
            } else {
              saveSetting("lastDropWarningTs", 0);
            }
          } else {
            saveSetting("lastDropWarningTs", 0);
          }

          // raise alarm
          if (raise3halarm > 0 && oldestPressure < pressure) {
            if (diffPressure > raise3halarm) {
              if (doWeNeedToWarn("lastRaiseWarningTs")) {
                showAlarm((Math.round(diffPressure * 10) / 10) + " hPa/3h from " +
                  Math.round(oldestPressure) + " to " + Math.round(pressure) + " hPa", "lastRaiseWarningTs");
              }
            } else {
              saveSetting("lastRaiseWarningTs", 0);
            }
          } else {
            saveSetting("lastRaiseWarningTs", 0);
          }
        }
      }
    }

    history3.push(d);
    // write data to storage
    storage.writeJSON(LOG_FILE, history3);

    // calculate 3h average for widget
    if (history3.length > 0) {
      let sum = 0;
      for (let i = 0; i < history3.length; i++) {
        sum += history3[i]["p"];
      }
      threeHourAvrPressure = sum / history3.length;
    } else {
      threeHourAvrPressure = undefined;
    }
  }


  /*
   turn on barometer power
   take multiple measurements
   sort the results
   take the middle one (median)
   turn off barometer power
  */
  function check() {
    if (stop) return;
    const MEDIANLENGTH = 20;
    Bangle.setBarometerPower(true, "widbaroalarm");
    Bangle.on('pressure', function(e) {
      while (currentPressures.length > MEDIANLENGTH) currentPressures.pop();
      currentPressures.unshift(e.pressure);
      median = currentPressures.slice().sort();

      if (median.length > 10) {
        var mid = median.length >> 1;
        medianPressure = Math.round(E.sum(median.slice(mid - 4, mid + 5)) / 9);
        if (medianPressure > 0) {
          turnOff();
          checkForAlarms(medianPressure);
        }
      }
    });

    setTimeout(function() {
      turnOff();
    }, 10000);
  }

  function turnOff() {
    if (Bangle.isBarometerOn())
      Bangle.setBarometerPower(false, "widbaroalarm");
  }

  function reload() {
    check();
  }

  function draw() {
    if (global.WIDGETS != undefined && typeof global.WIDGETS === "object") {
      global.WIDGETS["baroalarm"] = {
        width: setting("show") ? 24 : 0,
        reload: reload,
        area: "tr",
        draw: draw
      };
    }
    g.reset();
    if (setting("show")) {
      g.setFont("6x8", 1).setFontAlign(1, 0);
      if (medianPressure == undefined) {
        check();
        const x = this.x,
          y = this.y;
        g.drawString("...", x + 24, y + 6);
        setTimeout(function() {
          g.setFont("6x8", 1).setFontAlign(1, 0);
          g.drawString(Math.round(medianPressure), x + 24, y + 6);
        }, 10000);
      } else {
        g.drawString(Math.round(medianPressure), this.x + 24, this.y + 6);
      }

      if (threeHourAvrPressure != undefined && threeHourAvrPressure > 0) {
        g.drawString(Math.round(threeHourAvrPressure), this.x + 24, this.y + 6 + 10);
      }
    }
  }

  if (interval > 0) {
    setInterval(check, interval * 60000);
  }
  draw();

})();
