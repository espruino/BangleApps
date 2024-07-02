// touch listener for specific areas
function touchListener(b, c) {
  // check if inside any area
  for (var i = 0; i < aaa.length; i++) {
    if (!(c.x < aaa[i].x0 || c.x > aaa[i].x1 || c.y < aaa[i].y0 || c.y > aaa[i].y1)) {
      // check if drawing ongoing
      if (drawingID > 0) {
        // check if interrupt is set
        if (aaa[i].interrupt) {
          // stop ongoing drawing
          drawingID++;
          if (ATID) ATID = clearTimeout(ATID);
        } else {
          // do nothing
          return;
        }
      }
      // give feedback
      Bangle.buzz(25);
      // execute action
      aaa[i].funct();
    }
  }
}

// swipe listener for switching the displayed day
function swipeListener(h, v) {
  // give feedback
  Bangle.buzz(25);
  // set previous or next day
  prevDays += h;
  if (prevDays < -1) prevDays = -1;
  // redraw
  draw();
}

// day selection
function daySelection() {
  var date = Date(startDate - prevDays * 864E5).toString().split(" ");
  E.showPrompt(date.slice(0, 3).join(" ") + "\n" + date[3] + "\n" +
    prevDays + /*LANG*/" days before today", {
      title: /*LANG*/"Select Day",
      buttons: {
        "<<7": 7,
        "<1": 1,
        "Ok": 0,
        "1>": -1,
        "7>>": -7
      }
    }).then(function(v) {
    if (v) {
      prevDays += v;
      if (prevDays < -1) prevDays = -1;
      daySelection();
    } else {
      fromMenu();
    }
  });
}

// open settings menu
function openSettings() {
  // disable back behaviour to prevent bouncing on return
  backListener = () => {};
  // open settings menu
  eval(require("Storage").read("sleeplog.settings.js"))(fromMenu);
}

// draw progress as bar, increment on undefined percentage
function drawProgress(progress) {
  g.fillRect(19, 147, 136 * progress + 19, 149);
}

// (re)draw info data
function drawInfo() {
  // set active info type
  var info = infoData[infoType % infoData.length];
  // draw info
  g.clearRect(0, 69, 175, 105).reset()
    .setFont("6x8").setFontAlign(-1, -1)
    .drawString(info[0][0], 10, 70)
    .drawString(info[1][0], 10, 90)
    .setFont("12x20").setFontAlign(1, -1)
    .drawString((info[0][1] / 60 | 0) + "h " + (info[0][1] % 60) + "min", 166, 70)
    .drawString((info[1][1] / 60 | 0) + "h " + (info[1][1] % 60) + "min", 166, 90);
  // free ram
  info = undefined;
}


// draw graph for log segment
function drawGraph(log, date, pos) {
  // set y position
  var y = pos ? 144 : 110;
  // clear area
  g.reset().clearRect(0, y, width, y + 33);
  // draw x axis
  g.drawLine(0, y + 19, width, y + 19);
  // draw x label
  var stepWidth = width / 12;
  var startHour = date.getHours() + (pos ? 0 : 12);
  for (var x = 0; x < 12; x++) {
    g.fillRect(x * stepWidth, y + 20, x * stepWidth, y + 22);
    g.setFontAlign(-1, -1).setFont("6x8")
      .drawString((startHour + x) % 24, x * stepWidth + 1, y + 24);
  }

  // set height and color values:
  // status: unknown, not worn, awake, light sleep, deep sleep, consecutive
  // color:  black,   red,      green, cyan,        blue,       violet
  var heights = [0, 0.4, 0.6, 0.8, 1];
  var colors = [0, 63488, 2016, 2047, 31, 32799];

  // cycle through log
  log.forEach((entry, index, log) => {
    // calculate positions
    var x1 = Math.ceil((entry[0] - log[0][0]) / 72 * width);
    var x2 = Math.floor(((log[index + 1] || [date / 6E5])[0] - log[0][0]) / 72 * width);
    // calculate y2 position
    var y2 = y + 18 * (1 - heights[entry[1]]);
    // set color depending on status and consecutive sleep
    g.setColor(colors[entry[2] === 2 ? 5 : entry[1]]);
    // clear area, draw bar and top line
    g.clearRect(x1, y, x2, y + 18);
    g.fillRect(x1, y + 18, x2, y2).reset();
    if (y + 18 !== y2) g.fillRect(x1, y2, x2, y2);
  });
}

// draw information in an interruptable cycle
function drawingCycle(calcDate, thisID, cycle, log) {
  // reset analysis timeout ID
  ATID = undefined;

  // check drawing ID to continue
  if (thisID !== drawingID) return;

  // check cycle
  if (!cycle) {
    /* read log on first cycle */
    // set initial cycle
    cycle = 1;

    // read log
    log = slMod.readLog(calcDate - 864E5, calcDate);

    // draw progress
    drawProgress(0.6);
  } else if (cycle === 2) {
    /* draw stats on second cycle */

    // read stats and process into info data
    infoData = slMod.getStats(calcDate, 0, log);
    infoData = [
      [
        [ /*LANG*/"consecutive\nsleeping", infoData.consecSleep],
        [ /*LANG*/"true\nsleeping", infoData.deepSleep + infoData.lightSleep]
      ],
      [
        [ /*LANG*/"deep\nsleep", infoData.deepSleep],
        [ /*LANG*/"light\nsleep", infoData.lightSleep]
      ],
      [
        [ /*LANG*/"awake", infoData.awakeTime],
        [ /*LANG*/"not worn", infoData.notWornTime]
      ]
    ];
    // draw info
    drawInfo();

    // draw progress
    drawProgress(0.9);
  } else if (cycle === 3) {
    /* segment log on third cycle */
    // calculate segmentation date in 10min steps and index of the segmentation
    var segmDate = calcDate / 6E5 - 72;
    var segmIndex = log.findIndex(entry => entry[0] >= segmDate);

    // check if segmentation neccessary
    if (segmIndex > 0) {
      // split log
      log = [log.slice(segmIndex), log.slice(0, segmIndex)];
      // add entry at segmentation point
      if (log[0][0] !== segmDate)
        log[0].unshift([segmDate, log[1][segmIndex - 1][1], log[1][segmIndex - 1][2]]);
    } else if (segmIndex < 0) {
      // set log as second log entry
      log = [
        [], log
      ];
    } else {
      // add entry at segmentation point
      if (log[0] !== segmDate) log.unshift([segmDate, 0, 0]);
      // set log as first log entry
      log = [log, []];
    }

    // draw progress
    drawProgress(1);
  } else if (cycle === 4) {
    /* draw upper graph on fourth cycle */
    drawGraph(log[0], calcDate, 0);
  } else if (cycle === 5) {
    /* draw upper graph on fifth cycle */
    drawGraph(log[1], calcDate, 1);
  } else {
    /* stop cycle and set drawing finished */
    drawingID = 0;
    // give feedback
    Bangle.buzz(25);
  }

  // initiate next cycle if defined
  if (thisID === drawingID) ATID = setTimeout(drawingCycle, 10, calcDate, drawingID, ++cycle, log);
}

// return from a menu
function fromMenu() {
  // reset UI to custom mode
  Bangle.setUI(customUI);
  // enable back behaviour delayed to prevent bouncing
  setTimeout(() => backListener = load, 500);
  // redraw app
  draw();
}

// draw app
function draw() {
  // stop ongoing drawing
  drawingID++;
  if (ATID) ATID = clearTimeout(ATID);

  // clear app area
  g.reset().clearRect(0, 24, width, width);

  // set date to calculate data for
  var calcDate = new Date(startDate - prevDays * 864E5);

  // draw title
  g.setFont("12x20").setFontAlign(0, -1)
    .drawString( /*LANG*/"Night to " + require('locale').dow(calcDate, 1) + "\n" +
      require('locale').date(calcDate, 1), 87, 28);

  // reset graphics and define image string
  g.reset();
  var imgStr = "";
  // check which icon to set
  if (!global.sleeplog || global.sleeplog.conf.enabled !== true) {
    // set color and disabled service icon
    g.setColor(1, 0, 0);
    imgStr = "FBSBAOAAfwAP+AH3wD4+B8Hw+A+fAH/gA/wAH4AB+AA/wAf+APnwHw+D4Hx8A++AH/AA/gAH";
  } else if (global.sleeplog.debug) {
    // set debugging icon
    imgStr = typeof global.sleeplog.debug === "object" ?
      "FBSBAB/4AQDAF+4BfvAX74F+CBf+gX/oFJKBf+gUkoF/6BSSgX/oFJ6Bf+gX/oF/6BAAgf/4" : // file
      "FBSBAP//+f/V///4AAGAABkAAZgAGcABjgAYcAGDgBhwAY4AGcABmH+ZB/mAABgAAYAAH///"; // console
  }
  // draw service and settings icon
  if (imgStr) g.drawImage(atob(imgStr), 2, 36);
  g.reset().drawImage(atob("FBSBAAAeAAPgAHwAB4AA8AAPAwDwcA+PAP/wH/4D/8B/8A/gAfwAP4AH8AD+AA/AAPgABwAA"), width - 22, 36);

  // show loading info with progresss bar
  g.reset().drawRect(7, 117, width - 8, 157)
    .setFont("6x8").setFontAlign(0, 0)
    .drawString( /*LANG*/ "calculating data ...\nplease be patient :)", 87, 133)
    .drawRect(17, 145, 157, 151);

  // draw first progress
  drawProgress(0.1);

  // initiate drawing cycle
  ATID = setTimeout(drawingCycle, 10, calcDate, drawingID, 0);
}

// define sleeplog module
var slMod = require("sleeplog");

// read app timeout from settings
var appTimeout = (require("Storage").readJSON("sleeplog.json", true) || {}).appTimeout;

// set listener for back button
var backListener = load;
// define custom UI mode
var customUI = {
  mode: "custom",
  back: backListener,
  touch: touchListener,
  swipe: swipeListener
};

// define start values
var startDate = slMod.getLastBreak(); // date to start from
var prevDays = 0; //  number of previous days to display
var infoType = 0; //  type of info data to display
var infoData; //      storage for info data
var ATID; //          analysis timeout ID
var drawingID = 0; // drawing ID for ongoing process
// get screen width and center (zero based)
var width = g.getWidth() - 1;
//var center = width / 2 - 1;

// set areas and actions array
var aaa = [
  // day selection
  {
    x0: 26,
    x1: width - 26,
    y0: 24,
    y1: 68,
    interrupt: true,
    funct: () => daySelection()
  },
  // open settings
  {
    x0: width - 26,
    x1: width,
    y0: 24,
    y1: 68,
    interrupt: true,
    funct: () => openSettings()
  },
  // change info type
  {
    x0: 0,
    x1: width,
    y0: 69,
    y1: 105,
    funct: () => {
      // change info type
      infoType++;
      // redraw info
      drawInfo();
    }
  }
];

// clear and reset screen
g.clear(true);

// load and draw widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// set UI in custom mode
Bangle.setUI(customUI);

// set app timeout if defined
if (appTimeout) Bangle.setOptions({
  lockTimeout: appTimeout,
  backlightTimeout: appTimeout
});

// draw app
draw();
