(function(){
  var img = E.toArrayBuffer(atob("FhaBAAAAAAAAAAAAAcDgD8/AYeGDAwMMDAwwADDAAMOABwYAGAwAwBgGADAwAGGAAMwAAeAAAwAAAAAAAAAAAAA="));
  
  function draw() {
    g.reset();
    if (Bangle.isHRMOn()) {
      g.setColor(1,0,0);     // on = red
    } else {
      g.setColor(0.3,0.3,0.3); // off = grey
    }
    g.drawImage(img, 10+this.x, 2+this.y);
  }

  var timerInterval;
  Bangle.on('lcdPower', function(on) {
    if (on) {
      WIDGETS.widhrt.draw();
      if (!timerInterval) timerInterval = setInterval(()=>WIDGETS["widhrt"].draw(), 2000);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
      }
    }
  });

  WIDGETS.widhrt={area:"tr",width:24,draw:draw};
})();
