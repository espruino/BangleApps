var uart; // require("ble_uart")
var device; // BluetoothDevice
var uploadTimeout; // a timeout used during upload - if we disconnect, kill this
Bangle.loadWidgets();

var json = require("Storage").readJSON("espruinoprog.json",1);
/*var json = { // for example
  namePrefix : "Puck.js ",
  code : "E.setBootCode('digitalPulse(LED2,1,100);')",
  post : "LED.set();NRF.sleep()",
};*/

if ("object" != typeof json) {
  E.showAlert("JSON not found","Programmer").then(() => load());
  throw new Error("JSON not found");
  // stops execution
}

// Set up terminal
var R = Bangle.appRect;
var termg = Graphics.createArrayBuffer(R.w, R.h, 1, {msb:true});
termg.setFont("6x8");
var term;

function showTerminal() {
  E.showMenu(); // clear anything that was drawn
  if (term) term.print(""); // redraw terminal
}

function scanAndConnect() {
  termg.clear();
  term = require("VT100").connect(termg, {
    charWidth : 6,
    charHeight : 8
  });
  term.print = str => {
    for (var i of str) term.char(i);
    g.reset().drawImage(termg,R.x,R.y);
  };
  term.print(`\r\nScanning...\r\n`);
  NRF.requestDevice({ filters: [{ namePrefix: json.namePrefix }] }).then(function(dev) {
    term.print(`Found ${dev.name||dev.id.substr(0,17)}\r\n`);
    device = dev;

    term.print(`Connect to ${dev.name||dev.id.substr(0,17)}...\r\n`);
    device.removeAllListeners();
    device.on('gattserverdisconnected', function(reason) {
      if (!uart) return;
      term.print(`\r\nDISCONNECTED (${reason})\r\n`);
      uart = undefined;
      device = undefined;
      if (uploadTimeout) clearTimeout(uploadTimeout);
      uploadTimeout = undefined;
      setTimeout(scanAndConnect, 1000);
    });
    require("ble_uart").connect(device).then(function(u) {
      uart = u;
      term.print("Connected...\r\n");
      uart.removeAllListeners();
      uart.on('data', function(d) { term.print(d); });
      term.print("Upload initial...\r\n");
      uart.write((json.pre||"")+"\n").then(() => {
        term.print("\r\Done.\r\n");
        uploadTimeout = setTimeout(function() {
          uploadTimeout = undefined;
          term.print("\r\nUpload Code...\r\n");
          uart.write((json.code||"")+"\n").then(() => {
            term.print("\r\Done.\r\n");
            // main upload completed - wait a bit
            uploadTimeout = setTimeout(function() {
              uploadTimeout = undefined;
              term.print("\r\Upload final...\r\n");
              // now upload the code to run after...
              uart.write((json.post||"")+"\n").then(() => {
                term.print("\r\nDone.\r\n");
                // now wait and disconnect (if not already done!)
                uploadTimeout = setTimeout(function() {
                  uploadTimeout = undefined;
                  term.print("\r\nDisconnecting...\r\n");
                  if (uart) uart.disconnect();
                }, 500);
              });
            }, 2000);
          });
        }, 2000);
      });
    });
  }).catch(err => {
    if (err.toString().startsWith("No device found")) {
      // expected - try again
      scanAndConnect();
    } else
      term.print(`\r\ERROR ${err.toString()}\r\n`);
  });
}

// now start
Bangle.drawWidgets();
showTerminal();
scanAndConnect();
