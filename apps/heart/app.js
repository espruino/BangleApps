E.setFlags({pretokenise:1});

function log(msg) {
  console.log("heart: " + msg + " mem: " + process.memory().usage / process.memory().blocksize);
  return;
}

log("start");

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
  return;
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
    'View Records': ()=>{createRecordMenu(viewRecord.bind());},
    'Graph Records': ()=>{createRecordMenu(graphRecord.bind());},
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
      menu["#"+n+" "+Date(line.split(",")[0]*1000).as().str] = func.bind(null, n);
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
    if (parseInt(l.split(',')[2]) > 70) {
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
        settings.isRecording = false;
        updateSettings();
        require("Storage").open(getFileNbr(n),"r").erase();
        E.showMenu();
        load();
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
  const MaxValueCount = 164;
  const GraphXZero = 40;
  const GraphYZero = 200;
  const GraphY100 = 80;
  const GraphMarkerOffset = 5;
  const GraphXLabel = 35;
  const GraphXMax = GraphXZero + MaxValueCount;

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

  log("Counting lines");

  while (line !== undefined) {
    lineCount++;
    line = f.readLine();
  }

  log(`Line count: ${lineCount}`);
  if (lineCount > MaxValueCount)
    startLine = lineCount - MaxValueCount;
  f = undefined;
  line = undefined;
  lineCount = undefined;
  log(`start: ${startLine}`);

  f = require("Storage").open(getFileNbr(n),"r");
  line = f.readLine();

  var times = Uint32Array(2);
  var tempCount = 0;
  var positionX = GraphXZero;
  var positionY = GraphYZero;
  var measure;

  while (line !== undefined) {
    currentLine = line;
    line = f.readLine();
    tempCount++;
    if (tempCount == startLine) {
      g.clear();
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
      g.drawString("150", GraphXLabel, GraphY100 - GraphMarkerOffset);
      g.drawLine(GraphXZero - GraphMarkerOffset, GraphY100, GraphXZero, GraphY100);

      g.drawString("125", GraphXLabel, GraphYZero - 110 - GraphMarkerOffset);
      g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

      g.drawString("100", GraphXLabel, GraphYZero - 100 - GraphMarkerOffset);
      g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

      g.drawString("90", GraphXLabel, GraphYZero - 90 - GraphMarkerOffset);
      g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

      g.drawString("80", GraphXLabel, GraphYZero - 70 - GraphMarkerOffset);
      g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

      g.drawString("70", GraphXLabel, GraphYZero - 50 - GraphMarkerOffset);
      g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

      g.drawString("60", GraphXLabel, GraphYZero - 30 - GraphMarkerOffset);
      g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

      g.drawString("50", GraphXLabel, GraphYZero - 20 - GraphMarkerOffset);
      g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

      g.drawString("40", GraphXLabel, GraphYZero - 10 - GraphMarkerOffset);
      g.drawLine(GraphXZero - GraphMarkerOffset, 150, GraphXZero, 150);

      g.drawString("30", GraphXLabel, GraphYZero - GraphMarkerOffset);

      g.setColor(1, 1, 1);
      g.drawLine(GraphXZero - GraphMarkerOffset, GraphYZero, GraphXMax + GraphMarkerOffset, GraphYZero);

      log("Finished drawing chart");
    } else if (tempCount > startLine) {
      positionX++;
      if (parseInt(currentLine.split(",")[2]) >= 70) {
        g.setColor(1, 1, 1);
        oldPositionY = positionY;
        measure = parseInt(currentLine.split(",")[1]);
        positionY = GraphYZero - measure + 30;
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
  log('start: ' + times[0]);
  log('end: ' + times[1]);
  if (times[0] !== undefined) {
    g.setFontAlign(-1, -1, 0);
    g.drawString(Date(times[0]*1000).local().as("0h:0m").str, 15, GraphYZero + 12);
  }

  if (times[1] !== undefined) {
    g.setFontAlign(1, -1, 0);
    g.drawString(Date(times[1]*1000).local().as().str, GraphXMax, GraphYZero + 12);
  }

  log("Finished rendering data");
  Bangle.buzz(200, 0.3);
  setWatch(stop, BTN2, {edge:"falling", debounce:50, repeat:false});
  return;
}

showMainMenu();

// vim: et ts=2 sw=2
