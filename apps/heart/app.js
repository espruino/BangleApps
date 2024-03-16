E.setFlags({pretokenise:1});

function log(msg) {
  console.log("heart: " + msg + "; mem used: " + process.memory().usage / process.memory().blocksize);
  return;
}

log("start");

Bangle.loadWidgets();
Bangle.drawWidgets();

var settings = require("Storage").readJSON("heart.json",1)||{};

function getFileNbr(n) {
  return ".heart"+n.toString(36);
}

function updateSettings() {
  require("Storage").write("heart.json", settings);
  if (WIDGETS["heart"])
    WIDGETS["heart"].reload();
  return;
}

function showMainMenu() {
  const mainMenu = {
    '': { 'title': 'Heart Recorder' },
    'RECORD': {
      value: !!settings.isRecording,
      onchange: v => {
        settings.isRecording = v;
        updateSettings();
      }
    },
    'File Number': {
      value: settings.fileNbr|0,
      min: 0,
      max: 35,
      step: 1,
      onchange: v => {
        settings.isRecording = false;
        settings.fileNbr = v;
        updateSettings();
      }
    },
    'View Records': ()=>{createRecordMenu(viewRecord.bind());},
    'Graph Records': ()=>{createRecordMenu(graphRecord.bind());},
    '< Back': ()=>{load();}
  };
  return E.showMenu(mainMenu);
}

// Date().as().str cannot be used as it always returns UTC time
function getDateString(timestamp) {
  var date = new Date(timestamp);
  var day = date.getDate() < 10 ? "0" + date.getDate().toString() : date.getDate().toString();
  var month = date.getMonth() < 10 ? "0" + date.getMonth().toString() : date.getMonth().toString();
  return day + "." + month + "." + date.getFullYear();
}

// Date().as().str cannot be used as it always returns UTC time
function getTimeString(timestamp) {
  var date = new Date(timestamp);
  var hour = date.getHours() < 10 ? '0' + date.getHours().toString() : date.getHours().toString();
  var minute = date.getMinutes() < 10 ? '0' + date.getMinutes().toString() : date.getMinutes().toString();
  return hour + ':' + minute;
}

function createRecordMenu(func) {
  const menu = {
    '': { 'title': 'Heart Records' }
  };
  var found = false;
  for (var n=0;n<36;n++) {
    var line = require("Storage").open(getFileNbr(n),"r").readLine();
    if (line!==undefined) {
      menu["#" + n + " " + getDateString(line.split(",")[0]*1000) + " " + getTimeString(line.split(",")[0]*1000)] = func.bind(null, n);
      found = true;
    }
  }
  if (!found)
    menu["No Records Found"] = function(){};
  menu['< Back'] = ()=>{showMainMenu();};
  return E.showMenu(menu);
}

function viewRecord(n) {
  E.showMenu({'': 'Heart Record '+n});
  E.showMessage(
    "Loading Data ...\n\nMay take a while,\nwill vibrate\nwhen done.",
    'Heart Record '+n
  );
  const menu = {
    '': { 'title': 'Heart Record '+n }
  };
  var heartTime;
  var f = require("Storage").open(getFileNbr(n),"r");
  var l = f.readLine();
  // using arrays for memory optimization
  var limits = Uint8Array(2);
  // using arrays for memory optimization
  var avg = Uint32Array(2);
  // minimum
  limits[0] = 2000;
  // maximum
  limits[1] = 0;
  // count
  avg[0] = 0;
  // average sum
  avg[1] = 0;
  var count = 0;
  var value = 0;
  if (l!==undefined)
    heartTime = new Date(l.split(",")[0]*1000);
  log("parsing records");
  while (l!==undefined) {
    count++;
    if (parseInt(l.split(',')[2]) >= 70) {
      avg[0]++;
      value = parseInt(l.split(',')[1]);
      if (value < limits[0]) {
        limits[0] = value;
      } else if (value > limits[1]) {
        limits[1] = value;
      }
      avg[1] += value;
    }
    l = f.readLine();
  }
  l = undefined;
  value = undefined;
  log("finished parsing");
  if (heartTime)
    menu[" "+heartTime.toString().substr(4,17)] = function(){};
  menu[count + " records"] = function(){};
  menu["Min: " + limits[0]] = function(){};
  menu["Max: " + limits[1]] = function(){};
  menu["Avg: " + Math.round(avg[1] / avg[0])] = function(){};
  menu["Erase"] = function() {
    E.showPrompt("Delete Record?").then(function(v) {
      if (v) {
        if (n == settings.fileNbr) {
          settings.isRecording = false;
          updateSettings();
        }
        require("Storage").open(getFileNbr(n),"r").erase();
        E.showMenu();
        createRecordMenu(viewRecord.bind());
      } else
        return viewRecord(n);
    });
  };
  menu['< Back'] = ()=>{createRecordMenu(viewRecord.bind());};
  Bangle.buzz(200, 0.3);
  return E.showMenu(menu);
}

function stop() {
  E.showMenu();
  load();
}

function graphRecord(n) {
  var headline = "Heart Record " + n;
  E.showMenu({'': headline});
  E.showMessage(
    "Loading Data ...\n\nMay take a while,\nwill vibrate\nwhen done.",
    headline
  );

  const MinMeasurement = 30;
  const MaxMeasurement = 150;
  const GraphXLabel = 35;
  const GraphXZero = 40;
  const GraphY100 = 60;
  const GraphMarkerOffset = 5;
  // calculate number of pixels based on display width
  const MaxValueCount = g.getWidth() - GraphXZero - ( g.getWidth() - 220 ) - GraphMarkerOffset;
  // calculate Y axis "0" pixel
  const GraphYZero = g.getHeight() - g.setFont("Vector", 10).getFontHeight() - GraphMarkerOffset * 2;
  // calculate X axis max drawable pixel
  const GraphXMax = GraphXZero + MaxValueCount;
  // calculate space between labels of scale
  const LabelOffset = (GraphYZero - GraphY100) / (MaxMeasurement - MinMeasurement);

  var lineCount = 0;
  var startLine = 1;
  var f = require("Storage").open(getFileNbr(n),"r");
  var line = f.readLine();

  log("Counting lines");

  while (line !== undefined) {
    lineCount++;
    line = f.readLine();
  }

  log(`lineCount: ${lineCount}`);
  if (lineCount > MaxValueCount)
    startLine = lineCount - MaxValueCount;
  f = undefined;
  line = undefined;
  lineCount = undefined;
  log(`startLine: ${startLine}`);

  f = require("Storage").open(getFileNbr(n),"r");
  line = f.readLine();

  var times = Uint32Array(2);
  var tempCount = 0;
  var positionX = GraphXZero;
  var positionY = GraphYZero;
  var measure;

  while (line !== undefined) {
    const currentLine = line;
    line = f.readLine();
    tempCount++;
    if (tempCount == startLine) {
      // generating rgaph in loop when reaching startLine to keep loading
      // message on screen until graph can be drawn
      g.reset().clearRect(0,24,g.getWidth(),g.getHeight()).
      // Home for Btn2
        setColor(g.theme.fg).
        drawLine(220, 118, 227, 110).
        drawLine(227, 110, 234, 118).
        drawPoly([222,117,222,125,232,125,232,117], false).
        drawRect(226,120,229,125).

      // headline
        setFontAlign(0, -1, 0).
        setFont("6x8", 2).
        drawString(headline, g.getWidth()/2 - headline.length/2, GraphY100 - g.getFontHeight() - GraphMarkerOffset).

      // Chart
        setColor(1, 1, 0).
        // horizontal bottom line
        drawLine(GraphXZero, GraphYZero + GraphMarkerOffset, GraphXZero, GraphY100).
        // vertical left line
        drawLine(GraphXZero - GraphMarkerOffset, GraphYZero, GraphXMax + GraphMarkerOffset, GraphYZero).
        // scale indicator line for 100%
        drawLine(GraphXZero - GraphMarkerOffset, GraphY100, GraphXZero, GraphY100).
        // scale indicator line for 50%
        drawLine(GraphXZero - GraphMarkerOffset, GraphY100 + (GraphYZero - GraphY100)/2, GraphXZero, GraphY100 + (GraphYZero - GraphY100)/2).
        // background line for 50%
        setColor(g.theme.fg).
        drawLine(GraphXZero + 1, GraphY100 + (GraphYZero - GraphY100)/2, GraphXMax, GraphY100 + (GraphYZero - GraphY100)/2).
        setFontAlign(1, -1, 0).
        setFont("Vector", 10);

      // scale text
      for (var i = MaxMeasurement; i >= MinMeasurement; i-=10) {
        g.drawString(i, GraphXLabel, GraphY100 + LabelOffset * ( MaxMeasurement - i ) - GraphMarkerOffset);
      }

      log("Finished drawing chart");
    } else if (tempCount > startLine) {
      positionX++;
      if (parseInt(currentLine.split(",")[2]) >= 70) {
        g.setColor(1, 0.3, 0.3);
        const oldPositionY = positionY;
        measure = parseInt(currentLine.split(",")[1]);
        positionY = GraphYZero - measure + MinMeasurement;
        if (positionY > GraphYZero) {
          positionY = GraphYZero;
        }
        if (positionY < GraphY100) {
          positionY = GraphY100;
        }

        if (times[0] === 0) {
          times[0] = parseInt(currentLine.split(",")[0]);
        }
        if (tempCount == startLine + 1) {
          g.setPixel(positionX, positionY);
        } else {
          g.drawLine(positionX - 1, oldPositionY, positionX, positionY);
          times[1] = parseInt(currentLine.split(",")[0]);
        }
      }
    }
  }

  g.setColor(1, 1, 0).setFont("Vector", 10);
  log('startTime: ' + times[0]);
  log('endTime: ' + times[1]);

  if (times[0] !== 0) {
    g.setFontAlign(-1, -1, 0).
      drawString(getTimeString(times[0]*1000), 15, GraphYZero + 12);
  }

  if (times[1] !== 0) {
    var dateStr = getDateString(times[1]*1000);
    g.setFontAlign(-1, -1, 0).
      drawString(dateStr, GraphXMax/2 - dateStr.length/2 - GraphMarkerOffset, GraphYZero + 12).
      setFontAlign(1, -1, 0).
      drawString(getTimeString(times[1]*1000), GraphXMax, GraphYZero + 12);
  }

  log("Finished rendering data");
  Bangle.buzz(200, 0.3);
  g.flip();
  setWatch(stop, (global.BTN2!==undefined)?BTN2:BTN1, {edge:"falling", debounce:50, repeat:false});
  return;
}

showMainMenu();

// vim: et ts=2 sw=2
