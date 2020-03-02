// This ALWAYS runs at boot
E.setFlags({pretokenise:1});
// Load settings...
var s = require('Storage').readJSON('setting.json',1)||{};
if (s.ble!==false) {
  if (s.HID) { // Human interface device
    Bangle.HID = E.toUint8Array(atob("BQEJBqEBhQIFBxngKecVACUBdQGVCIEClQF1CIEBlQV1AQUIGQEpBZEClQF1A5EBlQZ1CBUAJXMFBxkAKXOBAAkFFQAm/wB1CJUCsQLABQwJAaEBhQEVACUBdQGVAQm1gQIJtoECCbeBAgm4gQIJzYECCeKBAgnpgQIJ6oECwA=="));
    NRF.setServices({}, {uart:true, hid:Bangle.HID});
  }
}
if (s.blerepl===false) { // If not programmable, force terminal off Bluetooth
  if (s.log) Terminal.setConsole(true); // if showing debug, force REPL onto terminal
  else E.setConsole(null,{force:true}); // on new (2v05+) firmware we have E.setConsole which allows a 'null' console
} else {
  if (s.log) Terminal.setConsole(); // if showing debug, put REPL on terminal (until connection)
  else Bluetooth.setConsole(true); // else if no debug, force REPL to Bluetooth
}
// we just reset, so BLE should be on.
// Don't disconnect if something is already connected to us
if (s.ble===false && !NRF.getSecurityStatus().connected) NRF.sleep();
// Set time, vibrate, beep, etc
if (!s.vibrate) Bangle.buzz=Promise.resolve;
if (!s.beep) Bangle.beep=Promise.resolve;
Bangle.setLCDTimeout(s.timeout);
if (!s.timeout) Bangle.setLCDPower(1);
E.setTimeZone(s.timezone);
delete s;
// check for alarms
function checkAlarm() {
  var alarms = require('Storage').readJSON('alarm.json',1)||[];
  var time = new Date();
  var active = alarms.filter(a=>a.on&&(a.last!=time.getDate()));
  if (active.length) {
    active = active.sort((a,b)=>a.hr-b.hr);
    var hr = time.getHours()+(time.getMinutes()/60)+(time.getSeconds()/3600);
    if (!require('Storage').read("alarm.js")) {
      console.log("No alarm app!");
      require('Storage').write('alarm.json',"[]")
    } else {
      var t = 3600000*(active[0].hr-hr);
      if (t<1000) t=1000;
      /* execute alarm at the correct time. We avoid execing immediately
      since this code will get called AGAIN when alarm.js is loaded. alarm.js
      will then clearInterval() to get rid of this call so it can proceed
      normally. */
      setTimeout(function() {
        load("alarm.js");
      },t);
    }
  }
}
// check to see if our clock is wrong - if it is use GPS time
if ((new Date()).getFullYear()==1970) {
  //console.log("Searching for GPS time");
  Bangle.on('GPS',function cb(g) {
    Bangle.setGPSPower(0);
    Bangle.removeListener("GPS",cb);
    if (!g.time || (g.time.getFullYear()<2000) ||
       (g.time.getFullYear()==2250)) {
      //console.log("GPS receiver's time not set");
      return;
    }
    setTime(g.time.getTime()/1000);
    //console.log("GPS time",g.time.toString());
    checkAlarm();
  });
  Bangle.setGPSPower(1);
} else checkAlarm();
delete checkAlarm;
