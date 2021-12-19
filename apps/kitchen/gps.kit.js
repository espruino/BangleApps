(() => {
  function getFace(){
    var intervalRefSec;

    const GDISP_OS = 4;
    const GDISP_LATLN = 5;
    const GDISP_SPEED = 6;
    const GDISP_ALT = 7;
    const GDISP_COURSE = 8;

    const Y_TIME = 30;
    const Y_ACTIVITY = 120;
    const Y_MODELINE = 200;

    let gpsDisplay = GDISP_OS;
    let clearActivityArea = true;
    let gpsObject = undefined;

    function log_debug(o) {
      //console.log(o);
    }

    function init(gps, sw, hrm) {
      log_debug("gps init");
      //log_debug(gps);
      gpsObject = gps;
      gpsDisplay = GDISP_OS;
      clearActivityArea = true;
      gpsObject.determineGPSState();
    }

    function freeResources() {}
    
    function startTimer() {
      draw();
      intervalRefSec = setInterval(draw, 5000);
    }

    function stopTimer() {
      if(intervalRefSec) {intervalRefSec=clearInterval(intervalRefSec);}
    }
    
    function onButtonShort(btn) {
      if (btn === 1) cycleGPSDisplay();
    }

    function onButtonLong(btn) {
      switch(btn) {
      case 1:
        toggleGPSPower();
        return;
      case 2:
        if (gpsObject.getState() === gpsObject.GPS_RUNNING)
          gpsObject.toggleGpsLogging();
        return;
      }
    }

    function draw(){
      drawGPSTime();
      drawGPSData();
    }

    function drawGPSTime() {  
      var time = gpsObject.getGPSTime();

      g.reset();
      g.clearRect(0,Y_TIME, 239, Y_ACTIVITY - 1);
      g.setColor(1,1,1);
      g.setFontAlign(0, -1);

      if (time.length > 5)
        g.setFont("Vector", 56);
      else
        g.setFont("Vector", 80);
        
      g.drawString(time, 120, Y_TIME);
    }

    function drawGPSData() {
      if (clearActivityArea) {
        g.clearRect(0, Y_ACTIVITY, 239, Y_MODELINE - 1);
        clearActivityArea = false;
      }

      g.setFontVector(26);
      g.setColor(0xFFC0); 
      g.setFontAlign(0, -1);

      if (Bangle.isGPSOn === undefined) {
        g.setColor(1,1,1);
        g.drawString("E-FW", 120, Y_ACTIVITY);
        return;
      }

      if (gpsObject.getState() === gpsObject.GPS_OFF) {
        g.drawString("GPS off", 120, Y_ACTIVITY);
        return;
      }

      if (gpsObject.getState() === gpsObject.GPS_TIME) {
        g.drawString("Waiting for", 120, Y_ACTIVITY);
        g.drawString("GPS", 120, Y_ACTIVITY + 36);
        return;
      }

      let fx = gpsObject.getLastFix();

      log_debug("gpsObject.getState()= " + gpsObject.getState());
      
      if (gpsObject.getState() === gpsObject.GPS_SATS) {
        g.drawString("Satellites", 120, Y_ACTIVITY);
        g.drawString(fx.satellites, 120, Y_ACTIVITY + 36);
        return;
      }

      if (gpsObject.getState() === gpsObject.GPS_RUNNING) {
        let time = gpsObject.formatTime(fx.time);
        let age = gpsObject.timeSince(time);
        let os = gpsObject.getOsRef();
        //let ref = to_map_ref(6, os.easting, os.northing);
        let speed;
        let activityStr = "";
        
        if (age < 0) age = 0;
        g.setFontVector(40);
        g.setColor(0xFFC0); 

        switch(gpsDisplay) {
        case GDISP_OS:
          activityStr = os;
          break;
        case GDISP_LATLN:
          g.setFontVector(26);
          activityStr = fx.lat.toFixed(4) + ", " + fx.lon.toFixed(4);
          break;
        case GDISP_SPEED:
          speed = fx.speed;
          speed = speed.toFixed(1);
          activityStr = speed + "kph"; 
          break;
        case GDISP_ALT:
          activityStr = fx.alt + "m";
          break;
        case GDISP_COURSE:
          activityStr = fx.course;
          break;
        }

        g.clearRect(0, Y_ACTIVITY, 239, Y_MODELINE - 1);
        g.drawString(activityStr, 120, Y_ACTIVITY);
        g.setFont("6x8",2);
        g.setColor(1,1,1);
        var age_and_logging = age + " logging " + gpsObject.loggingStatus();
        g.drawString(age_and_logging, 120, Y_ACTIVITY + 46);
      }
    }

    function toggleGPSPower() {
      gpsObject.toggleGPSPower();
      clearActivityArea = true;
      draw();
    }

    function cycleGPSDisplay() {
      if (gpsObject.getState() !== gpsObject.GPS_RUNNING) return;
      
      switch (gpsDisplay) {
      case GDISP_OS:
        gpsDisplay = GDISP_SPEED;
        break;
      case GDISP_SPEED:
        gpsDisplay = GDISP_ALT;
        break;
      case GDISP_ALT:
        gpsDisplay = GDISP_LATLN;
        break;
      case GDISP_LATLN:
        gpsDisplay = GDISP_COURSE;
        break;
      case GDISP_COURSE:
      default:
        gpsDisplay = GDISP_OS;
        break;
      }
      
      clearActivityArea = true;
      drawGPSData();
    }

    return {init:init, freeResources:freeResources, startTimer:startTimer, stopTimer:stopTimer,
            onButtonShort:onButtonShort, onButtonLong:onButtonLong};
  }

  return getFace;

})();
