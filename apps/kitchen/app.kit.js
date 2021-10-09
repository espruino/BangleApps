// simple template
(() => {
  function getFace(){
    var intervalRefSec;
    var prevTime;

    const Y_TIME = 30;
    const Y_ACTIVITY = 116;
    
    function init(gps,sw) {
      prevTime = "";
      g.clear();
    }

    function freeResources() {
      prevTime = undefined;
    }
    
    function startTimer() {
      draw();
      intervalRefSec = setInterval(draw, 5000);
    }
    
    function stopTimer() {
      if (intervalRefSec) { intervalRefSec = clearInterval(intervalRefSec); }
    }

    function onButtonShort(btn) {}
    function onButtonLong(btn) {}
   
    function draw() {
      var d = new Date();
      var da = d.toString().split(" ");
      var time = da[4].substr(0,5);

      if (time !== prevTime) {
        prevTime = time;
        g.setColor(0);
        g.fillRect(0, Y_TIME, 239, Y_ACTIVITY -1);
        g.setColor(1,1,1);
        g.setFont("Vector",80);
        g.setFontAlign(0,-1);
        g.drawString(time, 120, Y_TIME);

        g.setFont("Vector",26);
        g.drawString("Hello World", 120, Y_ACTIVITY);
      }
    }

    return {init:init, freeResources:freeResources, startTimer:startTimer, stopTimer:stopTimer,
            onButtonShort:onButtonShort, onButtonLong:onButtonLong};
  }

  return getFace;
})();
