exports.enable = () => {
  let settings = Object.assign(
    require('Storage').readJSON("sensortools.default.json", true) || {},
    require('Storage').readJSON("sensortools.json", true) || {}
  );

  let log = function(text, param) {
    if (!settings.log) return;
    let logline = new Date().toISOString() + " - " + "Sensortools - " + text;
    if (param) logline += ": " + JSON.stringify(param);
    print(logline);
  };
  
  log("Enabled");
  const POWER_DELAY = 10000;

  let onEvents = [];

  Bangle.sensortoolsOrigOn = Bangle.on;
  Bangle.sensortoolsOrigEmit = Bangle.emit;
  Bangle.sensortoolsOrigRemoveListener = Bangle.removeListener;

  const modifyArguments = function(args, value) {
    if (args.length >= 1)
      args[0] = value;
    return args;
  };

  Bangle.on = function(name, callback) {
    if (onEvents[name]) {
      log("Redirecting listener for", name, "to", name + "_mod");
      let origName = name;    
      Bangle.sensortoolsOrigOn(origName, (e) => {
        log("Redirected event for", origName, "to", origName + "_mod");
        Bangle.sensortoolsOrigEmit(origName + "_mod", onEvents[origName](e));
      });
      Bangle.sensortoolsOrigOn.apply(this, modifyArguments(arguments, name + "_mod"));
    } else {
      log("Pass through on call for", name, callback);
      Bangle.sensortoolsOrigOn.apply(this, arguments);
    }
  };

  Bangle.removeListener = function(name) {
    if (onEvents[name]) {
      log("Removing augmented listener for", name, onEvents[name]);
      Bangle.sensortoolsOrigRemoveListener.apply(this, modifyArguments(arguments, name + "_mod"));
    } else {
      log("Pass through remove listener for", name);
      Bangle.sensortoolsOrigRemoveListener.apply(this, arguments);
    }
  };

  Bangle.emit = function(name) {
    if (onEvents[name]) {
      log("Augmenting emit call for", name, onEvents[name]);
      Bangle.sensortoolsOrigEmit.apply(this, modifyArguments(arguments, name + "_mod"));
    } else {
      log("Pass through emit call for", name);
      Bangle.sensortoolsOrigEmit.apply(this, arguments);
    }
  };

  let createPowerFunction = function(type, name, origPower) {
    return function(isOn, app) {
      if (type == "nop") {
        return true;
      }else if (type == "delay") {
        setTimeout(() => {
          origPower(isOn, app);
        }, POWER_DELAY);
      } else if (type == "on") {
        origPower(1, "sensortools_force_on");
      } else if (type == "passthrough"){
        origPower(isOn, "app");
      } else if (type == "emulate"){
        if (!Bangle._PWR) Bangle._PWR={};
        if (!Bangle._PWR[name]) Bangle._PWR[name] = [];
        if (!app) app="?";
        if (isOn) {
          Bangle._PWR[name].push(app);
          return true;
        } else {
          Bangle._PWR[name] = Bangle._PWR[name].filter((v)=>{return v == app;});
          return false;
        }
      }
    };
  };

  if (settings.hrm && settings.hrm.enabled) {
    log("HRM", settings.hrm);
    if (settings.hrm.power) {
      log("HRM power");
      Bangle.sensortoolsOrigSetHRMPower = Bangle.setHRMPower;
      Bangle.setHRMPower = createPowerFunction(settings.hrm.power, "HRM", Bangle.sensortoolsOrigSetHRMPower);
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
      Bangle.setGPSPower = createPowerFunction(settings.gps.power, "GPS", Bangle.sensortoolsOrigSetGPSPower);
    }
    if (settings.gps.mode == "emulate") {
          function radians(a) {
            return a*Math.PI/180;
          }

          function degrees(a) {
            let d = a*180/Math.PI;
            return (d+360)%360;
          }

          function bearing(a,b){
            if (!a || !b || !a.lon || !a.lat || !b.lon || !b.lat) return Infinity;
            let delta = radians(b.lon-a.lon);
            let alat = radians(a.lat);
            let blat = radians(b.lat);
            let y = Math.sin(delta) * Math.cos(blat);
            let x = Math.cos(alat)*Math.sin(blat) -
                  Math.sin(alat)*Math.cos(blat)*Math.cos(delta);
            return Math.round(degrees(Math.atan2(y, x)));
          }
      
          function interpolate(a,b,progress){
            return {
              lat: b.lat * progress + a.lat * (1-progress),
              lon: b.lon * progress + a.lon * (1-progress),
              alt: b.alt * progress + a.alt * (1-progress)
            }
          }
          
          function getSquareRoute(){
            return [
              {lat:47.2577411,lon:11.9927442,alt:2273},
              {lat:47.266761,lon:11.9926673,alt:2166},
              {lat:47.2667605,lon:12.0059511,alt:2245},
              {lat:47.2577516,lon:12.0059925,alt:1994}
            ];
          }
          function getSquareRouteFuzzy(){
            return [
              {lat:47.2578455,lon:11.9929891,alt:2265},
              {lat:47.258592,lon:11.9923341,alt:2256},
              {lat:47.2594506,lon:11.9927412,alt:2230},
              {lat:47.2603323,lon:11.9924949,alt:2219},
              {lat:47.2612056,lon:11.9928175,alt:2199},
              {lat:47.2621002,lon:11.9929817,alt:2182},
              {lat:47.2629025,lon:11.9923915,alt:2189},
              {lat:47.2637828,lon:11.9926486,alt:2180},
              {lat:47.2646733,lon:11.9928167,alt:2191},
              {lat:47.2655617,lon:11.9930357,alt:2185},
              {lat:47.2662862,lon:11.992252,alt:2186},
              {lat:47.2669305,lon:11.993173,alt:2166},
              {lat:47.266666,lon:11.9944419,alt:2171},
              {lat:47.2667579,lon:11.99576,alt:2194},
              {lat:47.2669409,lon:11.9970579,alt:2207},
              {lat:47.2666562,lon:11.9983128,alt:2212},
              {lat:47.2666027,lon:11.9996335,alt:2262},
              {lat:47.2667245,lon:12.0009395,alt:2278},
              {lat:47.2668457,lon:12.002256,alt:2297},
              {lat:47.2666126,lon:12.0035373,alt:2303},
              {lat:47.2664554,lon:12.004841,alt:2251},
              {lat:47.2669461,lon:12.005948,alt:2245},
              {lat:47.2660877,lon:12.006323,alt:2195},
              {lat:47.2652729,lon:12.0057552,alt:2163},
              {lat:47.2643926,lon:12.0060123,alt:2131},
              {lat:47.2634978,lon:12.0058302,alt:2095},
              {lat:47.2626129,lon:12.0060759,alt:2066},
              {lat:47.2617325,lon:12.0058188,alt:2037},
              {lat:47.2608668,lon:12.0061784,alt:1993},
              {lat:47.2600155,lon:12.0057392,alt:1967},
              {lat:47.2591203,lon:12.0058233,alt:1949},
              {lat:47.2582307,lon:12.0059718,alt:1972},
              {lat:47.2578014,lon:12.004804,alt:2011},
              {lat:47.2577232,lon:12.0034834,alt:2044},
              {lat:47.257745,lon:12.0021656,alt:2061},
              {lat:47.2578682,lon:12.0008597,alt:2065},
              {lat:47.2577082,lon:11.9995526,alt:2071},
              {lat:47.2575917,lon:11.9982348,alt:2102},
              {lat:47.2577401,lon:11.996924,alt:2147},
              {lat:47.257715,lon:11.9956061,alt:2197},
              {lat:47.2578996,lon:11.9943081,alt:2228}
            ];
          }
      
      if (settings.gps.name == "staticfix") {
        modGps(() => { return {
          "lat": 52,
          "lon": 8,
          "alt": 100,
          "speed": 10,
          "course": 12,
          "time": new Date(),
          "satellites": 7,
          "fix": 1,
          "hdop": 1
        };});
      } else if (settings.gps.name.includes("route")) {
        let route;
        let interpSteps;
        if (settings.gps.name == "routeFuzzy"){
          route = getSquareRouteFuzzy();
          interpSteps = 74;
        } else {
          route = getSquareRoute();
          interpSteps = 740;
        }

        let step = 0;
        let routeIndex = 0;
        modGps(() => {
          let newIndex = (routeIndex + 1)%route.length;
          let followingIndex = (routeIndex + 2)%route.length;

          let result = {
            "speed": Math.random()*1 + 4.5,
            "time": new Date(),
            "satellites": Math.floor(Math.random()*5)+3,
            "fix": 1,
            "hdop": Math.floor(Math.random(30)+1)
          };

          let oldPos = route[routeIndex];
          let newPos = route[newIndex];
          let followingPos = route[followingIndex];
          let interpPos = interpolate(oldPos, newPos, E.clip(0,1,step/interpSteps));

          if (step > 0.5* interpSteps) {
          result.course = bearing(interpPos, interpolate(newPos, followingPos, E.clip(0,1,(step-0.5*interpSteps)/interpSteps)));
          } else {
            result.course = bearing(oldPos, newPos);
          }

          step++;
          if (step == interpSteps){
            routeIndex = (routeIndex + 1) % route.length;
            step = 0;
          }
          return Object.assign(result, interpPos);
        });
      } else if (settings.gps.name == "nofix") {
        modGps(() => { return {
          "lat": NaN,
          "lon": NaN,
          "alt": NaN,
          "speed": NaN,
          "course": NaN,
          "time": new Date(),
          "satellites": 2,
          "fix": 0,
          "hdop": NaN
        };});
      } else if (settings.gps.name == "changingfix") {
        let currentSpeed=1;
        let currentLat=20;
        let currentLon=10;
        let currentCourse=10;
        let currentDir=1000;
        let currentAlt=500;
        let currentSats=5;
        
        modGps(() => {
          currentLat += 0.01;
          if (currentLat > 50) currentLat = 20;
          currentLon += 0.01;
          if (currentLon > 20) currentLon = 10;
          currentSpeed *= 10;
          if (currentSpeed > 1000) currentSpeed = 1;
          currentCourse += 12;
          if (currentCourse > 360) currentCourse -= 360;
          currentSats += 1;
          if (currentSats > 10) currentSats = 5;
          currentAlt += currentDir;
          if (currentAlt > 20000) currentDir = -2000;
          if (currentAlt < -2000) currentDir = 2000;
          return {
          "lat": currentLat,
          "lon": currentLon,
          "alt": currentAlt,
          "speed": currentSpeed,
          "course": currentCourse,
          "time": new Date(),
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
        Bangle.getCompass = data;
        Bangle.sensortoolsOrigEmit("mag", data());
      }, 100);
    };
    if (settings.mag.power) {
      Bangle.sensortoolsOrigSetCompassPower = Bangle.setCompassPower;
      Bangle.setCompassPower = createPowerFunction(settings.mag.power, "Compass", Bangle.sensortoolsOrigSetCompassPower);
    }
    if (settings.mag.mode == "emulate") {
      if (settings.mag.name == "static") {
        modMag(()=>{return {
          x: 1,
          y: 1,
          z: 1,
          dx: 1,
          dy: 1,
          dz: 1,
          heading: 0
        };});
      } else if (settings.mag.name == "rotate"){
        let last = 0;
        modMag(()=>{return {
          x: 1,
          y: 1,
          z: 1,
          dx: 1,
          dy: 1,
          dz: 1,
          heading: last = (last+1)%360,
        };});
      }
    }
  }
};
