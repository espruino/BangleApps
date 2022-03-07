(function() {
  let lastPressure;
  let avrPressure;
  let threeHourAvrPressure;

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

  function showAlarm(text, value, value2, icon) {
    if (text == undefined || value == undefined) return;
    const Layout = require("Layout");
    layout = new Layout({
      type: "v",
      c: [{
          type: "h",
          c: [{
              type: "img",
              pad: 0,
              src: function() {
                return icon || require("heatshrink").decompress(atob("jEY4cA///gH4/++mkK30kiWC4H8x3BGDmSGgYDCgmSoEAg3bsAIDpAIFkmSpMAm3btgIFDQwIGNQpTYkAIJwAHEgMoCA0JgMEyBnBCAW3KoQQDhu3oAIH5JnDBAW24IIBEYm2EYwACBCIACA"));
              }
            },
            {
              type: "txt",
              id: "title",
              font: "6x8:2",
              label: "Alarm",
              pad: 2
            },
          ]
        },
        {
          type: "txt",
          id: "text",
          font: "6x8:2",
          label: text,
          pad: 3
        },
        {
          type: "txt",
          id: "value",
          font: "6x8:2",
          label: value,
          halign: 0,
          pad: 3
        },
        {
          type: "txt",
          id: "value2",
          font: "6x8:1",
          label: value2 || "",
          halign: 0,
          pad: 3
        },
      ]
    }, {
      btns: [{
        label: "OK",
        cb: function() {
          load(); // close
        }
      }],
      lazy: false
    });

    g.clear();
    layout.render();

    if (setting("buzz") &&
      !(storage.readJSON('setting.json', 1) || {}).quiet) {
      Bangle.buzz();
    }
  }

  let alreadyWarned = false;

  function baroHandler(data) {
    if (data === undefined) {
      setTimeout(() => Bangle.getPressure().then(baroHandler), 500);
    } else {
      lastPressure = Math.round(data.pressure);
      if (lastPressure == undefined || lastPressure <= 0) return;

      const ts = Math.round(Date.now() / 1000); // seconds
      const d = {
        "ts": ts,
        "p": lastPressure
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

      // we need at least three entries for reliable detection
      if (history3.length >= 3) {

        // calculate average of recent three entries
        avrPressure = (history3[history3.length - 1]["p"] + history3[history3.length - 2]["p"] + history3[history3.length - 3]["p"]) / 3;

        if (setting("lowalarm") && avrPressure <= setting("min")) {
          showAlarm("Pressure low", Math.round(avrPressure) + " hPa");
          alreadyWarned = true;
        }
        if (setting("highalarm") && avrPressure >= setting("max")) {
          showAlarm("Pressure high", Math.round(avrPressure) + " hPa");
          alreadyWarned = true;
        }

        if (!alreadyWarned) {
          // 3h change detection
          const threeHourChange = setting("changeIn3h");
          if (threeHourChange > 0) {
            // we need at least 30min of data for reliable detection
            if (history3[0]["ts"] > ts - (30 * 60)) {
              return;
            }

            // Average of oldest three entries
            const oldestAvgPressure = (history3[0]["p"] + history3[1]["p"] + history3[2]["p"]) / 3;
            if (oldestAvgPressure != undefined && oldestAvgPressure > 0) {
              const diff = oldestAvgPressure - avrPressure;
              if (Math.abs(diff) > threeHourChange) {
                showAlarm("Pressure " + (diff > 0 ? "drop" : "raise"), (Math.round(Math.abs(diff) * 10) / 10) + " hPa/3h",
                  Math.round(oldestAvgPressure) + " hPa -> " + Math.round(avrPressure) + " hPa");
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
  }

  function check() {
    Bangle.getPressure().then(baroHandler);
  }

  function reload() {
    check();
  }

  function draw() {
    g.reset();
    if (setting("show") && lastPressure != undefined) {
      g.setFont("6x8", 1).setFontAlign(1, 0);
      g.drawString(Math.round(lastPressure), this.x + 24, this.y + 6);
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

  // Let's delay check a bit
  setTimeout(function() {
    check();
    if (interval > 0) {
      setInterval(check, interval * 60000);
    }
  }, 10000);

})();
