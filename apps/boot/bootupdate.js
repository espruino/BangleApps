/* This rewrites boot0.js based on current settings. If settings changed then it
recalculates, but this avoids us doing a whole bunch of reconfiguration most
of the time. */
{ // execute in our own scope so we don't have to free variables...
E.showMessage(/*LANG*/"Updating boot0...");
let s = require('Storage').readJSON('setting.json',1)||{};
//const BANGLEJS2 = process.env.HWVERSION==2; // Is Bangle.js 2
const FWVERSION = parseFloat(process.env.VERSION.replace("v","").replace(/\.(\d\d)$/,".0$1"));
const DEBUG = s.bootDebug; // we can set this to enable debugging output in boot0
let boot = "", bootPost = "";
if (DEBUG) {
  boot += "var _tm=Date.now()\n";
  bootPost += "delete _tm;";
}
if (require('Storage').hash) { // new in 2v11 - helps ensure files haven't changed
  let CRC = E.CRC32(require('Storage').read('setting.json'))+require('Storage').hash(/\.boot\.js/)+E.CRC32(process.env.GIT_COMMIT);
  boot += `if(E.CRC32(require('Storage').read('setting.json'))+require('Storage').hash(/\\.boot\\.js/)+E.CRC32(process.env.GIT_COMMIT)!=${CRC})`;
} else {
  let CRC = E.CRC32(require('Storage').read('setting.json'))+E.CRC32(require('Storage').list(/\.boot\.js/))+E.CRC32(process.env.GIT_COMMIT);
  boot += `if(E.CRC32(require('Storage').read('setting.json'))+E.CRC32(require('Storage').list(/\\.boot\\.js/))+E.CRC32(process.env.GIT_COMMIT)!=${CRC})`;
}
boot += `{eval(require('Storage').read('bootupdate.js'));print("Storage Updated!")}else{\n`;
boot += `E.setFlags({pretokenise:1});\n`;
boot += `var bleServices = {}, bleServiceOptions = { uart : true};\n`;
bootPost += `NRF.setServices(bleServices,bleServiceOptions);delete bleServices,bleServiceOptions;\n`; // executed after other boot code
if (s.ble!==false) {
  if (s.HID) { // Human interface device
    if (s.HID=="joy") boot += `Bangle.HID = E.toUint8Array(atob("BQEJBKEBCQGhAAUJGQEpBRUAJQGVBXUBgQKVA3UBgQMFAQkwCTEVgSV/dQiVAoECwMA="));`;
    else if (s.HID=="com") boot += `Bangle.HID = E.toUint8Array(atob("BQEJAqEBhQEJAaEABQkZASkFFQAlAZUFdQGBApUBdQOBAwUBCTAJMQk4FYElf3UIlQOBBgUMCjgCFYElf3UIlQGBBsDABQEJBqEBhQIFBxngKecVACUBdQGVCIECdQiVAYEBGQApcxUAJXOVBXUIgQDA"));`
    else if (s.HID=="kb") boot += `Bangle.HID = E.toUint8Array(atob("BQEJBqEBBQcZ4CnnFQAlAXUBlQiBApUBdQiBAZUFdQEFCBkBKQWRApUBdQORAZUGdQgVACVzBQcZAClzgQAJBRUAJv8AdQiVArECwA=="));`
    else /*kbmedia*/boot += `Bangle.HID = E.toUint8Array(atob("BQEJBqEBhQIFBxngKecVACUBdQGVCIEClQF1CIEBlQV1AQUIGQEpBZEClQF1A5EBlQZ1CBUAJXMFBxkAKXOBAAkFFQAm/wB1CJUCsQLABQwJAaEBhQEVACUBdQGVAQm1gQIJtoECCbeBAgm4gQIJzYECCeKBAgnpgQIJ6oECwA=="));`;
    boot += `bleServiceOptions.hid=Bangle.HID;\n`;
  }
}
// settings.log 0-off, 1-display, 2-log, 3-both
if (s.blerepl===false) { // If not programmable, force terminal off Bluetooth
  if (s.log>=2) { boot += `_DBGLOG=require("Storage").open("log.txt","a");
LoopbackB.on('data',function(d) {_DBGLOG.write(d);${(s.log==3)?"Terminal.write(d);":""}});
LoopbackA.setConsole(true);\n`;
  } else if (s.log==1) boot += `Terminal.setConsole(true);\n`; // if showing debug, force REPL onto terminal
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
  if (s.log>=2) boot += `_DBGLOG=require("Storage").open("log.txt","a");
LoopbackB.on('data',function(d) {_DBGLOG.write(d);${(s.log==3)?"Terminal.write(d);":""}});
if (!NRF.getSecurityStatus().connected) LoopbackA.setConsole();\n`;
  else if (s.log==1) boot += `if (!NRF.getSecurityStatus().connected) Terminal.setConsole();\n`; // if showing debug, put REPL on terminal (until connection)
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
if (s.bleprivacy || (s.passkey!==undefined && s.passkey.length==6)) {
  let passkey = s.passkey ? `passkey:${E.toJS(s.passkey.toString())},display:1,mitm:1,` : "";
  let privacy = s.bleprivacy ? `privacy:${E.toJS(s.bleprivacy)},` : "";
  boot+=`NRF.setSecurity({${passkey}${privacy}});\n`;
}
if (s.blename === false) boot+=`NRF.setAdvertising({},{showName:false});\n`;
if (s.whitelist && !s.whitelist_disabled) boot+=`NRF.on('connect', function(addr) { if (!NRF.ignoreWhitelist) { let whitelist = (require('Storage').readJSON('setting.json',1)||{}).whitelist; if (NRF.resolveAddress !== undefined) { let resolvedAddr = NRF.resolveAddress(addr); if (resolvedAddr !== undefined) addr = resolvedAddr + " (resolved)"; } if (!whitelist.includes(addr)) NRF.disconnect(); }});\n`;
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
let date = new Date();
delete date.toLocalISOString; // toLocalISOString was only introduced in 2v15
if (!date.toLocalISOString) boot += `Date.prototype.toLocalISOString = function() {
  var o = this.getTimezoneOffset();
  var d = new Date(this.getTime() - o*60000);
  var sign = o>0?"-":"+";
  o = Math.abs(o);
  return d.toISOString().slice(0,-1)+sign+Math.floor(o/60).toString().padStart(2,0)+(o%60).toString().padStart(2,0);
};\n`;

// show timings
if (DEBUG) boot += `print(".boot0",0|(Date.now()-_tm),"ms");_tm=Date.now();\n`
// ================================================== BOOT.JS
// Append *.boot.js files.
// Name files with a number - eg 'foo.5.boot.js' to enforce order (lowest first). Numbered files get placed before non-numbered
// These could change bleServices/bleServiceOptions if needed
let bootFiles = require('Storage').list(/\.boot\.js$/).sort((a,b)=>{
  let getPriority = /.*\.(\d+)\.boot\.js$/;
  let aPriority = a.match(getPriority);
  let bPriority = b.match(getPriority);
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
bootPost += "}";
let fileSize = boot.length + bootPost.length;
bootFiles.forEach(bootFile=>{
  // match the size of data we're adding below in bootFiles.forEach
  if (DEBUG) fileSize += 2+bootFile.length+1; // `//${bootFile}\n` comment
  fileSize += require('Storage').read(bootFile).length+2; // boot code plus ";\n"
  if (DEBUG) fileSize += 48+E.toJS(bootFile).length; // `print(${E.toJS(bootFile)},0|(Date.now()-_tm),"ms");_tm=Date.now();\n`
});
// write file in chunks (so as not to use up all RAM)
require('Storage').write('.boot0',boot,0,fileSize);
let fileOffset = boot.length;
bootFiles.forEach(bootFile=>{
  // we add a semicolon so if the file is wrapped in (function(){ ... }()
  // with no semicolon we don't end up with (function(){ ... }()(function(){ ... }()
  // which would cause an error!
  // we write:
  // "//"+bootFile+"\n"+require('Storage').read(bootFile)+";\n";
  // but we need to do this without ever loading everything into RAM as some
  // boot files seem to be getting pretty big now.
  if (DEBUG) {
    require('Storage').write('.boot0',`//${bootFile}\n`,fileOffset);
    fileOffset+=2+bootFile.length+1;
  }
  let bf = require('Storage').read(bootFile);
  // we can't just write 'bf' in one go because at least in 2v13 and earlier
  // Espruino wants to read the whole file into RAM first, and on Bangle.js 1
  // it can be too big (especially BTHRM).
  let bflen = bf.length;
  let bfoffset = 0;
  while (bflen) {
    let bfchunk = Math.min(bflen, 2048);
    require('Storage').write('.boot0',bf.substr(bfoffset, bfchunk),fileOffset);
    fileOffset+=bfchunk;
    bfoffset+=bfchunk;
    bflen-=bfchunk;
  }
  require('Storage').write('.boot0',";\n",fileOffset);
  fileOffset+=2;
  if (DEBUG) {
    require('Storage').write('.boot0',`print(${E.toJS(bootFile)},0|(Date.now()-_tm),"ms");_tm=Date.now();\n`,fileOffset);
    fileOffset += 48+E.toJS(bootFile).length
  }
});
require('Storage').write('.boot0',bootPost,fileOffset);
E.showMessage(/*LANG*/"Reloading...");
}
// .bootcde should be run automatically after if required, since
// we normally get called automatically from '.boot0'
eval(require('Storage').read('.boot0'));
