E.showMessage("Scanning...");
var devices = [];

setInterval(function() {
  NRF.findDevices(function(devs) {
    devs.forEach(dev=>{
      var existing = devices.find(d=>d.id==dev.id);
      if (existing) {
        existing.timeout = 0;
        existing.rssi = (existing.rssi*3 + dev.rssi)/4;
      } else {
        dev.timeout = 0;
        dev.new = 0;
        devices.push(dev);
      }
    });
    devices.forEach(d=>{d.timeout++;d.new++});
    devices = devices.filter(dev=>dev.timeout<8);
    devices.sort((a,b)=>b.rssi - a.rssi);
    g.clear(1).setFont("12x20");
    var wasNew = false;
    devices.forEach((d,y)=>{
      y*=20;
      var n = d.name;
      if (!n) n=d.id.substr(0,22);
      if (d.new<4) {
        g.fillRect(0,y,g.getWidth(),y+19);
        g.setColor(g.theme.bg);
        if (d.rssi > -70) wasNew = true;
      } else {
        g.setColor(g.theme.fg);
      }
      g.setFontAlign(-1,-1);
      g.drawString(n,0,y);
      g.setFontAlign(1,-1);
      g.drawString(0|d.rssi,g.getWidth()-1,y);
    });
    g.flip();
    Bangle.setLCDBrightness(wasNew);
  }, 1200);
}, 1500);
