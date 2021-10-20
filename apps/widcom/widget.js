(function(){
  //var img = E.toArrayBuffer(atob("FBSBAAAAAAAAA/wAf+AP/wH/2D/zw/w8PwfD9nw+b8Pg/Dw/w8/8G/+A//AH/gA/wAAAAAAA"));
  //var img = E.toArrayBuffer(atob("GBiBAAB+AAP/wAeB4A4AcBgAGDAADHAADmABhmAHhsAfA8A/A8BmA8BmA8D8A8D4A2HgBmGABnAADjAADBgAGA4AcAeB4AP/wAB+AA=="));
  var img = E.toArrayBuffer(atob("FBSBAAH4AH/gHAODgBwwAMYABkAMLAPDwPg8CYPBkDwfA8PANDACYABjAAw4AcHAOAf+AB+A"));        
  
  function draw() {
    g.reset();
    if (Bangle.isCompassOn()) {
      g.setColor(1,0.8,0);     // on = amber
    } else {
      g.setColor(0.3,0.3,0.3); // off = grey
    }
    g.drawImage(img, 10+this.x, 2+this.var);
  }

  var timerInterval;
  Bangle.on('lcdPower', function(on) {
    if (on) {
      WIDGETS.compass.draw();
      if (!timerInterval) timerInterval = setInterval(()=>WIDGETS.compass.draw(), 2000);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
      }
    }
  });

  WIDGETS.compass={area:"tr",width:24,draw:draw};
})();
