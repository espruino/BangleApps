Bangle.loadWidgets();
Bangle.drawWidgets();

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
    s[key] = settings[key]
  }
}

function save() {
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
    s = {'lat': gps.lat, 'lon': gps.lon, 'location': '???' };
    Bangle.buzz(1500); // buzz on first position
    Bangle.setGPSPower(0);
    save();

    Bangle.setUI("updown", ()=>{ load(); });
    E.showPrompt("Location has been saved from the GPS fix",{
      title:"Location Saved",
      buttons : {"OK":1}
    }).then(function(v) {
      load(); // load default clock
    });
  });

  Bangle.setGPSPower(1);
  E.showMessage("Waiting for GPS fix. Place watch in the open. Could take 10 minutes. Long press to abort", "GPS Running");
  Bangle.setUI("updown", undefined);
}

function showMainMenu() {
  //console.log("showMainMenu");
  const mainmenu = {
    '': { 'title': 'My Location' },
    '<Back': ()=>{ load(); },
    'City': {
      value: 0 | locations.indexOf(s.location),
      min: 0, max: locations.length - 1,
      format: v => locations[v],
      onchange: v => {
        if (v != 6) {
          s.location = locations[v];
          s.lat = lats[v];
          s.lon = lons[v];
          save();
        }
      }
    },
    'Set From GPS': ()=>{ setFromGPS(); }
  };
  return E.showMenu(mainmenu);
}

loadSettings();
showMainMenu();
