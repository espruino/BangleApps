(() => {
  function getFace(){
    var intervalRefSec;
    var bearing;
    var heading;
    var oldHeading;
    var CALIBDATA;
    var previous;
    var wp;
    var wp_distance;
    var wp_bearing;
    var loc;
    var gpsObject;
    
    function log_debug(o) {
      //console.log(o);
    }

    function init(gps,sw, hrm) {
      gpsObject = gps;
      intervalRefSec = undefined;
      bearing = 0; // always point north if GPS is off
      heading = 0;
      oldHeading = 0;
      resetPrevious();
      loc = require("locale");
      CALIBDATA = require("Storage").readJSON("magnav.json",1)||null;
      getWaypoint();

      /*
       * compass should be powered on before startDraw is called
       * otherwise compass power widget will not come on
       */
      if (!Bangle.isCompassOn()) Bangle.setCompassPower(1);
      gps.determineGPSState();
    }

    function freeResources() {
      gpsObject = undefined;
      intervalRefSec = undefined;
      previous = undefined;
      bearing = 0;
      heading = 0;
      oldHeading = 0;
      loc = undefined;
      CALIBDATA = undefined;
      wp = undefined;
      if (Bangle.isCompassOn !== undefined && Bangle.isCompassOn()) Bangle.setCompassPower(0);
    }
    
    function startTimer() {
      log_debug("startTimer()");
      if (Bangle.isCompassOn !== undefined && !Bangle.isCompassOn()) Bangle.setCompassPower(1);
      resetPrevious();
      draw();
      intervalRefSec = setInterval(draw, 500);
    }

    function stopTimer() {
      log_debug("stopTimer()");
      if (intervalRefSec) {intervalRefSec=clearInterval(intervalRefSec);}
      if (Bangle.isCompassOn !== undefined && Bangle.isCompassOn()) Bangle.setCompassPower(0);
    }

    function onButtonShort(btn) {
      log_debug("onButtonShort()");
      if (gpsObject.getState() !== gpsObject.GPS_RUNNING) return;
      switch(btn) {
      case 1:
        log_debug("prev waypoint");
        gpsObject.nextWaypoint(-1);
        break;
      case 2:
        log_debug("next waypoint");
        gpsObject.nextWaypoint(1);
        break;
      case 3:
      default:
        break;
      }
      resetPrevious();
      getWaypoint();
      drawGPSData();
    }
    
    function onButtonLong(btn) {
      log_debug("markWaypoint()");
      if (btn === 1) {
        if (gpsObject.getState() !== gpsObject.GPS_RUNNING) return;
        log_debug("markWaypoint()");
      
        gpsObject.markWaypoint();
        resetPrevious();
        getWaypoint();
        drawGPSData();
        return;
      }

      if (btn === 2)
        Bangle.showLauncher();
    }

    function getWaypoint() {
      log_debug("getWaypoint()");
      wp = gpsObject.getCurrentWaypoint();
      wp_distance = gpsObject.getWPdistance();
      wp_bearing = gpsObject.getWPbearing();

      if (gpsObject.getState() === gpsObject.GPS_RUNNING)
        bearing = wp_bearing;
      else
        bearing = 0;

      log_debug(wp);
      log_debug("wp_distance:" + wp_distance);
      log_debug("wp_bearing:" + wp_bearing);
    }
    
    // takes 16-20ms, will be called twice
    function drawCompass(angle, col) {
      angle = angle * Math.PI/180;
      var p = [0, 1.1071, Math.PI/4, 2.8198, 3.4633, 7*Math.PI/4 , 5.1760];

      var poly = [
        120+60*Math.sin(angle+p[0]),       120-60*Math.cos(angle+p[0]),
        120+44.7214*Math.sin(angle+p[1]),  120-44.7214*Math.cos(angle+p[1]),
        120+28.2843*Math.sin(angle+p[2]),  120-28.2843*Math.cos(angle+p[2]),
        120+63.2455*Math.sin(angle+p[3]),  120-63.2455*Math.cos(angle+p[3]),
        120+63.2455*Math.sin(angle+p[4]),  120-63.2455*Math.cos(angle+p[4]),
        120+28.2843*Math.sin(angle+p[5]),  120-28.2843*Math.cos(angle+p[5]),
        120+44.7214*Math.sin(angle+p[6]),  120-44.7214*Math.cos(angle+p[6])
      ];
      
      g.setColor(col);
      g.fillPoly(poly);
    }

    // stops violent compass swings and wobbles, takes 3ms
    function newHeading(m,h){ 
      //log_debug("newHeading()");
      var s = Math.abs(m - h);
      var delta = (m>h)?1:-1;
      if (s>=180){s=360-s; delta = -delta;} 
      if (s<2) return h;
      if (s<3) return h;
      var hd = h + delta*(1 + Math.round(s/5));
      if (hd<0) hd+=360;
      if (hd>360)hd-= 360;
      return hd;
    }

    // takes approx 7ms
    function tiltfixread(O,S){
      //log_debug("tiltfixread()");
      var m = Bangle.getCompass();
      var g = Bangle.getAccel();
      m.dx =(m.x-O.x)*S.x; m.dy=(m.y-O.y)*S.y; m.dz=(m.z-O.z)*S.z;
      var d = Math.atan2(-m.dx,m.dy)*180/Math.PI;
      if (d<0) d+=360;
      var phi = Math.atan(-g.x/-g.z);
      var cosphi = Math.cos(phi), sinphi = Math.sin(phi);
      var theta = Math.atan(-g.y/(-g.x*sinphi-g.z*cosphi));
      var costheta = Math.cos(theta), sintheta = Math.sin(theta);
      var xh = m.dy*costheta + m.dx*sinphi*sintheta + m.dz*cosphi*sintheta;
      var yh = m.dz*sinphi - m.dx*cosphi;
      var psi = Math.atan2(yh,xh)*180/Math.PI;
      if (psi<0) psi+=360;
      return psi;
    }

    function draw() {
      log_debug("draw()");

      g.setFontAlign(0,0);
      g.setColor(1,1,1);
      g.setFont("Vector", 24);

      if (Bangle.isCompassOn === undefined) {
        g.drawString("E-FW", 120, 120);
        return
      }
      
      if (CALIBDATA === undefined || CALIBDATA === null) {
        g.drawString("E-CALIB", 120, 120);
        return
      }
      
      var d = tiltfixread(CALIBDATA.offset,CALIBDATA.scale);
      heading = newHeading(d,heading);
      // sets bearing to waypoint bearing if GPS on else sets to 0 (north)
      getWaypoint();  

      // make the compass point in the direction we need to go
      var dir = bearing - heading;
      if (dir < 0) dir += 360;
      if (dir > 360) dir -= 360;

      if (dir !== oldHeading) {
        drawCompass(oldHeading, 0);
        drawCompass(dir, 0xFFC0); // yellow
        oldHeading = dir;
      }

      if (gpsObject.getState() === gpsObject.GPS_RUNNING) {
        drawGPSData();
      } else {
        drawCompassHeading();
      }
    }

    // only used when acting as compass with GPS off
    function drawCompassHeading() {
      //log_debug("drawCompassHeading()");
      var hding = Math.round(heading);
      var hd = hding.toString();
      hd = hding < 10 ? "00"+hd : hding < 100 ? "0"+hd : hd;

      if (previous.hding !== hd) {
        previous.hding = hd;
        g.setColor(1,1,1);
        g.setFontAlign(-1,-1);
        g.setFont("Vector",38);
        g.clearRect(80, 200, 159, 239);
        g.drawString(hd, 80, 200);
      }
    }

    function drawGPSData() {
      log_debug("drawGPSData()");
      var bs = wp_bearing.toString();
      bs = wp_bearing<10?"00"+bs : wp_bearing<100 ?"0"+bs : bs;
      var dst = loc.distance(wp_distance);
      
      log_debug(bs);
      log_debug(dst);

      // -1=left (default), 0=center, 1=right
      
      // show distance on the left
      if (previous.dst !== dst) {
        previous.dst = dst
        g.setFontAlign(-1,-1);  // left, bottom
        g.setFont("Vector", 20);
        g.clearRect(0, 200, 79, 239);

        if (gpsObject.waypointHasLocation())
          g.setColor(0x07ff);
        else
          g.setColor(1,1,1);
        g.drawString(dst, 0, 200);
      }
      
      // bearing, place in middle at bottom of compass
      if (previous.bs !== bs) {
        previous.bs = bs;
        g.setColor(1,1,1);
        g.setFontAlign(0,-1);  // middle, bottom
        g.setFont("Vector",38);
        g.clearRect(80, 200, 159, 239);
        g.drawString(bs, 119, 200);
      }

      // waypoint name on right
      if (previous.wp_name !== wp.name) {
        g.setFontAlign(1,-1);     // right, bottom
        g.setFont("Vector", 20);
        g.clearRect(160, 200, 239, 239);

        if (gpsObject.waypointHasLocation())
          g.setColor(0x07ff);
        else
          g.setColor(1,1,1);
        g.drawString(wp.name, 239, 200);
      }
    }

    // clear the attributes that control the display refresh
    function resetPrevious() {
      log_debug("resetPrevious()");
      previous = {hding:"-", bs:"-", dst:"-", wp_name:"-", course:999};
    }

    return {init:init, freeResources:freeResources, startTimer:startTimer, stopTimer:stopTimer,
            onButtonShort:onButtonShort, onButtonLong:onButtonLong};
  }

  return getFace;

})();
