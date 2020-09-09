
var device;
var gatt;
var service;
var characteristic;

class CSCSensor {
  constructor() {
    this.movingTime = 0;
    this.lastTime = 0;
    this.lastBangleTime = Date.now();
    this.lastRevs = -1;
    this.wheelDia = 28.0;
    this.speedFailed = 0;
    this.speed = 0;
    this.maxSpeed = 0;
    this.lastSpeed = 0;
    this.qUpdateScreen = true;
    this.lastRevsStart = -1;
  }
  reset() {
    this.maxSpeed = 0;
    this.movingTime = 0;
    this.lastRevsStart = this.lastRevs;
    this.maxSpeed = 0;
  }
  updateScreen() {
    var dist = (this.lastRevs-this.lastRevsStart)*this.wheelDia*Math.PI/63360.0;
    var ddist = Math.round(100*dist)/100;
    var dspeed = Math.round(10*this.speed)/10; 
    var dmins = Math.floor(this.movingTime/60).toString();
    if (dmins.length<2) dmins = "0"+dmins;
    var dsecs = (Math.floor(this.movingTime) % 60).toString();
    if (dsecs.length<2) dsecs = "0"+dsecs;
    var avespeed = (this.movingTime>0 ? Math.round(10*dist/(this.movingTime/3600))/10 : 0);
    var maxspeed = Math.round(10*this.maxSpeed)/10;
    g.setFontAlign(1, -1, 0).setFontVector(18).setColor(1, 1, 0);
    g.drawString("Time:", 86, 60);
    g.drawString("Speed:", 86, 94);
    g.drawString("Ave spd:", 86, 128);
    g.drawString("Max spd:", 86, 160);
    g.drawString("Dist:", 86, 192);
    g.setFontAlign(-1, -1, 0).setFontVector(24).setColor(1, 1, 1).clearRect(92, 60, 239, 240);
    g.drawString(dmins+":"+dsecs, 92, 60);
    g.drawString(dspeed+" mph", 92, 94);
    g.drawString(avespeed + " mph", 92, 128);
    g.drawString(maxspeed + " mph", 92, 160);
    g.drawString(ddist + " miles", 92, 192);    
  }
  updateSensor(event) {
    var qChanged = false;
    if (event.target.uuid == "0x2a5b") {
      var wheelRevs = event.target.value.getUint32(1, true);
      var dRevs = (this.lastRevs>0 ? wheelRevs-this.lastRevs : 0);
      if (dRevs>0) qChanged = true;
      this.lastRevs = wheelRevs;
      if (this.lastRevsStart<0) this.lastRevsStart = wheelRevs;
      var wheelTime = event.target.value.getUint16(5, true);
      var dT = (wheelTime-this.lastTime)/1024;
      var dBT = (Date.now()-this.lastBangleTime)/1000;
      this.lastBangleTime = Date.now();
      if (dT<0) dT+=64;
      this.lastTime = wheelTime;
      this.speed = this.lastSpeed;
      if (dRevs>0 && dT>0) {
        this.speed = (dRevs*this.wheelDia*Math.PI/63360.0)*3600/dT;
	    this.speedFailed = 0;
        this.movingTime += dBT;
      }
      else {
        this.speedFailed++;
        qChanged = false;
        if (this.speedFailed>3) {  
          this.speed = 0;
          qChanged = (this.lastSpeed>0);
        }
      }
      this.lastSpeed = this.speed;
      if (this.speed > this.maxSpeed) this.maxSpeed = this.speed;
    }
    if (qChanged && this.qUpdateScreen) this.updateScreen();
  }
}

var mySensor = new CSCSensor();

function parseDevice(d) {
  device = d;
  g.clearRect(0, 60, 239, 239).setFontAlign(0, 0, 0).setColor(0, 1, 0).drawString("Found device", 120, 120).flip();
  device.gatt.connect().then(function(ga) {
  gatt = ga;
  g.clearRect(0, 60, 239, 239).setFontAlign(0, 0, 0).setColor(0, 1, 0).drawString("Connected", 120, 120).flip();
  return gatt.getPrimaryService("1816");
}).then(function(s) {
  service = s;
  return service.getCharacteristic("2a5b");
}).then(function(c) {
  characteristic = c;
  characteristic.on('characteristicvaluechanged', (event)=>mySensor.updateSensor(event));
  return characteristic.startNotifications();
}).then(function() {
  console.log("Done!");
  g.clearRect(0, 60, 239, 239).setColor(1, 1, 1).flip();
}).catch(function(e) {
  g.clearRect(0, 60, 239, 239).setColor(1, 0, 0).setFontAlign(0, 0, 0).drawString("ERROR"+e, 120, 120).flip();
})}

NRF.setScan(parseDevice, { filters: [{services:["1816"]}], timeout: 2000});
g.clearRect(0, 60, 239, 239).setFontVector(18).setFontAlign(0, 0, 0).setColor(0, 1, 0);
g.drawString("Scanning for CSC sensor...", 120, 120);

setWatch(function() { mySensor.reset(); mySensor.updateScreen(); }, BTN1);

Bangle.on('kill',()=>{ if (gatt!=undefined) gatt.disconnect()});

Bangle.loadWidgets();
Bangle.drawWidgets();
