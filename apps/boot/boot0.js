// This ALWAYS runs at boot
E.setFlags({pretokenise:1});
// Load settings...
var s = require('Storage').readJSON('setting.json',1)||{};
if (s.ble!==false) {
  if (s.HID) { // Human interface device
    if (s.HID=="joy") Bangle.HID = E.toUint8Array(atob("BQEJBKEBCQGhAAUJGQEpBRUAJQGVBXUBgQKVA3UBgQMFAQkwCTEVgSV/dQiVAoECwMA="));
    else if (s.HID=="kb") Bangle.HID = E.toUint8Array(atob("BQEJBqEBBQcZ4CnnFQAlAXUBlQiBApUBdQiBAZUFdQEFCBkBKQWRApUBdQORAZUGdQgVACVzBQcZAClzgQAJBRUAJv8AdQiVArECwA=="));
    else /*kbmedia*/Bangle.HID = E.toUint8Array(atob("BQEJBqEBhQIFBxngKecVACUBdQGVCIEClQF1CIEBlQV1AQUIGQEpBZEClQF1A5EBlQZ1CBUAJXMFBxkAKXOBAAkFFQAm/wB1CJUCsQLABQwJAaEBhQEVACUBdQGVAQm1gQIJtoECCbeBAgm4gQIJzYECCeKBAgnpgQIJ6oECwA=="));
    NRF.setServices({}, {uart:true, hid:Bangle.HID});
  }
}
if (s.blerepl===false) { // If not programmable, force terminal off Bluetooth
  if (s.log) Terminal.setConsole(true); // if showing debug, force REPL onto terminal
  else E.setConsole(null,{force:true}); // on new (2v05+) firmware we have E.setConsole which allows a 'null' console
} else {
  if (s.log && !NRF.getSecurityStatus().connected) Terminal.setConsole(); // if showing debug, put REPL on terminal (until connection)
  else Bluetooth.setConsole(true); // else if no debug, force REPL to Bluetooth
}
// we just reset, so BLE should be on.
// Don't disconnect if something is already connected to us
if (s.ble===false && !NRF.getSecurityStatus().connected) NRF.sleep();
// Set time, vibrate, beep, etc
if (!Bangle.F_BEEPSET) {
  if (!s.vibrate) Bangle.buzz=Promise.resolve;
  if (s.beep===false) Bangle.beep=Promise.resolve;
  else if (s.beep=="vib") Bangle.beep = function (time, freq) {
    return new Promise(function(resolve) {
      if ((0|freq)<=0) freq=4000;
      if ((0|time)<=0) time=200;
      if (time>5000) time=5000;
      analogWrite(D13,0.1,{freq:freq});
      setTimeout(function() {
        digitalWrite(D13,0);
        resolve();
      }, time);
    });
  };
}
Bangle.setLCDTimeout(s.timeout);
if (!s.timeout) Bangle.setLCDPower(1);
E.setTimeZone(s.timezone);
delete s;
// Draw out of memory errors onto the screen
E.on('errorFlag', function(errorFlags) {  g.reset(1).setColor("#ff0000").setFont("6x8").setFontAlign(0,1).drawString(errorFlags,g.getWidth()/2,g.getHeight()-1).flip();
  print("Interpreter error:",errorFlags);
  E.getErrorFlags(); // clear flags so we get called next time
});
// stop users doing bad things!
global.save = function() { throw new Error("You can't use save() on Bangle.js without overwriting the bootloader!"); }
// Load *.boot.js files
require('Storage').list(/\.boot\.js/).map(bootFile=>{
  eval(require('Storage').read(bootFile));
});
