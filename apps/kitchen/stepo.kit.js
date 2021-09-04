(() => {
  function getFace(){
    var intervalRefSec;
    var trip;
    var prevSteps;

    function init(g,sw,hrm,tr) {
      trip = tr;
    }

    function freeResources() {
      trip = undefined;
      prevSteps = -1;
    }

    function onButtonShort(btn) {
      trip.setTripState(!trip.getTripState());
      drawStepText();
    }

    function onButtonLong(btn) {
      if (btn === 1) {
        trip.resetTrip(getSteps());
        trip.setTripState(true);
        drawStepText();
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

    function drawSteps() {
      var i = 0;
      var cx = 60 + 60;
      var cy = 60 + 115;
      var r = 56;
      var steps = getSteps();

      if (prevSteps == steps)
        return;

      prevSteps = steps;
      
      var percent = steps / 10000;

      if (percent > 1) percent = 1;
      
      var startrot = 0 - 180;
      var midrot = -180 - (360 * percent);
      var endrot = -360  - 180;

      g.setColor(0xAFE5);  // greenyellow

      // draw guauge
      for (i = startrot; i > midrot; i -= 4) {
        x = cx + r * Math.sin(radians(i));
        y = cy + r * Math.cos(radians(i));
        g.fillCircle(x,y,4);
      }

      // change the remaining color to RED if battery is below 25%
      if (E.getBattery() > 25) 
        g.setColor(0x7BEF); // grey
      else
        g.setColor(0xF800); // red
      
      // draw remainder of guage in grey or red
      for (i = midrot; i > endrot; i -= 4) {
        x = cx + r * Math.sin(radians(i));
        y = cy + r * Math.cos(radians(i));
        g.fillCircle(x,y,4);
      }
    }

    function drawStepText() {
      var cx = 60 + 60;
      var cy = 60 + 115;
      var r = 56;
      var steps = getSteps();

      /*
       * if our trip count is greater than todays steps then we have
       * rolled over to the next day so we should reset the trip counter
       */
      if (trip.getTrip(steps) < 0)
        trip.resetTrip(steps);
      
      // show trip count or total steps today
      g.setFontAlign(0,0);
      g.setFont("Vector", 24);

      // clear the space for the text
      g.clearRect(cx - (r - 12), cy - 16, cx + (r - 12), cy + 16); 
      
      if (trip.getTripState() == true) {
        g.setColor(0x7BEF); // grey
        //g.setColor(1,0,0); // red
        g.drawString(trip.getTrip(steps), cx, cy);
      } else {
        g.setColor(1,1,1); // white
        g.drawString(steps, cx, cy);
      }
    }
    
    function draw() {
      var d = new Date();
      var da = d.toString().split(" ");
      var time = da[4].substr(0,5);

      g.clearRect(0, 30, 239, 99);
      g.setColor(1,1,1);
      g.setFontAlign(0, -1);
      g.setFont("Vector", 80);
      g.drawString(time, 120, 30, true);

      drawSteps();
      drawStepText();
    }

    function getSteps() {
      if (stepsWidget() !== undefined)
        return stepsWidget().getSteps();
      return "E-STEPS";
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
