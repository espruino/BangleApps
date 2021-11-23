(() => {
  function getFace(){
    const Y_TIME = 30;
    const Y_ACTIVITY = 116;
    let prevTime;
    let prevBpm;
    let toggle = 1;
    let redrawHrmPower = true;
    let intervalRefSec;
    let img;
    let hrmObject;

    function log_debug(o) {
      //console.log(o);
    }

    function init(gps, sw, hrm) {
      img = require("heatshrink").decompress(atob("mEwwRC/ABf/+ADBh//BQgGB//AgYDBCAQWCA4QPCDAYSC//8n4EC4AiEAAo1EBZIeDAAn8BZoKHJAYL7L64LLTa6/DAAi/CKhDjGBZBIGIwQ8IHQQ8IHQYwHBQgwFFwgwGFwgwGFwowFBQwwDFwwwEFwwwEFw4wDBRAkBERAkCERIA/AAYA="));
      prevTime = "-";
      prevBpm = "-";
      toggle = 1;
      redrawHrmPower = true;
      hrmObject = hrm;
      intervalRefSec;
      g.clear();
    }

    function freeResources() {
      prevTime = undefined;
      img = undefined;
    }
    
    function startTimer() {
      draw();
      intervalRefSec = setInterval(draw, 1000);
    }
    
    function stopTimer() {
      if (intervalRefSec) { intervalRefSec = clearInterval(intervalRefSec); }
    }

    function onButtonShort(btn) {}

    function onButtonLong(btn) {
      log_debug("toggleHRM");
      if (btn !== 1) return;
      if (!Bangle.isHRMOn) return; // old firmware
      hrmObject.toggleHRMPower();
      prevBpm = '-';
      toggle = 1;  // ensure we draw the heart first
      redrawHrmPower = true;
    }

    function draw() {
      let d = new Date();
      let da = d.toString().split(" ");
      let time = da[4].substr(0,5);

      if (time !== prevTime) {
        prevTime = time;
        g.setColor(0);
        g.fillRect(0, Y_TIME, 239, Y_ACTIVITY -1);
        g.setColor(1,1,1);
        g.setFont("Vector",80);
        g.setFontAlign(0,-1);
        g.drawString(time, 120, Y_TIME);
      }

      let bpm = hrmObject.getBpm();

      if (!Bangle.isHRMOn()) {
        if (!redrawHrmPower) return;
        redrawHrmPower = false;
        g.setColor(0);
        g.drawImage(img, 12, 132, {scale:2});
        g.fillRect(120,120,239,239);
        g.setColor(255,0,0);
        //g.setColor(0xFFC0); // yellow
        g.drawImage(img, 12, 132, {scale:2});

        g.setFont("Vector",40);
        g.setFontAlign(0,0);
        g.setColor(1,1,1);
        g.drawString("OFF", 180, 180);
        return;
      }

      // draw the heart
      if (++toggle % 2 === 0) {
        g.setColor(0);
        g.fillRect(12, 132, 108, 228);
      } else {
        g.setColor(255,0,0);
        //g.setColor(0xFFC0); // yellow
        g.drawImage(img, 12, 132, {scale:2});
      }

      // draw the bpm
      if (bpm !== prevBpm) {
        prevBpm = bpm;
        g.setColor(0);
        g.fillRect(120, 120, 239, 239);
        g.setColor(1,1,1);
        //g.setColor(0xFFC0); // yellow
        g.setFont("Vector",52);
        g.setFontAlign(0,0);
        g.drawString(bpm, 180, 180);
      }
    }

    return {init:init, freeResources:freeResources, startTimer:startTimer, stopTimer:stopTimer,
            onButtonShort:onButtonShort, onButtonLong:onButtonLong};
  }

  return getFace;
})();
