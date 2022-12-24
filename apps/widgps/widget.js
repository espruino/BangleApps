(function() {

let settings = Object.assign(
      require('Storage').readJSON("widgps.default.json", true) || {},
      require('Storage').readJSON("widgps.json", true) || {}
);

var interval;

// override setGPSPower so we know if GPS is on or off
var oldSetGPSPower = Bangle.setGPSPower;
Bangle.setGPSPower = function(on, id) {
  var isGPSon = oldSetGPSPower(on, id);
  WIDGETS.gps.width = !isGPSon && settings.hideWhenGpsOff ? 0 : 24;
  Bangle.drawWidgets();
  return isGPSon;
};

WIDGETS.gps = {
  area : "tr",
  width : !Bangle.isGPSOn() && settings.hideWhenGpsOff ? 0 : 24,
  draw : function() {
    g.reset();

    // check if we need to update the widget periodically
    if (Bangle.isGPSOn() && interval === undefined) {
      interval = setInterval(
          function() { WIDGETS.gps.draw(WIDGETS.gps); },
          10 * 1000); // update every 10 seconds to show gps fix/no fix
    } else if (!Bangle.isGPSOn() && interval !== undefined) {
      clearInterval(interval);
      interval = undefined;
    }
    if (settings.crossIcon) {
      if (Bangle.isGPSOn()) {
        const gpsObject = Bangle.getGPSFix();
        if (gpsObject && gpsObject.fix > 0) {
          g.setColor("#0F0"); // on and has fix = green
        } else {
          g.setColor("#FD0"); // on but no fix = amber
        }

        g.drawImage(
          atob(
              "GBiBAAAAAAAAAAAAAA//8B//+BgYGBgYGBgYGBgYGBgYGBgYGB//+B//+BgYGBgYGBgYGBgYGBgYGBgYGB//+A//8AAAAAAAAAAAAA=="),
          this.x, 2 + this.y);

      } else {
        if(!settings.hideWhenGpsOff) {
          g.setColor("#888"); // off = grey

          g.drawImage(
            atob(
                "GBiBAAAAAAAAAAAAAA//8B//+BgYGBgYGBgYGBgYGBgYGBgYGB//+B//+BgYGBgYGBgYGBgYGBgYGBgYGB//+A//8AAAAAAAAAAAAA=="),
            this.x, 2 + this.y);
        }
      }

    } else { // marker icons
      if (Bangle.isGPSOn()) {  
        const gpsObject = Bangle.getGPSFix();
        if (gpsObject && gpsObject.fix > 0) {
          // on and has fix
           g.drawImage(
                atob("GBiBAAAAAAAAAAB+AAD/AAHDgAMAwAcAwAY8YAY8YAY8YAY8YAMAwAMAwAOBwAGBgAHDgADDAABmAAB+AAA8AAAYAAAAAAAAAAAAAA=="),
                this.x, 2 + this.y);

        } else {
          // GNSS on but no fix
           g.drawImage(
                atob("GBiBAAAAAAAAAAh+AA3/gA+B4A8AcA+AMAA8GAB+GADnDADDDADDDDDDADBmADB+ABg8ABgYAAwB8A4A8AeB8AH/sAB+EAAAAAAAAA=="),
                this.x, 2 + this.y);
        }
      } else {
        // GNSS off
        if(!settings.hideWhenGpsOff) {
          g.drawImage(
                atob("GBiBAAAAAAAAAAB+ABj/ABxDgA4AwAcAwAeMYAfEYAbgYAZwYAM4wAMcQAOOAAGHAAHDgADDwABm4AB+cAA8OAAYGAAAAAAAAAAAAA=="),
                this.x, 2 + this.y);
        }
      }
    }
  }
};
})();
