(() => {
  const myprofile = require("Storage").readJSON("myprofile.json",1)||{};

  require("FontTeletext5x9Ascii").add(Graphics);

  const calczone = (bpm) => {
    if (bpm <= myprofile.maxHrm*0.5) {
      return 0;
    } else if (bpm <= myprofile.maxHrm*0.60) {
      return 1;
    } else if (bpm <= myprofile.maxHrm*0.70) {
      return 2;
    } else if (bpm <= myprofile.maxHrm*0.80) {
      return 3;
    } else if (bpm <= myprofile.maxHrm*0.90) {
      return 4;
    } else { // > 0.9
      return 5;
    }
  };

  const zoneToText = (zone) => {
    switch(zone) {
      case 1:
        return "HEALTH";
      case 2:
        return "FAT-B";
      case 3:
        return "AROBIC";
      case 4:
        return "ANAROB";
      default:
        return "MAX";
    }
  };

  const zoneToColor = (zone) => {
    switch(zone) {
      case 1:
        return ["#888888", "#000000"]; // bg, fg
      case 2:
        return ["#0000ff", "#ffffff"];
      case 3:
        return ["#00ff00", "#000000"];
      case 4:
        return ["#ffff00", "#000000"];
      default:
        return ["#ff0000", "#ffffff"];
    }
  };

  Bangle.on('HRM', function(hrm) {
    if (hrm.confidence >= 90) {
      const zone = calczone(hrm.bpm);
      if (WIDGETS.widhrzone.zone != zone) {
        WIDGETS.widhrzone.zone = zone;
        WIDGETS.widhrzone.draw();
      }
    }
  });

  WIDGETS.widhrzone = {
    area:"tl", // tl (top left), tr (top right), bl (bottom left), br (bottom right)
    width: 0, // default hide, only show for valid hrm
    draw: function() {
      if (this.zone > 0 && Bangle.isHRMOn()) {
        if (this.width === 0) {
          this.width = 6*6;
          // width changed, re-layout
          Bangle.drawWidgets();
        }
        // https://icons8.com/icon/set/heart/color 12x12, compression, transparency, inverted
        g.reset();
        // background
        const colors = zoneToColor(this.zone);
        g.setColor(colors[0]).fillRect(this.x, this.y, this.x+this.width, this.y+24);
        // icon
        const icon = require("heatshrink").decompress(atob("hkMgIFCv/m/1D8EGgFhjkXwHwBwQ"));
        g.setColor(colors[1]).setBgColor(colors[0]).drawImage(icon, this.x, this.y);
        // number upper right
        g.setBgColor(colors[0]).setColor(colors[1]);
        g.setFont("4x6:2x2").drawString(this.zone, this.x+18, this.y);
        // text bottom
        g.setFont("Teletext5x9Ascii:1x1").drawString(zoneToText(this.zone), this.x, this.y+12);
        g.setColor(g.theme.fg).setBgColor(g.theme.bg); // restore
      } else {
        if (this.width !== 0) {
          this.width = 0;
          // width changed, re-layout
          Bangle.drawWidgets();
        }
      }
    },
    zone: 0
  };
})();
