const typo1 = {
  width : 126, height : 43, bpp : 1,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("ABM8Bhd4gEB/AOKg/wgEPAQIAEgOAAgUP4F4n/AgEfBQkAn4EBn+D/H/j/A/4fDv0BAwX+n/7///w/+Fwf4h/+nkD/P/84PBn/8JIfgv/8CQPP/+P//9/5RBjA+Bwf/+/wn9/GAIhC8EBCIN+h4oB4H9/JOBFwOfwAsBHwM/DIMD//H8fx/n8vxwB4ARB/grBEQM/x/H8/jUAN/CIMH8P/EQP4/0+j8fx4sBMAN8j+H7/wJQPx/AuBSYPD+ED+F+j9/4aaBH4Pz+H8EIPAh/B/F9PQIaBH4PPDgN+n+APAPj+56B+F4CIInBDQJgBvYcBz/8P4IbBQAN+LIJgBh50Bv/zZ4JUBNoQEBToM//P7+/vMoIsBz+f4BqB4EA//v7/fYwJlCvykBYoMAVAK2CHwJKBd4LjB4D+Bg4OBJoPfwH+gf3CgN/ZQJOB//P+P/LAL/CCQP4ZQJXB/1/wf9/9/4AzB+EP8BOBYYPhbYJuBG4I2BbQU/gKZBj51B44bBB4P8GYMADQP4C4PgvxDBgEBeQXgIAP/fQP/wJLBDIIsBGAUH8//wY6BgfAgwOBHQIgBLYI0CAwQAEB4OAEYXAge/WIIAEv7CBKYQHCBwoHBC4K6BAYQSCAAkwAQMPQoIDBUIIAIn5KCcAIAJFwUAvAOJVYIbKAAUHWgIAMj6ABABl+BxsAVAxOIVAwAHA"))
};
const logoTemp = {
  width : 20, height : 20, bpp : 8,
  transparent : 254,
  buffer : require("heatshrink").decompress(atob("/wAb1msCSQURCauIxATlHaO74OXy4TQAAQTRE6Y7kCQYUPCaQSFChoTTJ84VECJ4AMA="))
};
const logoBatt = {
  width : 20, height : 20, bpp : 1,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("ABcH//44EAxEAhm/wH7/ENAgPb/EPz8A9kAhF//+AEpY"))
};
const logoHeart = {
  width : 20, height : 20, bpp : 1,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AA0B/P4n//4f//gEC7/8gHD4Egnkem+A//wh//gF/8EDCAMfwEAsAqHA"))
};
const logoCompass = {
  width : 20, height : 20, bpp : 1,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AAUfwEEgUAwEQiEAwUAkkAhkEgPCoF4kkPgVA2Eki0CoWAkEwCgVBgEIhEBgFAkEB/AuCA=="))
};
const logoGpsCoord = {
  width : 20, height : 20, bpp : 1,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AAkT/kB/Pgj0DgPgjEA+HAj+MgOY4EQwkhzEDj+AmHwgcGgEYg+A4F4g+fwE/5AsEA=="))
};
const logoGpsSpeed = {
  width : 20, height : 20, bpp : 1,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AAtggEGgEOs8A//wh//gF58EHz0D8F8n0H4AJDCYvmuAiEAAgA=="))
};
const logoTime = {
  width : 20, height : 20, bpp : 1,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AAUegFH/kG4FgvFDg+EiEAoGAgkIAgOGg+IsEAwUAhEggODgEQjEDgHA8ED/AuHA"))
};

require("Font7x11Numeric7Seg").add(Graphics);
const locale = require("locale");
let xyCenter = g.getWidth()/2;

// function Time
function drawTime(){
  let d = new Date();
  let time = locale.time(d,1);

  // typo's colors
  let r   = Math.random();
  let gr  = Math.random();
  let b   = Math.random();

  g.setColor("#F79F79");
  g.drawImage(typo1, 100, 25);
  // random typo
  g.setColor(r,gr,b);
  g.drawImage(typo1, 0, 45);
  g.setColor("#E3F09B");
  g.drawImage(typo1, 155, 65);
  g.setColor("#D36135");
  g.drawImage(typo1, 25, 75);
  g.setColor("#87B6A7");
  g.drawImage(typo1, 130, 35);
  g.setColor("#5B5941");
  g.drawImage(typo1, 60, 95);

  // Local time
  g.setFont("7x11Numeric7Seg",6);
  g.setColor("#ffffff");
  g.drawString(time, xyCenter, 160);
}

// function "Timestamp"
let intTimeStamp = null;
function timeStamp(){
  let d = new Date();
  let tst = Math.round(d.getTime());
  g.setFont("6x8",2);
  g.setColor("#ffffff");
  g.clearRect(0,220,240,240);
  g.drawImage(logoTime, 10, 220);
  g.drawString(tst, xyCenter, 230);
}

// function "GPS" : alt, speed, course
function gpsTrackSpeed(){
  Bangle.on('GPS',function(fix) {
    if (fix.fix) {
      let speed = fix.speed;
      let course = fix.course;
      let alt = fix.alt;
      g.setFont("Vector",20);
      g.setColor("#ffffff");
      g.clearRect(0,220,240,240);
      g.drawString(alt.toFixed(0)+"M "+speed.toFixed(0)+"km/h "+(isNaN(course) ? "---" : course.toFixed(0))+"°", xyCenter, 230);
    } else {
        g.setFont("Vector",20);
        g.setColor("#ffffff");
        g.clearRect(0,220,240,240);
        g.drawImage(logoGpsSpeed, 10, 220);
        g.drawString(fix.satellites+" satellites", xyCenter, 230);
      }
  });
}

// function "GPS" lat, lon
function gpsTrackCoords(){
  Bangle.on('GPS',function(fix) {
    if (fix.fix) {
      let lat = fix.lat;
      let lon = fix.lon;
      g.setFont("Vector",20);
      g.setColor("#ffffff");
      g.clearRect(0,220,240,240);
      g.drawString(lat.toFixed(5)+"° / "+lon.toFixed(5)+"°", xyCenter, 230);
    } else {
        g.setFont("Vector",20);
        g.setColor("#ffffff");
        g.clearRect(0,220,240,240);
        g.drawImage(logoGpsCoord, 10, 220);
        g.drawString(fix.satellites+" satellites", xyCenter, 230);
      }
  });
}

// function "Boussole"
function magTrack(){
  Bangle.on('mag', function(mag) {
  if (isNaN(mag.heading)) {
    g.setFont("Vector",20);
    g.setColor("#ffffff");
    g.clearRect(0,220,240,240);
    g.drawImage(logoCompass, 10, 220);
    g.drawString("tournez 360°", xyCenter, 230);
  } else {
      const directions = [
        'N',
        'NE',
        'E',
        'SE',
        'S',
        'SW',
        'W',
        'NW'
      ];
      let angle = mag.heading;
      let card = angle?  directions[Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8]:
  "-- ";
      g.setFont("Vector",20);
      g.setColor("#ffffff");
      g.clearRect(0,220,240,240);
      g.drawString(Math.round(angle)+"°    "+card, xyCenter, 230);
    }
  });
}

// function "Heart rate"
function heartRate(){
  Bangle.on('HRM',function(hrm) {
    let bpm = hrm.bpm;
    let confidence = hrm.confidence;
    g.setFont("Vector",20);
    g.clearRect(0,220,240,240);
    g.setColor(0xF800);
    g.drawImage(logoHeart, 10, 220);
    g.setColor("#ffffff");
    g.drawString(hrm ? bpm+" BPM ("+confidence+")" : "---", xyCenter, 230);
  });
}

// function "Battery"
let intBattery = null;
function battery(){
  let batt = parseInt(E.getBattery());
  g.setFont("Vector",20);
  g.setColor("#ffffff");
  g.clearRect(0,220,240,240);
  g.drawImage(logoBatt, 70, 220);
  g.drawString(batt+"%", xyCenter, 230);
}

// function "Temperature"
let intSetTemp = null;
function setTemp(){
  let temp = locale.temp(parseInt(E.getTemperature())-10);
  g.setFont("Vector",20);
  g.setColor("#ffffff");
  g.clearRect(0,220,240,240);
  g.drawImage(logoTemp, 70, 220);
  g.drawString(temp, xyCenter, 230);
}

// function date avec "Beats"
let intDrawDate = null;
function drawDate(){
  let d = new Date();
  function getUTCTime(d) {
  return d.toUTCString().split(' ')[4].split(':').map(function(d){return Number(d);});
  }
  let utc = getUTCTime(d);
  let beats = Math.floor((((utc[0] + 1) % 24) + utc[1] / 60 + utc[2] /   3600) * 1000 / 24);
  let newDate = locale.dow(d,1)+" "+locale.date(d,1);
  g.setFont("Vector",20);
  g.setColor("#ffffff");
  g.clearRect(0,220,240,240);
  g.drawString(newDate+" @"+beats, xyCenter, 230);
}

// function date avec "Secondes"
let intNextDate = null;
function nextDate(){
  let d = new Date();
  let date = locale.dow(d,1)+" "+d.getDate()+"/"+locale.month(d,1);
  let seconds = d.getSeconds();
  g.setFont("Vector",20);
  g.setColor("#ffffff");
  g.clearRect(0,220,240,240);
  g.drawString(date+" :"+seconds, xyCenter, 230);
}

// Switch des differentes fonctions
let next = 1;
function swap(){
  switch(next){
    case 1:
      intNextDate = setInterval(nextDate, 1000);
      nextDate();
      break;
    case 2:
      clearInterval(intNextDate);
      intSetTemp = setInterval(setTemp, 1000);
      setTemp();
      break;
    case 3:
      clearInterval(intSetTemp);
      intBattery = setInterval(battery, 1000);
      battery();
      break;
    case 4:
      clearInterval(intBattery);
      Bangle.setGPSPower(1);
      gpsTrackSpeed();
      break;
    case 5:
      Bangle.setGPSPower(0);
      Bangle.setCompassPower(1);
      magTrack();
      break;
    case 6:
      Bangle.setCompassPower(0);
      Bangle.setGPSPower(1);
      gpsTrackCoords();
      break;
    case 7:
      Bangle.setGPSPower(0);
      Bangle.setHRMPower(1);
      heartRate();
      break;
    case 8:
      Bangle.setHRMPower(0);
      intTimeStamp = setInterval(timeStamp, 75);
      timeStamp();
      break;
    case 9:
      clearInterval(intTimeStamp);
      intDrawDate = setInterval(drawDate, 1000);
      drawDate();
      break;
    case 10:
      clearInterval(intDrawDate);
      g.clearRect(0,220,240,240);
      break;
    default:
      g.clearRect(0,220,240,240);
      break;
  }
  next = Math.wrap(next, 10) + 1;
}

// function "Heure GPS"
function setGpsTime(){
  Bangle.setGPSPower(1);
  Bangle.on('GPS',function(gps) {
	  if (gps.fix) {
		    let curTime = gps.time.getTime()/1000;
        setTime(curTime);
        Bangle.setGPSPower(0);
        Bangle.buzz(100, 1);
        start();
      } else {
          stop();
          g.setFont("Vector",20);
          g.setColor("#ffffff");
          g.drawString("Mise à l'heure\npar satellites\nen cours...", xyCenter, 50);
      }
  });
}

function setButtons(){
  // BTN 1
  setWatch(() => {
    setGpsTime();
    Bangle.beep(500, 4000);
  }, BTN1, {repeat:true});
  // BTN 2
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
  // BTN 3
  setWatch(() => {
    swap();
    Bangle.beep();
  }, BTN3, {repeat:true});
}

let intervalRef = null;
function start(){
  g.reset();
  g.clear();
  Bangle.drawWidgets();
  intervalRef = setInterval(drawTime, 1000);
  drawTime();
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
