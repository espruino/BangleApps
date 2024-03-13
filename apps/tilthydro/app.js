var readings;
var failures = 0;

function displayInfo(reading) {
  g.reset(1).setColor(1,0,0);
  g.clearRect(0,24,g.getWidth(),g.getHeight()-48);
    g.drawImage(require("heatshrink").decompress(atob("o1GgQIFgOr///0oZLg4PBAAP+oAQJjf/yolBtf/yAQIj/5AocGCJMf+hKF3+AGQ4QFCIRHGg/4DI0B/wHFgRDEBIn9A4u+QJI9Fl6DJhfQApIAFDgkCMwwAE3oEILA4dDj7IKIAPAAYMDIhQABnwDC3AQLgI0CPBQ0FGZsAlwzOGgZnMgO8heAgXgCBUG//QnsAAIIAJr///wgBg+AGJO////+EfgDPJgIPBEQIPBCQIAIn4QB/tAheBKxFAgQQCAwN8loPGgr7Bj4RBDwMD4atGD4PggP+t//BAMtngQFqEvKIMFLAJkBgPnPIu/BgPwAoMP/4NBj94CAgOBBgLIC3/8AYP7aAcUBwW//AHBg//4AmB2gQCt/QDYIMDRoJ6CEQS3B/wOB6AMDNoQiDBoJDBBwIMDRoQiDQAIABBwQMDPQYiBl4QCBwYMCgh6D/dCCARJBBwIMCjfQv56BEQLHEBwW//uv/0DNoX3wAiCSwZdCLwMvyAbBvELyI/CPQYRCoKHC+6gCJgU//xrBAAIZBAAMenrHEcIRNCGIKgC6XQGAaWCoH//1Qdoc9jzHC/z1C/EL/L+Eg/B+DHCAYMLOYNkCAkAvEPLYIwCgCWCAAoPB3AwCMAMD/oUBAAkB+EHPQIwBPQMZEI0AlwBCGBIACgfQEgIEBPQQAIIYMLGAMvOgoAEj5NBvpKB8gQJgXgAQI0BABYfBPgI0BABSaCCgYzMAYL7DABG9AYULTwJnMAAN+CBUHSon4CBMBBYkHPZQuFj6+Jl6GFAwwbK35dDAAcLZI0B/wRGg5hHgQRGhf9Hg8G/+QAwcbCBAjB//lHQVv/KUK3//1Wv/4QKAANr/4ABygKFA==")),24,24);
  g.setColor(-1).setFont("6x8",2);

  if (reading=="startup") {
    g.setFontAlign(0,0);
    g.drawString("Scanning...", g.getWidth()/2, g.getHeight()*2/3);
  } else if (!reading) {
    g.setFontAlign(0,0);
    g.drawString("No Tilt found", g.getWidth()/2, g.getHeight()*2/3);
  } else {
    g.drawString("Temperature",0,100);
    g.drawString("Gravity",0,160);
    g.setFontAlign(0,0);
    g.drawString(reading.color, g.getWidth()*3/4, 24+40);
    g.setFontVector(34);
    g.setFontAlign(0,-1);
    // we can't use locale directly as it currently is just to the nearest degree
    var temp = reading.C.toFixed(1)+"°C";
    if (require("locale").temp(0).endsWith("F")) // check locale
      temp = reading.F.toFixed(1)+"°F";
    g.drawString(temp,g.getWidth()/2,120);
    g.drawString(reading.gravity,g.getWidth()/2,180);
  }
  g.flip();
}

function arrayBufferToHex (arrayBuffer){
  return (new Uint8Array(arrayBuffer)).slice().map(x=>(256+x).toString(16).substr(-2)).join("");
}

var TILT_DEVICES = {
    'a495bb30c5b14b44b5121370f02d74de': 'Black',
    'a495bb60c5b14b44b5121370f02d74de': 'Blue',
    'a495bb20c5b14b44b5121370f02d74de': 'Green',
    'a495bb50c5b14b44b5121370f02d74de': 'Orange',
    'a495bb80c5b14b44b5121370f02d74de': 'Pink',
    'a495bb40c5b14b44b5121370f02d74de': 'Purple',
    'a495bb10c5b14b44b5121370f02d74de': 'Red',
    'a495bb70c5b14b44b5121370f02d74de': 'Yellow',
};

function takeReading() {
  // scan for 5 seconds max
  NRF.setScan(function(device) {
    const d = new DataView(device.manufacturerData);
    if (d.getUint8(4) == 0xbb) {
      var hexData = arrayBufferToHex(device.manufacturerData);
      var tempF = d.getUint16(18);
      var tempC = ( tempF - 32) * 5 / 9;
      var gravity = d.getUint16(20) / 1000.0;
      var color = TILT_DEVICES[hexData.substr(4,32)];
      readings= {
        C:tempC,
        F:tempF,
        gravity:gravity,
        d:device.manufacturerData,
        color: color,
      };
      failures=0;
      NRF.setScan();
      if (notFoundTimeout) clearTimeout(notFoundTimeout);
      notFoundTimeout = undefined;
      displayInfo(readings);
    }
  }, { filters: [{ manufacturerData: { 0x004C: {} } }]});
  // stop scanning after 5 seconds
  var notFoundTimeout = setTimeout(function() {
    NRF.setScan();
    notFoundTimeout = undefined;
    failures++;
    if (failures>5) displayInfo();
  }, 5000);
}

Bangle.loadWidgets();
Bangle.drawWidgets();


// Scan every minute
setInterval(function() {
  takeReading();
}, 60*1000);
// Scan once at boot/upload
displayInfo("startup");
takeReading();
