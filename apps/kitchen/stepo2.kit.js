(() => {
  function getFace(){
    var intervalRefSec;
    var trip;
    var prevSteps;
    var prevTopText1;
    var prevTopText2;
    var prevBottomText;
    var prevMins;
    var infoMode;
    
    const INFO_DATE = 0;
    const INFO_TRIP = 1;
    const INFO_BATT = 2;
    const INFO_MEM = 3;
    const INFO_FW = 4;

    function init(g,sw,hrm,tr) {
      trip = tr;
      infoMode = INFO_DATE;
      forceRedraw();
    }

    function freeResources() {
      trip = undefined;
    }

    function forceRedraw() {
      prevStepsText = '';
      prevSteps = -1;
      prevTopText1 = '';
      prevTopText2 = '';
      prevBottomText = '';
      prevMins = '';
    }

    function cycleInfoMode() {
      switch(infoMode) {
      case INFO_DATE:
        infoMode = INFO_TRIP;
        break;
      case INFO_TRIP:
        infoMode = INFO_BATT;
        break;
      case INFO_BATT:
        infoMode = INFO_MEM
        break;
      case INFO_MEM:
        infoMode = INFO_FW
        break;
      case INFO_FW:
      default:
        infoMode = INFO_DATE;
        break;
      }
    }

    function onButtonShort(btn) {
      cycleInfoMode();
      forceRedraw();
      draw();
    }
    
    function onButtonLong(btn) {
      if (btn === 1) {
        trip.resetTrip(getSteps());
        infoMode = INFO_TRIP;
        forceRedraw();
        draw();
        return;
      }

      if (btn === 2) Bangle.showLauncher();
    }

    function radians(a) {
      return a*Math.PI/180;
    }

    function startTimer() {
      draw();
      intervalRefSec = setInterval(draw, 5000);
    }

    function stopTimer() {
      if(intervalRefSec) {intervalRefSec=clearInterval(intervalRefSec);}
    }

    function draw() {
      var d = new Date();
      var da = d.toString().split(" ");
      var hh = da[4].substr(0,2);
      var mm = da[4].substr(3,2);
      var day = da[0];
      var day_month = da[2] + " " + da[1];

      g.setColor(1,1,1); // white

      if (prevMins != mm) {
        prevMins = mm;
        // hours and minutes
        g.clearRect(0, 24, 149, 239);
        g.setFontAlign(-1, -1);
        g.setFont("Vector", 104);
        g.drawString(hh, 20, 30, true);
        g.drawString(mm, 20, 120, true);
      }
      
      /*
       * if our trip count is greater than todays steps then we have
       * rolled over to the next day so we should reset the trip counter
       */
      var steps = getSteps();
      if (trip.getTrip(steps) < 0)
        trip.resetTrip(steps);
      
      drawTopText(day,day_month);
      drawBottomText();
      drawSteps();
    }

    function drawTopText(dy, dm) {
      var topText1 = "";
      var topText2 = "";

      switch(infoMode) {
      case INFO_DATE:
        topText1 = dy.toUpperCase();
        topText2 = dm.toUpperCase();
        break;
      case INFO_TRIP:
        topText2 = "TRIP";
        break;
      case INFO_BATT:
        topText2 = "BATT";
        break;
      case INFO_MEM:
        topText2 = "MEM";
        break;
      case INFO_FW:
        topText2 = "F/W";
        break;
      }
        
      if (prevTopText1 !== topText1 || prevTopText2 !== topText2) {
        prevTopText1 = topText1;
        prevTopText2 = topText2;

        // day, date
        g.setFont("Vector", 24);
        g.setFontAlign(0, -1);
        g.clearRect(150, 30, 239, 75);
        g.drawString(topText1, 195, 30, true);
        g.drawString(topText2, 195, 55, true);
      }
    }

    function drawBottomText() {
      var bottomText = "";
      var steps = getSteps();

      switch(infoMode) {
      case INFO_DATE:
        bottomText = "" + steps;
        break;
      case INFO_TRIP:
        bottomText = "" + trip.getTrip(steps);
        break;
      case INFO_BATT:
        bottomText = "" + E.getBattery() + "%";
        break;
      case INFO_MEM:
        var val = process.memory();
        bottomText = "" + Math.round(val.usage*100/val.total) + "%";
        break;
      case INFO_FW:
        bottomText = process.env.VERSION;
        break;
      }

      if (prevBottomText !== bottomText) {
        prevBottomText = bottomText;
        g.clearRect(148, 190, 239, 239);
        g.setColor(1,1,1); // white
        g.setFont("Vector", 24);
        g.setFontAlign(0, -1);
        g.drawString(bottomText, 195, 190);
      }
    }
    
    function drawSteps() {
      var i = 0;
      var cx = 150 + 45;
      var cy = 130;
      var r = 34;
      
      var steps = getSteps();
      
      if (trip.getTripState() == true)
        steps = trip.getTrip(steps);
      
      if (prevSteps == steps)
        return;

      prevSteps = steps;
      
      var percent = steps / 10000;

      if (percent > 1) percent = 1;
      
      var startrot = 0 - 180;
      var midrot = -180 - (360 * percent);
      var endrot = -360  - 180;

      //g.setColor(0x07FF);   // light cyan
      g.setColor(0xFFC0);  // yellow

      // draw guauge
      for (i = startrot; i > midrot; i -= 3) {
        x = cx + r * Math.sin(radians(i));
        y = cy + r * Math.cos(radians(i));
        g.fillCircle(x,y,3);
      }

      // change the remaining color to RED if battery is below 25%
      if (E.getBattery() > 25) {
        g.setColor(0x7BEF); // grey
        //g.setColor(0x000D);   // dark navy
      } else {
        g.setColor(0xF800); // red
      }
    
      // draw remainder of guage in grey or red
      for (i = midrot - 12; i > endrot + 12; i -= 3) {
        x = cx + r * Math.sin(radians(i));
        y = cy + r * Math.cos(radians(i));
        g.fillCircle(x,y,3);
      }
    }

    function getSteps() {
      if (stepsWidget() === undefined)
        return "E-STEPS";

      return stepsWidget().getSteps(); 
    }
    
    function stepsWidget() {
      if (WIDGETS.activepedom !== undefined) {
        return WIDGETS.activepedom;
      } else if (WIDGETS.wpedom !== undefined) {
        return WIDGETS.wpedom;
      }
      return undefined;
    }

    return {init:init, freeResources:freeResources, startTimer:startTimer, stopTimer:stopTimer,
            onButtonShort:onButtonShort, onButtonLong:onButtonLong};
  }

  return getFace;
})();
