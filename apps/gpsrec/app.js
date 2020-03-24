Bangle.loadWidgets();
Bangle.drawWidgets();

var settings = require("Storage").readJSON("gpsrec.json",1)||{};

function getFN(n) {
  return ".gpsrc"+n.toString(36);
}

function updateSettings() {
  require("Storage").write("gpsrec.json", settings);
  if (WIDGETS["gpsrec"])
    WIDGETS["gpsrec"].reload();
}

function showMainMenu() {
  const mainmenu = {
    '': { 'title': 'GPS Record' },
    'RECORD': {
      value: !!settings.recording,
      format: v=>v?"On":"Off",
      onchange: v => {
        settings.recording = v;
        updateSettings();
      }
    },
    'File #': {
      value: settings.file|0,
      min: 0,
      max: 35,
      step: 1,
      onchange: v => {
        settings.recording = false;
        settings.file = v;
        updateSettings();
      }
    },
    'Time Period': {
      value: settings.period||1,
      min: 1,
      max: 60,
      step: 1,
      onchange: v => {
        settings.recording = false;
        settings.period = v;
        updateSettings();
      }
    },
    'View Tracks': viewTracks,
    '< Back': ()=>{load();}
  };
  return E.showMenu(mainmenu);
}

function viewTracks() {
  const menu = {
    '': { 'title': 'GPS Tracks' }
  };
  var found = false;
  for (var n=0;n<36;n++) {
    var f = require("Storage").open(getFN(n),"r");
    if (f.readLine()!==undefined) {
      menu["Track "+n] = viewTrack.bind(null,n);
      found = true;
    }
  }
  if (!found)
    menu["No Tracks found"] = function(){};
  menu['< Back'] = showMainMenu;
  return E.showMenu(menu);
}

function viewTrack(n) {
  const menu = {
    '': { 'title': 'GPS Track '+n }
  };
  var trackCount = 0;
  var trackTime;
  var f = require("Storage").open(getFN(n),"r");
  var l = f.readLine();
  if (l!==undefined) {
    var c = l.split(",");
    trackTime = new Date(parseInt(c[0]));
  }
  while (l!==undefined) {
    trackCount++;
    // TODO: min/max/length of track?
    l = f.readLine();
  }
  if (trackTime)
    menu[" "+trackTime.toISOString().substr(0,16).replace("T"," ")] = function(){};
  menu[trackCount+" records"] = function(){};
  // TODO: option to draw it? Just scan through, project using min/max
  menu['Erase'] = function() {
    E.showPrompt("Delete Track?").then(function(v) {
      if (v) {
        settings.recording = false;
        updateSettings();
        var f = require("Storage").open(getFN(n),"r");
        f.erase();
        viewTracks();
      } else
        viewTrack(n);
    });
  };
  menu['< Back'] = viewTracks;
  return E.showMenu(menu);
}

showMainMenu();
