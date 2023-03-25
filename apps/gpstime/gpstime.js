function satelliteImage() {
  return require("heatshrink").decompress(atob("mEwxH+AH4A/AH4A/AH4AGnE4F1wvsF34wgFldcLdyMYsoACF1WJF4YxPFzOtF4wxNFzAvKSiIvU1ovIGAkJAAQucF5QxCFwYwbF4QwLrwvjYIVfrwABrtdq9Wqwvkq4oCAAtXmYvi1teE4NXrphCrxoCGAbvdSIoAHNQNeFzQvGeRQvCsowrYYNfF8YwHZQQFCF8QwGF4owjeYovBroHEMERhEF8IwNrtWryYFF8YwCq4vhGBeJF5AwaxIwKwVXFwwvandfMJeJF8M6nZiLGQIvdstfGAVlGBZkCxJeZJQIwCGIRjMFzYACGIc6r/+FsIvGGIYABEzYvPGQYvusovkAH4A/AH4A/ACo="));
}

var fix;

Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
var Layout = require("Layout");
Bangle.setGPSPower(1, "app");
Bangle.loadWidgets();
Bangle.drawWidgets();
E.showMessage(/*LANG*/"Loading..."); // avoid showing rubbish on screen

function setGPSTime() {
  if (fix.time!==undefined) {
    setTime(fix.time.getTime()/1000);
    E.showMessage("System time set", {img:require("heatshrink").decompress(atob("lEo4UBvvv///vEFBYNVAAWq1QFDBAgKGrQJD0oJDtQJD1IICqwGBFoIDByocDwAJBgQeDtWoJwcqDwWq0EAgfAgEKHoQcCBIQeBGAQaBBIQzBytaEwQJDlWlrQmBBIkK0tqBI+ptRNCBIcCBKhECBIh6CAgUL8AJHl/4BI8+3gJRl/8GJH/BI8Ah6MDLIZQB+BjGAAIoBBI84BIaVCAAaVBVIYJEWYLkEXobRDAAbRBcoYACcoT5DEwYJCtQoElWpBINaDwYcB0oJBGQIzCAYIwBDwQGBAAIcCDwYACDgQACBIYIEBQYFDA="))});
  } else {
    E.showMessage("No GPS time to set");
  }

  Bangle.removeListener('GPS',onGPS);
  setTimeout(function() {
    fix = undefined;
    layout.forgetLazyState(); // redraw all next time
    Bangle.on('GPS',onGPS);
  }, 2000);
}

var layout = new Layout( {
  type:"v", c: [
    {type:"h", c:[
      {type:"img", src:satelliteImage },
      { type:"v", fillx:1, c: [
       {type:"txt", font:"6x8:2", label:"Waiting\nfor GPS", id:"status" },
       {type:"txt", font:"6x8", label:"---", id:"sat" },
     ]},
    ]},
    {type:"txt", fillx:1, filly:1, font:"6x8:2", label:"---", id:"gpstime" }
  ]},{lazy:true, btns: [
    { label : "Set", cb : setGPSTime},
    { label : "Back", cb : ()=>load() }
  ]});


function onGPS(f) {
  if (fix===undefined) {
    g.clear();
    Bangle.drawWidgets();
  }
  fix = f;
  if (fix.fix) {
    layout.status.label = "GPS\nAcquired";
  } else {
    layout.status.label = "Waiting\nfor GPS";
  }
  layout.sat.label = fix.satellites+" satellites";

  var t = ["","---",""];
  if (fix.time!==undefined) {
    t = fix.time.toString().split(" ");
    var tz = (new Date()).getTimezoneOffset()/-60;
    if (tz==0) tz="UTC";
    else if (tz>0) tz="UTC+"+tz;
    else tz="UTC"+tz;

    t = [t[1]+" "+t[2],t[3],t[4],t[5],tz];
  }

  layout.gpstime.label = t.join("\n");
  layout.render();
}

Bangle.on('GPS',onGPS);
