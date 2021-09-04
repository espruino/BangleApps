/* This rewrites boot0.js based on current settings. If settings changed then it
recalculates, but this avoids us doing a whole bunch of reconfiguration most
of the time. */
E.showMessage("Updating boot0...");
var s = require('Storage').readJSON('setting.json',1)||{};
var isB2 = process.env.HWVERSION; // Is Bangle.js 2
var boot = "";
var CRC = E.CRC32(require('Storage').read('setting.json'))+E.CRC32(require('Storage').list(/\.boot\.js/));
boot += `if (E.CRC32(require('Storage').read('setting.json'))+E.CRC32(require('Storage').list(/\.boot\.js/))!=${CRC}) { eval(require('Storage').read('bootupdate.js')); throw "Storage Updated!"}\n`;
boot += `E.setFlags({pretokenise:1});\n`;
if (s.ble!==false) {
  if (s.HID) { // Human interface device
    if (s.HID=="joy") boot += `Bangle.HID = E.toUint8Array(atob("BQEJBKEBCQGhAAUJGQEpBRUAJQGVBXUBgQKVA3UBgQMFAQkwCTEVgSV/dQiVAoECwMA="));`;
    else if (s.HID=="kb") boot += `Bangle.HID = E.toUint8Array(atob("BQEJBqEBBQcZ4CnnFQAlAXUBlQiBApUBdQiBAZUFdQEFCBkBKQWRApUBdQORAZUGdQgVACVzBQcZAClzgQAJBRUAJv8AdQiVArECwA=="));`
    else /*kbmedia*/boot += `Bangle.HID = E.toUint8Array(atob("BQEJBqEBhQIFBxngKecVACUBdQGVCIEClQF1CIEBlQV1AQUIGQEpBZEClQF1A5EBlQZ1CBUAJXMFBxkAKXOBAAkFFQAm/wB1CJUCsQLABQwJAaEBhQEVACUBdQGVAQm1gQIJtoECCbeBAgm4gQIJzYECCeKBAgnpgQIJ6oECwA=="));`;
    boot += `NRF.setServices({}, {uart:true, hid:Bangle.HID});\n`;
  }
}
if (s.blerepl===false) { // If not programmable, force terminal off Bluetooth
  if (s.log) boot += `Terminal.setConsole(true);\n`; // if showing debug, force REPL onto terminal
  else boot += `E.setConsole(null,{force:true});\n`; // on new (2v05+) firmware we have E.setConsole which allows a 'null' console
  /* If not programmable add our own handler for Bluetooth data
  to allow Gadgetbridge commands to be received*/
  boot += `
Bluetooth.line="";
Bluetooth.on('data',function(d) {
  var l = (Bluetooth.line + d).split("\n");
  Bluetooth.line = l.pop();
  l.forEach(n=>Bluetooth.emit("line",n));
});
Bluetooth.on('line',function(l) {
  if (l.startsWith('\x10')) l=l.slice(1);
  if (l.startsWith('GB({') && l.endsWith('})') && global.GB)
    try { global.GB(JSON.parse(l.slice(3,-1))); } catch(e) {}
});\n`;
} else {
  if (s.log) boot += `if (!NRF.getSecurityStatus().connected) Terminal.setConsole();\n`; // if showing debug, put REPL on terminal (until connection)
  else boot += `Bluetooth.setConsole(true);\n`; // else if no debug, force REPL to Bluetooth
}
// we just reset, so BLE should be on.
// Don't disconnect if something is already connected to us
if (s.ble===false) boot += `if (!NRF.getSecurityStatus().connected) NRF.sleep();\n`;
// Set time
if (s.timeout!==undefined) boot += `Bangle.setLCDTimeout(${s.timeout});\n`;
if (!s.timeout) boot += `Bangle.setLCDPower(1);\n`;
boot += `E.setTimeZone(${s.timezone});`;
// Set vibrate, beep, etc IF on older firmwares
if (!Bangle.F_BEEPSET) {
  if (!s.vibrate) boot += `Bangle.buzz=Promise.resolve;\n`
  if (s.beep===false) boot += `Bangle.beep=Promise.resolve;\n`
  else if (s.beep=="vib") boot += `Bangle.beep = function (time, freq) {
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
  };\n`;
}
// Draw out of memory errors onto the screen
boot += `E.on('errorFlag', function(errorFlags) {
  g.reset(1).setColor("#ff0000").setFont("6x8").setFontAlign(0,1).drawString(errorFlags,g.getWidth()/2,g.getHeight()-1).flip();
  print("Interpreter error:", errorFlags);
  E.getErrorFlags(); // clear flags so we get called next time
});\n`;
// stop users doing bad things!
if (global.save) boot += `global.save = function() { throw new Error("You can't use save() on Bangle.js without overwriting the bootloader!"); }\n`;
// Apply any settings-specific stuff
if (s.options) boot+=`Bangle.setOptions(${E.toJS(s.options)});\n`;
if (s.quiet && s.qmOptions) boot+=`Bangle.setOptions(${E.toJS(s.qmOptions)});\n`;
if (s.quiet && s.qmBrightness) {
  if (s.qmBrightness!=1) boot+=`Bangle.setLCDBrightness(${s.qmBrightness});\n`;
} else {
  if (s.brightness && s.brightness!=1) boot+=`Bangle.setLCDBrightness(${s.brightness});\n`;
}
if (s.quiet && s.qmTimeout) boot+=`Bangle.setLCDTimeout(${s.qmTimeout});\n`;
if (s.passkey!==undefined && s.passkey.length==6) boot+=`NRF.setSecurity({passkey:${s.passkey}, mitm:1, display:1});\n`;
if (s.whitelist) boot+=`NRF.on('connect', function(addr) { if (!(require('Storage').readJSON('setting.json',1)||{}).whitelist.includes(addr)) NRF.disconnect(); });\n`;
// Pre-2v10 firmwares without a theme/setUI
if (!g.theme) {
  boot += `g.theme={fg:-1,bg:0,fg2:-1,bg2:7,fgH:-1,bgH:0x02F7,dark:true};\n`;
}
if (!Bangle.setUI) { // assume this is just for F18 - Q3 should already have it
  boot += `Bangle.setUI=function(mode, cb) {
if (Bangle.btnWatches) {
  Bangle.btnWatches.forEach(clearWatch);
  delete Bangle.btnWatches;
}
if (Bangle.swipeHandler) {
  Bangle.removeListener("swipe", Bangle.swipeHandler);
  delete Bangle.swipeHandler;
}
if (Bangle.touchandler) {
  Bangle.removeListener("touch", Bangle.touchHandler);
  delete Bangle.touchHandler;
}
if (!mode) return;
else if (mode=="updown") {
  Bangle.btnWatches = [
    setWatch(function() { cb(-1); }, BTN1, {repeat:1}),
    setWatch(function() { cb(1); }, BTN3, {repeat:1}),
    setWatch(function() { cb(); }, BTN2, {repeat:1})
  ];
} else if (mode=="leftright") {
  Bangle.btnWatches = [
    setWatch(function() { cb(-1); }, BTN1, {repeat:1}),
    setWatch(function() { cb(1); }, BTN3, {repeat:1}),
    setWatch(function() { cb(); }, BTN2, {repeat:1})
  ];
  Bangle.swipeHandler = d => {cb(d);};
  Bangle.on("swipe", Bangle.swipeHandler);
  Bangle.touchHandler = d => {cb();};
  Bangle.on("touch", Bangle.touchHandler);
} else if (mode=="clock") {
  Bangle.CLOCK=1;
  Bangle.btnWatches = [
    setWatch(Bangle.showLauncher, BTN2, {repeat:1,edge:"falling"})
  ];
} else if (mode=="clockupdown") {
  Bangle.CLOCK=1;
  Bangle.btnWatches = [
    setWatch(function() { cb(-1); }, BTN1, {repeat:1}),
    setWatch(function() { cb(1); }, BTN3, {repeat:1}),
    setWatch(Bangle.showLauncher, BTN2, {repeat:1,edge:"falling"})
  ];
} else
  throw new Error("Unknown UI mode");
};\n`;
}
// Append *.boot.js files
require('Storage').list(/\.boot\.js/).forEach(bootFile=>{
  // we add a semicolon so if the file is wrapped in (function(){ ... }()
  // with no semicolon we don't end up with (function(){ ... }()(function(){ ... }()
  // which would cause an error!
  boot += require('Storage').read(bootFile)+";\n";
});
require('Storage').write('.boot0',boot);
delete boot;
E.showMessage("Reloading...");
eval(require('Storage').read('.boot0'));
// .bootcde should be run automatically after if required, since
// we normally get called automatically from '.boot0'
