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

showMainMenu();
