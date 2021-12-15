/**
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */


// Non-user-configurable constants
const APP_ID = 'sensible';
const ESPRUINO_COMPANY_CODE = 0x0590;
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
let isBarEnabled = true;
let isGpsEnabled = true;
let isHrmEnabled = true;
let isMagEnabled = true;
let isNewAccData = false;
let isNewBarData = false;
let isNewGpsData = false;
let isNewHrmData = false;
let isNewMagData = false;



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

  NRF.setAdvertising(data, { showName: false, interval: 200 });
}


// Encode the bar service data to fit in a Bluetooth PDU
function encodeBarServiceData() {
  let tEncoded = Math.round(bar.temperature * 100);
  let pEncoded = Math.round(bar.pressure * 100);
  let eEncoded = Math.round(bar.altitude * 100);

  if(bar.temperature < 0) {
    tEncoded += 0x10000;
  }
  if(bar.altitude < 0) {
    eEncoded += 0x1000000;
  }

  let t = [ tEncoded & 0xff, (tEncoded >> 8) & 0xff ];
  let p = [ pEncoded & 0xff, (pEncoded >> 8) & 0xff, (pEncoded >> 16) & 0xff,
            (pEncoded >> 24) & 0xff ];
  let e = [ eEncoded & 0xff, (eEncoded >> 8) & 0xff, (eEncoded >> 16) & 0xff ];

  return [
      0x02, 0x01, 0x06,                               // Flags
      0x05, 0x16, 0x6e, 0x2a, t[0], t[1],             // Temperature
      0x07, 0x16, 0x6d, 0x2a, p[0], p[1], p[2], p[3], // Pressure
      0x06, 0x16, 0x6c, 0x2a, e[0], e[1], e[2]        // Elevation
  ];
}


// Encode the GPS service data using the Location and Speed characteristic
function encodeGpsServiceData() {
  let latEncoded = Math.round(gps.lat * 10000000);
  let lonEncoded = Math.round(gps.lon * 10000000);
  let hEncoded = Math.round(gps.course * 100);
  let sEncoded = Math.round(1000 * gps.speed / 36);

  if(gps.lat < 0) {
    latEncoded += 0x100000000;
  }
  if(gps.lon < 0) {
    lonEncoded += 0x100000000;
  }

  let s = [ sEncoded & 0xff, (sEncoded >> 8) & 0xff ];
  let lat = [ latEncoded & 0xff, (latEncoded >> 8) & 0xff,
              (latEncoded >> 16) & 0xff, (latEncoded >> 24) & 0xff ];
  let lon = [ lonEncoded & 0xff, (lonEncoded >> 8) & 0xff,
              (lonEncoded >> 16) & 0xff, (lonEncoded >> 24) & 0xff ];
  let h = [ hEncoded & 0xff, (hEncoded >> 8) & 0xff ];

  return [
      0x02, 0x01, 0x06,                                  // Flags
      0x11, 0x16, 0x67, 0x2a, 0x95, 0x02, s[0], s[1], lat[0], lat[1], lat[2],
      lat[3], lon[0], lon[1], lon[2], lon[3], h[0], h[1] // Location and Speed
  ];
}


// Encode the mag service data using the magnetic flux density 3D characteristic
function encodeMagServiceData() {
  let xEncoded = mag.x; // TODO: units???
  let yEncoded = mag.y;
  let zEncoded = mag.z;

  if(xEncoded < 0) {
    xEncoded += 0x10000;
  }
  if(yEncoded < 0) {
    yEncoded += 0x10000;
  }
  if(yEncoded < 0) {
    yEncoded += 0x10000;
  }

  let x = [ xEncoded & 0xff, (xEncoded >> 8) & 0xff ];
  let y = [ yEncoded & 0xff, (yEncoded >> 8) & 0xff ];
  let z = [ zEncoded & 0xff, (zEncoded >> 8) & 0xff ];

  return [
      0x02, 0x01, 0x06,                                          // Flags
      0x09, 0x16, 0xa1, 0x2a, x[0], x[1], y[0], y[1], z[0], z[1] // Mag 3D
  ];
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
Bangle.setBarometerPower(isBarEnabled, APP_ID);
Bangle.setGPSPower(isGpsEnabled, APP_ID);
Bangle.setHRMPower(isHrmEnabled, APP_ID);
Bangle.setCompassPower(isMagEnabled, APP_ID);
E.showMenu(mainMenu);
setInterval(transmitUpdatedSensorData, 1000);