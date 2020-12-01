const typo = {
  width : 100, height : 50, bpp : 1,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AH4A5ggDCj/AAgf+AYIHCgYGCgEB//ggEMA4Vw+AiDCoQCCg0HBYYVCDAfgmAYJhkDDBXAiAYKMAgYHBggYS4/AjEAOYPAt/g//4gEOv0BwEf+EMg//h//MYXgjEDw+A4F4vB8EDAMwnAYBgeMSocwjAOC4FwjCuD8YJBsEYhkGgIYDjwYBBAIYBB4JsDgYYKgAYXoAYKY4IYKcAJjEB4PgPhAYBwx8D+CVEDANwJIX+n/8n/5//mgODVwUf4f/43/z/+DAMfY4IADTwIGEAAkDgeABhM4vALJgI4CABEPNYQA/AE4A="))
};
const logo = {
  width : 55, height : 25, bpp : 1,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("j+Ah/Ag/ggF/wE/4EfAwP/wH/4F/4ED/8BBAcH/4BBwYIBj/+h4ICD4P8BAYoB/gIBn/+FAP4//8BQMB/fxBAP9/kT+/j//x/YRB9/nAAP3+f/z/f5/PBAP/n+/BAf+v9/BAMf7+wvwIBv0/HwIuBGoN//xeB+AIDM4PhBAXwAwPD//B//gMYIIBNwPAh/+BAcAh/4g/8g5nBh/wAIMH/ClBCwKlCA=="))
};

!function(e,t){"function"==typeof define&&define.amd?define(["b"],function(r){return e.returnExportsGlobal=t()}):"object"==typeof module&&module.exports?module.exports=t(require("b")):e.OpenLocationCode=t()}(this,function(){var e={};e.CODE_PRECISION_NORMAL=10,e.CODE_PRECISION_EXTRA=11;var t="23456789CFGHJMPQRVWX",r=t.length,n=[20,1,.05,.0025,125e-6],o=(e.getAlphabet=function(){return t},e.isValid=function(e){if(!e||"string"!=typeof e)return!1;if(-1==e.indexOf("+"))return!1;if(e.indexOf("+")!=e.lastIndexOf("+"))return!1;if(1==e.length)return!1;if(e.indexOf("+")>8||e.indexOf("+")%2==1)return!1;if(e.indexOf("0")>-1){if(0==e.indexOf("0"))return!1;var r=e.match(new RegExp("(0+)","g"));if(r.length>1||r[0].length%2==1||r[0].length>6)return!1;if("+"!=e.charAt(e.length-1))return!1}if(e.length-e.indexOf("+")-1==1)return!1;for(var n=0,o=(e=e.replace(new RegExp("\\++"),"").replace(new RegExp("0+"),"")).length;n<o;n++){var i=e.charAt(n).toUpperCase();if("+"!=i&&-1==t.indexOf(i))return!1}return!0}),i=e.isShort=function(e){return!!o(e)&&(e.indexOf("+")>=0&&e.indexOf("+")<8)},a=e.isFull=function(e){return!!o(e)&&(!i(e)&&(!(t.indexOf(e.charAt(0).toUpperCase())*r>=180)&&!(e.length>1&&t.indexOf(e.charAt(1).toUpperCase())*r>=360)))},u=e.encode=function(t,r,n){if(t=Number(t),r=Number(r),n=void 0===n?e.CODE_PRECISION_NORMAL:Number(n),isNaN(t)||isNaN(r)||isNaN(n))throw"ValueError: Parameters are not numbers";if(n<2||n<10&&n%2==1)throw"IllegalArgumentException: Invalid Open Location Code length";t=l(t),r=h(r),90==t&&(t-=d(n));var o=s(t,r,Math.min(n,10));return n>10&&(o+=c(t,r,n-10)),o},f=e.decode=function(e){if(!a(e))throw"IllegalArgumentException: Passed Open Location Code is not a valid full code: "+e;e=(e=(e=e.replace("+","")).replace(new RegExp("0+"),"")).toUpperCase();var t=g(e.substring(0,10));if(e.length<=10)return t;var r=C(e.substring(10));return x(t.latitudeLo+r.latitudeLo,t.longitudeLo+r.longitudeLo,t.latitudeLo+r.latitudeHi,t.longitudeLo+r.longitudeHi,t.codeLength+r.codeLength)},l=(e.recoverNearest=function(e,t,r){if(!i(e)){if(a(e))return e;throw"ValueError: Passed short code is not valid: "+e}if(t=Number(t),r=Number(r),isNaN(t)||isNaN(r))throw"ValueError: Reference position are not numbers";t=l(t),r=h(r);var n=8-(e=e.toUpperCase()).indexOf("+"),o=Math.pow(20,2-n/2),d=o/2,s=f(u(t,r).substr(0,n)+e);return t+d<s.latitudeCenter&&s.latitudeCenter-o>=-90?s.latitudeCenter-=o:t-d>s.latitudeCenter&&s.latitudeCenter+o<=90&&(s.latitudeCenter+=o),r+d<s.longitudeCenter?s.longitudeCenter-=o:r-d>s.longitudeCenter&&(s.longitudeCenter+=o),u(s.latitudeCenter,s.longitudeCenter,s.codeLength)},e.shorten=function(e,t,r){if(!a(e))throw"ValueError: Passed code is not valid and full: "+e;if(-1!=e.indexOf("0"))throw"ValueError: Cannot shorten padded codes: "+e;var e=e.toUpperCase(),o=f(e);if(o.codeLength<6)throw"ValueError: Code length must be at least 6";if(t=Number(t),r=Number(r),isNaN(t)||isNaN(r))throw"ValueError: Reference position are not numbers";t=l(t),r=h(r);for(var i=Math.max(Math.abs(o.latitudeCenter-t),Math.abs(o.longitudeCenter-r)),u=n.length-2;u>=1;u--)if(i<.3*n[u])return e.substring(2*(u+1));return e},function(e){return Math.min(90,Math.max(-90,e))}),d=function(e){return e<=10?Math.pow(20,Math.floor(e/-2+2)):Math.pow(20,-3)/Math.pow(5,e-10)},h=function(e){for(;e<-180;)e+=360;for(;e>=180;)e-=360;return e},s=function(e,r,o){for(var i="",a=e+90,u=r+180,f=0;f<o;){var l=n[Math.floor(f/2)],d=Math.floor(a/l);a-=d*l,i+=t.charAt(d),f+=1,u-=(d=Math.floor(u/l))*l,i+=t.charAt(d),8==(f+=1)&&f<o&&(i+="+")}return i.length<8&&(i+=Array(8-i.length+1).join("0")),8==i.length&&(i+="+"),i},c=function(e,r,n){var o="",i=125e-6,a=125e-6;e+=90,r+=180;for(var u=(e%=1)%i,f=(r%=1)%a,l=0;l<n;l++){var d=Math.floor(u/(i/5)),h=Math.floor(f/(a/4));u-=d*(i/=5),f-=h*(a/=4),o+=t.charAt(4*d+h)}return o},g=function(e){var t=p(e,0),r=p(e,1);return new x(t[0]-90,r[0]-180,t[1]-90,r[1]-180,e.length)},p=function(e,r){for(var o=0,i=0;2*o+r<e.length;)i+=t.indexOf(e.charAt(2*o+r))*n[o],o+=1;return[i,i+n[o-1]]},C=function(e){for(var r=0,n=0,o=125e-6,i=125e-6,a=0;a<e.length;){var u=t.indexOf(e.charAt(a));r+=Math.floor(u/4)*(o/=5),n+=u%4*(i/=4),a+=1}return x(r,n,r+o,n+i,e.length)},x=e.CodeArea=function(t,r,n,o,i){return new e.CodeArea.fn.init(t,r,n,o,i)};return x.fn=x.prototype={init:function(e,t,r,n,o){this.latitudeLo=e,this.longitudeLo=t,this.latitudeHi=r,this.longitudeHi=n,this.codeLength=o,this.latitudeCenter=Math.min(e+(r-e)/2,90),this.longitudeCenter=Math.min(t+(n-t)/2,180)}},x.fn.init.prototype=x.fn,e});

latLonToGridSquare=function(o,a){var t,e,n,s,l,i,r,h,M,f=-100,g=0,u="ABCDEFGHIJKLMNOPQRSTUVWX",d=u.toLowerCase();function N(o){return"number"==typeof o?o:"string"==typeof o?parseFloat(o):"function"==typeof o?parseFloat(o()):void E.showMessage("can't convert \ninput: "+o)}return"object"==typeof o?2===o.length?(f=N(o[0]),g=N(o[1])):"lat"in o&&"lon"in o?(f=N(o.lat),g=N(o.lon)):"latitude"in o&&"longitude"in o?(f=N(o.latitude),g=N(o.longitude)):E.showMessage("can't convert \nobject "+o):(f=N(o),g=N(a)),isNaN(f)&&E.showMessage("lat is NaN"),isNaN(g)&&E.showMessage("lon is NaN"),90===Math.abs(f)&&E.showMessage("grid invalid \nat N/S"),90<Math.abs(f)&&E.showMessage("invalid lat: \n"+f),180<Math.abs(g)&&E.showMessage("invalid lon: \n"+g),t=f+90,e=g+180,n=u[Math.floor(t/10)],s=u[Math.floor(e/20)],l=""+Math.floor(t%10),i=""+Math.floor(e/2%10),h=60*(t-Math.floor(t)),M=60*(e-2*Math.floor(e/2)),r=d[Math.floor(h/2.5)],s+n+i+l+d[Math.floor(M/5)]+r};

require("Font7x11Numeric7Seg").add(Graphics);
const storage = require('Storage');
const locale = require('locale');
let coords;
let timer;
let fix;
const xyCenter = g.getWidth()/2;

function drawTime(){
  let d    = new Date();
  let da = d.toString().split(" ");
  let date = locale.dow(d,1)+" "+locale.date(d,1);
  let time = da[4].split(":");
  let hours = time[0],
    minutes = time[1],
    seconds = time[2];

  function getUTCTime(d) {
    return d.toUTCString().split(' ')[4].split(':').map(function(d){return Number(d);});
  }
  let utc  = getUTCTime(d);
  let beats = Math.floor((((utc[0] + 1) % 24) + utc[1] / 60 + utc[2] / 3600) * 1000 / 24);

  g.setColor(1,1,1);

  // middle time
  g.setFont("7x11Numeric7Seg",3);
  g.drawString(`${hours}:${minutes}:${seconds}`, xyCenter, 50, true);

  // middle date
  g.setFont("6x8",2);
  g.clearRect(180,75,240,95);
  g.setColor(1,0,0);
  g.drawString(date+" @"+beats,xyCenter,90);

  // logo
  g.setColor("#4C4C4C");
  g.drawImage(typo, 40, 197);
  g.drawImage(logo, 135, 213);
}

//Write coordinates to file
function updateCoords(){
  storage.write('coords.json', coords);
}

//set coordinates to default
function resetCoords() {
  coords = {
    lat : 45.433858,
    lon : 4.372231,
    alt :  573.7,
    qth : "JN25ek",
    plusCodes : "C9MC+GV",
  };
  updateCoords();
}

function getGpsFix(){
  Bangle.on('GPS', function(fix) {
    g.clearRect(0,100,240,200);

    if (fix.fix == 1) {
      setTime(fix.time.getTime()/1000);
      let gpsString = "lat: " + fix.lat.toFixed(6) + "\nlon: " + fix.lon.toFixed(6) + "alt: " + fix.alt;
      coords.lat = fix.lat;
      coords.lon = fix.lon;
      coords.alt = fix.alt;
      coords.qth = latLonToGridSquare(fix.lat,fix.lon);
      coords.plusCodes = OpenLocationCode.encode(fix.lat,fix.lon);
      updateCoords();
      g.setColor(1,0,0);
      g.setFont("Vector12",15);
      g.drawString("Got GPS fix",xyCenter,115);
      g.setColor(1,1,1);
      g.setFont("Vector12",15);
      g.drawString(gpsString,xyCenter,125);
      g.drawString("Press BTN5 to return",xyCenter,135);
      clearInterval(timer);
      timer = undefined;
    }
    else {
      g.setColor(1,0,0);
      g.setFont("Vector12",15);
      g.drawString(fix.satellites+" Satellites",xyCenter,115);
      g.drawString("Press BTN5 to stop",xyCenter, 135);
    }
  });
}

function DDToDMS(deg, lat){
  let direction;
  let absolute = Math.abs(deg);
  let degrees = Math.floor(absolute);
  let minutesNotTruncated = (absolute - degrees) * 60;
  let minutes = Math.floor(minutesNotTruncated);
  let seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

  if (lat) {
    direction = deg >= 0 ? "N" : "S";
  } else {
      direction = deg >= 0 ? "E" : "W";
    }

  return degrees + "°" + minutes + "'" + seconds + "''" + direction;
}

function DDToDM(lat, lon){
  let convertLat = Math.abs(lat);
  let LatDeg = Math.floor(convertLat);
  let LatMin = (Math.floor((convertLat - LatDeg) * 60));
  let LatCardinal = ((lat > 0) ? "N" : "S");

  let convertLng = Math.abs(lon);
  let LonDeg = Math.floor(convertLng);
  let LonMin = (Math.floor((convertLng - LonDeg) * 60));
  let LonCardinal = ((lon > 0) ? "E" : "W");

  return "Lat: " + LatDeg + "°" + LatMin  + "'" + LatCardinal + "\nLon: " + LonDeg + "°" + LonMin + "'" + LonCardinal + " (DM)";
}

// GPS coords
function gps(){
  g.setFont("6x8",2);
  g.setColor(1,1,1);
  g.clearRect(0,116,240,147);
  g.drawString("Lat: " + coords.lat.toFixed(6) + "\nLon: " + coords.lon.toFixed(6) + "\nAlt: " + coords.alt + " M", xyCenter,124);
  g.drawString("\nQTH: " + coords.qth + "\n+co: " + coords.plusCodes, xyCenter,157);
}

function temp(){
  let temp = parseInt(E.getTemperature());
  g.setColor(1,1,1);
  g.setFont("6x8",2);
  g.clearRect(0,116,240,147);
  g.drawString("Temperature: "+temp+"°c",xyCenter,124);
}
function DMS(){
  g.setColor(1,1,1);
  g.setFont("6x8",2);
  g.clearRect(0,116,240,147);
  g.drawString("Lat: " + DDToDMS(coords.lat,1) + "\nLon: " + DDToDMS(coords.lon,0),xyCenter,124);
}
function DM(){
  g.setColor(1,1,1);
  g.setFont("6x8",2);
  g.clearRect(0,116,240,147);
  g.drawString(DDToDM(coords.lat,coords.lon),xyCenter,124);
}

let next = 1;
function swap(){
  switch(next){
    case 1:
      temp();
      break;
    case 2:
      DMS();
      break;
    case 3:
      DM();
      break;
    case 4:
      gps();
      break;
  }
  next = Math.wrap(next, 4) + 1;
}

function setButtons(){
  // BTN 1
  setWatch(() => {
    swap();
    Bangle.beep();
  }, BTN1, {edge:"rising", repeat:true});

  // BTN 2
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

  // BTN 4
  setWatch(() => {
    stop();
    Bangle.buzz(250);
    g.clearRect(0,24,240,200);
    g.setColor(1,0,0);
    g.setFont("Vector12",15);
    g.drawString("--- Getting GPS signal ---",xyCenter, 115);
    Bangle.setGPSPower(1);
    timer = setInterval(getGpsFix, 10000);
  }, BTN4, {edge:"rising", debounce:50, repeat:true});

  // BTN 5
  setWatch(() => {
    if (timer) clearInterval(timer);
    timer = undefined;
    Bangle.setGPSPower(0);
    g.clearRect(0,24,240,200);
    start();
    Bangle.buzz(250);
  }, BTN5, {edge:"rising", debounce:50, repeat:true});
}

let intervalRef = null;
function start(){
  g.reset();
  g.clear();
  Bangle.drawWidgets();
  intervalRef = setInterval(drawTime, 1000);
  drawTime();
  coords = storage.readJSON('coords.json',1);
  if (!coords) resetCoords();
  gps();
}

function stop(){
  clearInterval(intervalRef);
}

// ANCS Widget
var SCREENACCESS = {
  withApp:true,
  request:function(){
    this.withApp=false;
    stop();
    clearWatch();
  },
  release:function(){
    this.withApp=true;
    start();
    setButtons();
  }
};

// handle switch display on by pressing BTN1
Bangle.on('lcdPower', function(on) {
  if (!SCREENACCESS.withApp) return;
  if (on) {
    start();
  } else {
      stop();
    }
});

// clean app screen
Bangle.loadWidgets();
start();
setButtons();
