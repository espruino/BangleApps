(() => {
  
  function getFace(){

    //var img = require("heatshrink").decompress(atob("mEwghC/AH4AKg9wC6t3u4uVC6wWBI6t3uJeVuMQCqcBLisAi4XLxAABFxAXKgc4DBAuBRhQXEDAq7MmYXEwBHEXZYXFGAOqAAKDMmczC4mIC62CC50PC4JIBkQABiIvRmURAAUSjQXSFwMoxGKC6CRFwUSVYgXLPIgXXwMYegoXLJAYXCGBnzGA0hPQIwMgYwGC6gwCC4ZIMC4gYBC604C4ZISmcRVgapQAAMhC6GIJIwXCMBcIxGDDBAuLC4IwGAARGMAAQWGmAXPJQoWMC4pwCCpoXJAB4XXAH4A/ABQA="));
    var nofix = 0;
    
    function formatTime(now) {
      var fd = now.toUTCString().split(" ");
      return fd[4];
    }

    
    function timeSince(t) {
      var hms = t.split(":");
      var now = new Date();
      
      var sn = 3600*(now.getHours()) + 60*(now.getMinutes()) + 1*(now.getSeconds());
      var st = 3600*(hms[0]) + 60*(hms[1]) + 1*(hms[2]);
  
      return (sn - st);
    }

    function draw() {
      var gps_on = false;

      var fix = {
        fix: 0,
        alt: 0,
        lat: 0,
	lon: 0,
	speed: 0,
	time: 0,
	satellites: 0
      };

      var y_line = 26;
      var y_start = 46;
      var x_start = 10;
      
      // only attempt to get gps fix if gpsservuce is loaded
      if (WIDGETS.gpsservice !== undefined) {
        fix = WIDGETS.gpsservice.gps_get_fix();
	gps_on = WIDGETS.gpsservice.gps_get_status();
      }

      g.reset();
      g.clearRect(0,24,239,239);

      if (fix.fix) {
	var time = formatTime(fix.time);
	var age = timeSince(time);
	
	g.setFontAlign(-1, -1);
	g.setFont("6x8");
	g.setFontVector(22);
	g.drawString("Alt: " + fix.alt +" m", x_start, y_start, true);
	g.drawString("Lat: "+ fix.lat, x_start, y_start + y_line, true);
	g.drawString("Lon: " + fix.lon, x_start, y_start + 2*y_line, true);
	g.drawString("Time: " + time, x_start, y_start + 3*y_line, true);
	g.drawString("Age(s): " + age, x_start, y_start + 4*y_line, true);
	g.drawString("Satellites: " + fix.satellites, x_start, y_start + 5*y_line, true);
	
      } else if (gps_on) {
	
	g.setFontAlign(0, 1);
	g.setFont("6x8", 2);
	g.drawString("GPS Watch", 120, 60);
	g.drawString("Waiting for GPS", 120, 80);
	nofix = (nofix+1) % 4;
	g.drawString(".".repeat(nofix) + " ".repeat(4-nofix), 120, 120);
	g.setFontAlign(0,0);
	g.drawString(fix.satellites + " satellites", 120, 100);
	
      } else if (!gps_on) {
	
	g.setFontAlign(0, 0);
	g.setFont("6x8", 3);
	g.drawString("GPS Watch", 120, 80);
	g.drawString("GPS is off",120, 160);
	
      }
    }

    function onSecond(){
      var t = new Date();
      if ((t.getSeconds() % 5) === 0) draw();
    }
    
    return {init:draw, tick:onSecond};
  }

  return getFace;

})();
