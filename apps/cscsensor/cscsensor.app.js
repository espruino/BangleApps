var device;
var gatt;
var service;
var characteristic;

const SETTINGS_FILE = 'cscsensor.json';
const storage = require('Storage');

class CSCSensor {
  constructor() {
    this.movingTime = 0;
    this.lastTime = 0;
    this.lastBangleTime = Date.now();
    this.lastRevs = -1;
    this.settings = storage.readJSON(SETTINGS_FILE, 1) || {};
    this.settings.totaldist = this.settings.totaldist || 0;
    this.totaldist = this.settings.totaldist;
    this.wheelCirc = (this.settings.wheelcirc || 2165)/25.4;
    this.speedFailed = 0;
    this.speed = 0;
    this.maxSpeed = 0;
    this.lastSpeed = 0;
    this.qUpdateScreen = true;
    this.lastRevsStart = -1;
    this.qMetric = !require("locale").speed(1).toString().endsWith("mph");
    this.speedUnit = this.qMetric ? "km/h" : "mph";
    this.distUnit = this.qMetric ? "km" : "mi";
    this.distFactor = this.qMetric ? 1.609344 : 1;
  }
  reset() {
    this.settings.totaldist = this.totaldist;
    storage.writeJSON(SETTINGS_FILE, this.settings);
    this.maxSpeed = 0;
    this.movingTime = 0;
    this.lastRevsStart = this.lastRevs;
    this.maxSpeed = 0;
  }
  updateScreen() {
    var dist = this.distFactor*(this.lastRevs-this.lastRevsStart)*this.wheelCirc/63360.0;
    var ddist = Math.round(100*dist)/100;
    var tdist = Math.round(this.distFactor*this.totaldist*10)/10;
    var dspeed = Math.round(10*this.distFactor*this.speed)/10; 
    var dmins = Math.floor(this.movingTime/60).toString();
    if (dmins.length<2) dmins = "0"+dmins;
    var dsecs = (Math.floor(this.movingTime) % 60).toString();
    if (dsecs.length<2) dsecs = "0"+dsecs;
    var avespeed = (this.movingTime>2 ? Math.round(10*dist/(this.movingTime/3600))/10 : 0);
    var maxspeed = Math.round(10*this.distFactor*this.maxSpeed)/10;
    g.setFontAlign(1, -1, 0).setFontVector(18).setColor(1, 1, 0);
    g.drawString("Time:", 86, 60);
    g.drawString("Speed:", 86, 92);
    g.drawString("Ave spd:", 86, 124);
    g.drawString("Max spd:", 86, 156);
    g.drawString("Trip dist:", 86, 188);
    g.drawString("Total:", 86, 220);
    g.setFontAlign(-1, -1, 0).setFontVector(24).setColor(1, 1, 1).clearRect(92, 60, 239, 239);
    g.drawString(dmins+":"+dsecs, 92, 60);
    g.drawString(dspeed+" "+this.speedUnit, 92, 92);
    g.drawString(avespeed + " " + this.speedUnit, 92, 124);
    g.drawString(maxspeed + " " + this.speedUnit, 92, 156);
    g.drawString(ddist + " " + this.distUnit, 92, 188);
    g.drawString(tdist + " " + this.distUnit, 92, 220);
  }
  updateSensor(event) {
    var qChanged = false;
    if (event.target.uuid == "0x2a5b") {
      var wheelRevs = event.target.value.getUint32(1, true);
      var dRevs = (this.lastRevs>0 ? wheelRevs-this.lastRevs : 0);
      if (dRevs>0) {
        qChanged = true;
        this.totaldist += dRevs*this.wheelCirc/63360.0;
        if ((this.totaldist-this.settings.totaldist)>0.1) {
          this.settings.totaldist = this.totaldist;
          storage.writeJSON(SETTINGS_FILE, this.settings);
        }
      }
      this.lastRevs = wheelRevs;
      if (this.lastRevsStart<0) this.lastRevsStart = wheelRevs;
      var wheelTime = event.target.value.getUint16(5, true);
      var dT = (wheelTime-this.lastTime)/1024;
      var dBT = (Date.now()-this.lastBangleTime)/1000;
      this.lastBangleTime = Date.now();
      if (dT<0) dT+=64;
      if (Math.abs(dT-dBT)>2) dT = dBT;
      this.lastTime = wheelTime;
      this.speed = this.lastSpeed;
      if (dRevs>0 && dT>0) {
        this.speed = (dRevs*this.wheelCirc/63360.0)*3600/dT;
        this.speedFailed = 0;
        this.movingTime += dT;
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
  mySensor.updateScreen();
}).catch(function(e) {
  g.clearRect(0, 60, 239, 239).setColor(1, 0, 0).setFontAlign(0, 0, 0).drawString("ERROR"+e, 120, 120).flip();
})}

function connection_setup() {
  NRF.setScan(parseDevice, { filters: [{services:["1816"]}], timeout: 2000});
  g.clearRect(0, 60, 239, 239).setFontVector(18).setFontAlign(0, 0, 0).setColor(0, 1, 0);
  g.drawString("Scanning for CSC sensor...", 120, 120);
}

connection_setup();
setWatch(function() { mySensor.reset(); g.clearRect(0, 60, 239, 239); mySensor.updateScreen(); }, BTN1, {repeat:true, debounce:20});
E.on('kill',()=>{ if (gatt!=undefined) gatt.disconnect(); mySensor.settings.totaldist = mySensor.totaldist; storage.writeJSON(SETTINGS_FILE, mySensor.settings); });
NRF.on('disconnect', connection_setup);

Bangle.loadWidgets();
Bangle.drawWidgets();
