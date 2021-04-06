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
    'View Records': viewRecords,
    'Graph Records': graphRecords,
    '< Back': ()=>{load();}
  };
  return E.showMenu(mainMenu);
}

function viewRecords() {
  const menu = {
    '': { 'title': 'Heart Records' }
  };
  var found = false;
  for (var n=0;n<36;n++) {
    var f = require("Storage").open(getFileNbr(n),"r");
    if (f.readLine()!==undefined) {
      menu["Record "+n] = viewRecord.bind(null,n);
      found = true;
    }
  }
  if (!found)
    menu["No Records Found"] = function(){};
  menu['< Back'] = showMainMenu;
  return E.showMenu(menu);
}

function viewRecord(n) {
  const menu = {
    '': { 'title': 'Heart Record '+n }
  };
  var heartCount = 0;
  var heartTime;
  var f = require("Storage").open(getFileNbr(n),"r");
  var l = f.readLine();
  if (l!==undefined) {
    var c = l.split(",");
    heartTime = new Date(c[0]*1000);
  }
  while (l!==undefined) {
    heartCount++;
    // TODO: min/max/average of heart rate?
    l = f.readLine();
  }
  if (heartTime)
    menu[" "+heartTime.toString().substr(4,17)] = function(){};
  menu[heartCount+" records"] = function(){};
  // TODO: option to draw it? Just scan through, project using min/max
  menu['Erase'] = function() {
    E.showPrompt("Delete Record?").then(function(v) {
      if (v) {
        settings.isRecording = false;
        updateSettings();
        var f = require("Storage").open(getFileNbr(n),"r");
        f.erase();
        viewRecords();
      } else
        viewRecord(n);
    });
  };
  menu['< Back'] = viewRecords;
  print(menu);
  return E.showMenu(menu);
}

function graphRecords() {
  const menu = {
    '': { 'title': 'Heart Records' }
  };
  var found = false;
  for (var n=0;n<36;n++) {
    var f = require("Storage").open(getFileNbr(n),"r");
    var line = f.readLine();
    if (line!==undefined) {
      menu["#"+n+" "+Date(line.split(",")[0]*1000).as().str] = graphRecord.bind(null,n);
      found = true;
    }
  }
  if (!found)
    menu["No Records Found"] = function(){};
  menu['< Back'] = showMainMenu;
  return E.showMenu(menu);
}

// based on batchart
function renderHomeIcon() {
  //Home for Btn2
  g.setColor(1, 1, 1);
  g.drawLine(220, 118, 227, 110);
  g.drawLine(227, 110, 234, 118);

  g.drawPoly([222,117,222,125,232,125,232,117], false);
  g.drawRect(226,120,229,125);
}

function renderChart() {
  // Left Y axis (Battery)
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

  console.log("Finished drawing chart");
}

// as drawing starts at 30 HRM decreasing measrure by 30
// recalculate for range 110-150 as only 20 pixels are available
function getY(measure) {
  positionY = GraphYZero - measure + 30;
  if (100 < measure < 150) {
    positionY = GraphYZero - ( 100 + Math.round((measure - 100)/2) ) + 30;
    g.setColor(1, 0, 0);
  } else if (60 < measrure < 100) {
    positionY = GraphYZero - ( 30 + Math.round((measure - 30)/2) ) + 30;
    g.setColor(0, 1, 0);
  }
  if (positionY > GraphYZero) {
    positionY = GraphYZero;
    g.setColor(1, 0, 0);
  }
  if (positionY < GraphY100) {
    positionY = GraphY100;
    g.setColor(1, 0, 0);
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

  var lastPixel;
  var lineCount = 0;
  var positionX = GraphXZero;
  var positionY = GraphYZero;
  var startLine = 1;
  var tempCount = 0;
  var f = require("Storage").open(getFileNbr(n),"r");
  var line = f.readLine();
  var times = Array(2);
  console.log("Counting lines");
  while (line !== undefined) {
    lineCount++;
    line = f.readLine();
  }
  console.log(`Line count: ${lineCount}`);
  if (lineCount > MaxValueCount) {
    startLine = lineCount - MaxValueCount;
  }
  console.log(`start: ${startLine}`);

  f = require("Storage").open(getFileNbr(n),"r");
  line = f.readLine();
  while (line !== undefined) {
    currentLine = line;
    line = f.readLine();
    tempCount++;
    if (tempCount == startLine) {
      g.clear();
      Bangle.loadWidgets();
      Bangle.drawWidgets();
      renderHomeIcon();
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
    g.flip();
  }

  g.setColor(1, 1, 0);
  g.setFont("Vector", 10);
  console.log('start: ' + times[0]);
  console.log('end: ' + times[1]);
  if (times[0] !== undefined) {
    g.setFontAlign(-1, -1, 0);
    var startdate = new Date(times[0]*1000);
    g.drawString(startdate.local().as("0h:0m").str, 15, GraphYZero + 12);
  }
  if (times[1] !== undefined) {
    g.setFontAlign(1, -1, 0);
    var enddate = new Date(times[1]*1000);
    g.drawString(enddate.local().as().str, GraphXMax, GraphYZero + 12);
  }
  console.log("Finished rendering data");
  Bangle.buzz(200, 0.3);
  setWatch(stop, BTN2, {edge:"falling", debounce:50, repeat:false});
}

showMainMenu();

// vim: et ts=2 sw=2
