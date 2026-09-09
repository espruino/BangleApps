var mysterySet = 0;
var prayerIndex = 0;
var running = false;
var nextPrayerTime = 0;
var pausedRemaining = 0;
var prayers = [];
var redrawInterval = null;
var homeScreen = true;

var mysterySets = [
  {
    name: "JOYFUL",
    mysteries: [
      "Annunciation",
      "Visitation",
      "Nativity",
      "Presentation",
      "Finding Jesus"
    ]
  },
  {
    name: "SORROWFUL",
    mysteries: [
      "Agony in Garden",
      "Scourging",
      "Crowning with Thorns",
      "Carrying the Cross",
      "Crucifixion"
    ]
  },
  {
    name: "GLORIOUS",
    mysteries: [
      "Resurrection",
      "Ascension",
      "Descent of Holy Spirit",
      "Assumption",
      "Coronation of Mary"
    ]
  },
  {
    name: "LUMINOUS",
    mysteries: [
      "Baptism of Jesus",
      "Wedding at Cana",
      "Proclamation of Kingdom",
      "Transfiguration",
      "Institution of Eucharist"
    ]
  }
];

var DUR = {
  creed: 30,
  ourFather: 20,
  hailMary: 15,
  gloryBe: 15,
  ohMyJesus: 15,
  mystery: 3,
  hailHolyQueen: 60,
  finalPrayer: 30
};

function clearScreen() {
  g.setBgColor(0, 0, 0);
  g.clear();
  g.setColor(1, 1, 1);
}

function centerText(text, y, size) {
  g.setFont("Vector", size);
  g.setFontAlign(0, 0);
  g.drawString(text, 88, y);
}

function wrapText(text, size, maxWidth) {
  g.setFont("Vector", size);
  var words = text.split(" ");
  var lines = [];
  var current = "";

  for (var i = 0; i < words.length; i++) {
    var test = current ? current + " " + words[i] : words[i];

    if (g.stringWidth(test) > maxWidth && current) {
      lines.push(current);
      current = words[i];
    } else {
      current = test;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function drawMysteryName(text, yCenter) {
  var maxWidth = 168;
  var size = 16;
  var lines = wrapText(text, size, maxWidth);

  while (lines.length > 2 && size > 10) {
    size -= 2;
    lines = wrapText(text, size, maxWidth);
  }

  g.setFont("Vector", size);
  g.setFontAlign(0, 0);

  var lineHeight = size + 6;
  var startY = yCenter - ((lines.length - 1) * lineHeight) / 2;

  for (var i = 0; i < lines.length; i++) {
    g.drawString(lines[i], 88, startY + i * lineHeight);
  }
}

function drawHome() {
  clearScreen();

  centerText("ROSARY", 20, 24);
  centerText(mysterySets[mysterySet].name, 65, 22);
  centerText("< SWIPE >", 100, 14);
  centerText("TAP TO START", 135, 13);
  centerText((mysterySet + 1) + "/4", 160, 12);
}

function buildPrayers() {
  prayers = [];

  prayers.push({
    name: "Apostles Creed",
    duration: DUR.creed
  });

  prayers.push({
    name: "Our Father",
    duration: DUR.ourFather
  });

  prayers.push({
    name: "Hail Mary",
    duration: DUR.hailMary
  });

  prayers.push({
    name: "Hail Mary",
    duration: DUR.hailMary
  });

  prayers.push({
    name: "Hail Mary",
    duration: DUR.hailMary
  });

  prayers.push({
    name: "Glory Be",
    duration: DUR.gloryBe
  });

  for (var d = 0; d < 5; d++) {

    prayers.push({
      name: mysterySets[mysterySet].mysteries[d],
      duration: DUR.mystery,
      mystery: d + 1
    });

    prayers.push({
      name: "Our Father",
      duration: DUR.ourFather,
      mystery: d + 1
    });

    for (var h = 1; h <= 10; h++) {
      prayers.push({
        name: "Hail Mary",
        duration: DUR.hailMary,
        mystery: d + 1,
        hailMary: h
      });
    }

    prayers.push({
      name: "Glory Be",
      duration: DUR.gloryBe,
      mystery: d + 1,
      decadeGlory: true
    });

    prayers.push({
      name: "Oh My Jesus",
      duration: DUR.ohMyJesus,
      mystery: d + 1
    });
  }

  prayers.push({
    name: "Hail Holy Queen",
    duration: DUR.hailHolyQueen
  });

  prayers.push({
    name: "Final Prayer",
    duration: DUR.finalPrayer
  });
}

function drawRosary() {
  clearScreen();

  var p = prayers[prayerIndex];

  centerText(mysterySets[mysterySet].name, 12, 12);

  if (p.mystery) {
    centerText("MYSTERY " + p.mystery + "/5", 29, 12);
  }

  if (p.hailMary) {
    centerText("HAIL MARY", 58, 20);
    centerText(p.hailMary + "/10", 88, 26);
  } else {
    drawMysteryName(p.name.toUpperCase(), 68);
  }

  var remaining;

  if (running) {
    remaining = Math.ceil(
      (nextPrayerTime - Date.now()) / 1000
    );

    if (remaining < 0) {
      remaining = 0;
    }
  } else {
    remaining = pausedRemaining;
  }

  centerText(remaining + "s", 118, 24);

  if (running) {
    centerText("TAP TO PAUSE", 147, 10);
  } else {
    centerText("PAUSED", 145, 14);
    centerText("TAP TO RESUME", 162, 10);
  }
}

function startPrayer() {
  var p = prayers[prayerIndex];

  pausedRemaining = p.duration;

  nextPrayerTime = Date.now() + p.duration * 1000;

  running = true;

  drawRosary();
}

function normalBuzz() {
  Bangle.buzz(180, 1);
}

function tripleBuzz() {
  Bangle.buzz(220, 1);

  setTimeout(function() {
    Bangle.buzz(220, 1);
  }, 350);

  setTimeout(function() {
    Bangle.buzz(220, 1);
  }, 700);
}

function nextPrayer() {
  prayerIndex++;

  if (prayerIndex >= prayers.length) {
    running = false;

    clearScreen();

    centerText("ROSARY", 55, 24);
    centerText("COMPLETE", 85, 21);
    centerText("GOD BLESS YOU", 120, 13);

    Bangle.buzz(500, 1);

    return;
  }

  if (prayers[prayerIndex].hailMary === 10) {
    tripleBuzz();
  } else {
    normalBuzz();
  }

  startPrayer();
}

function togglePause() {
  if (homeScreen) {
    return;
  }

  if (running) {
    pausedRemaining = Math.ceil(
      (nextPrayerTime - Date.now()) / 1000
    );

    if (pausedRemaining < 0) {
      pausedRemaining = 0;
    }

    running = false;
  } else {
    nextPrayerTime =
      Date.now() + pausedRemaining * 1000;

    running = true;
  }

  drawRosary();
}

function resetRosary() {
  running = false;
  prayerIndex = 0;
  nextPrayerTime = 0;
  pausedRemaining = 0;
  prayers = [];
  homeScreen = true;

  drawHome();
}

function selectMystery() {
  buildPrayers();

  prayerIndex = 0;
  homeScreen = false;

  startPrayer();
}

function handleTouch(x, y, type) {
  if (homeScreen) {
    selectMystery();
  } else {
    togglePause();
  }
}

function handleSwipe(directionLR, directionUD) {
  if (homeScreen) {

    if (directionLR === 1) {
      mysterySet++;

      if (mysterySet >= mysterySets.length) {
        mysterySet = 0;
      }

      drawHome();

    } else if (directionLR === -1) {
      mysterySet--;

      if (mysterySet < 0) {
        mysterySet = mysterySets.length - 1;
      }

      drawHome();
    }

  } else {

    if (directionUD === -1) {
      resetRosary();
    }
  }
}

function leaveApp() {
  resetRosary();
  Bangle.showLauncher();
}

function updateTimer() {
  if (!homeScreen && running) {

    if (Date.now() >= nextPrayerTime) {
      nextPrayer();
    } else {
      drawRosary();
    }
  }
}

Bangle.setUI({
  mode: "custom",

  touch: function(x, y, type) {
    handleTouch(x, y, type);
  },

  swipe: function(directionLR, directionUD) {
    handleSwipe(directionLR, directionUD);
  },

  btn: function() {
    leaveApp();
  },

  remove: function() {
    if (redrawInterval) {
      clearInterval(redrawInterval);
      redrawInterval = null;
    }

    running = false;
    prayerIndex = 0;
    prayers = [];
    homeScreen = true;
  }
});

clearScreen();
drawHome();

redrawInterval = setInterval(function() {
  updateTimer();
}, 500);