(function(back) {

const SETTINGS_FILE = "mylocation.json";
let settings;

// initialize with default settings...
let s = {
  'lat': 51.5072,
  'lon': 0.1276,
  'location': "London"
};

function loadSettings() {
  settings = require('Storage').readJSON(SETTINGS_FILE, 1) || {};
  for (const key in settings) {
    s[key] = settings[key];
  }
}

function saveSettings() {
  settings = s;
  require('Storage').write(SETTINGS_FILE, settings);
}

const locations = ["London" ,"Newcastle","Edinburgh", "Paris" , "New York" , "Tokyo"  , "Frankfurt", "Auckland", "???"];
const lats =      [ 51.5072 ,  54.9783  , 55.9533   , 48.8566 ,  40.7128   ,  35.6762 ,  50.1236   ,  -36.9    ,  0.0 ];
const lons =      [ -0.1276 ,  -1.6178  , -3.1883   ,  2.3522 , -74.0060   , 139.6503 ,   8.6553   ,  174.7832 ,  0.0 ];

function setFromGPS() {
  Bangle.on('GPS', (gps) => {
    //console.log(".");
    if (gps.fix === 0) return;
    //console.log("fix from GPS");
    s = {'lat': gps.lat, 'lon': gps.lon, 'location': 'GPS' };
    Bangle.buzz(1500); // buzz on first position
    Bangle.setGPSPower(0, "mylocation");
    saveSettings();

    Bangle.setUI("updown", ()=>{ load(); });
    E.showPrompt(/*LANG*/"Location has been saved from the GPS fix",{
      title:/*LANG*/"Location Saved",
      buttons : {/*LANG*/"OK":1}
    }).then(function(v) {
      load(); // load default clock
    });
  });

  Bangle.setGPSPower(1, "mylocation");
  E.showMessage(/*LANG*/"Waiting for GPS fix. Place watch in the open. Could take 10 minutes. Long press to abort", "GPS Running");
  Bangle.setUI("updown", undefined);
}

function setFromWaypoint() {
  const wpmenu = {
    '': { 'title': /*LANG*/'Waypoint' },
    '< Back': ()=>{ showMainMenu(); },
  };
  require("waypoints").load().forEach(wp => {
    if (typeof(wp.lat) === 'number' && typeof(wp.lon) === 'number') {
      wpmenu[wp.name] = ()=>{
          s.location = wp.name;
          s.lat = parseFloat(wp.lat);
          s.lon = parseFloat(wp.lon);
          saveSettings();
          showMainMenu();
      };
    }
  });
  return E.showMenu(wpmenu);
}

function showMainMenu() {
  //console.log("showMainMenu");
  const mainmenu = {
    '': { 'title': /*LANG*/'My Location' },
    '< Back': ()=>{ back(); },
    /*LANG*/'City': {
      value: 0 | locations.indexOf(s.location),
      min: 0, max: locations.length - 1,
      format: v => {
        if (v === -1) {
          return s.location;
        } else {
          return locations[v];
        }
      },
      onchange: v => {
        if (locations[v] !== "???") {
          s.location = locations[v];
          s.lat = lats[v];
          s.lon = lons[v];
          saveSettings();
        }
      }
    },
    /*LANG*/'Set From GPS': ()=>{ setFromGPS(); }
  };
  try {
    require("waypoints");
    mainmenu[/*LANG*/'Set From Waypoint'] = ()=>{ setFromWaypoint(); };
  } catch(err) {
    // waypoints not installed, thats ok
  }
  return E.showMenu(mainmenu);
}

loadSettings();
showMainMenu();
})
