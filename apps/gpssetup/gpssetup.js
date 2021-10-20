const SETTINGS_FILE = "gpssetup.settings.json";

function log_debug(o) {
  //let timestamp = new Date().getTime();
  //console.log(timestamp + " : " + o);
}

function writeGPScmd(cmd) {
  var d = [0xB5,0x62]; // sync chars
  d = d.concat(cmd);
  var a=0,b=0;
  for (var i=2;i<d.length;i++) {
    a += d[i];
    b += a;
  }
  d.push(a&255,b&255);
  Serial1.write(d);
}

// UBX-CFG-PMS - enable power management - Super-E
function UBX_CFG_PMS() {
  log_debug("UBX_CFG_PMS()");
  writeGPScmd([0x06,0x86, // msg class + type
               8,0,//length
               0x00,0x03, 0,0, 0,0, 0,0]);
}

/*
 * Extended Power Management
 * update and search are in milli seconds
 * settings are loaded little endian, lsb first
 *
 * https://github.com/thasti/utrak/blob/master/gps.c
 */
function UBX_CFG_PM2(update,search) {
  log_debug("UBX_CFG_PM2()");

  // convert an integer to an array of bytes
  function int_2_bytes( x ){
    var bytes = [];
    var i = 4;
    do {
      bytes[--i] = x & (255);
      x = x>>8;
    } while (i);
    return bytes;
  }

  var u = int_2_bytes(update*1000);
  var s = int_2_bytes(search*1000);

  writeGPScmd([0x06, 0x3B,                /* class id */
               44, 0,                      /* length */
               0x01, 0x00, 0x00, 0x00,    /* v1, reserved 1..3 */
               0x00, 0x10, 0x00, 0x00,    /* on/off-mode, update ephemeris */
               u[3], u[2], u[1], u[0],    /* update period, ms, 120s=00 01 D4 C0, 30s= 00 00 75 30 */
               s[3], s[2], s[1], s[0],    /* search period, ms, 120s, 20s = 00 00 4E 20, 5s = 13 88 */
               0x00, 0x00, 0x00, 0x00,    /* grid offset */
               0x00, 0x00,              /* on-time after first fix */
               0x01, 0x00,                /* minimum acquisition time */
               0x00, 0x00, 0x00, 0x00,    /* reserved 4,5 */
               0x00, 0x00, 0x00, 0x00,    /* reserved 6 */
               0x00, 0x00, 0x00, 0x00,    /* reserved 7 */
               0x00, 0x00, 0x00, 0x00,    /* reserved 8,9,10 */
               0x00, 0x00, 0x00, 0x00]);  /* reserved 11 */
}

// enable power saving mode, after configured with PM2
function UBX_CFG_RXM() {
  log_debug("UBX_CFG_RXM()");
  writeGPScmd([0x06, 0x11,      /* UBX-CFG-RXM */
               2, 0,            /* length */
               0x08, 0x01]);    /* reserved, enable power save mode */
}

/*
 * Save configuration otherwise it will reset when the GPS wakes up
  */
function UBX_CFG_SAVE() {
  log_debug("UBX_CFG_SAVE()");
  writeGPScmd([0x06, 0x09,   // class id
               0x0D, 0x00,   // length
               0x00, 0x00, 0x00, 0x00,  // clear mask
               0xFF, 0xFF, 0x00, 0x00,  // save mask
               0x00, 0x00, 0x00, 0x00,  // load mask
               0x07]);                  // b2=eeprom b1=flash b0=bat backed ram
}

/*
 * Reset to factory settings using clear mask in UBX_CFG_CFG
 * https://portal.u-blox.com/s/question/0D52p0000925T00CAE/ublox-max-m8q-getting-stuck-when-sleeping-with-extint-pin-control
 */
function UBX_CFG_RESET() {
  log_debug("UBX_CFG_RESET()");
  writeGPScmd([0x06, 0x09,   // class id
               0x0D, 0x00,
               0xFF, 0xFB, 0x00, 0x00,  // clear mask
               0x00, 0x00, 0x00, 0x00,  // save mask
               0xFF, 0xFF, 0x00, 0x00,  // load mask
               0x17]);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setupSuperE() {
  log_debug("setupGPS() Super-E");
  return Promise.resolve().then(function() {
    UBX_CFG_RESET();
    return delay(100);
  }).then(function() {
    UBX_CFG_PMS();
    return delay(20);
  }).then(function() {
    UBX_CFG_SAVE();
    return delay(20);
  }).then(function() {
    log_debug("Powering GPS Off");
    /*
     * must be part of the promise chain to ensure that
     * setup does not return and powerOff before config functions
     * have run
     */
    return delay(20);
  });
}

function setupPSMOO(settings) {
  log_debug("setupGPS() PSMOO");
  return Promise.resolve().then(function() {
    UBX_CFG_RESET();
    return delay(100);
  }).then(function() {
    UBX_CFG_PM2(settings.update, settings.search);
    return delay(20);
  }).then(function() {
    UBX_CFG_RXM();
    return delay(20);
  }).then(function() {
    UBX_CFG_SAVE();
    return delay(20);
  }).then(function() {
    log_debug("Powering GPS Off");
    /*
     * must be part of the promise chain to ensure that
     * setup does not return and powerOff before config functions
     * have run
     */
    return delay(20);
  });
}

/** Set GPS power mode (assumes GPS on), returns a promise.
Either:

require("gpssetup").setPowerMode() // <-- set up GPS to current saved defaults
require("gpssetup").setPowerMode({power_mode:"PSMOO", update:optional, search:optional}) // <-- PSMOO mode
require("gpssetup").setPowerMode({power_mode:"SuperE"}) // <-- Super E mode

See the README for more information
 */
exports.setPowerMode = function(options) {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};
  if (options) {
    if (options.update) settings.update = options.update;
    if (options.search) settings.search = options.search;
    if (options.power_mode) settings.power_mode = options.power_mode;
  }
  settings.update = settings.update||120;
  settings.search = settings.search||5;
  settings.power_mode = settings.power_mode||"SuperE";
  if (options) require("Storage").write(SETTINGS_FILE, settings);
  if (settings.power_mode === "PSMOO") {
    return setupPSMOO(settings);
  } else {
    return setupSuperE();
  }
};
