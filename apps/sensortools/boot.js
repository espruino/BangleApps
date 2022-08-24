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

    var onEvents = [];

    Bangle.sensortoolsOrigOn = Bangle.on;
    Bangle.sensortoolsOrigEmit = Bangle.emit;
    Bangle.sensortoolsOrigRemoveListener = Bangle.removeListener;

    Bangle.on = function(name, callback) {
      if (onEvents[name]) {
        log("Redirecting listener for", name, "to", name + "_mod");
        Bangle.sensortoolsOrigOn(name + "_mod", callback);
        Bangle.sensortoolsOrigOn(name, (e) => {
          log("Redirected event for", name, "to", name + "_mod");
          Bangle.sensortoolsOrigEmit(name + "_mod", onEvents[name](e));
        });
      } else {
        log("Pass through on call for", name, callback);
        Bangle.sensortoolsOrigOn(name, callback);
      }
    };

    Bangle.removeListener = function(name, callback) {
      if (onEvents[name]) {
        log("Removing augmented listener for", name, onEvents[name]);
        Bangle.sensortoolsOrigRemoveListener(name + "_mod", callback);
      } else {
        log("Pass through remove listener for", name);
        Bangle.sensortoolsOrigRemoveListener(name, callback);
      }
    };

    Bangle.emit = function(name, event) {
      if (onEvents[name]) {
        log("Augmenting emit call for", name, onEvents[name]);
        Bangle.sensortoolsOrigEmit(name + "_mod", event);
      } else {
        log("Pass through emit call for", name);
        Bangle.sensortoolsOrigEmit(name, event);
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

    if (settings.hrm && settings.hrm.enabled) {
      log("HRM", settings.hrm);
      if (settings.hrm.power) {
        log("HRM power");
        Bangle.sensortoolsOrigSetHRMPower = Bangle.setHRMPower;
        Bangle.setHRMPower = createPowerFunction(settings.hrm.power, Bangle.sensortoolsOrigSetHRMPower);
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
            Bangle.sensortoolsOrigEmit(60 + 3 * Math.sin(Date.now() / 10000));
          }, 1000);
        }
      }
    }

    if (settings.gps && settings.gps.enabled) {
      log("GPS", settings.gps);
      let modGps = function(dataProvider) {
        Bangle.getGPSFix = dataProvider;
        setInterval(() => {
          Bangle.sensortoolsOrigEmit("GPS", dataProvider());
        }, 1000);
      };
      if (settings.gps.power) {
        Bangle.sensortoolsOrigSetGPSPower = Bangle.setGPSPower;
        Bangle.setGPSPower = createPowerFunction(settings.gps.power, Bangle.sensortoolsOrigSetGPSPower);
      }
      if (settings.gps.mode == "emulate") {
        if (settings.gps.name == "staticfix") {
          modGps(() => { return {
            "lat": 52,
            "lon": 8,
            "alt": 100,
            "speed": 10,
            "course": 12,
            "time": Date.now(),
            "satellites": 7,
            "fix": 1,
            "hdop": 1
          };});
        } else if (settings.gps.name == "nofix") {
          modGps(() => { return {
            "lat": NaN,
            "lon": NaN,
            "alt": NaN,
            "speed": NaN,
            "course": NaN,
            "time": Date.now(),
            "satellites": 2,
            "fix": 0,
            "hdop": NaN
          };});
        } else if (settings.gps.name == "changingfix") {
          let currentSpeed=1;
          let currentLat=20;
          let currentLon=10;
          let currentCourse=10;
          let currentAlt=-100;
          let currentSats=5;
          modGps(() => {
            currentLat += 0.1;
            if (currentLat > 50) currentLat = 20;
            currentLon += 0.1;
            if (currentLon > 20) currentLon = 10;
            currentSpeed *= 10;
            if (currentSpeed > 1000) currentSpeed = 1;
            currentCourse += 12;
            if (currentCourse > 360) currentCourse -= 360;
            currentSats += 1;
            if (currentSats > 10) currentSats = 5;
            currentAlt *= 10;
            if (currentAlt > 1000) currentAlt = -100;
            return {
            "lat": currentLat,
            "lon": currentLon,
            "alt": currentAlt,
            "speed": currentSpeed,
            "course": currentCourse,
            "time": Date.now(),
            "satellites": currentSats,
            "fix": 1,
            "hdop": 1
          };});
        }
      }
    }

    if (settings.mag && settings.mag.enabled) {
      log("MAG", settings.mag);
      let modMag = function(data) {
        setInterval(() => {
          Bangle.getCompass = () => data;
          Bangle.sensortoolsOrigEmit("mag", data);
        }, 100);
      };
      if (settings.mag.power) {
        Bangle.sensortoolsOrigSetCompassPower = Bangle.setCompassPower;
        Bangle.setCompassPower = createPowerFunction(settings.mag.power, Bangle.sensortoolsOrigSetCompassPower);
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
