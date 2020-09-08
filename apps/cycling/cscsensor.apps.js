
var device;
var gatt;
var service;
var characteristic;

class CSCSensor {
  constructor() {
    this.lastTime = 0;
    this.lastBangleTime = Date.now();
    this.lastRevs = -1;
    this.wheelDia = 28.0;
    this.speedFailed = 0;
    this.speed = 0;
    this.lastSpeed = 0;
    this.qUpdateScreen = true;
  }

  updateScreen() {
    var dist = Math.round(100*this.lastRevs*this.wheelDia*Math.PI/63360.0)/100;
    var dspeed = Math.round(10*this.speed)/10; 
    g.clearRect(0, 120-2*20, 239, 120+2*20).drawString(dspeed+" mph", 120, 100).drawString(dist+" miles", 120, 140);
    return;
  }

  updateSensor(event) {
    var qChanged = false;
    if (event.target.uuid == "0x2a5b") {
      var wheelRevs = event.target.value.getUint32(1, true);
      var dRevs = (this.lastRevs>0 ? wheelRevs-this.lastRevs : 0);
      if (dRevs>0) qChanged = true;
      this.lastRevs = wheelRevs;
      var wheelTime = event.target.value.getUint16(5, true);
      var dT = (wheelTime-this.lastTime)/1024;
      var dBT = (Date.now()-this.lastBangleTime)/1000;
      if (dT<0) dT+=64;
      this.lastTime = wheelTime;
      this.speed = this.lastSpeed;
      if (dRevs>0 && dT>0) {
        this.speed = (dRevs*this.wheelDia*Math.PI/63360.0)*3600/dT;
	    this.speedFailed = 0;
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
    }
    if (qChanged && this.qUpdateScreen) this.updateScreen();
  }
};

var mySensor = new CSCSensor();

function parseDevice(d) {
  device = d;
  g.clear().drawString("Found device", 120, 120).flip();
  device.gatt.connect().then(function(ga) {
  gatt = ga;
  g.clear().drawString("Connected", 120, 120).flip();
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
  g.clear().setFontVector("40").setColor(1, 1, 1).flip();
}).catch(function(e) {
  g.clear().setColor(1, 0, 0).drawString("ERROR"+e, 120, 120).flip();
})}

NRF.setScan(parseDevice, { filters: [{services:["1816"]}], timeout: 2000});
g.clear().setFontVector(18).setFontAlign(0, 0, 0).setColor(0, 1, 0);
g.drawString("Scanning for CSC sensor...", 120, 120);

Bangle.on('kill',()=>{ if (gatt!=undefined) gatt.disconnect()});
