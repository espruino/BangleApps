/**
 * Copyright reelyActive 2021-2022
 * We believe in an open Internet of Things
 */


// Non-user-configurable constants
const APP_ID = 'sensible';
const ESPRUINO_COMPANY_CODE = 0x0590;
const SETTINGS_FILENAME = 'sensible.data.json';
const UPDATE_MILLISECONDS = 1000;
const APP_ADVERTISING_DATA = [ 0x12, 0xff, 0x90, 0x05, 0x7b, 0x6e, 0x61, 0x6d,
                               0x65, 0x3a, 0x73, 0x65, 0x6e, 0x73, 0x69, 0x62,
                               0x6c, 0x65, 0x7d ];


// Global variables
let acc, bar, hrm, mag;
let isAccMenu = false;
let isBarMenu = false;
let isGpsMenu = false;
let isHrmMenu = false;
let isMagMenu = false;
let isNewAccData = false;
let isNewBarData = false;
let isNewGpsData = false;
let isNewHrmData = false;
let isNewMagData = false;
let settings = require('Storage').readJSON(SETTINGS_FILENAME);


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
    value: settings.isBarEnabled,
    onchange: v => { updateSetting('isBarEnabled', v); }
  },
  "Altitude": { value: null },
  "Press": { value: null },
  "Temp": { value: null },
  "<-": function() { E.showMenu(mainMenu); isBarMenu = false; },
};
let gpsMenu = {
  "": { "title" : "-      GPS     -" },
  "State": {
    value: settings.isGpsEnabled,
    onchange: v => { updateSetting('isGpsEnabled', v); }
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
    value: settings.isHrmEnabled,
    onchange: v => { updateSetting('isHrmEnabled', v); }
  },
  "BPM": { value: null },
  "Confidence": { value: null },
  "<-": function() { E.showMenu(mainMenu); isHrmMenu = false; },
};
let magMenu = {
  "": { "title" : "- Magnetometer -" },
  "State": {
    value: settings.isMagEnabled,
    onchange: v => { updateSetting('isMagEnabled', v); }
  },
  "x": { value: null },
  "y": { value: null },
  "z": { value: null },
  "Heading": { value: null },
  "<-": function() { E.showMenu(mainMenu); isMagMenu = false; },
};


// Check for new sensor data and update the advertising sequence
function transmitUpdatedSensorData() {
  let data = [ APP_ADVERTISING_DATA ]; // Always advertise at least app name

  if(isNewBarData) {
    data.push(encodeBarServiceData());
    isNewBarData = false;
  }

  if(isNewGpsData && gps.lat && gps.lon) {
    data.push(encodeGpsServiceData());
    isNewGpsData = false;
  }

  if(isNewHrmData) {
    data.push({ 0x2a37: [ 0, hrm.bpm ] });
    isNewHrmData = false;
  }

  if(isNewMagData) {
    data.push(encodeMagServiceData());
    isNewMagData = false;
  }

  let interval = UPDATE_MILLISECONDS / data.length;
  NRF.setAdvertising(data, { showName: false, interval: interval });
}


// Encode the bar service data to fit in a Bluetooth PDU
function encodeBarServiceData() {
  let t = toByteArray(Math.round(bar.temperature * 100), 2, true);
  let p = toByteArray(Math.round(bar.pressure * 1000), 4, false);
  let e = toByteArray(Math.round(bar.altitude * 100), 3, true);

  return [
      0x02, 0x01, 0x06,                               // Flags
      0x05, 0x16, 0x6e, 0x2a, t[0], t[1],             // Temperature
      0x07, 0x16, 0x6d, 0x2a, p[0], p[1], p[2], p[3], // Pressure
      0x06, 0x16, 0x6c, 0x2a, e[0], e[1], e[2]        // Elevation
  ];
}


// Encode the GPS service data using the Location and Speed characteristic
function encodeGpsServiceData() {
  let s = toByteArray(Math.round(1000 * gps.speed / 36), 2, false);
  let lat = toByteArray(Math.round(gps.lat * 10000000), 4, true);
  let lon = toByteArray(Math.round(gps.lon * 10000000), 4, true);
  let e = toByteArray(Math.round(gps.alt * 100), 3, true);
  let h = toByteArray(Math.round(gps.course * 100), 2, false);

  return [
      0x02, 0x01, 0x06, // Flags
      0x14, 0x16, 0x67, 0x2a, 0x9d, 0x02, s[0], s[1], lat[0], lat[1], lat[2],
      lat[3], lon[0], lon[1], lon[2], lon[3], e[0], e[1], e[2], h[0], h[1]
                        // Location and Speed
  ];
}


// Encode the mag service data using the magnetic flux density 3D characteristic
function encodeMagServiceData() {
  let x = toByteArray(mag.x, 2, true);
  let y = toByteArray(mag.y, 2, true);
  let z = toByteArray(mag.z, 2, true);

  return [
      0x02, 0x01, 0x06,                                          // Flags
      0x09, 0x16, 0xa1, 0x2a, x[0], x[1], y[0], y[1], z[0], z[1] // Mag 3D
  ];
}


// Convert the given value to a little endian byte array
function toByteArray(value, numberOfBytes, isSigned) {
  let byteArray = new Array(numberOfBytes);

  if(isSigned && (value < 0)) {
    value += 1 << (numberOfBytes * 8);
  }

  for(let index = 0; index < numberOfBytes; index++) {
    byteArray[index] = (value >> (index * 8)) & 0xff;
  }

  return byteArray;
}


// Enable the sensors as per the current settings
function enableSensors() {
  Bangle.setBarometerPower(settings.isBarEnabled, APP_ID);
  Bangle.setGPSPower(settings.isGpsEnabled, APP_ID);
  Bangle.setHRMPower(settings.isHrmEnabled, APP_ID);
  Bangle.setCompassPower(settings.isMagEnabled, APP_ID);
}


// Update the given setting and write to persistent storage
function updateSetting(name, value) {
  settings[name] = value;
  require('Storage').writeJSON(SETTINGS_FILENAME, settings);
  enableSensors();
}


// Update acceleration
Bangle.on('accel', function(newAcc) {
  acc = newAcc;
  isNewAccData = true;

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
  isNewBarData = true;

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
  isNewGpsData = true;

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
  isNewHrmData = true;

  if(isHrmMenu) {
    hrmMenu.BPM.value = hrm.bpm;
    hrmMenu.Confidence.value = hrm.confidence + '%';
    E.showMenu(hrmMenu);
  }
});

// Update magnetometer
Bangle.on('mag', function(newMag) {
  mag = newMag;
  isNewMagData = true;

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
enableSensors();
E.showMenu(mainMenu);
setInterval(transmitUpdatedSensorData, UPDATE_MILLISECONDS);