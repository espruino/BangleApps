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
if (FWVERSION < 216) {
  E.showMessage(/*LANG*/"Please update Bangle.js firmware\n\nCurrent = "+process.env.VERSION,{title:"ERROR"});
  throw new Error("Old firmware");
}
let CRC = E.CRC32(require('Storage').read('setting.json'))+require('Storage').hash(/\.js$/)+E.CRC32(process.env.GIT_COMMIT);
boot += `if(E.CRC32(require('Storage').read('setting.json'))+require('Storage').hash(/\\.js$/)+E.CRC32(process.env.GIT_COMMIT)!=${CRC})`;
boot += `{eval(require('Storage').read('bootupdate.js'));}else{\n`;
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
  let l = (Bluetooth.line + d).split(/[\\n\\r]/);
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
// Draw out of memory errors onto the screen if logging enabled
if (s.log) boot += `E.on('errorFlag', function(errorFlags) {
  g.reset(1).setColor("#ff0000").setFont("6x8").setFontAlign(0,1).drawString(errorFlags,g.getWidth()/2,g.getHeight()-1).flip();
  print("Interpreter error:", errorFlags);
  E.getErrorFlags();
});\n`;// E.getErrorFlags() -> clear flags so we get called next time
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
boot+=`Bangle.loadWidgets=function(){if(!global.WIDGETS)eval(require("Storage").read(".widcache"))};\n`;
// ================================================== FIXING OLDER FIRMWARES
// deleting stops us getting confused by our own decl. builtins can't be deleted
// this is a polyfill without fastloading capability
delete Bangle.showClock;
if (!Bangle.showClock) boot += `Bangle.showClock = ()=>{load(".bootcde")};\n`;
delete Bangle.load;
if (!Bangle.load) boot += `Bangle.load = load;\n`;

// show timings
if (DEBUG) boot += `print(".boot0",0|(Date.now()-_tm),"ms");_tm=Date.now();\n`
// ================================================== .BOOT0
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
let fileOffset,fileSize;
/* code to output a file, plus preable and postable
when called with dst==undefined it just increments
fileOffset so we can see ho wbig the file has to be */
let outputFile = (dst,src,pre,post) => {"ram";
  if (DEBUG) {
    if (dst) require('Storage').write(dst,`//${src}\n`,fileOffset);
    fileOffset+=2+src.length+1;
  }
  if (pre) {
    if (dst) require('Storage').write(dst,pre,fileOffset);
    fileOffset+=pre.length;
  }
  let f = require('Storage').read(src);
  if (src.endsWith("clkinfo.js") && f[0]!="(") {
    /* we shouldn't have to do this but it seems sometimes (sched 0.28) folks have
    used libraries which get added into the clockinfo, and we can't use them directly
    to we have to revert back to eval */
    f = `eval(require('Storage').read(${E.toJS(src)}))`;
  }
  if (dst) {
    // we can't just write 'f' in one go because it can be too big
    let len = f.length;
    let offset = 0;
    while (len) {
      let chunk = Math.min(len, 2048);
      require('Storage').write(dst,f.substr(offset, chunk),fileOffset);
      fileOffset+=chunk;
      offset+=chunk;
      len-=chunk;
    }
  } else
    fileOffset+=f.length;
  if (dst) require('Storage').write(dst,post,fileOffset);
  fileOffset+=post.length;
  if (DEBUG) {
    if (dst) require('Storage').write(dst,`print(${E.toJS(src)},0|(Date.now()-_tm),"ms");_tm=Date.now();\n`,fileOffset);
    fileOffset += 48+E.toJS(src).length;
  }
};
let outputFileComplete = (dst,fn) => {
  // we add a semicolon so if the file is wrapped in (function(){ ... }()
  // with no semicolon we don't end up with (function(){ ... }()(function(){ ... }()
  // which would cause an error!
  // we write:
  // "//"+bootFile+"\n"+require('Storage').read(bootFile)+";\n";
  // but we need to do this without ever loading everything into RAM as some
  // boot files seem to be getting pretty big now.
  outputFile(dst,fn,"",";\n");
};
fileOffset = boot.length + bootPost.length;
bootFiles.forEach(fn=>outputFileComplete(undefined,fn)); // just get sizes
fileSize = fileOffset;
require('Storage').write('.boot0',boot,0,fileSize);
fileOffset = boot.length;
bootFiles.forEach(fn=>outputFileComplete('.boot0',fn));
require('Storage').write('.boot0',bootPost,fileOffset);
delete boot,bootPost,bootFiles;
// ================================================== .WIDCACHE for widgets
let widgetFiles = require("Storage").list(/\.wid\.js$/);
let widget = `// Made by bootupdate.js\nglobal.WIDGETS={};`, widgetPost = `var W=WIDGETS;WIDGETS={};
Object.keys(W).sort((a,b)=>(0|W[b].sortorder)-(0|W[a].sortorder)).forEach(k=>WIDGETS[k]=W[k]);`; // sort
if (DEBUG) widget+="var _tm=Date.now();";
outputFileComplete = (dst,fn) => {
  outputFile(dst,fn,"try{",`}catch(e){print(${E.toJS(fn)},e,e.stack)}\n`);
};
fileOffset = widget.length + widgetPost.length;
widgetFiles.forEach(fn=>outputFileComplete(undefined,fn)); // just get sizes
fileSize = fileOffset;
require('Storage').write('.widcache',widget,0,fileSize);
fileOffset = widget.length;
widgetFiles.forEach(fn=>outputFileComplete('.widcache',fn));
require('Storage').write('.widcache',widgetPost,fileOffset);
delete widget,widgetPost,widgetFiles;
// ================================================== .clkinfocache for clockinfos
let ciFiles = require("Storage").list(/\.clkinfo\.js$/);
let ci = `// Made by bootupdate.js\n`;
if (DEBUG) ci+="var _tm=Date.now();";
outputFileComplete = (dst,fn) => {
  outputFile(dst,fn,"try{let fn=",`;let a=fn(),b=menu.find(x=>x.name===a.name);if(b)b.items=b.items.concat(a.items)else menu=menu.concat(a);}catch(e){print(${E.toJS(fn)},e,e.stack)}\n`);
};
fileOffset = ci.length;
ciFiles.forEach(fn=>outputFileComplete(undefined,fn)); // just get sizes
fileSize = fileOffset;
require('Storage').write('.clkinfocache',ci,0,fileSize);
fileOffset = ci.length;
ciFiles.forEach(fn=>outputFileComplete('.clkinfocache',fn));
delete ci,ciFiles;
// test with require("clock_info").load()
// ================================================== END
E.showMessage(/*LANG*/"Reloading...");
}
// .bootcde should be run automatically after if required, since
// we normally get called automatically from '.boot0'
eval(require('Storage').read('.boot0'));
