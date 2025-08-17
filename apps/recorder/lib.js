let storageFile; // file for GPS track
let writeSetup; // the interval for writing, or 'true' if using GPS
let writeSubSecs; // true if we should write .1s for time, otherwise round to nearest second

// A list of currently used recorders
exports.activeRecorders = [];


let loadSettings = function() {
  var settings = require("Storage").readJSON("recorder.json",1)||{};
  settings.period = settings.period||10;
  if (!settings.file || !settings.file.startsWith("recorder.log"))
    settings.recording = false;
  if (!settings.record)
    settings.record = ["gps"];
  return settings;
};

let updateSettings = function(settings) {
  require("Storage").writeJSON("recorder.json", settings);
};

// Load a new set of recorders (regardless of whether they are active or not)
exports.getRecorders = function() {
  var recorders = {
    gps:function() {
      var lat = 0;
      var lon = 0;
      var alt = 0;
      var samples = 0;
      var hasFix = 0;
      function onGPS(f) {
        hasFix = f.fix;
        if (!hasFix) return;
        lat += f.lat;
        lon += f.lon;
        alt += f.alt;
        samples++;
      }
      return {
        name : "GPS",
        fields : ["Latitude","Longitude","Altitude"],
        getValues : () => {
          var r = ["","",""];
          if (samples)
            r = [(lat/samples).toFixed(6),(lon/samples).toFixed(6),Math.round(alt/samples)];
          samples = 0; lat = 0; lon = 0; alt = 0;
          return r;
        },
        start : () => {
          hasFix = false;
          Bangle.on('GPS', onGPS);
          Bangle.setGPSPower(1,"recorder");
        },
        stop : () => {
          hasFix = false;
          Bangle.removeListener('GPS', onGPS);
          Bangle.setGPSPower(0,"recorder");
        },
        draw : (x,y) => g.setColor(hasFix?"#0f0":"#f88").drawImage(atob("DAwBEAKARAKQE4DwHkPqPRGKAEAA"),x,y)
      };
    },
    hrm:function() {
      var bpm = "", bpmConfidence = "", src="";
      function onHRM(h) {
        bpmConfidence = h.confidence;
        bpm = h.bpm;
        src = h.src;
      }
      return {
        name : "HR",
        fields : ["Heartrate", "Confidence", "Source"],
        getValues : () => {
          var r = [bpm,bpmConfidence,src];
          bpm = ""; bpmConfidence = ""; src="";
          return r;
        },
        start : () => {
          Bangle.on('HRM', onHRM);
          Bangle.setHRMPower(1,"recorder");
        },
        stop : () => {
          Bangle.removeListener('HRM', onHRM);
          Bangle.setHRMPower(0,"recorder");
        },
        draw : (x,y) => g.setColor(Bangle.isHRMOn()?"#f00":"#f88").drawImage(atob("DAwBAAAAMMeef+f+f+P8H4DwBgAA"),x,y)
      };
    },
    bat:function() {
      return {
        name : "BAT",
        fields : ["Battery Percentage", "Battery Voltage", "Charging"],
        getValues : () => {
          return [E.getBattery(), NRF.getBattery().toFixed(2), Bangle.isCharging()];
        },
        start : () => {
        },
        stop : () => {
        },
        draw : (x,y) => g.setColor(Bangle.isCharging() ? "#0f0" : "#ff0").drawImage(atob("DAwBAABgH4G4EYG4H4H4H4GIH4AA"),x,y)
      };
    },
    steps:function() {
      var lastSteps = 0;
      return {
        name : "Steps",
        fields : ["Steps"],
        getValues : () => {
          var c = Bangle.getStepCount(), r=[c-lastSteps];
          lastSteps = c;
          return r;
        },
        start : () => { lastSteps = Bangle.getStepCount(); },
        stop : () => {},
        draw : (x,y) => g.reset().drawImage(atob("DAwBAAMMeeeeeeeecOMMAAMMMMAA"),x,y)
      };
    },
    accel:function() {
      var ax=0,ay=0,az=0,n=0;
      function onAccel(a) {
        ax += a.x;
        ay += a.y;
        az += a.z;
        n++;
      }
      return {
        name : "Accel",
        fields : ["Accel X", "Accel Y", "Accel Z"],
        getValues : () => {
          if (n<1) n=1;
          var r = [(ax/n).toFixed(2), (ay/n).toFixed(2), (az/n).toFixed(2)];
          n = ax = ay = az = 0;
          return r;
        },
        start : () => { Bangle.on('accel', onAccel); },
        stop : () => { Bangle.removeListener('accel', onAccel); },
        draw : (x,y) => g.reset().drawImage(atob("DAwBAAMMeeeeeeeecOMMAAMMMMAA"),x,y)
      };
    }
  };
  if (Bangle.getPressure){
    recorders['baro'] = function() {
      var temp="",press="",alt="";
      function onPress(c) {
          temp=c.temperature.toFixed(1);
          press=c.pressure.toFixed(2);
          alt=c.altitude.toFixed(2);
      }
      return {
        name : "Baro",
        fields : ["Barometer Temperature", "Barometer Pressure", "Barometer Altitude"],
        getValues : () => {
            var r = [temp,press,alt];
            temp="";
            press="";
            alt="";
            return r;
        },
        start : () => {
          Bangle.setBarometerPower(1,"recorder");
          Bangle.on('pressure', onPress);
        },
        stop : () => {
          Bangle.setBarometerPower(0,"recorder");
          Bangle.removeListener('pressure', onPress);
        },
        draw : (x,y) => g.setColor("#0f0").drawImage(atob("DAwBAAH4EIHIEIHIEIHIEIEIH4AA"),x,y)
      };
    }
  }

  /* You can add new data items to record by creating a JS file on the Bangle named ending in `.recorder.js` that adds a new item
to the supplied `recorders` array. For example `foobar.recorder.js` could contain:

  (function(recorders) {
    recorders.foobar = {
      name : "Foobar",           // Name to appear in UIs
      fields : ["foobar"],       // Column headings to appear as header in recorded CSV data
      getValues : () => [123],   // Columns of data (length should match 'fields')
      start : () => {},          // Called when recording starts - turn on any hardware/intervals you need
      stop : () => {},           // Called when recording stops - turn off any hardware/intervals
      draw (x,y) => {}           // draw 12x12px status image at x,y on g
    }
  })
  */
  require("Storage").list(/^.*\.recorder\.js$/).forEach(fn=>eval(require("Storage").read(fn))(recorders));
  return recorders;
}

// Load a new list of recorders and return only the active ones
let getActiveRecorders = function(settings) {
  let activeRecorders = [];
  let recorders = exports.getRecorders();
  settings.record.forEach(r => {
    var recorder = recorders[r];
    if (!recorder) {
      console.log(/*LANG*/"Recorder for "+E.toJS(r)+/*LANG*/"+not found");
      return;
    }
    activeRecorders.push(recorder());
  });
  return activeRecorders;
};
let getCSVHeaders = activeRecorders => ["Time"].concat(activeRecorders.map(r=>r.fields));

// Write one line to the recorder storage file
let writeLog = function() {
  if (global.WIDGETS && WIDGETS["recorder"]) WIDGETS["recorder"].draw();
  try {
    var fields = [writeSubSecs?getTime().toFixed(1):Math.round(getTime())];
    exports.activeRecorders.forEach(recorder => fields.push.apply(fields,recorder.getValues()));
    if (storageFile) storageFile.write(fields.join(",")+"\n");
  } catch(e) {
    // If storage.write caused an error, disable
    // GPS recording so we don't keep getting errors!
    console.log("recorder: error", e);
    var settings = loadSettings();
    settings.recording = false;
    require("Storage").write("recorder.json", settings);
    exports.reload();
  }
}

// Called by the GPS app to reload settings and decide what to do
exports.reload = function(options) {
  options = options||{};
  var settings = loadSettings();
  if (typeof writeSetup === "number") clearInterval(writeSetup);
  writeSetup = undefined;
  Bangle.removeListener('GPS', writeLog);

  exports.activeRecorders.forEach(rec => rec.stop());
  exports.activeRecorders = [];
  if (settings.recording) {
    // set up recorders
    exports.activeRecorders = getActiveRecorders(settings);
    exports.activeRecorders.forEach(activeRecorder => {
      activeRecorder.start();
    });
    // open/create file
    if (require("Storage").list(settings.file).length) { // Append
      storageFile = require("Storage").open(settings.file,"a");
      // TODO: what if loaded modules are different??
    } else {
      storageFile = require("Storage").open(settings.file,"w");
      // New file - write headers
      storageFile.write(getCSVHeaders(exports.activeRecorders).join(",")+"\n");
    }
    // start recording...
    writeSubSecs = settings.period===1;
    if (settings.period===1 && settings.record.includes("gps")) {
      Bangle.on('GPS', writeLog);
      writeSetup = true;
    } else {
      writeSetup = setInterval(writeLog, settings.period*1000, settings.period);
    }
  } else {
    storageFile = undefined;
  }
  if (!options.noUpdateWidget && global.WIDGETS && WIDGETS["recorder"])
    exports.setWidgetWidth();
}

// Sets the width of WIDGETS["recorder"]
exports.setWidgetWidth = function() {
  WIDGETS["recorder"].width =
    exports.activeRecorders.length ?
      15 + ((exports.activeRecorders.length+1)>>1)*12 : // 12px per recorder
      0;
  Bangle.drawWidgets(); // relayout/redraw all widgets as we changed width
}

exports.setRecording = function(isOn, options) {
  /* options = {
    force : [optional] "append"/"new"/"overwrite" - don't ask, just do what's requested
  } */
  var settings = loadSettings();
  options = options||{};
  if (isOn && !settings.recording) {
    var date=(new Date()).toISOString().substr(0,10).replace(/-/g,""), trackNo=10;
    function getTrackFilename() { return "recorder.log" + date + trackNo.toString(36) + ".csv"; }
    if (!settings.file || !settings.file.startsWith("recorder.log" + date)) {
      // if no filename set or date different, set up a new filename
      settings.file = getTrackFilename();
    }
    var headers = require("Storage").open(settings.file,"r").readLine();
    if (headers){ // if file exists
      if(headers.trim()!==getCSVHeaders(getActiveRecorders(settings)).join(",")){
        // headers don't match, reset (#3081)
        options.force = "new";
      }
      if (!options.force) { // if not forced, ask the question
        g.reset(); // work around bug in 2v17 and earlier where bg color wasn't reset
        return E.showPrompt(
                  /*LANG*/"Overwrite\nLog " + settings.file.match(/^recorder\.log(.*)\.csv$/)[1] + "?",
                  { title:/*LANG*/"Recorder",
                    buttons:{/*LANG*/"Yes":"overwrite",/*LANG*/"No":"cancel",/*LANG*/"New":"new",/*LANG*/"Append":"append"}
                  }).then(selection=>{
          if (selection==="cancel") return false; // just cancel
          if (selection==="overwrite") return exports.setRecording(1,{force:"overwrite"});
          if (selection==="new") return exports.setRecording(1,{force:"new"});
          if (selection==="append") return exports.setRecording(1,{force:"append"});
          throw new Error("Unknown response!");
        });
      } else if (options.force=="append") {
        // do nothing, filename is the same - we are good
      } else if (options.force=="overwrite") {
        // wipe the file
        require("Storage").open(settings.file,"r").erase();
      } else if (options.force=="new") {
        // new file - use the current date
        var newFileName;
        do { // while a file exists, add one to the letter after the date
          newFileName = getTrackFilename();
          trackNo++;
        } while (require("Storage").list(newFileName).length);
        settings.file = newFileName;
      } else throw new Error("Unknown options.force, "+options.force);
    }
  }
  settings.recording = !!isOn;
  updateSettings(settings);
  exports.reload();
  return Promise.resolve(settings.recording);
};

/* Plots the current track in the currently set color.
  options can be {
    async: if true, plots the path a bit at a time - returns an object with a 'stop' function to stop
    callback: a function to call back when plotting is finished
  }
  */
exports.plotTrack = function(m, options) { // m=instance of openstmap module
  options = options||{};
  var settings = loadSettings();
  if (!settings.file) return; // no file specified
  // keep function to draw track in RAM
  function plot(g) { "ram";
    var f = require("Storage").open(settings.file,"r");
    var l = f.readLine();
    if (l===undefined) return; // empty file?
    var mp, c = l.split(",");
    var la=c.indexOf("Latitude"),lo=c.indexOf("Longitude");
    if (la<0 || lo<0) return; // no GPS!
    l = f.readLine();c=[];
    while (l && !c[la]) {
      c = l.split(",");
      l = f.readLine(f);
    }
    var asyncTimeout;
    var color = g.getColor();
    function plotPartial() {
      asyncTimeout = undefined;
      if (l===undefined) return; // empty file?
      mp = m.latLonToXY(+c[la], +c[lo]);
      g.moveTo(mp.x,mp.y).setColor(color);
      l = f.readLine(f);
      var n = options.async ? 10 : 200; // only plot first 200 points to keep things fast(ish)
      while(l && n--) {
        c = l.split(",");
        if (c[la]) {
          mp = m.latLonToXY(+c[la], +c[lo]);
          g.lineTo(mp.x,mp.y);
        }
        l = f.readLine(f);
      }
      if (options.async && n<0)
        asyncTimeout = setTimeout(plotPartial, 20);
      else if (options.callback) options.callback();
    }
    plotPartial();
    if (options.async) return {
      stop : function() {
        if (asyncTimeout) clearTimeout(asyncTimeout);
        asyncTimeout = undefined;
        if (options.callback) options.callback();
      }
    };
  }
  return plot(g);
};

exports.isRecording = function() {
  return !!writeSetup;
};

exports.reload({noUpdateWidget:true});