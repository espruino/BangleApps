var deviceInfo = {};
if (Bangle.getAccel().x < -0.7)
    g.setRotation(3); // assume watch in charge cradle
// Tile sizes
var TILESIZE = 60;
// Tiles along width of screen
var TILEX = 4;

// Map devices to nice names...
var deviceNames = {
  "eb:44:c1:71:2e:89 random" : "Office",
  "c4:7c:8d:6a:ac:79 public" : "Peacelily"
};

var scanHandlers = [
  { filter : {serviceData:{"fe95":{}}}, // Xiaomi
    handler : function(device) {
      if (!device.serviceData["fe95"]) return;
  var d = new DataView(device.serviceData["fe95"]);
  var frame = d.getUint16(0,true);
  var offset = 5;
  if (frame&16) offset+=6; // mac address
  if (frame&32) offset+=1; // capabilitities
  if (frame&64) { // event
    var l = d.getUint8(offset+2);
    var code = d.getUint16(offset,true);
    if (!deviceInfo[device.id]) deviceInfo[device.id]={id:device.id};
    event = deviceInfo[device.id];
    switch (code) {
      case 0x1004: event.temperature = d.getInt16(offset+3,true)/10; break;
      case 0x1006: event.humidity = d.getInt16(offset+3)/10; break;
      case 0x100D:
        event.temperature = d.getInt16(offset+3,true)/10;
        event.humidity = d.getInt16(offset+5)/10; break;
      case 0x1008: event.moisture = d.getUint8(offset+3); break;
      case 0x1009: event.fertility = d.getUint16(offset+3,true)/10; break;
      // case 0x1007: break; // 3 bytes? got 84,0,0 or 68,0,0
      default: event.code = code;
        event.raw = new Uint8Array(d.buffer, offset+3, l);
        break;
    }
  }}}, {
  filter : {serviceData:{"1809":{}}}, // Standard Bluetooth
  handler : function(device) {
    if (!device.serviceData["1809"]) return;
    var d = new DataView(device.serviceData["1809"]);
    if (!deviceInfo[device.id]) deviceInfo[device.id]={id:device.id,name:device.name};
    event = deviceInfo[device.id];
    event.temperature = d.getInt16(0,1)/100;
  }}, {
  filter : { manufacturerData:{0x0590:{}} }, // Espruino
  handler : function(device) {
    if (!device.manufacturerData) return;
    var j;
    try { j = JSON.parse(E.toString(device.manufacturerData)); }
    catch (e) { return; } // not JSON
    if (!deviceInfo[device.id]) deviceInfo[device.id]={id:device.id,name:device.name};
    event = deviceInfo[device.id];
    if (j.t) event.temperature = j.t;
    if (j.a) event.alert = j.a;
  }}
];

function getImgHum() {
  return require("heatshrink").decompress(atob("jUoxH+AEtlsoYYDS4ZYDAYaVDLAYFDSQYHDSIZYDBIaPDLAYLDRoZYDBoaLDLAYPDRIZYDCIaHDLAYTDQoZYDCoaDDOQYXAA+JxIYX1utDSwYBAAIzYGiwZUTgpODQpzPGGgY3OdI4aRDIIaMDJIYCDIztDGRwaJP5oaWDAwaRDBAbOC5YcKB5I="));
}
function getImgTemp() {
  return require("heatshrink").decompress(atob("iUqxH+AA2sAAQLHCBASMCAoSLCPOBAAQRfI/5Hn3YACy4ACCL4ADCL5H/I/AQHCRAQJCQwQLCQgQNCQYRQCB4A/ADaPjYqTpSCRYQGCZALFA"));
}

function drawAlert(tile,x,y) {
  g.setFont("Vector",56).setFontAlign(0,0);
  g.drawString("!",x+TILESIZE/2,y+10+TILESIZE/2);
}

function drawMoisture(tile,x,y) {
  g.drawImage(getImgHum(),x+2,y+18);
  g.setFont("Vector",28);
  g.drawString(tile.device.moisture,x+26,y+12);
}

function drawTemperature(tile,x,y) {
  g.drawImage(getImgTemp(),x+3,y+16);
  g.setFont("Vector",30);
  var t = Math.round(tile.device.temperature);
  g.drawString(t,x+25,y+13);
}

function getTiles() {
  var tiles = [];
  Object.keys(deviceInfo).forEach(id=>{
    var dev = deviceInfo[id];
    if (dev.alert) {
      tiles.push({
        alert: true, device: dev,
        draw: drawAlert
      });
    }
    if (dev.moisture && dev.moisture<40) {
      tiles.push({
        alert: true, device: dev,
        draw: drawMoisture
      });
    }
    if (dev.temperature) {
      tiles.push({
        device: dev,
        draw: drawTemperature
      });
    }
  });
  tiles.sort((a,b)=>(b.alert|0)-(a.alert|0))
  return tiles;
}


g.clear();
require("Font7x11Numeric7Seg").add(Graphics);
function drawClock() {
  var d = new Date();
  var size = 3;
  var x = (g.getWidth()/2) - size*6,
      y = size;
  g.reset();
  g.setFont("7x11Numeric7Seg",size).setFontAlign(1,-1);
  g.drawString(d.getHours(), x, y, true);
  g.setFontAlign(-1,-1);
  if (d.getSeconds()&1) g.drawString(":", x,y);
  g.drawString(("0"+d.getMinutes()).substr(-2),x+size*4,y, true);
  // draw seconds
  g.setFont("7x11Numeric7Seg",size/2);
  g.drawString(("0"+d.getSeconds()).substr(-2),x+size*18,y + size*7, true);
  // date
  var s = d.toString().split(" ").slice(0,4).join(" ");
  g.reset().setFontAlign(0,-1);
  g.drawString(s,g.getWidth()/2, y + size*12, true);
  // keep screen on
  g.flip();
}
function drawTiles() {
  // draw tiles
  var tiles = getTiles();
  for (var i=0;i<6;i++) {
    var x = (i%TILEX)*TILESIZE;
    var y = TILESIZE + TILESIZE*((i/TILEX)|0);
    g.reset();
    var tile = tiles[i];
    if (tile && tile.alert) {
       g.setBgColor(0.5,0,0);
    }
    g.clearRect(x,y,x+TILESIZE-1,y+TILESIZE-1);
    if (tile) {
      g.reset().setFont("6x8");
      var t = deviceNames[tile.device.id];
      if (!t) t = tile.device.name || tile.device.id.substr(0,17);
      g.drawString(t,x+2,y+2);
      tile.draw(tile, x, y);
      if (tile.alert) {
        g.setColor(1,1,0);
        g.drawRect(x,y,x+TILESIZE-1,y+TILESIZE-1);
      }
    }
  }
  g.flip(); // keep forcing display on
}

setInterval(drawClock, 1000);
setInterval(drawTiles, 10000);
drawClock();
drawTiles();

function parseDevice(dev) {
  if (!dev.serviceData) dev.serviceData={};
  scanHandlers.forEach(s=>s.handler(dev));
}
NRF.setScan(parseDevice, { filters: scanHandlers.map(s=>s.filter), timeout: 2000 });

if (Bangle.isCharging()) {
  Bangle.on("charging", isCharging => {
    if (!isCharging) load();
  });
}
