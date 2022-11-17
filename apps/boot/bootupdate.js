/* This rewrites boot0.js based on current settings. If settings changed then it
recalculates, but this avoids us doing a whole bunch of reconfiguration most
of the time. */
E.showMessage(/*LANG*/"Updating boot0...");
var s = require('Storage').readJSON('setting.json',1)||{};
var BANGLEJS2 = process.env.HWVERSION==2; // Is Bangle.js 2
var FWVERSION = parseFloat(process.env.VERSION.replace("v","").replace(/\.(\d\d)$/,".0$1"));
var boot = "", bootPost = "";
if (require('Storage').hash) { // new in 2v11 - helps ensure files haven't changed
  var CRC = E.CRC32(require('Storage').read('setting.json'))+require('Storage').hash(/\.boot\.js/)+E.CRC32(process.env.GIT_COMMIT);
  boot += `if (E.CRC32(require('Storage').read('setting.json'))+require('Storage').hash(/\\.boot\\.js/)+E.CRC32(process.env.GIT_COMMIT)!=${CRC})`;
} else {
  var CRC = E.CRC32(require('Storage').read('setting.json'))+E.CRC32(require('Storage').list(/\.boot\.js/))+E.CRC32(process.env.GIT_COMMIT);
  boot += `if (E.CRC32(require('Storage').read('setting.json'))+E.CRC32(require('Storage').list(/\\.boot\\.js/))+E.CRC32(process.env.GIT_COMMIT)!=${CRC})`;
}
boot += ` { eval(require('Storage').read('bootupdate.js')); throw "Storage Updated!"}\n`;
boot += `E.setFlags({pretokenise:1});\n`;
boot += `var bleServices = {}, bleServiceOptions = { uart : true};\n`;
bootPost += `NRF.setServices(bleServices, bleServiceOptions);delete bleServices,bleServiceOptions;\n`; // executed after other boot code
if (s.ble!==false) {
  if (s.HID) { // Human interface device
    if (s.HID=="joy") boot += `Bangle.HID = E.toUint8Array(atob("BQEJBKEBCQGhAAUJGQEpBRUAJQGVBXUBgQKVA3UBgQMFAQkwCTEVgSV/dQiVAoECwMA="));`;
    else if (s.HID=="com") boot += `Bangle.HID = E.toUint8Array(atob("BQEJAqEBhQEJAaEABQkZASkFFQAlAZUFdQGBApUBdQOBAwUBCTAJMQk4FYElf3UIlQOBBgUMCjgCFYElf3UIlQGBBsDABQEJBqEBhQIFBxngKecVACUBdQGVCIECdQiVAYEBGQApcxUAJXOVBXUIgQDA"));`
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
  var l = (Bluetooth.line + d).split(/[\\n\\r]/);
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
if (s.rotate) boot+=`g.setRotation(${s.rotate&3},${s.rotate>>2});\n` // screen rotation
// ================================================== FIXING OLDER FIRMWARES
if (FWVERSION<215.068) // 2v15.68 and before had compass heading inverted.
  boot += `Bangle.on('mag',e=>{if(!isNaN(e.heading))e.heading=360-e.heading;});
Bangle.getCompass=(c=>(()=>{e=c();if(!isNaN(e.heading))e.heading=360-e.heading;return e;}))(Bangle.getCompass);`;

// deleting stops us getting confused by our own decl. builtins can't be deleted
// this is a polyfill without fastloading capability
delete Bangle.showClock;
if (!Bangle.showClock) boot += `Bangle.showClock = ()=>{load(".bootcde")};\n`;
delete Bangle.load;
if (!Bangle.load) boot += `Bangle.load = load;\n`;

// ================================================== BOOT.JS
// Append *.boot.js files
// These could change bleServices/bleServiceOptions if needed
var bootFiles = require('Storage').list(/\.boot\.js$/).sort((a,b)=>{
  var getPriority = /.*\.(\d+)\.boot\.js$/;
  var aPriority = a.match(getPriority);
  var bPriority = b.match(getPriority);
  if (aPriority && bPriority){
    return parseInt(aPriority[1]) - parseInt(bPriority[1]);
  } else if (aPriority && !bPriority){
    return -1;
  } else if (!aPriority && bPriority){
    return 1;
  }
  return a==b ? 0 : (a>b ? 1 : -1);
});
// precalculate file size
var fileSize = boot.length + bootPost.length;
bootFiles.forEach(bootFile=>{
  // match the size of data we're adding below in bootFiles.forEach
  fileSize += 2+bootFile.length+1+require('Storage').read(bootFile).length+2;
});
// write file in chunks (so as not to use up all RAM)
require('Storage').write('.boot0',boot,0,fileSize);
var fileOffset = boot.length;
bootFiles.forEach(bootFile=>{
  // we add a semicolon so if the file is wrapped in (function(){ ... }()
  // with no semicolon we don't end up with (function(){ ... }()(function(){ ... }()
  // which would cause an error!
  // we write:
  // "//"+bootFile+"\n"+require('Storage').read(bootFile)+";\n";
  // but we need to do this without ever loading everything into RAM as some
  // boot files seem to be getting pretty big now.
  require('Storage').write('.boot0',"//"+bootFile+"\n",fileOffset);
  fileOffset+=2+bootFile.length+1;
  var bf = require('Storage').read(bootFile);
  // we can't just write 'bf' in one go because at least in 2v13 and earlier
  // Espruino wants to read the whole file into RAM first, and on Bangle.js 1
  // it can be too big (especially BTHRM).
  var bflen = bf.length;
  var bfoffset = 0;
  while (bflen) {
    var bfchunk = Math.min(bflen, 2048);
    require('Storage').write('.boot0',bf.substr(bfoffset, bfchunk),fileOffset);
    fileOffset+=bfchunk;
    bfoffset+=bfchunk;
    bflen-=bfchunk;
  }
  require('Storage').write('.boot0',";\n",fileOffset);
  fileOffset+=2;
});
require('Storage').write('.boot0',bootPost,fileOffset);

delete boot;
delete bootPost;
delete bootFiles;
delete fileSize;
delete fileOffset;
E.showMessage(/*LANG*/"Reloading...");
eval(require('Storage').read('.boot0'));
// .bootcde should be run automatically after if required, since
// we normally get called automatically from '.boot0'
