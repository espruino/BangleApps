/*
  Golf-GPS app v0.01
  written by JeonLab (https://jeonlab.wordpress.com)
  6/26/2024
*/

var currentHole = 1,
  totalShots = 0,
  courseName = "",
  latLast,
  lonLast,
  W = g.getWidth(),
  H = g.getHeight(),
  lat = Array(19).fill(0),
  lon = Array(19).fill(0),
  par = Array(19).fill(0),
  score = Array(19).fill(0),
  playON = false;

var fileIndx;
var scoreFiles;

require("Font7x11Numeric7Seg").add(Graphics);

Graphics.prototype.setFontDroidSansMono52 = function() {
  // Actual height 52 (53 - 2)
  // 1 BPP
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('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'))),
    46,
    atob("HCQnHCYmKCYmJyYmGw=="),
    70 | 65536
  );
};

Graphics.prototype.setFontDroidSansMono35 = function() {
  // Actual height 35 (37 - 3)
  // 1 BPP
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('AH/wAgcB/AFDgf8ArYjFF4oAehAFEnAFELIoFEj4FEv4FDgP/8AFCh//wAFCn/+Cwf/LAcH//AE4f/E5EDE5UfE4kfQAkfE4YFBMIkYRjo8BIQd//49COoIABJIJTBAAI+BNQIABDAIcBAAJQBh4IBg4FBj4aBcYRTDAoMeAoV4AqQdDAoopCF4kPHwQCCI4hTFL4rQBAALcD//8YwivEAEVgAoj6DAoxiCIAb1Eg7JDAoJLEh59BAAUfMoSJCArgAbZYMDNAhTCNAQFCgbRCAoMHAoRfBj5BCYIQFEv4pBjwFB/wFDgP8AoYoBAocH+AFDh/gAoIjBn/AAod/wAFC4b6BAoMP//+Aog/BAoMH/7ABNYX/YAIFBgAcBAoZ9EApIAQgIrBTYUBG4MHRIIFCSoSnCeoYFHNYM8HYQFFQYIFRvgFOFIKPBGoWBAonH95TD//v44FD56dCUIPHToShBw//NAX+A4JiCOwKpCABxIBAAf8AgcDAokHAokfAok/Aon/PwI6C/wFDg/4AocP+AFDn/AAod/wAFCDgKiCH4YFCDgIFDj56BAof/AAKbCAqwACIIYFZAC8BLgJsB8DvCI4PwAosAKYYDBAoYLBvAFGj0AAsY1DAo/8JoQFBv7CCAoX/MoIFBn4FEJ4PAewf/wAFCg7rBADR4CFAYjDHQIvDdIQ7BgIFCI4MDAoQeBg/8nkHAoJiBvEBOIMP4B3Dh+AWYiPEAoqnPUJUDAoabBUJoABUI6DDLAQAYF4IFZhAFEnAFEMoaqBAokfAol/AobHBO4ZlBNYJ3CcYQFB/5rCj0HQQceQQJHDv/8RoiTFf4QFBE4QFCHAIFDUgbjCAD1+QAZrBHoMD/0DNYReBw5PCAoPPPoR7BAov/wJ4Bj4eBU4UfgIFBvCJCO4IFDB4IFDAYIRJDoYjDFIWDUIIFBHYpHFLIYFDYAYiBNYYsCWokAnifan7GEHIQABGYJLBuBBCNYZTBNYYFFj+An4FDAIQFDh6JEApo3BAoodCgJJBFIUDAoWAn0PRIICBvl/d4YABfYYABR4JlBAAJxDMwR9CPAkHMoIA/ABUPMYKJBPwPAgJgCAq4jFAAg'))),
    46,
    atob("FBkbFBsaHBobGxsbEw=="),
    48 | 65536
  );
};

var courseData = require("Storage").open("course-data", "r");

var lastFix = {
  lat: 0,
  lon: 0,
  alt: 0, // altitude in m
  speed: 0, // km/h
  course: 0, // heading in degrees
  time: 0,
  satellites: 0,
  fix: 0,
  hdop: 0, // x5 ~ meter accuracy
};

const zeroPad = (num, places) => String(num).padStart(places, '0');

function onGPS(fix) {
  Object.assign(lastFix, fix);
  if (lastFix.fix && playON) showPlayData();
}

function radians(degrees) {
  return degrees * Math.PI / 180;
}

function readOneCourseData() {
  // Clear previous data
  lat = [];
  lon = [];
  par = [];
  let l = courseData.readLine();
  courseName = l;
  // Read one course data & initialize score
  for (let i = 1; i < 19; i++) {
    l = courseData.readLine();
    if (l !== undefined) {
      const parts = l.split(',');
      lat[i] = parseFloat(parts[0]);
      lon[i] = parseFloat(parts[1]);
      par[i] = parseInt(parts[2]);
      score[i] = 0;
    }
  }
}

function distanceCalc(lat1, long1, lat2, long2) {
  let delLat = Math.abs(lat1 - lat2) * 111194.9; // 111194.9 = (2*6371000*pi)/360, 6371000 ~ Earth's average radius
  let delLong = Math.abs(long1 - long2) * 111194.9 * Math.cos(radians((lat1+lat2)/2));
  return Math.sqrt(delLat * delLat + delLong * delLong)/0.9144; // in yards
}

function mainMenu() {
  E.showPrompt("Play now or\n\nView scores?", {
    title: "Golf GPS",
    buttons: {
      "PLAY": 1,
      "VIEW": 2
    }
  }).then(choice => {
    if (choice === 1) fixGPS();
    else browseScore();
  });
}

function browseScore() {
  scoreFiles = require("Storage").list(/^Scorecard-/);
  if (scoreFiles.length === 0) {
    E.showPrompt("No score file found.\n\nYou need to play at least a game.", {
      title: `Error`,
      buttons: {
        "END": 1
      }
    }).then(choice => {
      if (choice === 1) load();
    });
  }
  fileIndx = scoreFiles.length - 1;
  browseFiles();
}

function browseFiles() {
  const browsefile = require("Storage").open(scoreFiles[fileIndx].substring(0, 18), "r");
  const l = browsefile.read(80);

  E.showPrompt(l, {
    buttons: {
      "<<": 1,
      ">>": 2,
      "End": 3
    }
  }).then(choice => {
    if (choice === 1) fileIndx = (fileIndx - 1 + scoreFiles.length) % scoreFiles.length;
    else if (choice === 2) fileIndx = (fileIndx + 1) % scoreFiles.length;
    else if (choice === 3) load();
    browseFiles();
  });
}

function fixGPS() {
  Bangle.on('GPS', onGPS);
  Bangle.setGPSPower(1, "golf-gps");
  E.showMessage("Golf GPS v0.1\n\nWaiting for GPS fix...\n\nwritten by\nJinseok Jeon\n\n ");

  let fixInterval = setInterval(() => {
    let date = new Date();
    g.clearRect(0, 150, W, H);
    g.setFontAlign(1, 1).setFont('6x8:3').drawString(lastFix.hdop, W, H);
    g.setFontAlign(-1, 1).setFont('6x8:3').drawString((date.getHours() > 12 ? date.getHours() % 12 : date.getHours()) + ':' + zeroPad(date.getMinutes(), 2), 2, H);
    if (lastFix.fix && lastFix.hdop <= 5) {
      clearInterval(fixInterval);
      searchCourse();
    }
  }, 1000); // Check every second
}

function searchCourse() {
  readOneCourseData();
  if (!courseName) {
    courseData = require("Storage").open("course-data", "r");
    E.showPrompt("Scan again\nor quit?", {
      title: "No course found",
      buttons: {
        "SCAN": 1,
        "QUIT": 2
      }
    }).then(choice => {
      if (choice === 1) searchCourse();
      else load();
    });
  } else if (distanceCalc(lastFix.lat, lastFix.lon, lat[1], lon[1]) < 1000) {
    Bangle.buzz();
    E.showPrompt(courseName + "\nIs this correct?", {
      buttons: {
        " YES ": 1,
        " NO ": 2
      }
    }).then(choice => {
      if (choice == 1) {
        E.showPrompt("Front or Back", {
          title: courseName,
          buttons: {
            "FRONT": 1,
            "BACK": 2
          }
        }).then(choice => {
          currentHole = (choice === 1) ? 1 : 10;
          playON = true;
          showPlayData();
        });
      } else searchCourse();
    });
  } else searchCourse();
}

function showPlayData() {
  let date = new Date();
  let distanceToHole = distanceCalc(lastFix.lat, lastFix.lon, lat[currentHole], lon[currentHole]);
  let distanceFromLast = distanceCalc(lastFix.lat, lastFix.lon, latLast, lonLast) || 0;

  g.reset().clearRect(Bangle.appRect);

  // distance to hole in yards
  g.setColor(g.theme.fg).setFontAlign(1, -1).setFontDroidSansMono52();
  g.drawString(distanceToHole > 1000 ? "000" : distanceToHole.toFixed(0), W - 2, 1);

  // distance from last shot in yards
  g.setFontDroidSansMono35().setColor('#00f').drawString(distanceFromLast.toFixed(0), W - 2, 70);

  // hole number and par color(red:3, green:4, blue:5)
  g.setColor(par[currentHole] == 3 ? '#f00' : (par[currentHole] == 4 ? '#0f0' : '#00f'));
  g.fillRect(3, 3, 47, 47);
  g.setColor(par[currentHole] == 4 ? '#000' : '#fff').setFontAlign(0, -1).drawString(currentHole, 24, 5);

  // total shots and current shots
  g.setColor(g.theme.fg).setFontAlign(-1, -1);
  g.drawString(totalShots, 3, 70); // total shots
  g.drawString(score[currentHole], 3, 128); // current shots
  g.setFont("6x8:2").drawString('TOTAL', 3, 54);
  g.drawString('THIS', 3, 112);

  // clock
  g.setFontAlign(1, 1).setFont("7x11Numeric7Seg:4").drawString((date.getHours() > 12 ? date.getHours() % 12 : date.getHours()) + ':' + zeroPad(date.getMinutes(), 2), W - 2, H - 4);
  g.drawString((date.getHours() > 12 ? date.getHours() % 12 : date.getHours()) + ':' + zeroPad(date.getMinutes(), 2), W - 1, H - 3);

  // battery level bar
  g.setColor('#000').drawRect(59, H * 2 / 3 - 2, W - 5, H * 2 / 3 + 4);
  g.drawRect(58, H * 2 / 3 - 1, W - 4, H * 2 / 3 + 5);
  g.setColor(E.getBattery() > 15 ? '#03f' : '#f00').fillRect(60, H * 2 / 3, 60 + E.getBattery() / 100 * (W - 60), H * 2 / 3 + 3);

  // hdop level indicator
  if (lastFix.hdop < 5) g.setColor('#0f0').fillRect(60, H / 3, 96, H / 3 + 5);
  if (lastFix.hdop < 2) g.fillRect(100, H / 3, 136, H / 3 + 5);
  if (lastFix.hdop < 1) g.fillRect(140, H / 3, W, H / 3 + 5);
}

function finishGame() {
  let date = new Date();
  let saveFileContents = ' ';
  let parTotal = 0;

  Bangle.setGPSPower(0, "golf-gps");
  const saveFilename = `Scorecard-${date.getFullYear()}${zeroPad(date.getMonth() + 1, 2)}${zeroPad(date.getDate(), 2)}`;
  const saveFile = require("Storage").open(saveFilename, "w");
  for (let i = 1; i < 19; i++) {
    saveFileContents += String(score[i] - par[i]).padStart(2, ' ');
    saveFileContents += (i == 18 ? ' ' : (i % 6 == 0 ? ' \n ' : ''));
    parTotal += par[i];
  }
  saveFile.write(`${date.getFullYear()}_${zeroPad(date.getMonth() + 1, 2)}_${zeroPad(date.getDate(), 2)}\n${courseName}${totalShots}/${parTotal}\n${saveFileContents}`);
  E.showPrompt(saveFileContents, {
    title: `${totalShots}/${parTotal}`,
    buttons: {
      "END": 1
    }
  }).then(choice => {
    if (choice === 1) load();
  });
}

setWatch(() => {
  playON = false;
  E.showPrompt("Finish game?", {
    title: courseName,
    buttons: {
      " YES ": 1,
      " NO ": 2
    }
  }).then(choice => {
    if (choice === 1) {
      finishGame();
    } else {
      playON = true;
      showPlayData();
    }
  });
}, (process.env.HWVERSION === 2) ? BTN1 : BTN2, {
  repeat: true,
  edge: "falling"
});

Bangle.on('swipe', function(directionLR, directionUD) {
  if (playON) {
    currentHole = (currentHole - directionLR) % 18 || 18;
    score[currentHole] = Math.max(0, score[currentHole] - directionUD);
    totalShots = Math.max(0, totalShots - directionUD);
    if (directionUD === -1) {
      latLast = lastFix.lat;
      lonLast = lastFix.lon;
    }
  }
});

Bangle.loadWidgets();
require("widget_utils").hide();

// keep unlocked
Bangle.setLCDTimeout(0);
Bangle.setLocked(false);

// keep backlight off
Bangle.setLCDBrightness(0);

mainMenu();
