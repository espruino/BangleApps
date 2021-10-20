<<<<<<< HEAD
var img = require("heatshrink").decompress(atob("mEwghC/AH8A1QWVhWq0AuVAAIuVAAIwT1WinQwTFwMzmQwTCYMjlUqGCIuBlWi0UzC6JdBIoMjC4UDmAuOkYXBPAWgmczLp2ilUiVAUDC4IwLFwIUBLoJ2BFwQwM1WjCgJ1DFwQwLFwJ1B0SQCkQWDGBQXBCgK9BDgKQBAAgwJOwUzRgIDBC54wCkZdGPBwACRgguDBIIwLFxEJBQIwLFxGaBYQwKFxQwLgAWGmQuBcAQwJC48ifYYwJgUidgsyC4L7DGBIXBdohnBCgL7BcYIXIGAqMCIoL7DL5IwERgIUBLoL7BO5QXBGAK7DkWiOxQXGFwOjFoUyFxZhDgBdCCgJ1CCxYxCgBABkcqOwIuNGAQXC0S9BLpgAFXoIwBmYuPAAYwCLp4wHFyYwDFyYwDFygwCCyoA/AFQA="));

Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);

g.clear();

var fix;
Bangle.setGPSPower(1);
Bangle.on('GPS',function(f) {
  fix = f;
  g.reset(1);
  g.setFont("6x8",2);
  g.setFontAlign(0,0);
  g.clearRect(90,30,239,90);
  if (fix.fix) {
    g.drawString("GPS",170,40);
    g.drawString("Acquired",170,60);
  } else {
    g.drawString("Waiting for",170,40);
    g.drawString("GPS Fix",170,60);
  }
  g.setFont("6x8");
  g.drawString(fix.satellites+" satellites",170,80);

  g.clearRect(0,100,239,239);
  var t = ["","","","---",""];
  if (fix.time!==undefined)
    t = fix.time.toString().split(" ");
    /*
 [
  "Sun",
  "Nov",
  "10",
  "2019",
  "15:55:35",
  "GMT+0100"
 ]
  */
  //g.setFont("6x8",2);
  //g.drawString(t[0],120,110); // day
  g.setFont("6x8",3);
  g.drawString(t[1]+" "+t[2],120,135); // date
  g.setFont("6x8",2);
  g.drawString(t[3],120,160); // year
  g.setFont("6x8",3);
  g.drawString(t[4],120,185); // time
  if (fix.time) {
    // timezone
    var tz = (new Date()).getTimezoneOffset()/-60;
    if (tz==0) tz="UTC";
    else if (tz>0) tz="UTC+"+tz;
    else tz="UTC"+tz;
    g.setFont("6x8",2);
    g.drawString(tz,120,210); // gmt
    g.setFontAlign(0,0,3);
    g.drawString("Set",230,120);
    g.setFontAlign(0,0);
  }
});

setInterval(function() {
  g.drawImage(img,48,48,{scale:1.5,rotate:Math.sin(getTime()*2)/2});
},100);
setWatch(function() {
  if (fix.time!==undefined)
    setTime(fix.time.getTime()/1000);
}, BTN2, {repeat:true});
=======
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
E.showMessage("Loading..."); // avoid showing rubbish on screen

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
>>>>>>> 1cc7674aa7f990f88644e78d9d19cd981ea34324
