E.setFlags({pretokenise:1});
const GraphXZero = 40;
const GraphYZero = 200;
const GraphY100 = 80;

const GraphMarkerOffset = 5;
const MaxValueCount = 164;
const GraphXMax = GraphXZero + MaxValueCount;

Bangle.loadWidgets();
Bangle.drawWidgets();

var settings = require("Storage").readJSON("heart.json",1)||{};

var globalSettings = require('Storage').readJSON('setting.json', true) || {timezone: 0};
require('DateExt').locale({
  str: "0D.0M. 0h:0m",
  offset: [
    globalSettings.timezone * 60,
    globalSettings.timezone * 60
  ]
});
globalSettings = undefined;

function getFileNbr(n) {
  return ".heart"+n.toString(36);
}

function updateSettings() {
  require("Storage").write("heart.json", settings);
  if (WIDGETS["heart"])
    WIDGETS["heart"].reload();
}

function showMainMenu() {
  const mainMenu = {
    '': { 'title': 'Heart Recorder' },
    'RECORD': {
      value: !!settings.isRecording,
      format: v=>v?"On":"Off",
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
    'View Records': createRecordMenu.bind(null, viewRecord.bind()),
    'Graph Records': createRecordMenu.bind(null, graphRecord.bind()),
    '< Back': ()=>{load();}
  };
  return E.showMenu(mainMenu);
}

function createRecordMenu(func) {
  const menu = {
    '': { 'title': 'Heart Records' }
  };
  var found = false;
  for (var n=0;n<36;n++) {
    var line = require("Storage").open(getFileNbr(n),"r").readLine();
    if (line!==undefined) {
      menu["#"+n+" "+Date(line.split(",")[0]*1000).as().str] = func.bind(null,n);
      found = true;
    }
  }
  if (!found)
    menu["No Records Found"] = function(){};
  menu['< Back'] = ()=>{showMainMenu()};
  return E.showMenu(menu);
}

function viewRecord(n) {
  const menu = {
    '': { 'title': 'Heart Record '+n }
  };
  var heartTime;
  var f = require("Storage").open(getFileNbr(n),"r");
  var l = f.readLine();
  var limits = {"min": 2000, "max": 0, "avg": 0, "cnt": 0};
  var value = 0;
  if (l!==undefined)
    heartTime = new Date(l.split(",")[0]*1000);
  console.log("heart: parsing records");
  while (l!==undefined) {
    if (parseInt(l.split(',')[2]) > 70) {
      limits.cnt++;
      value = parseInt(l.split(',')[1]);
      if (value < limits.min) {
        limits.min = value;
      } else if (value > limits.max) {
        limits.max = value;
      }
      limits.avg += value;
    }
    l = f.readLine();
  }
  l = undefined;
  value = undefined;
  console.log("heart: finished parsing");
  limits.avg = limits.avg / limits.cnt;
  if (heartTime)
    menu[" "+heartTime.toString().substr(4,17)] = function(){};
  menu[limits.cnt+" records"] = function(){};
  menu["Min: " + limits.min] = function(){};
  menu["Max: " + limits.max] = function(){};
  menu["Avg: " + Math.round(limits.avg)] = function(){};
  menu["Erase"] = function() {
    E.showPrompt("Delete Record?").then(function(v) {
      if (v) {
        settings.isRecording = false;
        updateSettings();
        require("Storage").open(getFileNbr(n),"r").erase();
        E.showMenu();
        load();
      } else
        viewRecord(n);
    });
  };
  menu['< Back'] = function() {
    limits = undefined;
    E.showMenu();
    createRecordMenu(viewRecord);
  };
  limits = undefined;
  return E.showMenu(menu);
}

function renderChart() {
  // Home for Btn2
  g.setColor(1, 1, 1);
  g.drawLine(220, 118, 227, 110);
  g.drawLine(227, 110, 234, 118);

  g.drawPoly([222,117,222,125,232,125,232,117], false);
  g.drawRect(226,120,229,125);

  // Chart
  g.setColor(1, 1, 0);
  g.drawLine(GraphXZero, GraphYZero + GraphMarkerOffset, GraphXZero, GraphY100);

  g.setFontAlign(1, -1, 0);
  g.drawString("150", 35, GraphY100 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, GraphY100, GraphXZero, GraphY100);

  g.drawString("125", 35, GraphYZero - 110 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

  g.drawString("100", 35, GraphYZero - 100 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

  g.drawString("90", 35, GraphYZero - 90 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

  g.drawString("80", 35, GraphYZero - 70 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

  g.drawString("70", 35, GraphYZero - 50 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

  g.drawString("60", 35, GraphYZero - 30 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

  g.drawString("50", 35, GraphYZero - 20 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

  g.drawString("40", 35, GraphYZero - 10 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

  g.drawString("30", 35, GraphYZero - GraphMarkerOffset);

  g.setColor(1, 1, 1);
  g.drawLine(GraphXZero - GraphMarkerOffset, GraphYZero, GraphXMax + GraphMarkerOffset, GraphYZero);

  console.log("heart: Finished drawing chart");
}

// as drawing starts at 30 HRM decreasing measrure by 30
// recalculate for range 110-150 as only 20 pixels are available
function getY(measure) {
  var positionY = GraphYZero - measure + 30;
  if (100 < measure < 150) {
    positionY = GraphYZero - ( 100 + Math.round((measure - 100)/2) ) + 30;
  } else if (60 < measrure < 100) {
    positionY = GraphYZero - ( 30 + Math.round((measure - 30)/2) ) + 30;
  }
  if (positionY > GraphYZero) {
    positionY = GraphYZero;
  }
  if (positionY < GraphY100) {
    positionY = GraphY100;
  }
  return positionY;
}

function stop() {
  E.showMenu();
  load();
}

function graphRecord(n) {
  E.showMenu({'': 'Heart Record '+n});
  E.showMessage(
    "Loading Data ...\n\nMay take a while,\nwill vibrate\nwhen done.",
    'Heart Record '+n
  );
  g.setFont("Vector", 10);

  var lineCount = 0;
  var startLine = 1;
  var f = require("Storage").open(getFileNbr(n),"r");
  var line = f.readLine();
  console.log("heart: Counting lines");

  while (line !== undefined) {
    lineCount++;
    line = f.readLine();
  }

  console.log(`heart: Line count: ${lineCount}`);
  if (lineCount > MaxValueCount)
    startLine = lineCount - MaxValueCount;
  f = undefined;
  line = undefined;
  lineCount = undefined;
  console.log(`heart: start: ${startLine}`);

  f = require("Storage").open(getFileNbr(n),"r");
  line = f.readLine();

  var times = Uint32Array(2);
  var tempCount = 0;
  var positionX = GraphXZero;
  var positionY = GraphYZero;

  while (line !== undefined) {
    currentLine = line;
    line = f.readLine();
    tempCount++;
    if (tempCount == startLine) {
      g.clear();
      renderChart();
    } else if (tempCount > startLine) {
      positionX++;
      if (parseInt(currentLine.split(",")[2]) >= 70) {
        g.setColor(1, 1, 1);
        oldPositionY = positionY;
        positionY = getY(parseInt(currentLine.split(",")[1]));
        if (times[0] === undefined) {
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
  g.flip();

  g.setColor(1, 1, 0).setFont("Vector", 10);
  console.log('heart: start: ' + times[0]);
  console.log('heart: end: ' + times[1]);
  if (times[0] !== undefined) {
    g.setFontAlign(-1, -1, 0);
    g.drawString(Date(times[0]*1000).local().as("0h:0m").str, 15, GraphYZero + 12);
  }

  if (times[1] !== undefined) {
    g.setFontAlign(1, -1, 0);
    g.drawString(Date(times[1]*1000).local().as().str, GraphXMax, GraphYZero + 12);
  }

  console.log("heart: Finished rendering data");
  Bangle.buzz(200, 0.3);
  setWatch(stop, BTN2, {edge:"falling", debounce:50, repeat:false});
}

showMainMenu();

// vim: et ts=2 sw=2
