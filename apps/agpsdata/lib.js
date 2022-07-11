function readSettings() {
  settings = Object.assign(
      require('Storage').readJSON("agpsdata.default.json", true) || {},
      require('Storage').readJSON(FILE, true) || {});
}

var FILE = "agpsdata.settings.json";
var settings;
readSettings();

function setAGPS(data) {
  var js = jsFromBase64(data);
  try {
    eval(js);
    return true;
  }
  catch(e) {
    console.log("error:", e);
  }
  return false;
}

function jsFromBase64(b64) {
  var bin = atob(b64);
  var chunkSize = 128;
  var js = "Bangle.setGPSPower(1);\n"; // turn GPS on
  var gnsstype = settings.gnsstype || 1; // default GPS
  js += `Serial1.println("${CASIC_CHECKSUM("$PCAS04,"+gnsstype)}")\n`; // set GNSS mode
  // What about:
  // NAV-TIMEUTC (0x01 0x10)
  // NAV-PV (0x01 0x03)
  // or AGPS.zip uses AID-INI (0x0B 0x01)

  for (var i=0;i<bin.length;i+=chunkSize) {
    var chunk = bin.substr(i,chunkSize);
    js += `Serial1.write(atob("${btoa(chunk)}"))\n`;
  }
  return js;
}

function CASIC_CHECKSUM(cmd) {
  var cs = 0;
  for (var i=1;i<cmd.length;i++)
    cs = cs ^ cmd.charCodeAt(i);
  return cmd+"*"+cs.toString(16).toUpperCase().padStart(2, '0');
}

function updateLastUpdate() {
  const file = "agpsdata.json";
  let data = require("Storage").readJSON(file, 1) || {};
  data.lastUpdate = Math.round(Date.now());
  require("Storage").writeJSON(file, data);
}

exports.pull = function(successCallback, failureCallback) {
  let uri = "https://www.espruino.com/agps/casic.base64";
  if (Bangle.http){
    Bangle.http(uri, {timeout:10000}).then(event => {
      let result = setAGPS(event.resp);
      if (result) {
          updateLastUpdate();
          if (successCallback) successCallback();
      } else {
          console.log("error applying AGPS data");
          if (failureCallback) failureCallback("Error applying AGPS data");
      }
    }).catch((e)=>{
      console.log("error", e);
      if (failureCallback) failureCallback(e);
    });
  } else {
    console.log("error: No http method found");
    if (failureCallback) failureCallback(/*LANG*/"No http method");
  }
};
