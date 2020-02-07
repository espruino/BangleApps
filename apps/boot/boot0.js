// This ALWAYS runs at boot
E.setFlags({pretokenise:1});
// Load settings...
var s = require('Storage').readJSON('@setting')||{};
if (s.ble!==false) {
  if (s.HID) { // Humen interface device
    Bangle.HID = E.toUint8Array(atob("BQEJBqEBhQIFBxngKecVACUBdQGVCIEClQF1CIEBlQV1AQUIGQEpBZEClQF1A5EBlQZ1CBUAJXMFBxkAKXOBAAkFFQAm/wB1CJUCsQLABQwJAaEBhQEVACUBdQGVAQm1gQIJtoECCbeBAgm4gQIJzYECCeKBAgnpgQIJ6oECwA=="));
    NRF.setServices({}, {uart:true, hid:Bangle.HID});
  }
}
// If not programmable, force terminal onto screen
if (s.dev===false) Terminal.setConsole(true);
// we just reset, so BLE should be on
if (s.ble===false) NRF.sleep();
// Set time, vibrate, beep, etc
if (!s.vibrate) Bangle.buzz=Promise.resolve;
if (!s.beep) Bangle.beep=Promise.resolve;
Bangle.setLCDTimeout(s.timeout);
if (!s.timeout) Bangle.setLCDPower(1);
E.setTimeZone(s.timezone);
delete s;
// check to see if our clock is wrong - if it is use GPS time
if ((new Date()).getFullYear()==1970) {
  console.log("Searching for GPS time");
  Bangle.on('GPS',function cb(g) {
    Bangle.setGPSPower(0);
    Bangle.removeListener("GPS",cb);
    if (!g.time || (g.time.getFullYear()<2000) ||
       (g.time.getFullYear()==2250)) {
      console.log("GPS receiver's time not set");
      return;
    }
    setTime(g.time.getTime()/1000);
    console.log("GPS time",g.time.toString());
  });
  Bangle.setGPSPower(1);
}
// All of this is just shim for older Bangles
if (!Bangle.loadWidgets) {
  Bangle.loadWidgets = function(){
    global.WIDGETPOS={tl:32,tr:g.getWidth()-32,bl:32,br:g.getWidth()-32};
    global.WIDGETS={};
    require("Storage").list().filter(a=>a[0]=='=').forEach(widget=>eval(require("Storage").read(widget)));
  };
  Bangle.drawWidgets = function(){
    for(var w of WIDGETS)w.draw()
  };
  Bangle.showLauncher = function(){
    var l = require("Storage").list().filter(a=>a[0]=='+').map(app=>{
      try { return require("Storage").readJSON(app); } catch (e) {}
    }).find(app=>app.type=="launch");
    if (l) load(l.src);
    else E.showMessage("Launcher\nnot found");
  };
  var _load = load;
  global.load = function(x) {
    if (!x) _load(x);
    else setTimeout(function(){
      // attempt to remove any currently-running code
      delete Bangle.buzz;
      delete Bangle.beep;
      Bangle.setLCDOffset&&Bangle.setLCDOffset(0);
      Bangle.setLCDMode("direct");
      g.clear();
      clearInterval();
      clearWatch();
      Bangle.removeAllListeners();
      NRF.removeAllListeners();
      Bluetooth.removeAllListeners();
      E.removeAllListeners();
      for (var i in global) if (i!="g") delete global[i];
      setTimeout('eval(require("Storage").read("'+x+'"));',20);
    },20);
  }
}
