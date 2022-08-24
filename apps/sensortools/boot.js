(function() {
  var settings = Object.assign(
    require('Storage').readJSON("sensortools.default.json", true) || {},
    require('Storage').readJSON("sensortools.json", true) || {}
  );

  var log = function(text, param) {
    var logline = new Date().toISOString() + " - " + "Sensortools - " + text;
    if (param) logline += ": " + JSON.stringify(param);
    print(logline);
  };

  if (settings.enabled) {
    log("Enabled");
    const POWER_DELAY = 10000;
    var orig = {};

    var onEvents = [];

    orig.bangleOn = Bangle.on;
    orig.bangleEmit = Bangle.emit;
    orig.bangleRemoveListener = Bangle.removeListener;

    Bangle.on = function(name, callback) {
      if (onEvents[name]) {
        orig.bangleOn(name + "_mod", callback);
        orig.bangleOn(name, (e) => {
          Bangle.emit(name + "_mod", onEvents[name](e));
        });
      } else {
        orig.bangleOn(name, callback);
      }
    };

    Bangle.removeListener = function(name, callback) {
      if (onEvents[name]) {
        orig.bangleRemoveListener(name + "_mod", callback);
      } else {
        orig.bangleRemoveListener(name, callback);
      }
    };

    Bangle.emit = function(name, event) {
      if (onEvents[name]) {
        orig.bangleEmit(name + "_mod", event);
      } else {
        orig.bangleEmit(name, event);
      }
    };

    var createPowerFunction = function(type, origPower) {
      return function(isOn, app) {
        if (type == "nop") {
          return;
        } else if (type == "delay") {
          setTimeout(() => {
            origPower(isOn, app);
          }, POWER_DELAY);
        } else if (type == "on") {
          origPower(1, "sensortools_force_on");
        }
      };
    };

    if (settings.hrm) {
      log("HRM", settings.hrm);
      if (settings.hrm.power) {
        log("HRM power");
        orig.bangleSetHRMPower = Bangle.setHRMPower;
        Bangle.setHRMPower = createPowerFunction(settings.hrm.power, orig.bangleSetHRMPower);
      }
      if (settings.hrm.mode == "modify") {
        if (settings.hrm.name == "bpmtrippled") {
          onEvents.HRM = (e) => {
            return {
              bpm: e.bpm * 3
            };
          };
        }
      } else if (settings.hrm.mode == "emulate") {
        if (settings.hrm.name == "sin") {
          setInterval(() => {
            orig.bangleEmit(60 + 3 * Math.sin(Date.now() / 10000));
          }, 1000);
        }
      }
    }

    if (settings.gps) {
      log("GPS", settings.gps);
      let modGps = function(data) {
        setInterval(() => {
          Bangle.getGPSFix = () => data;
          orig.bangleEmit("GPS", data);
        }, 1000);
      };
      if (settings.gps.power) {
        orig.bangleSetGPSPower = Bangle.setGPSPower;
        Bangle.setGPSPower = createPowerFunction(settings.gps.power, orig.bangleSetGPSPower);
      }
      if (settings.gps.mode == "emulate") {
        if (settings.gps.name == "staticfix") {
          modGps({
            "lat": 52,
            "lon": 8,
            "alt": 100,
            "speed": 0,
            "course": 0,
            "time": Date.now(),
            "satellites": 7,
            "fix": 1,
            "hdop": 1
          });
        } else if (settings.gps.name == "nofix") {
          modGps({
            "lat": NaN,
            "lon": NaN,
            "alt": NaN,
            "speed": NaN,
            "course": NaN,
            "time": Date.now(),
            "satellites": 2,
            "fix": 0,
            "hdop": NaN
          });
        }
      }
    }

    if (settings.mag) {
      log("MAG", settings.mag);
      let modMag = function(data) {
        setInterval(() => {
          Bangle.getCompass = () => data;
          orig.bangleEmit("mag", data);
        }, 100);
      };
      if (settings.mag.power) {
        orig.bangleSetCompassPower = Bangle.setCompassPower;
        Bangle.setCompassPower = createPowerFunction(settings.mag.power, orig.bangleSetCompassPower);
      }
      if (settings.mag.mode == "emulate") {
        if (settings.mag.name == "static") {
          modMag({
            x: 1,
            y: 1,
            z: 1,
            dx: 1,
            dy: 1,
            dz: 1,
            heading: 0
          });
        }
      }
    }
  }
})();
