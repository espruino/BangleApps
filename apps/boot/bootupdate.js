/* This rewrites boot0.js based on current settings. If settings changed then it
recalculates, but this avoids us doing a whole bunch of reconfiguration most
of the time. */
E.showMessage("Updating boot0...");
var s = require('Storage').readJSON('setting.json',1)||{};
var BANGLEJS2 = process.env.HWVERSION==2; // Is Bangle.js 2
var boot = "";
if (require('Storage').hash) { // new in 2v11 - helps ensure files haven't changed
  var CRC = E.CRC32(require('Storage').read('setting.json'))+require('Storage').hash(/\.boot\.js/);
  boot += `if (E.CRC32(require('Storage').read('setting.json'))+require('Storage').hash(/\\.boot\\.js/)!=${CRC})`;
} else {
  var CRC = E.CRC32(require('Storage').read('setting.json'))+E.CRC32(require('Storage').list(/\.boot\.js/));
  boot += `if (E.CRC32(require('Storage').read('setting.json'))+E.CRC32(require('Storage').list(/\\.boot\\.js/))!=${CRC})`;
}
boot += ` { eval(require('Storage').read('bootupdate.js')); throw "Storage Updated!"}\n`;
boot += `E.setFlags({pretokenise:1});\n`;
boot += `var bleServices = {}, bleServiceOptions = { uart : true};\n`;
if (s.ble!==false) {
  if (s.HID) { // Human interface device
    if (s.HID=="joy") boot += `Bangle.HID = E.toUint8Array(atob("BQEJBKEBCQGhAAUJGQEpBRUAJQGVBXUBgQKVA3UBgQMFAQkwCTEVgSV/dQiVAoECwMA="));`;
    else if (s.HID=="kb") boot += `Bangle.HID = E.toUint8Array(atob("BQEJBqEBBQcZ4CnnFQAlAXUBlQiBApUBdQiBAZUFdQEFCBkBKQWRApUBdQORAZUGdQgVACVzBQcZAClzgQAJBRUAJv8AdQiVArECwA=="));`
    else /*kbmedia*/boot += `Bangle.HID = E.toUint8Array(atob("BQEJBqEBhQIFBxngKecVACUBdQGVCIEClQF1CIEBlQV1AQUIGQEpBZEClQF1A5EBlQZ1CBUAJXMFBxkAKXOBAAkFFQAm/wB1CJUCsQLABQwJAaEBhQEVACUBdQGVAQm1gQIJtoECCbeBAgm4gQIJzYECCeKBAgnpgQIJ6oECwA=="));`;
    boot += `bleServiceOptions.hid=Bangle.HID;\n`;
  }
}
if (s.log==2) { // logging to file
    boot += `_DBGLOG=require("Storage").open("log.txt","a");
`;
} if (s.blerepl===false) { // If not programmable, force terminal off Bluetooth
  if (s.log==2) boot += `_DBGLOG=require("Storage").open("log.txt","a");
LoopbackB.on('data',function(d) {_DBGLOG.write(d);Terminal.write(d);});
LoopbackA.setConsole(true);\n`;
  else if (s.log) boot += `Terminal.setConsole(true);\n`; // if showing debug, force REPL onto terminal
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
  if (s.log==2) boot += `_DBGLOG=require("Storage").open("log.txt","a");
LoopbackB.on('data',function(d) {_DBGLOG.write(d);Terminal.write(d);});
if (!NRF.getSecurityStatus().connected) LoopbackA.setConsole();\n`;
  else if (s.log) boot += `if (!NRF.getSecurityStatus().connected) Terminal.setConsole();\n`; // if showing debug, put REPL on terminal (until connection)
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
  else if (s.beep=="vib" && !BANGLEJS2) boot += `Bangle.beep = function (time, freq) {
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
if (s.brightness && s.brightness!=1) boot+=`Bangle.setLCDBrightness(${s.brightness});\n`;
if (s.passkey!==undefined && s.passkey.length==6) boot+=`NRF.setSecurity({passkey:${E.toJS(s.passkey.toString())}, mitm:1, display:1});\n`;
if (s.whitelist) boot+=`NRF.on('connect', function(addr) { if (!(require('Storage').readJSON('setting.json',1)||{}).whitelist.includes(addr)) NRF.disconnect(); });\n`;
// Pre-2v10 firmwares without a theme/setUI
delete g.theme; // deleting stops us getting confused by our own decl. builtins can't be deleted
if (!g.theme) {
  boot += `g.theme={fg:-1,bg:0,fg2:-1,bg2:7,fgH:-1,bgH:0x02F7,dark:true};\n`;
}
delete Bangle.setUI; // deleting stops us getting confused by our own decl. builtins can't be deleted
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
if (Bangle.touchHandler) {
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
delete E.showScroller; // deleting stops us getting confused by our own decl. builtins can't be deleted
if (!E.showScroller) { // added in 2v11 - this is a limited functionality polyfill
  boot += `E.showScroller = (function(a){function n(){g.reset();b>=l+c&&(c=1+b-l);b<c&&(c=b);g.setColor(g.theme.fg);for(var d=0;d<l;d++){var m=d+c;if(0>m||m>=a.c)break;var f=24+d*a.h;a.draw(m,{x:0,y:f,w:h,h:a.h});d+c==b&&g.setColor(g.theme.fg).drawRect(0,f,h-1,f+a.h-1).drawRect(1,f+1,h-2,f+a.h-2)}g.setColor(c?g.theme.fg:g.theme.bg);g.fillPoly([e,6,e-14,20,e+14,20]);g.setColor(a.c>l+c?g.theme.fg:g.theme.bg);g.fillPoly([e,k-7,e-14,k-21,e+14,k-21])}if(!a)return Bangle.setUI();var b=0,c=0,h=g.getWidth(),
k=g.getHeight(),e=h/2,l=Math.floor((k-48)/a.h);g.reset().clearRect(0,24,h-1,k-1);n();Bangle.setUI("updown",d=>{d?(b+=d,0>b&&(b=a.c-1),b>=a.c&&(b=0),n()):a.select(b)})});\n`;
}
delete g.imageMetrics; // deleting stops us getting confused by our own decl. builtins can't be deleted
if (!g.imageMetrics) { // added in 2v11 - this is a limited functionality polyfill
  boot += `Graphics.prototype.imageMetrics=function(src) {
  if (src[0]) return {width:src[0],height:src[1]};
  else if ('object'==typeof src) return {
    width:("width" in src) ? src.width : src.getWidth(),
    height:("height" in src) ? src.height : src.getHeight()};
  var im = E.toString(src);
  return {width:im.charCodeAt(0), height:im.charCodeAt(1)};
};\n`;
}
delete g.stringMetrics; // deleting stops us getting confused by our own decl. builtins can't be deleted
if (!g.stringMetrics) { // added in 2v11 - this is a limited functionality polyfill
  boot += `Graphics.prototype.stringMetrics=function(txt) {
  txt = txt.toString().split("\\n");
  return {width:Math.max.apply(null,txt.map(x=>g.stringWidth(x))), height:this.getFontHeight()*txt.length};
};\n`;
}
delete g.wrapString; // deleting stops us getting confused by our own decl. builtins can't be deleted
if (!g.wrapString) { // added in 2v11 - this is a limited functionality polyfill
  boot += `Graphics.prototype.wrapString=function(str, maxWidth) {
  var lines = [];
  for (var unwrappedLine of str.split("\\n")) {
    var words = unwrappedLine.split(" ");
    var line = words.shift();
    for (var word of words) {
      if (g.stringWidth(line + " " + word) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line += " " + word;
      }
    }
    lines.push(line);
  }
  return lines;
};\n`;
}
delete Bangle.appRect; // deleting stops us getting confused by our own decl. builtins can't be deleted
if (!Bangle.appRect) { // added in 2v11 - polyfill for older firmwares
  boot += `Bangle.appRect = ((y,w,h)=>({x:0,y:0,w:w,h:h,x2:w-1,y2:h-1}))(g.getWidth(),g.getHeight());
  (lw=>{ Bangle.loadWidgets = () => { lw(); Bangle.appRect = ((y,w,h)=>({x:0,y:y,w:w,h:h-y,x2:w-1,y2:h-(1+h)}))(global.WIDGETS?24:0,g.getWidth(),g.getHeight()); }; })(Bangle.loadWidgets);\n`;
}

// Append *.boot.js files
// These could change bleServices/bleServiceOptions if needed
require('Storage').list(/\.boot\.js/).forEach(bootFile=>{
  // we add a semicolon so if the file is wrapped in (function(){ ... }()
  // with no semicolon we don't end up with (function(){ ... }()(function(){ ... }()
  // which would cause an error!
  boot += "//"+bootFile+"\n"+require('Storage').read(bootFile)+";\n";
});
// update ble
boot += `NRF.setServices(bleServices, bleServiceOptions);delete bleServices,bleServiceOptions;\n`;
// write file
require('Storage').write('.boot0',boot);
delete boot;
E.showMessage("Reloading...");
eval(require('Storage').read('.boot0'));
// .bootcde should be run automatically after if required, since
// we normally get called automatically from '.boot0'
