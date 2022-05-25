(function(){
  var interval;

  // override setGPSPower so we know if GPS is on or off
  var oldSetGPSPower = Bangle.setGPSPower;
  Bangle.setGPSPower = function(on,id) {
    var isGPSon = oldSetGPSPower(on,id);
    WIDGETS.gps.draw();
    return isGPSon;
  }

  WIDGETS.gps={area:"tr",width:24,draw:function() {
    g.reset();
    if (Bangle.isGPSOn()) {
      const gpsObject = Bangle.getGPSFix();
      if (gpsObject && gpsObject.fix > 0) {
        g.setColor("#0F0"); // on and has fix = green
      } else {
        g.setColor("#FD0"); // on but no fix = amber
      }
    } else {
      g.setColor("#888"); // off = grey
    }

    // check if we need to update the widget periodically
    if (Bangle.isGPSOn() && interval === undefined) {
      interval = setInterval(function() {
        WIDGETS.gps.draw(WIDGETS.gps);
      }, 10*1000); // update every 10 seconds to show gps fix/no fix
    } else if (!Bangle.isGPSOn() && interval !== undefined) {
      clearInterval(interval);
      interval = undefined;
    }
    g.drawImage(atob("GBiBAAAAAAAAAAAAAA//8B//+BgYGBgYGBgYGBgYGBgYGBgYGB//+B//+BgYGBgYGBgYGBgYGBgYGBgYGB//+A//8AAAAAAAAAAAAA=="), this.x, 2+this.y);
  }};
})();
