function readSettings() {
  settings = Object.assign(
      require('Storage').readJSON("agpsdata.default.json", true) || {},
      require('Storage').readJSON(FILE, true) || {});
}

var FILE = "agpsdata.settings.json";
var settings;
readSettings();

function setAGPS(b64) {
  return new Promise(function(resolve, reject) {
    const gnsstype = settings.gnsstype || 1;       // default GPS
    // What about:
    // NAV-TIMEUTC (0x01 0x10)
    // NAV-PV (0x01 0x03)
    // or AGPS.zip uses AID-INI (0x0B 0x01)
    Bangle.setGPSPower(1,"agpsdata"); // turn GPS on
    Serial1.println(CASIC_CHECKSUM("$PCAS04," + gnsstype)); // set GNSS mode

    try {
      writeChunks(atob(b64), ()=>{
        setTimeout(()=>{
          Bangle.setGPSPower(0,"agpsdata");
          resolve();
        }, 1000);
      });
    } catch (e) {
      console.log("error:", e);
      Bangle.setGPSPower(0,"agpsdata");
      reject();
    }
  });
}

var chunkI = 0;
function writeChunks(bin, resolve) {
  return new Promise(function(resolve2) {
    const chunkSize = 128;
    setTimeout(function() {
      if (chunkI < bin.length) {
        var chunk = bin.substr(chunkI, chunkSize);
        Serial1.write(atob(btoa(chunk)));
        
        chunkI += chunkSize;
        writeChunks(bin, resolve);
      } else {
        if (resolve)
          resolve(); // call outer resolve
      }
    }, 200);
  });
}

function CASIC_CHECKSUM(cmd) {
  var cs = 0;
  for (var i = 1; i < cmd.length; i++)
    cs = cs ^ cmd.charCodeAt(i);
  return cmd + "*" + cs.toString(16).toUpperCase().padStart(2, '0');
}

function updateLastUpdate() {
  const file = "agpsdata.json";
  let data = require("Storage").readJSON(file, 1) || {};
  data.lastUpdate = Math.round(Date.now());
  require("Storage").writeJSON(file, data);
}

exports.pull = function(successCallback, failureCallback) {
  const uri = "https://www.espruino.com/agps/casic.base64";
  if (Bangle.http) {
    Bangle.http(uri, {timeout : 10000})
        .then(event => {
          setAGPS(event.resp)
              .then(r => {
                updateLastUpdate();
                if (successCallback)
                  successCallback();
              })
              .catch((e) => {
                console.log("error", e);
                if (failureCallback)
                  failureCallback(e);
              });
        })
        .catch((e) => {
          console.log("error", e);
          if (failureCallback)
            failureCallback(e);
        });
  } else {
    console.log("error: No http method found");
    if (failureCallback)
      failureCallback(/*LANG*/ "No http method");
  }
};
