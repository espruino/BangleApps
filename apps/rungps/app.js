var storage = require("Storage");
var width = g.getWidth();
var height = g.getHeight();

var gps = {};
var heart_rate = {bpm: 0, confidence: 0};
var running = false;
var al_fix = false;
var al_rate = false;
var typen = false;
var vorig = null;
var total_distance = 0;
var start_time = 0|getTime();
var watch;
var interval;

var mainMenu;

function central(text, x, x2, y) {
  g.drawString(text, (x2 - g.stringWidth(text))/2+x, y);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function write(f) {
  var csv = [
    0|getTime(),
    gps.lat,
    gps.lon,
    gps.alt,
    gps.speed,
    gps.course,
    heart_rate.bpm
  ];
  f.write(csv.join(", ")+"\n");
}

function getTimediffrence() {
  var diffrence = 0|getTime() - start_time;
  return [Math.floor(diffrence / 60), diffrence % 60];
}

function scherm() {
  var speed = 0;
  var diffrence = getTimediffrence();
  if (gps.fix) {
    if (gps.speed != 0) {
      speed = 60/gps.speed;
    }
  }
  g.setColor(0, 0, 0);
  g.clear();
  g.setFont("Vector", 15);
  g.drawLine(width/2, 0, width/2, height);
  g.drawLine(0, height/2, width, height/2);
  central("Speed", 0, width/2, 5);
  central("Distance", width/2, width/2, 5);
  central("Heart rate", 0, width/2, height/2+5);
  central("Time", width/2, width/2, height/2+5);
  g.setFont("Vector", 30);
  if (gps.fix) {
    central(Math.floor(speed)+":"+Math.floor((speed * 60) % 60), 0, width/2, 20);
    if (vorig) {
      total_distance += getDistanceFromLatLonInKm(vorig.lat, vorig.lon, gps.lat, gps.lon);
      central(Math.floor(total_distance*100)/100, width/2, width/2, 20);
    }
  }
  central(heart_rate.bpm, 0, width/2, height/2+20);
  central(diffrence[0]+":"+diffrence[1], width/2, width/2, height/2+20);
  if (running) {
    g.setColor(0, 1, 0);
  } else {
    g.setColor(1, 0, 0);
  }
  g.fillRect(width/2-8, height/2-8, width/2+8, height/2+8);
}

function maakklaar(f) {
  if (!typen) {
    var fix = Bangle.getGPSFix();
    gps = fix;
    scherm();
    if (fix.fix) {
      if (!al_fix) {
        Bangle.buzz();
        console.log(fix.satellites);
        al_fix = true;
      }
      if (!al_rate) {
        al_rate = true;
      }
      if (running) {
        write(f);
      }
      vorig = gps;
    }
  }
}

function run() {
  var f = storage.open("rungps."+require("locale").date(new Date())+".csv","a");
  watch = setWatch(() => {running = !running;
               if (running === false) {
                 f.write("]");
                 stopRun();
               } else {
                 start_time = 0|getTime();
               }
               }, BTN1, {repeat: true});
  interval = setInterval(maakklaar, 2000, [f]);

  Bangle.setGPSPower(1, "rungps");
  Bangle.setHRMPower(1, "rungps");
  Bangle.on("HRM", (r) => { heart_rate = Number(r); });
}

function stopRun() {
  clearWatch(watch);
  clearInterval(interval);

  Bangle.setGPSPower(0, "rungps");
  Bangle.setHRMPower(0, "rungps");
  Bangle.removeListener("HRM", (r) => { heart_rate = Number(r); });
}

function parseFile(file) {
  var totalHeart_rate = 0;
  var distance = 0;
  var points = 0;
  var endTime = 0;

  var l = file.readLine();
  var all = l.split(", ");
  const startTime = all[0];
  var lat = all[1];
  var lon = all[2];
  totalHeart_rate += all[6]/10000;
  points += 1;

  var vorig = {lat: lat, lon: lon};

  l = file.readLine();
  while (l[0] !== "]") {
    all = l.split(", ");
    var time = all[0];
    lat = all[1];
    lon = all[2];

    distance += getDistanceFromLatLonInKm(vorig.lat, vorig.lon, lat, lon);
    totalHeart_rate += all[6]/10000;
    points += 1;
    vorig = {lat: lat, lon: lon};
    l = file.readLine();
    if (l[0] === "]") {
      endTime = time;
    }
  }
  var timeDifference = endTime - startTime;
  var speed = Math.floor(timeDifference/distance);
  distance = Math.floor(distance*100)/100;
  return [Math.floor(totalHeart_rate/points*10000), distance.toString()+"km", convertSecondsToTime(timeDifference),
    Math.floor(speed/60)+":"+Math.floor(speed % 60)+"min/km"];
}

function convertSecondsToTime(given_seconds) {
  var seconds = given_seconds % 60;
  var minutes = Math.floor(given_seconds/60) % 60;
  var hours = Math.floor(given_seconds/60/60);
  return hours+":"+minutes+":"+seconds;
}

function showData(file) {
  var title = file.replace("rungps.","").replace(".csv","");
  E.showMessage(/*LANG*/"Loading...", title);
  var f = storage.open(file, "r");
  var all = parseFile(f);
  var heart_rate = all[0];
  var distance = all[1];
  var timeDifference = all[2];
  var speed = all[3];
  E.showMenu({
    "": {title: file.replace("rungps.","").replace(".csv","")},
    "Speed": {value: speed},
    "Distance": {value: distance},
    "Time": {value: timeDifference},
    "Heart rate": {value: heart_rate},
    "< Back": () => E.showMenu(mainMenu)
  });
}

function results() {
  var allFiles = storage.list(/rungps\..+\.csv$/, {sf: true});
  E.showScroller({
    h : 40, c : allFiles.length,
    draw : (idx, r) => {
      g.setBgColor((idx&1)?"#666":"#CCC").clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
      g.setFont("6x8:2").drawString(allFiles[idx].replace("rungps.","").replace(".csv",""), r.x+10,r.y+4);
    },
    select : (idx) => showData(allFiles[idx])
  });
}

mainMenu = {
  "": { title: "-- Running --" }, // options
  "Run": () => run(),
  "Results": () => results()
};
E.showMenu(mainMenu);

