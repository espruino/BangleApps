Bangle.setGPSPower(1);
E.showMessage("Loading...");

function onGNSS(nmea) {
  Terminal.println(nmea);
}
Bangle.on('GPS-raw', onGNSS);
