
/*

test bed for working out lowest power consumption, with workable GPS
Load into IDE and upload code to RAM when connected to watch

*/


Bangle.on('GPS-raw',function (d) {
  if (d[0]=="$") return;
  if (d.startsWith("\xB5\x62\x05\x01")) print("GPS ACK");
  else if (d.startsWith("\xB5\x62\x05\x00")) print("GPS NACK");
  // 181,98 sync chars  
  else print("GPS",E.toUint8Array(d).join(","));
});

function writeGPScmd(cmd) {
  var d = [0xB5,0x62]; // sync chars
  d = d.concat(cmd);
  var a=0,b=0;
  for (var i=2;i<d.length;i++) {
    a += d[i];
    b += a;
  }
  d.push(a&255,b&255);
  console.log(d);
  Serial1.write(d);
}

// quick hack
function wait(ms){
  var start = new Date().getTime();
  var end = start;
  while(end < start + ms) {
    end = new Date().getTime();
  }
}


/* 
 * gps_disable_nmea_output
 *
 * disables all NMEA messages to be output from the GPS.
 * even though the parser can cope with NMEA messages and ignores them, it 
 * may save power to disable them completely.
 *
 *
 * DO NOT USE
 * HB:  This is a bad idea on a Bangle JS
 * You wont get any fixes if you call this function
 *
 *
 */
function UBX_CFG_DISABLE_NMEA() {
  writeGPScmd([0x06, 0x00,  /* UBX-CFG-PRT */
           20, 0x00,        
           0x01, 0x00, 0x00, 0x00,                     /* UART1, reserved, no TX ready */
           0xe0, 0x08, 0x00, 0x00,                /* UART mode (8N1) */
           0x80, 0x25, 0x00, 0x00,                /* UART baud rate (9600) */
           0x01, 0x00,                    /* input protocols (uBx only) */
           0x01, 0x00,                    /* output protocols (uBx only) */
           0x00, 0x00,                    /* flags */
           0x00, 0x00]);                    /* reserved */
}

/* 
 * gps_disable_nmea_output
 *
 * disables all NMEA messages to be output from the GPS.
 * even though the parser can cope with NMEA messages and ignores them, it 
 * may save power to disable them completely.
 *
 * Can use this to switch NMEA back on if you call 
 * UBX_CFG_DISABLE_NMEA() 
 *
 */
function UBX_CFG_RESTORE_NMEA() {
  writeGPScmd([0x06, 0x00,  /* UBX-CFG-PRT */
           20, 0x00,        
           0x01, 0x00, 0x00, 0x00,                     /* UART1, reserved, no TX ready */
           0xe0, 0x08, 0x00, 0x00,                /* UART mode (8N1) */
           0x80, 0x25, 0x00, 0x00,                /* UART baud rate (9600) */
           0x03, 0x00,                    /* input protocols (uBx only) */
           0x03, 0x00,                    /* output protocols (uBx only) */
           0x00, 0x00,                    /* flags */
           0x00, 0x00]);                    /* reserved */
}

function UBX_CFG_PMS() {
  // UBX-CFG-PMS - enable power management - Super-E
  writeGPScmd([0x06,0x86, // msg class + type
         8,0,//length
         0x00,0x03, 0,0, 0,0, 0,0]);  
}

function UBX_CFG_INTERVAL(period, ontime) {
  writeGPScmd([0x06,0x86, // msg class + type
         8,0, //length
         //v0,  interval     period             ontime           reserved
         0x00,  0x02,        period,        0,  ontime,     0,    0,      0  ]);
         // the values are little endian, least significant byte first
}

/*
 * set update baud rate
 *
 * the setting is in milliseconds in 2 bytes, max 65 seconds
 * we are passing in a value in seconds
 * we set the most significant byte only
 * 8 seconds ~ 8192ms 0x2000, 0x20 = 32 = 4*8
 *
 */
function UBX_CFG_RATE(rate) {
  rate = (rate * 4) % 256;
  //console.log("rate=" + rate);
   
  writeGPScmd([0x06,0x08,  // class, id 
           0x06, 0,          // length
           0x00, rate,       // b0: 8192ms 0x2000,  0x00FF (~65sec)
           0x01, 0x00,       // b2: 
           0x01, 0x00]);     // b4: timeref GPS
}

/*
 * Save configuration otherwise it will reset when the GPS wakes up
 *
 */
function UBX_CFG_SAVE() {
  writeGPScmd([0x06, 0x09,   // class id
           0x0D, 0x00,   // length
           0x00, 0x00, 0x00, 0x00,  // clear mask
           0xFF, 0xFF, 0x00, 0x00,  // save mask
           0x00, 0x00, 0x00, 0x00,  // load mask
           0x07]);                  // b2=eeprom b1=flash b0=bat backed ram
                                        // code on github had 7 - all 3 set ?
}



  /*
   * Reset to factory settings using clear mask in UBX_CFG_CFG
   * https://portal.u-blox.com/s/question/0D52p0000925T00CAE/ublox-max-m8q-getting-stuck-when-sleeping-with-extint-pin-control
   */
  function UBX_CFG_RESET() {
    writeGPScmd([0x06, 0x09,   // class id 
                 0x0D, 0x00,
         0xFF, 0xFB, 0x00, 0x00,  // clear mask
         0x00, 0x00, 0x00, 0x00,  // save mask
         0xFF, 0xFF, 0x00, 0x00,  // load mask
         0x17]);
  }


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


  /*
   * Extended Power Management 
   * update and search are in seconds
   *
   * https://github.com/thasti/utrak/blob/master/gps.c
   */
function UBX_CFG_PM2(update,search) {

  var u = int_2_bytes(update*1000);
  var s = int_2_bytes(search*1000);

  writeGPScmd([0x06, 0x3B,                   /* class id */
           44, 0,                         /* length */
           0x01, 0x00, 0x00, 0x00,       /* v1, reserved 1..3 */
           0x00, 0x10, 0x00, 0x00,       /* on/off-mode, update ephemeris */
           // little endian, lsb first
           //0x30, 0x75, 0x00, 0x00,    /* update period, ms, 120s=00 01 D4 C0, 30s= 00 00 75 30 */
           //0x88, 0x13, 0x00, 0x00,    /* search period, ms, 120s, 20s = 00 00 4E 20, 5s = 13 88 */
           u[3], u[2], u[1], u[0],          /* update period, ms, 120s=00 01 D4 C0, 30s= 00 00 75 30 */
           s[3], s[2], s[1], s[0],          /* search period, ms, 120s, 20s = 00 00 4E 20, 5s = 13 88 */
           0x00, 0x00, 0x00, 0x00,    /* grid offset */
           0x00, 0x00,              /* on-time after first fix */
           0x01, 0x00,                /* minimum acquisition time */
           0x00, 0x00, 0x00, 0x00,      /* reserved 4,5 */
           0x00, 0x00, 0x00, 0x00,      /* reserved 6 */
           0x00, 0x00, 0x00, 0x00,    /* reserved 7 */
           0x00, 0x00, 0x00, 0x00,    /* reserved 8,9,10 */
           0x00, 0x00, 0x00, 0x00]);  /* reserved 11 */
}


// enable power saving mode, after configured with PM2
function UBX_CFG_RXM() {
  writeGPScmd([0x06, 0x11,        /* UBX-CFG-RXM */
           2, 0,              /* length */
           0x08, 0x01]);      /* reserved, enable power save mode */
}

function onGPS(fix) {
  console.log(fix);
}


function setupGPS() {
  Bangle.setGPSPower(1);

  UBX_CFG_RESET();
  wait(100);

  //UBX_CFG_RESTORE_NMEA();
  //wait(20);

  UBX_CFG_PM2(120,5);
  wait(20);
  
  UBX_CFG_RXM();
  wait(20);
    
  UBX_CFG_SAVE();
  wait(20);
  
  Bangle.on('GPS',onGPS);
}

function test_gps_on() {

  var settings = WIDGETS.gpsservice.gps_get_settings();

  settings.gpsservice = true;
  settings.update = 65;
  settings.search = 5;
  settings.power_mode = "PSMOO";
  
  WIDGETS.gpsservice.gps_set_settings(settings);
  WIDGETS.gpsservice.reload(); // will power on
}


function test_gps_off() {

  var settings = WIDGETS.gpsservice.gps_get_settings();

  settings.gpsservice = false;
  settings.power_mode = "SuperE";
  
  WIDGETS.gpsservice.gps_set_settings(settings);
  WIDGETS.gpsservice.reload(); // will power off
}

// test_gps_on();
// test_gps_off();

