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
    var initCommands = "Bangle.setGPSPower(1);\n"; // turn GPS on
    const gnsstype = settings.gnsstype || 1;       // default GPS
    initCommands += `Serial1.println("${CASIC_CHECKSUM("$PCAS04," + gnsstype)}")\n`; // set GNSS mode
    // What about:
    // NAV-TIMEUTC (0x01 0x10)
    // NAV-PV (0x01 0x03)
    // or AGPS.zip uses AID-INI (0x0B 0x01)

    eval(initCommands);

    try {
      writeChunks(atob(b64), resolve);
    } catch (e) {
      console.log("error:", e);
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
        js = `Serial1.write(atob("${btoa(chunk)}"))\n`;
        eval(js);

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
