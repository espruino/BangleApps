(() => {
  var settings = {};
  var fixToggle = false; // toggles once for each reading
  var have_fix = false;
  
  var last_fix = {
    fix: 0,
    alt: 0,
    lat: 0,
    lon: 0,
    speed: 0,
    time: 0,
    satellites: 0
  };

  function gps_get_fix() { return last_fix; }
  function gps_get_status() { return WIDGETS.gpsservice.width === 24 ? true : false;}
  function gps_get_version() { return "0.2"; }
	
  // Called by the GPS widget settings to reload settings and decide what to do
  function reload() {
    settings = require("Storage").readJSON("gpsservice.settings.json",1)||{};
    settings.service = settings.service||false;
    settings.update = settings.update||120;
    settings.search = settings.search||5;   
    settings.power = settings.power||0;
    console.log(settings);
	  
    Bangle.removeListener('GPS',onGPS);

    if (settings.service) {
       gps_power_on();
    } else {
       gps_power_off();
    }
  }
  
  function gps_power_on() {
    have_fix = false;
    fixToggle = false;
    setupGPS();
    WIDGETS.gpsservice.width = 24;
  }

  function gps_power_off() {
    Bangle.setGPSPower(0);
    have_fix = false;
    fixToggle = false;
    last_fix.fix = 0;
    WIDGETS.gpsservice.width = 0;
  }

  // quick hack
  function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
    }
  }

  function setupGPS() {
    Bangle.setGPSPower(1);
    console.log(settings);

    // 1 == PMSOO, 0 == PSM
    if (settings.power === 1) {
      console.log("setupGPS() PSMOO");
      UBX_CFG_RESET();
      wait(100);
      
      UBX_CFG_PM2(settings.update, settings.search);
      wait(20);
    
      UBX_CFG_RXM();
      wait(20);
      
      UBX_CFG_SAVE();
      wait(20);
    } else {
      console.log("setupGPS() PMS");
      UBX_CFG_RESET();
      wait(100);
      
      UBX_CFG_PMS();
      wait(20);

      UBX_CFG_SAVE();
      wait(20);
    }
    Bangle.on('GPS',onGPS);
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
    writeGPScmd([0x06,0x86, // msg class + type
		 8,0,//length
		 0x00,0x03, 0,0, 0,0, 0,0]);  
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
   * update and search are in milli seconds
   * settings are loaded little endian, lsb first
   *
   * https://github.com/thasti/utrak/blob/master/gps.c
   */
  function UBX_CFG_PM2(update,search) {

    var u = int_2_bytes(update*1000);
    var s = int_2_bytes(search*1000);

    writeGPScmd([0x06, 0x3B,                /* class id */
		 44, 0,	                    /* length */
		 0x01, 0x00, 0x00, 0x00,    /* v1, reserved 1..3 */
		 0x00, 0x10, 0x00, 0x00,    /* on/off-mode, update ephemeris */
		 u[3], u[2], u[1], u[0],    /* update period, ms, 120s=00 01 D4 C0, 30s= 00 00 75 30 */
		 s[3], s[2], s[1], s[0],    /* search period, ms, 120s, 20s = 00 00 4E 20, 5s = 13 88 */
		 0x00, 0x00, 0x00, 0x00,    /* grid offset */
		 0x00, 0x00,	            /* on-time after first fix */
		 0x01, 0x00,                /* minimum acquisition time */
		 0x00, 0x00, 0x00, 0x00,    /* reserved 4,5 */
		 0x00, 0x00, 0x00, 0x00,    /* reserved 6 */
		 0x00, 0x00, 0x00, 0x00,    /* reserved 7 */
		 0x00, 0x00, 0x00, 0x00,    /* reserved 8,9,10 */
		 0x00, 0x00, 0x00, 0x00]);  /* reserved 11 */
  }
  
  // enable power saving mode, after configured with PM2
  function UBX_CFG_RXM() {
    writeGPScmd([0x06, 0x11,      /* UBX-CFG-RXM */
		 2, 0,	          /* length */
		 0x08, 0x01]);	  /* reserved, enable power save mode */
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
 
  // draw the widget
  function draw() {
    if (!settings.service) return;
    g.reset();
    g.drawImage(atob("GBgCAAAAAAAAAAQAAAAAAD8AAAAAAP/AAAAAAP/wAAAAAH/8C9AAAB/8L/QAAAfwv/wAAAHS//wAAAAL//gAAAAf/+AAAAAf/4AAAAL//gAAAAD/+DwAAAB/Uf8AAAAfA//AAAACAf/wAAAAAH/0AAAAAB/wAAAAAAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"),this.x,this.y);
    if (gps_get_status() === true && have_fix) {
      g.setColor("#00FF00");
      g.drawImage(fixToggle ? atob("CgoCAAAAA0AAOAAD5AAPwAAAAAAAAAAAAAAAAA==") : atob("CgoCAAABw0AcOAHj5A8PwHwAAvgAB/wABUAAAA=="),this.x,this.y+14);
    } else {
      g.setColor("#0000FF");
      if (fixToggle) g.setFont("6x8").drawString("?",this.x,this.y+14);
    }
  }
  
  function onGPS(fix) {
    fixToggle = !fixToggle;
    WIDGETS.gpsservice.draw();

    last_fix.satellites = fix.satellites;

    /*
     * If we have a fix record it, we will get another soon. Apps
     * will see the timestamp of the last fix and be able to work out
     * if it is stale. This means an App will always have the last
     * known fix, and we avoid saying no fix all the time.
     *
     */
    if (fix.fix) {
      last_fix.fix = fix.fix;
      last_fix.alt = fix.alt;
      last_fix.lat = fix.lat;
      last_fix.lon = fix.lon;
      last_fix.speed = fix.speed;
      last_fix.time = fix.time;
    }
  }
  
  // redraw when the LCD turns on
  Bangle.on('lcdPower', function(on) {
    if (on) WIDGETS.gpsservice.draw();
  });
  
  // add the widget
  WIDGETS.gpsservice = {
    area:"tl",
    width:24,
    draw:draw,
    gps_power_on:gps_power_on,
    gps_power_off:gps_power_off,
    gps_get_status:gps_get_status,
    gps_get_fix:gps_get_fix,
    gps_get_version:gps_get_version,
    reload:function() {
        reload();
        Bangle.drawWidgets(); // relayout all widgets
    }};

   // load settings, set correct widget width
  reload();
  
})();

