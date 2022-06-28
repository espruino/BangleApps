var _GB = global.GB;
var counter = 0;

function GB(msg) {
  console.log(msg);
  if (msg.t == "http") {
    display("Received", "(" + msg.resp.length + ") Touch to apply", () => {
      display("Apply data..", "");
      setTimeout(() => {
        if (setAGPS(msg.resp)) {
          display("Success", "Touch for restart", httpTest);
        }
        else {
          display("Error", "Touch for restart", httpTest);
        }
      }, 1);
    });
  }
  if (_GB) {
    _GB(msg);
  }
}

function setAGPS(data) {
  var js = jsFromBase64(data);
  console.log(js);
  try {
    eval(js);
    return true;
  }
  catch(e) {
    console.log("Error:", e);
  }
  return false;
}

function jsFromBase64(b64) {
  var bin = atob(b64);
  var chunkSize = 128;
  var js = "Bangle.setGPSPower(1);\n"; // turn GPS on
  var gnss_select="1";
  js += `Serial1.println("${CASIC_CHECKSUM("$PCAS04,"+gnss_select)}")\n`; // set GNSS mode
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

function display(text1, text2, next) {
  g.reset();
  g.clear();
  var img = require("Storage").read("agpsdata.img");
  if (img) {
    g.drawImage(img, g.getWidth() - 48, g.getHeight()-48-24);
  }
  g.setFont("Vector", 30);
  g.setFontAlign(0, 1);
  g.drawString(text1, g.getWidth() / 2, g.getHeight() / 3 + 24);
  g.setFont("Vector", 15);
  g.setFontAlign(-1, -1);
  g.drawString(text2, 0, g.getHeight() / 3 + 29);
  Bangle.drawWidgets();
  nextStep = null;
  if (next) {
    nextStep = next;
  }
}

function httpTest() {
  counter++;  
  display("AGPS Data", "Touch for start", () => {
    display("Request...", "Touch for restart", httpTest);
    if (Bluetooth.println) {
      console.log("On device");
      Bluetooth.println(JSON.stringify({t:"info", msg:"HTTP Request"}));
      Bluetooth.println(JSON.stringify({t:"http", url:"https://www.espruino.com/agps/casic.base64"}));
    }
    else {
      console.log("Testing on Emulator");
      setTimeout(() => {
        GB({t:"http", resp:testData});
      }, 1);
    }
  });
}

var nextStep = null;

Bangle.on("touch", () => {
  if (nextStep) {
    nextStep();
  }
});

httpTest();

// Show launcher when middle button pressed
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();


/*
require("Storage").write("httptest.info",{
  "id":"httptest",
  "name":"Http Test",
  "src":"httptest.js",
  "icon":"wristlight.img"
});
*/

var testData = "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";
