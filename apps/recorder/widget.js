{
  let storageFile; // file for GPS track
  let activeRecorders = [];
  let writeSetup; // the interval for writing, or 'true' if using GPS
  let writeSubSecs; // true if we should write .1s for time, otherwise round to nearest second

  let loadSettings = function() {
    var settings = require("Storage").readJSON("recorder.json",1)||{};
    settings.period = settings.period||10;
    if (!settings.file || !settings.file.startsWith("recorder.log"))
      settings.recording = false;
    if (!settings.record)
      settings.record = ["gps"];
    return settings;
  }

  let updateSettings = function(settings) {
    require("Storage").writeJSON("recorder.json", settings);
    if (WIDGETS["recorder"]) WIDGETS["recorder"].reload();
  }

  let getRecorders = function() {
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
            return [E.getBattery(), NRF.getBattery(), Bangle.isCharging()];
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
      }
    };
    if (Bangle.getPressure){
      recorders['baro'] = function() {
        var temp="",press="",alt="";
        function onPress(c) {
            temp=c.temperature;
            press=c.pressure;
            alt=c.altitude;
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

    /* eg. foobar.recorder.js
    (function(recorders) {
      recorders.foobar = {
        name : "Foobar",
        fields : ["foobar"],
        getValues : () => [123],
        start : () => {},
        stop : () => {},
        draw (x,y) => {} // draw 12x12px status image
      }
    })
    */
    require("Storage").list(/^.*\.recorder\.js$/).forEach(fn=>eval(require("Storage").read(fn))(recorders));
    return recorders;
  }

  let getActiveRecorders = function(settings) {
    let activeRecorders = [];
    let recorders = getRecorders();
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

  let writeLog = function() {
    WIDGETS["recorder"].draw();
    try {
      var fields = [writeSubSecs?getTime().toFixed(1):Math.round(getTime())];
      activeRecorders.forEach(recorder => fields.push.apply(fields,recorder.getValues()));
      if (storageFile) storageFile.write(fields.join(",")+"\n");
    } catch(e) {
      // If storage.write caused an error, disable
      // GPS recording so we don't keep getting errors!
      console.log("recorder: error", e);
      var settings = loadSettings();
      settings.recording = false;
      require("Storage").write("recorder.json", settings);
      reload();
    }
  }

  // Called by the GPS app to reload settings and decide what to do
  let reload = function() {
    var settings = loadSettings();
    if (typeof writeSetup === "number") clearInterval(writeSetup);
    writeSetup = undefined;
    Bangle.removeListener('GPS', writeLog);

    activeRecorders.forEach(rec => rec.stop());
    activeRecorders = [];

    if (settings.recording) {
      // set up recorders
      activeRecorders = getActiveRecorders(settings);
      activeRecorders.forEach(activeRecorder => {
        activeRecorder.start();
      });
      WIDGETS["recorder"].width = 15 + ((activeRecorders.length+1)>>1)*12; // 12px per recorder
      // open/create file
      if (require("Storage").list(settings.file).length) { // Append
        storageFile = require("Storage").open(settings.file,"a");
        // TODO: what if loaded modules are different??
      } else {
        storageFile = require("Storage").open(settings.file,"w");
        // New file - write headers
        storageFile.write(getCSVHeaders(activeRecorders).join(",")+"\n");
      }
      // start recording...
      WIDGETS["recorder"].draw();
      writeSubSecs = settings.period===1;
      if (settings.period===1 && settings.record.includes("gps")) {
        Bangle.on('GPS', writeLog);
        writeSetup = true;
      } else {
        writeSetup = setInterval(writeLog, settings.period*1000, settings.period);
      }
    } else {
      WIDGETS["recorder"].width = 0;
      storageFile = undefined;
    }
  }
  // add the widget
  WIDGETS["recorder"]={area:"tl",width:0,draw:function() {
    if (!writeSetup) return;
    g.reset().drawImage(atob("DRSBAAGAHgDwAwAAA8B/D/hvx38zzh4w8A+AbgMwGYDMDGBjAA=="),this.x+1,this.y+2);
    activeRecorders.forEach((recorder,i)=>{
      recorder.draw(this.x+15+(i>>1)*12, this.y+(i&1)*12);
    });
  },getRecorders:getRecorders,reload:function() {
    reload();
    Bangle.drawWidgets(); // relayout all widgets
  },isRecording:function() {
    return !!writeSetup;
  },setRecording:function(isOn, options) {
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
            if (selection==="overwrite") return WIDGETS["recorder"].setRecording(1,{force:"overwrite"});
            if (selection==="new") return WIDGETS["recorder"].setRecording(1,{force:"new"});
            if (selection==="append") return WIDGETS["recorder"].setRecording(1,{force:"append"});
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
    settings.recording = isOn;
    updateSettings(settings);
    WIDGETS["recorder"].reload();
    return Promise.resolve(settings.recording);
  },plotTrack:function(m, options) { // m=instance of openstmap module
    /* Plots the current track in the currently set color.
      options can be {
        async: if true, plots the path a bit at a time - returns an object with a 'stop' function to stop
        callback: a function to call back when plotting is finished
      }
     */
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
  }};
  // load settings, set correct widget width
  reload();
}
