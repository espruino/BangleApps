/**
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */


// Non-user-configurable constants
const APP_ID = 'sensible';


// Global variables
let acc, bar, hrm, mag;
let isAccMenu, isBarMenu, isGpsMenu, isHrmMenu, isMagMenu = false;
let barEnabled, gpsEnabled, hrmEnabled, magEnabled = true;


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
    value: barEnabled,
    format: v => v ? "On" : "Off",
    onchange: v => { barEnabled = v; Bangle.setBarometerPower(v, APP_ID); }
  },
  "Altitude": { value: null },
  "Press": { value: null },
  "Temp": { value: null },
  "<-": function() { E.showMenu(mainMenu); isBarMenu = false; },
};
let gpsMenu = {
  "": { "title" : "-      GPS     -" },
  "State": {
    value: gpsEnabled,
    format: v => v ? "On" : "Off",
    onchange: v => { gpsEnabled = v; Bangle.setGPSPower(v, APP_ID); }
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
    value: hrmEnabled,
    format: v => v ? "On" : "Off",
    onchange: v => { hrmEnabled = v; Bangle.setHRMPower(v, APP_ID); }
  },
  "BPM": { value: null },
  "Confidence": { value: null },
  "<-": function() { E.showMenu(mainMenu); isHrmMenu = false; },
};
let magMenu = {
  "": { "title" : "- Magnetometer -" },
  "State": {
    value: magEnabled,
    format: v => v ? "On" : "Off",
    onchange: v => { magEnabled = v; Bangle.setCompassPower(v, APP_ID); }
  },
  "x": { value: null },
  "y": { value: null },
  "z": { value: null },
  "Heading": { value: null },
  "<-": function() { E.showMenu(mainMenu); isMagMenu = false; },
};


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


// Special function to handle display switch on
//Bangle.on('lcdPower', (on) => {
//  if(on) {
//    E.showMenu(mainMenu);
//  }
//});


// On start:
g.clear();
Bangle.setBarometerPower(true, APP_ID);
Bangle.setGPSPower(true, APP_ID);
Bangle.setHRMPower(true, APP_ID);
Bangle.setCompassPower(true, APP_ID);
E.showMenu(mainMenu);