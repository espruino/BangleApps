// set storage and define settings
var storage = require("Storage");
var breaktod, maxawake, minconsec;

// read required settings from storage
function readSettings(settings) {
  breaktod = settings.breaktod || (settings.breaktod === 0 ? 0 : 10); // time of day when to start/end graphs
  maxawake = settings.maxawake || 36E5; // 60min in ms
  minconsec = settings.minconsec || 18E5; // 30min in ms
}

// define draw log function
function drawLog(topY, viewUntil) {
  // set default view time
  viewUntil = viewUntil || Date();

  // define parameters
  var statusValue = [0, 0.4, 0.6, 1]; // unknown, not worn, awake, sleeping, consecutive sleep
  var statusColor = [0, 63488, 2016, 32799, 31]; // black, red, green, violet, blue
  var period = 432E5; // 12h
  var graphHeight = 18;
  var labelHeight = 12;
  var width = g.getWidth();
  var timestamp0 = viewUntil.valueOf() - period;
  var y = topY + graphHeight;

  // read 12h wide log
  var log = require("sleeplog").readLog(0, timestamp0, viewUntil.valueOf());

  // format log array if not empty
  if (log.length) {
    // if the period goes into the future add unknown status at the beginning
    if (viewUntil > Date()) log.unshift([Date().valueOf(), 0]);

    // check if the period goes earlier than logged data
    if (log[log.length - 1][0] < timestamp0) {
      // set time of last entry according to period
      log[log.length - 1][0] = timestamp0;
    } else {
      // add entry with unknown status at the end
      log.push([timestamp0, 0]);
    }

    // remap each element to [status, relative beginning, relative end, duration]
    log = log.map((element, index) => [
      element[1],
      element[0] - timestamp0,
      (log[index - 1] || [viewUntil.valueOf()])[0] - timestamp0,
      (log[index - 1] || [viewUntil.valueOf()])[0] - element[0]
    ]);

    // start with the oldest entry to build graph left to right
    log.reverse();
  }

  // clear area
  g.reset().clearRect(0, topY, width, y + labelHeight);
  // draw x axis
  g.drawLine(0, y + 1, width, y + 1);
  // draw x label
  var hours = period / 36E5;
  var stepwidth = width / hours;
  var startHour = 24 + viewUntil.getHours() - hours;
  for (var x = 0; x < hours; x++) {
    g.fillRect(x * stepwidth, y + 2, x * stepwidth, y + 4);
    g.setFontAlign(-1, -1).setFont("6x8")
      .drawString((startHour + x) % 24, x * stepwidth + 1, y + 6);
  }

  // define variables for sleep calculation
  var consecutive = 0;
  var output = [0, 0]; // [estimated, true]
  var i, nosleepduration;

  // draw graph
  log.forEach((element, index) => {
    // set bar color depending on type
    g.setColor(statusColor[consecutive ? 4 : element[0]]);

    // check for sleeping status
    if (element[0] === 3) {
      // count true sleeping hours
      output[1] += element[3];
      // count duration of subsequent non sleeping periods
      i = index + 1;
      nosleepduration = 0;
      while (log[i] !== undefined && log[i][0] < 3 && nosleepduration < maxawake) {
        nosleepduration += log[i++][3];
      }
      // check if counted duration lower than threshold to start/stop counting
      if (log[i] !== undefined && nosleepduration < maxawake) {
        // start counting consecutive sleeping hours
        consecutive += element[3];
        // correct color to match consecutive sleeping
        g.setColor(statusColor[4]);
      } else {
        // check if counted consecutive sleeping greater then threshold
        if (consecutive >= minconsec) {
          // write verified consecutive sleeping hours to output
          output[0] += consecutive + element[3];
        } else {
          // correct color to display a canceled consecutive sleeping period
          g.setColor(statusColor[3]);
        }
        // stop counting consecutive sleeping hours
        consecutive = 0;
      }
    } else {
      // count durations of non sleeping periods for consecutive sleeping
      if (consecutive) consecutive += element[3];
    }

    // calculate points
    var x1 = Math.ceil(element[1] / period * width);
    var x2 = Math.floor(element[2] / period * width);
    var y2 = y - graphHeight * statusValue[element[0]];
    // draw bar
    g.clearRect(x1, topY, x2, y);
    g.fillRect(x1, y, x2, y2).reset();
    if (y !== y2) g.fillRect(x1, y2, x2, y2);
  });

  // clear variables
  log = undefined;

  // return convert output into minutes
  return output.map(value => value /= 6E4);
}

// define function to draw the analysis
function drawAnalysis(toDate) {
  //var t0 = Date.now();

  // get width
  var width = g.getWidth();

  // define variable for sleep calculation
  var outputs = [0, 0]; // [estimated, true]

  // clear analysis area
  g.clearRect(0, 71, width, width);

  // draw log graphs and read outputs
  drawLog(110, toDate).forEach(
    (value, index) => outputs[index] += value);
  drawLog(144, Date(toDate.valueOf() - 432E5)).forEach(
    (value, index) => outputs[index] += value);

  // draw outputs
  g.reset(); // area: 0, 70, width, 105
  g.setFont("6x8").setFontAlign(-1, -1);
  g.drawString("consecutive\nsleeping", 10, 70);
  g.drawString("true\nsleeping", 10, 90);
  g.setFont("12x20").setFontAlign(1, -1);
  g.drawString(Math.floor(outputs[0] / 60) + "h " +
    Math.floor(outputs[0] % 60) + "min", width - 10, 70);
  g.drawString(Math.floor(outputs[1] / 60) + "h " +
    Math.floor(outputs[1] % 60) + "min", width - 10, 90);

  //print("analysis processing seconds:", Math.round(Date.now() - t0) / 1000);
}

// define draw night to function
function drawNightTo(prevDays) {
  // calculate 10am of this or a previous day
  var toDate = Date();
  toDate = Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() - prevDays, breaktod);

  // get width
  var width = g.getWidth();
  var center = width / 2;

  // reduce date by 1s to ensure correct headline
  toDate = Date(toDate.valueOf() - 1E3);

  // clear heading area
  g.clearRect(0, 24, width, 70);

  // display service states: service, loggging and powersaving
  if (!sleeplog.enabled) {
    // draw disabled service icon
    g.setColor(1, 0, 0)
      .drawImage(atob("FBSBAAH4AH/gH/+D//w/n8f5/nud7znP85z/f+/3/v8/z/P895+efGPj4Hw//8H/+Af+AB+A"), 2, 36);
  } else if (!sleeplog.logfile) {
    // draw disabled log icon
    g.reset().drawImage(atob("EA6BAM//z/8AAAAAz//P/wAAAADP/8//AAAAAM//z/8="), 4, 40)
      .setColor(1, 0, 0).fillPoly([2, 38, 4, 36, 22, 54, 20, 56]);
  }
  // draw power saving icon
  if (sleeplog.powersaving) g.setColor(0, 1, 0)
    .drawImage(atob("FBSBAAAAcAD/AH/wP/4P/+H//h//4//+fv/nj/7x/88//Of/jH/4j/8I/+Af+AH+AD8AA4AA"), width - 22, 36);

  // draw headline
  g.reset().setFont("12x20").setFontAlign(0, -1);
  g.drawString("Night to " + require('locale').dow(toDate, 1) + "\n" +
    require('locale').date(toDate, 1), center, 30);

  // show loading info
  var info = "calculating data ...\nplease be patient :)";
  var y0 = center + 30;
  var bounds = [center - 80, y0 - 20, center + 80, y0 + 20];
  g.clearRect.apply(g, bounds).drawRect.apply(g, bounds);
  g.setFont("6x8").setFontAlign(0, 0);
  g.drawString(info, center, y0);

  // calculate and draw analysis after timeout for faster feedback
  if (ATID) ATID = clearTimeout(ATID);
  ATID = setTimeout(drawAnalysis, 100, toDate);
}

// define function to draw and setup UI
function startApp() {
  readSettings(storage.readJSON("sleeplog.json", true) || {});
  drawNightTo(prevDays);
  Bangle.setUI("leftright", (cb) => {
    if (!cb) {
      eval(storage.read("sleeplog.settings.js"))(startApp);
    } else if (prevDays + cb >= -1) {
      drawNightTo((prevDays += cb));
    }
  });
}

// define day to display and analysis timeout id
var prevDays = 0;
var ATID;

// setup app
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

// start app
startApp();
