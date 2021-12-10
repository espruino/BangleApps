/**
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */


// Non-user-configurable constants
const APP_ID = 'sensible';
const ESPRUINO_COMPANY_CODE = 0x0590;


// Global variables
let acc, bar, hrm, mag;
let isAccMenu = false;
let isBarMenu = false;
let isGpsMenu = false;
let isHrmMenu = false;
let isMagMenu = false;
let isBarEnabled = true;
let isGpsEnabled = true;
let isHrmEnabled = true;
let isMagEnabled = true;


// Menus
let mainMenu = {
  "": { "title": "--  SensiBLE  --" },
  "Acceleration": function() { E.showMenu(accMenu); isAccMenu = true; },
  "Barometer": function() { E.showMenu(barMenu); isBarMenu = true; },
  "GPS": function() { E.showMenu(gpsMenu); isGpsMenu = true; },
  "Heart Rate": function() { E.showMenu(hrmMenu); isHrmMenu = true; },
  "Magnetometer": function() { E.showMenu(magMenu); isMagMenu = true; }
};
let accMenu = {
  "": { "title" : "- Acceleration -" },
  "State": { value: "On" },
  "x": { value: null },
  "y": { value: null },
  "z": { value: null },
  "<-": function() { E.showMenu(mainMenu); isAccMenu = false; },
};
let barMenu = {
  "": { "title" : "-  Barometer   -" },
  "State": {
    value: isBarEnabled,
    format: v => v ? "On" : "Off",
    onchange: v => { isBarEnabled = v; Bangle.setBarometerPower(v, APP_ID); }
  },
  "Altitude": { value: null },
  "Press": { value: null },
  "Temp": { value: null },
  "<-": function() { E.showMenu(mainMenu); isBarMenu = false; },
};
let gpsMenu = {
  "": { "title" : "-      GPS     -" },
  "State": {
    value: isGpsEnabled,
    format: v => v ? "On" : "Off",
    onchange: v => { isGpsEnabled = v; Bangle.setGPSPower(v, APP_ID); }
  },
  "Lat": { value: null },
  "Lon": { value: null },
  "Altitude": { value: null },
  "Satellites": { value: null },
  "HDOP": { value: null },
  "<-": function() { E.showMenu(mainMenu); isGpsMenu = false; },
};
let hrmMenu = {
  "": { "title" : "-  Heart Rate  -" },
  "State": {
    value: isHrmEnabled,
    format: v => v ? "On" : "Off",
    onchange: v => { isHrmEnabled = v; Bangle.setHRMPower(v, APP_ID); }
  },
  "BPM": { value: null },
  "Confidence": { value: null },
  "<-": function() { E.showMenu(mainMenu); isHrmMenu = false; },
};
let magMenu = {
  "": { "title" : "- Magnetometer -" },
  "State": {
    value: isMagEnabled,
    format: v => v ? "On" : "Off",
    onchange: v => { isMagEnabled = v; Bangle.setCompassPower(v, APP_ID); }
  },
  "x": { value: null },
  "y": { value: null },
  "z": { value: null },
  "Heading": { value: null },
  "<-": function() { E.showMenu(mainMenu); isMagMenu = false; },
};


// Transmit the app name under the Espruino company code to facilitate discovery
function transmitAppName() {
  let options = {
      showName: false,
      manufacturer: ESPRUINO_COMPANY_CODE,
      manufacturerData: JSON.stringify({ name: APP_ID }),
      interval: 2000
  }

  NRF.setAdvertising({}, options);
}


// Update acceleration
Bangle.on('accel', function(newAcc) {
  acc = newAcc;

  if(isAccMenu) {
    accMenu.x.value = acc.x.toFixed(2);
    accMenu.y.value = acc.y.toFixed(2);
    accMenu.z.value = acc.z.toFixed(2);
    E.showMenu(accMenu);
  }
});

// Update barometer
Bangle.on('pressure', function(newBar) {
  bar = newBar;

  if(isBarMenu) {
    barMenu.Altitude.value = bar.altitude.toFixed(1) + 'm';
    barMenu.Press.value = bar.pressure.toFixed(1) + 'mbar';
    barMenu.Temp.value = bar.temperature.toFixed(1) + 'C';
    E.showMenu(barMenu);
  }
});

// Update GPS
Bangle.on('GPS', function(newGps) {
  gps = newGps;

  if(isGpsMenu) {
    gpsMenu.Lat.value = gps.lat.toFixed(4);
    gpsMenu.Lon.value = gps.lon.toFixed(4);
    gpsMenu.Altitude.value = gps.alt + 'm';
    gpsMenu.Satellites.value = gps.satellites;
    gpsMenu.HDOP.value = (gps.hdop * 5).toFixed(1) + 'm';
    E.showMenu(gpsMenu);
  }
});

// Update heart rate monitor
Bangle.on('HRM', function(newHrm) {
  hrm = newHrm;

  if(isHrmMenu) {
    hrmMenu.BPM.value = hrm.bpm;
    hrmMenu.Confidence.value = hrm.confidence + '%';
    E.showMenu(hrmMenu);
  }
});

// Update magnetometer
Bangle.on('mag', function(newMag) {
  mag = newMag;

  if(isMagMenu) {
    magMenu.x.value = mag.x;
    magMenu.y.value = mag.y;
    magMenu.z.value = mag.z;
    magMenu.Heading.value = mag.heading.toFixed(1);
    E.showMenu(magMenu);
  }
});


// On start: enable sensors and display main menu
g.clear();
transmitAppName();
Bangle.setBarometerPower(isBarEnabled, APP_ID);
Bangle.setGPSPower(isGpsEnabled, APP_ID);
Bangle.setHRMPower(isHrmEnabled, APP_ID);
Bangle.setCompassPower(isMagEnabled, APP_ID);
E.showMenu(mainMenu);