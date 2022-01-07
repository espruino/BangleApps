(() => {
  var storageFile; // file for GPS track
  var entriesWritten = 0;
  var activeRecorders = [];
  var writeInterval;

  function loadSettings() {
    var settings = require("Storage").readJSON("recorder.json",1)||{};
    settings.period = settings.period||10;
    if (!settings.file || !settings.file.startsWith("recorder.log"))
      settings.recording = false;
    return settings;
  }

  function getRecorders() {
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
        var bpm = 0, bpmConfidence = 0;
        function onHRM(h) {
          if (h.confidence >= bpmConfidence) {
            bpmConfidence = h.confidence;
            bpm = h.bpm;
          }
        }
        return {
          name : "HR",
          fields : ["Heartrate", "Confidence"],
          getValues : () => {
            var r = [bpm,bpmConfidence];
            bpm = 0; bpmConfidence = 0;
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
      temp:function() {
        var core = 0, skin = 0;
        var hasCore = false;
        function onCore(c) {
            core=c.core;
            skin=c.skin;
            hasCore = true;
        }
        return {
          name : "Core",
          fields : ["Core","Skin"],
          getValues : () => {
            var r = [core,skin];
            return r;
          },
          start : () => {
            hasCore = false;
            Bangle.on('CoreTemp', onCore);
          },
          stop : () => {
            hasCore = false;
            Bangle.removeListener('CoreTemp', onCore);
          },
          draw : (x,y) => g.setColor(hasCore?"#0f0":"#8f8").drawImage(atob("DAwBAAAOAKPOfgZgZgZgZgfgPAAA"),x,y)
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
      // TODO: recAltitude from pressure sensor
    };
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

  function writeLog() {
    entriesWritten++;
    WIDGETS["recorder"].draw();
    try {
      var fields = [Math.round(getTime())];
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
  function reload() {
    var settings = loadSettings();
    if (writeInterval) clearInterval(writeInterval);
    writeInterval = undefined;

    activeRecorders.forEach(rec => rec.stop());
    activeRecorders = [];
    entriesWritten = 0;

    if (settings.recording) {
      // set up recorders
      var recorders = getRecorders(); // TODO: order??
      settings.record.forEach(r => {
        var recorder = recorders[r];
        if (!recorder) {
          console.log("Recorder for "+E.toJS(r)+"+not found");
          return;
        }
        var activeRecorder = recorder();
        activeRecorder.start();
        activeRecorders.push(activeRecorder);
        // TODO: write field names?
      });
      WIDGETS["recorder"].width = 15 + ((activeRecorders.length+1)>>1)*12; // 12px per recorder
      // open/create file
      if (require("Storage").list(settings.file).length) { // Append
        storageFile = require("Storage").open(settings.file,"a");
        // TODO: what if loaded modules are different??
      } else {
        storageFile = require("Storage").open(settings.file,"w");
        // New file - write headers
        var fields = ["Time"];
        activeRecorders.forEach(recorder => fields.push.apply(fields,recorder.fields));
        storageFile.write(fields.join(",")+"\n");
      }
      // start recording...
      WIDGETS["recorder"].draw();
      writeInterval = setInterval(writeLog, settings.period*1000);
    } else {
      WIDGETS["recorder"].width = 0;
      storageFile = undefined;
    }
  }
  // add the widget
  WIDGETS["recorder"]={area:"tl",width:0,draw:function() {
    if (!writeInterval) return;
    g.reset();    g.drawImage(atob("DRSBAAGAHgDwAwAAA8B/D/hvx38zzh4w8A+AbgMwGYDMDGBjAA=="),this.x+1,this.y+2);
    activeRecorders.forEach((recorder,i)=>{
      recorder.draw(this.x+15+(i>>1)*12, this.y+(i&1)*12);
    });
  },getRecorders:getRecorders,reload:function() {
    reload();
    Bangle.drawWidgets(); // relayout all widgets
  },setRecording:function(isOn) {
    var settings = loadSettings();
    if (isOn && !settings.recording && require("Storage").list(settings.file).length)
      return E.showPrompt("Overwrite\nLog 0?",{title:"Recorder",buttons:{Yes:"yes",No:"no"}}).then(selection=>{
        if (selection=="no") return false; // just cancel
        if (selection=="yes") require("Storage").open(settings.file,"r").erase();
        // TODO: Add 'new file' option
        return WIDGETS["recorder"].setRecording(1);
      });
    settings.recording = isOn;
    require("Storage").write("recorder.json", settings);
    WIDGETS["recorder"].reload();
    return Promise.resolve(settings.recording);
  }/*,plotTrack:function(m) { // m=instance of openstmap module
    // if we're here, settings was already loaded
    var f = require("Storage").open(settings.file,"r");
    var l = f.readLine(f);
    if (l===undefined) return;
    var c = l.split(",");
    var mp = m.latLonToXY(+c[1], +c[2]);
    g.moveTo(mp.x,mp.y);
    l = f.readLine(f);
    while(l!==undefined) {
      c = l.split(",");
      mp = m.latLonToXY(+c[1], +c[2]);
      g.lineTo(mp.x,mp.y);
      g.fillCircle(mp.x,mp.y,2); // make the track more visible
      l = f.readLine(f);
    }
  }*/};
  // load settings, set correct widget width
  reload();
})()
