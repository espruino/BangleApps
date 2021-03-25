(() => {
  function getFace(){
    var intervalRefSec;
    var pal_by;
    var pal_bw;
    var pal_bb;
    var buf1;
    var buf2;
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

    function init(gps) {
      showMem("compass init() START");
      gpsObject = gps;
      pal_by = new Uint16Array([0x0000,0xFFC0],0,1); // black, yellow
      pal_bw = new Uint16Array([0x0000,0xffff],0,1); // black, white
      pal_bb = new Uint16Array([0x0000,0x07ff],0,1); // black, blue
      buf1 = Graphics.createArrayBuffer(128,128,1,{msb:true});
      buf2 = Graphics.createArrayBuffer(80,40,1,{msb:true});

      intervalRefSec = undefined;
      bearing = 0; // always point north if GPS is off
      heading = 0;
      oldHeading = 0;
      previous = {bs:"-", dst:"-", wp_name:"-", course:999};
      loc = require("locale");
      CALIBDATA = require("Storage").readJSON("magnav.json",1)||null;
      getWaypoint();

      /*
       * compass should be powered on before startDraw is called
       * otherwise compass power widget will not come on
       */
      if (!Bangle.isCompassOn()) Bangle.setCompassPower(1);
      gps.determineGPSState();

      showMem("compass init() END");
    }

    function freeResources() {
      showMem("compass freeResources() START");
      gpsObject = undefined;
      pal_by = undefined;
      pal_bw = undefined;
      pal_bb = undefined;
      buf1 = undefined;
      buf2 = undefined;
      intervalRefSec = undefined;
      previous = undefined;

      bearing = 0;
      heading = 0;
      oldHeading = 0;
      loc = undefined;
      CALIBDATA = undefined;
      wp = undefined;
      if (Bangle.isCompassOn()) Bangle.setCompassPower(0);
      showMem("compass freeResources() END");
    }
    
    function flip1(x,y) {
      g.drawImage({width:128,height:128,bpp:1,buffer:buf1.buffer, palette:pal_by},x ,y);
      buf1.clear();
    }

    function flip2_bw(x,y) {
      g.drawImage({width:80,height:40,bpp:1,buffer:buf2.buffer, palette:pal_bw},x ,y);
      buf2.clear();
    }

    function flip2_bb(x,y) {
      g.drawImage({width:80,height:40,bpp:1,buffer:buf2.buffer, palette:pal_bb},x ,y);
      buf2.clear();
    }

    function startTimer() {
      log_debug("startTimer()");
      if (!Bangle.isCompassOn()) Bangle.setCompassPower(1);
      resetPrevious();
      draw();
      intervalRefSec = setInterval(draw, 500);
    }

    function stopTimer() {
      log_debug("stopTimer()");
      if(intervalRefSec) {intervalRefSec=clearInterval(intervalRefSec);}
      if (Bangle.isCompassOn()) Bangle.setCompassPower(0);
    }

    function showMem(msg) {
      var val = process.memory();
      var str = msg + " " + Math.round(val.usage*100/val.total) + "%";
      log_debug(str);
    }

    function onButtonShort(btn) {
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
      if (btn !== 1) return;
      if (gpsObject.getState() !== gpsObject.GPS_RUNNING) return;

      log_debug("markWaypoint()");
      
      gpsObject.markWaypoint();
      resetPrevious();
      getWaypoint();
      drawGPSData();
    }

    function getWaypoint() {
      log_debug("getWaypoint()");
      wp = gpsObject.getCurrentWaypoint();
      wp_distance = gpsObject.getWPdistance();
      wp_bearing = gpsObject.getWPbearing();
      log_debug(wp);
      log_debug(wp_distance);
      log_debug(wp_bearing);
    }
    
    // takes 32ms
    function drawCompass(hd) {
      if (Math.abs(hd - oldHeading) < 2) return 0;
      hd=hd*Math.PI/180;
      var p = [0, 1.1071, Math.PI/4, 2.8198, 3.4633, 7*Math.PI/4 , 5.1760];

      var poly = [
        64+60*Math.sin(hd+p[0]),       64-60*Math.cos(hd+p[0]),
        64+44.7214*Math.sin(hd+p[1]),  64-44.7214*Math.cos(hd+p[1]),
        64+28.2843*Math.sin(hd+p[2]),  64-28.2843*Math.cos(hd+p[2]),
        64+63.2455*Math.sin(hd+p[3]),  64-63.2455*Math.cos(hd+p[3]),
        64+63.2455*Math.sin(hd+p[4]),  64-63.2455*Math.cos(hd+p[4]),
        64+28.2843*Math.sin(hd+p[5]),  64-28.2843*Math.cos(hd+p[5]),
        64+44.7214*Math.sin(hd+p[6]),  64-44.7214*Math.cos(hd+p[6])
      ];
      
      buf1.fillPoly(poly);
      flip1(56, 56);
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
      //log_debug("draw()");
      var d = tiltfixread(CALIBDATA.offset,CALIBDATA.scale);
      heading = newHeading(d,heading);

      if (gpsObject.getState() === gpsObject.GPS_RUNNING) {
        wp_dist = gpsObject.getWPdistance();
        wp_bearing = gpsObject.getWPbearing();
        bearing = wp_bearing;
      } else {
        bearing = 0;
        wp_distance = 0;
        wp_bearing = 0;
      }

      var dir = bearing - heading;
      if (dir < 0) dir += 360;
      if (dir > 360) dir -= 360;
      var t = drawCompass(dir);  // we want compass to show us where to go
      oldHeading = dir;

      if (gpsObject.getState() === gpsObject.GPS_RUNNING) {
        drawGPSData();
      } else {
        drawCompassHeading();
      }      
    }

    function drawCompassHeading() {
      //log_debug("drawCompassHeading()");
      // draw the heading
      buf2.setColor(1);
      buf2.setFontAlign(-1,-1);
      buf2.setFont("Vector",38);
      var hding = Math.round(heading);
      var hd = hding.toString();
      hd = hding < 10 ? "00"+hd : hding < 100 ? "0"+hd : hd;
      buf2.drawString(hd,0,0);
      flip2_bw(90, 200);
    }

    function drawGPSData() {
      log_debug("drawGPSData()");
      buf2.setFont("Vector",24);
      var bs = wp_bearing.toString();
      bs = wp_bearing<10?"00"+bs : wp_bearing<100 ?"0"+bs : bs;
      var dst = loc.distance(wp_distance);
      
      log_debug(bs);
      log_debug(dst);

      // -1=left (default), 0=center, 1=right
      
      // show distance on the left
      if (previous.dst !== dst) {
        previous.dst = dst
        buf2.setColor(1);
        buf2.setFontAlign(-1,-1);
        buf2.setFont("Vector", 20);
        if (gpsObject.waypointHasLocation()) {
          buf2.drawString(dst,0,0);
          flip2_bb(0, 200);
        } else {
          buf2.drawString(" ",0,0);
          flip2_bw(0, 200);
        }
      }
      
      // bearing, place in middle at bottom of compass
      if (previous.bs !== bs) {
        previous.bs = bs;
        buf2.setColor(1);
        buf2.setFontAlign(0, -1);
        buf2.setFont("Vector",38);
        buf2.drawString(bs,40,0);
        flip2_bw(80, 200);
      }

      // waypoint name on right
      if (previous.wp_name !== wp.name) {
        buf2.setColor(1);
        buf2.setFontAlign(1,-1);     // right, bottom
        buf2.setFont("Vector", 20);
        buf2.drawString(wp.name, 80, 0);
        if (gpsObject.waypointHasLocation())
          flip2_bb(160, 200);
        else
          flip2_bw(160, 200);
      }
    }

    // clear the attributes that control the display refresh
    function resetPrevious() {
      log_debug("resetPrevious()");
      previous = {bs:"-", dst:"-", wp_name:"-", course:999};
    }

    return {init:init, freeResources:freeResources, startTimer:startTimer, stopTimer:stopTimer,
            onButtonShort:onButtonShort, onButtonLong:onButtonLong};
  }

  return getFace;

})();
