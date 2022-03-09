(function() {
    let medianPressure;
    let threeHourAvrPressure;
    let currentPressures = [];

    const LOG_FILE = "widbaroalarm.log.json";
    const SETTINGS_FILE = "widbaroalarm.json";
    const storage = require('Storage');
    let settings = Object.assign(
      storage.readJSON("widbaroalarm.default.json", true) || {},
      storage.readJSON(SETTINGS_FILE, true) || {}
    );

    function setting(key) {
      return settings[key];
    }
    const interval = setting("interval");

    let history3 = storage.readJSON(LOG_FILE, true) || []; // history of recent 3 hours

    function showAlarm(body, title) {
      if (body == undefined) return;

      require("notify").show({
        title: title || "Pressure",
        body: body,
        icon: require("heatshrink").decompress(atob("jEY4cA///gH4/++mkK30kiWC4H8x3BGDmSGgYDCgmSoEAg3bsAIDpAIFkmSpMAm3btgIFDQwIGNQpTYkAIJwAHEgMoCA0JgMEyBnBCAW3KoQQDhu3oAIH5JnDBAW24IIBEYm2EYwACBCIACA"))
      });

      if (setting("buzz") &&
        !(storage.readJSON('setting.json', 1) || {}).quiet) {
        Bangle.buzz();
      }
    }

    let alreadyWarned = false;

    function checkForAlarms(pressure) {
      if (pressure == undefined || pressure <= 0) return;

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

      history3.push(d);
      // write data to storage
      storage.writeJSON(LOG_FILE, history3);

      if (setting("lowalarm") && pressure <= setting("min")) {
        showAlarm("Pressure low: " + Math.round(pressure) + " hPa");
        alreadyWarned = true;
      }
      if (setting("highalarm") && pressure >= setting("max")) {
        showAlarm("Pressure high: " + Math.round(pressure) + " hPa");
        alreadyWarned = true;
      }

      if (!alreadyWarned) {
        // 3h change detection
        const drop3halarm = setting("drop3halarm");
        const raise3halarm = setting("raise3halarm");
        if (drop3halarm > 0 || raise3halarm > 0) {
          // we need at least 30min of data for reliable detection
          if (history3[0]["ts"] > ts - (30 * 60)) {
            return;
          }

          // Get oldest entry:
          const oldestPressure = history3[0]["p"];
          if (oldestPressure != undefined && oldestPressure > 0) {
            const diff = oldestPressure - pressure;

            // drop alarm
            if (drop3halarm > 0 && oldestPressure > pressure) {
              if (Math.abs(diff) > drop3halarm) {
                showAlarm((Math.round(Math.abs(diff) * 10) / 10) + " hPa/3h from " +
                  Math.round(oldestPressure) + " to " + Math.round(pressure) + " hPa", "Pressure drop");
            }
          }

          // raise alarm
          if (raise3halarm > 0 && oldestPressure < pressure) {
            if (Math.abs(diff) > raise3halarm) {
              showAlarm((Math.round(Math.abs(diff) * 10) / 10) + " hPa/3h from " +
                Math.round(oldestPressure) + " to " + Math.round(pressure) + " hPa", "Pressure raise");
          }
        }
      }
    }
  }

  // calculate 3h average for widget
  let sum = 0;
  for (let i = 0; i < history3.length; i++) {
    sum += history3[i]["p"];
  }
  threeHourAvrPressure = sum / history3.length;
}



function baroHandler(data) {
  if (data) {
    const pressure = Math.round(data.pressure);
    if (pressure == undefined || pressure <= 0) return;
    currentPressures.push(pressure);
  }
}

/*
 turn on barometer power
 take 5 measurements
 sort the results
 take the middle one (median)
 turn off barometer power
*/
function check() {
  Bangle.setBarometerPower(true, "widbaroalarm");
  setTimeout(function() {
    currentPressures = [];

    Bangle.getPressure().then(baroHandler);
    Bangle.getPressure().then(baroHandler);
    Bangle.getPressure().then(baroHandler);
    Bangle.getPressure().then(baroHandler);
    Bangle.getPressure().then(baroHandler);

    setTimeout(function() {
      Bangle.setBarometerPower(false, "widbaroalarm");

      currentPressures.sort();

      // take median value
      medianPressure = currentPressures[3];
      checkForAlarms(medianPressure);
    }, 1000);
  }, 500);
}

function reload() {
  check();
}

function draw() {
  g.reset();
  if (setting("show") && medianPressure != undefined) {
    g.setFont("6x8", 1).setFontAlign(1, 0);
    g.drawString(Math.round(medianPressure), this.x + 24, this.y + 6);
    if (threeHourAvrPressure != undefined && threeHourAvrPressure > 0) {
      g.drawString(Math.round(threeHourAvrPressure), this.x + 24, this.y + 6 + 10);
    }
  }
}

if (global.WIDGETS != undefined && typeof WIDGETS === "object") {
  WIDGETS["baroalarm"] = {
    width: setting("show") ? 24 : 0,
    reload: reload,
    area: "tr",
    draw: draw
  };
}

// Let's delay the first check a bit
setTimeout(function() {
check();
if (interval > 0) {
  setInterval(check, interval * 60000);
}
}, 5000);

})();
