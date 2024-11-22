/**
 * Copyright reelyActive 2024
 * We believe in an open Internet of Things
 */


// Non-user-configurable constants
const APP_ID = 'openlocatebeacon';
const ADVERTISING_OPTIONS = { showName: false, interval: 5000 };


// Global variables
let bar, gps;
let sequenceNumber = 0;


// Menus
let mainMenu = {
  "": { "title": "OpenLocateBcn" },
  "Lat": { value: null },
  "Lon": { value: null },
  "Altitude": { value: null },
  "Satellites": { value: null }
};


// Encode the OpenLocate geo location element advertising packet
function encodeGeoLocationElement() {
  let lci = new Uint8Array(16);
  let seqFrag = ((sequenceNumber++ & 0x0f) << 4) + 0x01;
  let rfc6225lat = toRfc6225Coordinate(gps.lat);
  let rfc6225lon = toRfc6225Coordinate(gps.lon);
  let rfc6225alt = toRfc6225Altitude(bar.altitude);
  lci[0] = rfc6225lat.integer >> 7;
  lci[1] = ((rfc6225lat.integer & 0xff) << 1) + (rfc6225lat.fraction >> 24);
  lci[2] = (rfc6225lat.fraction >> 16) & 0xff;
  lci[3] = (rfc6225lat.fraction >> 8) & 0xff;
  lci[4] = rfc6225lat.fraction & 0xff;
  lci[5] = rfc6225lon.integer >> 7;
  lci[6] = ((rfc6225lon.integer & 0xff) << 1) + (rfc6225lon.fraction >> 24);
  lci[7] = (rfc6225lon.fraction >> 16) & 0xff;
  lci[8] = (rfc6225lon.fraction >> 8) & 0xff;
  lci[9] = rfc6225lon.fraction & 0xff;
  lci[10] = bar.altitude ? 0x10 : 0x00;
  lci[11] = (rfc6225alt.integer >> 16) & 0xff;
  lci[12] = (rfc6225alt.integer >> 8) & 0xff;
  lci[13] = rfc6225alt.integer & 0xff;
  lci[14] = rfc6225alt.fraction & 0xff;
  lci[15] = 0x41;

  return [
      0x02, 0x01, 0x06, // Flags
      0x16, 0x16, 0x94, 0xfd, 0x09, seqFrag, 0x30, lci[0], lci[1], lci[2],
      lci[3], lci[4], lci[5], lci[6], lci[7], lci[8], lci[9], lci[10], lci[11],
      lci[12], lci[13], lci[14], lci[15]
  ];
}


// Convert a latitude or longitude coordinate to RFC6225
function toRfc6225Coordinate(coordinate) {
  let integer = Math.floor(coordinate);
  let fraction = Math.round((coordinate - integer) * 0x1ffffff);

  if(integer < 0) {
    integer += 0x1ff + 1;
  }

  return { integer: integer, fraction: fraction };
}


// Convert altitude to RFC6225
function toRfc6225Altitude(altitude) {
  if(!altitude) {
    return { integer: 0, fraction: 0 };
  }

  let integer = Math.floor(altitude);
  let fraction = Math.round((altitude - integer) * 0xff);

  if(integer < 0) {
    integer += 0x3fffff + 1;
  }

  return { integer: integer, fraction: fraction };
}


// Update barometer
Bangle.on('pressure', (newBar) => {
  bar = newBar;

  mainMenu.Altitude.value = bar.altitude.toFixed(1) + 'm';
  E.showMenu(mainMenu);
});


// Update GPS
Bangle.on('GPS', (newGps) => {
  gps = newGps;

  mainMenu.Lat.value = gps.lat.toFixed(4);
  mainMenu.Lon.value = gps.lon.toFixed(4);
  mainMenu.Satellites.value = gps.satellites;
  E.showMenu(mainMenu);

  if(!isNaN(gps.lat) && !isNaN(gps.lon)) {
    NRF.setAdvertising(encodeGeoLocationElement(), ADVERTISING_OPTIONS);
  }
  else {
    NRF.setAdvertising({}, { name: "Bangle.js" });
  }
});


// On start: enable sensors and display main menu
g.clear();
Bangle.setGPSPower(true, APP_ID);
Bangle.setBarometerPower(true, APP_ID);
E.showMenu(mainMenu);