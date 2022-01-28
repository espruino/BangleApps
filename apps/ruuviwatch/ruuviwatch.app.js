require("Storage").write("ruuviwatch.info",{
    "id":"ruuviwatch",
    "name":"Ruuvi Watch",
    "src":"ruuviwatch.app.js",
    "icon":"ruuviwatch.img"
  });
  
  const lookup = {};
  const ruuvis = [];
  let current = 0;
  
  function int2Hex (str) {
    return ('0' + str.toString(16).toUpperCase()).slice(-2);
  }
  
  function p(data) {
    const OFFSET = 7; // 0-4 header, 5-6 Ruuvi id
    const robject = {};
    robject.version = data[OFFSET];
  
    let temperature = (data[OFFSET+1] << 8) | (data[OFFSET+2] & 0xff);
    if (temperature > 32767) {
      temperature -= 65534;
    }
    robject.temperature = temperature / 200.0;
  
    robject.humidity = (((data[OFFSET+3] & 0xff) << 8) | (data[OFFSET+4] & 0xff)) / 400.0;
    robject.pressure = ((((data[OFFSET+5] & 0xff) << 8) | (data[OFFSET+6] & 0xff)) + 50000) / 100.0;
  
    let accelerationX = (data[OFFSET+7] << 8) | (data[OFFSET+8] & 0xff);
    if (accelerationX > 32767) accelerationX -= 65536; // two's complement
    robject.accelerationX = accelerationX / 1000.0;
  
    let accelerationY = (data[OFFSET+9] << 8) | (data[OFFSET+10] & 0xff);
    if (accelerationY > 32767) accelerationY -= 65536; // two's complement
    robject.accelerationY = accelerationY / 1000.0;
  
    let accelerationZ = (data[OFFSET+11] << 8) | (data[OFFSET+12] & 0xff);
    if (accelerationZ > 32767) accelerationZ -= 65536; // two's complement
    robject.accelerationZ = accelerationZ / 1000.0;
  
    const powerInfo = ((data[OFFSET+13] & 0xff) << 8) | (data[OFFSET+14] & 0xff);
    robject.battery = ((powerInfo >>> 5) + 1600) / 1000.0;
    robject.txPower = (powerInfo & 0b11111) * 2 - 40;
    robject.movementCounter = data[OFFSET+15] & 0xff;
    robject.measurementSequenceNumber = ((data[OFFSET+16] & 0xff) << 8) | (data[OFFSET+17] & 0xff);
  
    robject.mac = [
      int2Hex(data[OFFSET+18]),
      int2Hex(data[OFFSET+19]),
      int2Hex(data[OFFSET+20]),
      int2Hex(data[OFFSET+21]),
      int2Hex(data[OFFSET+22]),
      int2Hex(data[OFFSET+23])
    ].join(':');
  
    robject.name = "Ruuvi " + int2Hex(data[OFFSET+22]) + int2Hex(data[OFFSET+23]);
    return robject;
  }
  
  function getAge(created) {
     const now = new Date().getTime();
     const ago = ((now - created) / 1000).toFixed(0);
    return ago > 0 ? ago + "s ago" : "now";
  }
  
  function redraw() {
    if (ruuvis.length > 0 && ruuvis[current]) {
      const ruuvi = ruuvis[current];
      g.clear();
      g.setFontAlign(0,0);
      g.setFont("Vector",12);
      g.drawString(" (" + (current+1) + "/" + ruuvis.length + ")", g.getWidth()/2, 10);
      g.setFont("Vector",20);
      g.drawString(ruuvi.name, g.getWidth()/2, 30);
      g.setFont("Vector",12);
      const age = getAge(ruuvi.time);
      if(age > (5*60)) {
        g.setColor("#ff0000");
      } else if (age > 60) {
        g.setColor("#f39c12");
      } else {
        g.setColor("#2ecc71");
      }
      g.drawString(age, g.getWidth()/2, 50);
      g.setColor("#ffffff");
      g.setFont("Vector",60);
      g.drawString(ruuvi.temperature.toFixed(2) + "°c", g.getWidth()/2, g.getHeight()/2);
      g.setFontAlign(0,1);
      g.setFont("Vector",20);
      g.drawString(ruuvi.humidity + "% " + ruuvi.pressure + "hPa ", g.getWidth()/2, g.getHeight()-30);
      g.setFont("Vector",12);
      g.drawString(ruuvi.battery + "v", g.getWidth()/2, g.getHeight()-10);
    } else {
      g.clear();
      g.drawImage(require("Storage").read("ruuviwatch.img"), g.getWidth()/2-24, g.getHeight()/2-24);
      g.setFontAlign(0,0);
      g.setFont("Vector",16);
      g.drawString("Looking for Ruuvi...", g.getWidth()/2, g.getHeight()/2 + 50);
    }
  }
  
  function scan() {
    NRF.findDevices(function(devices) {
      let foundNew = false;
        devices.forEach(device => {
          const data = p(device.data);
          data.time = new Date().getTime();
          const idx = lookup[data.name];
          if (idx !== undefined) {
            ruuvis[idx] = data;
          } else {
            lookup[data.name] = ruuvis.push(data)-1;
            foundNew = true;
          }
        });
        redraw();
        if (foundNew) {
          Bangle.buzz();
          g.flip();
        }
  
    }, {timeout : 2000, filters : [{ manufacturerData:{0x0499:{}} }] });
  }
  
  g.clear();
  g.drawImage(require("Storage").read("ruuviwatch.img"), g.getWidth()/2-24, g.getHeight()/2-24);
  
  var drawInterval = setInterval(redraw, 1000);
  var scanInterval = setInterval(scan, 10000);
  setWatch(() => {
    current--;
    if (current < 0) {
      current = ruuvis.length-1;
    }
    redraw();
  }, BTN1, {repeat:true});
  
  setWatch(() => {
    scan();
  }, BTN2, {repeat:true});
  
  setWatch(() => {
    current++;
    if (current >= ruuvis.length) {
      current = 0;
    }
    redraw();
  }, BTN3, {repeat:true});
  
  scan();