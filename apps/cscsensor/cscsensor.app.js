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
    this.wheelCirc = (this.settings.wheelcirc || 2230)/25.4;
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
    this.screenInit = true;
    this.batteryLevel = -1;
  }

  reset() {
    this.settings.totaldist = this.totaldist;
    storage.writeJSON(SETTINGS_FILE, this.settings);
    this.maxSpeed = 0;
    this.movingTime = 0;
    this.lastRevsStart = this.lastRevs;
    this.maxSpeed = 0;
    this.screenInit = true;
  }

  setBatteryLevel(level) {
    if (level!=this.batteryLevel) {
      this.batteryLevel = level;
      this.drawBatteryIcon();
    }
  }

  updateBatteryLevel(event) {
    if (event.target.uuid == "0x2a19") this.setBatteryLevel(event.target.value.getUint8(0));
  }

  drawBatteryIcon() {
    g.setColor(1, 1, 1).drawRect(10, 55, 20, 75).fillRect(14, 53, 16, 55).setColor(0).fillRect(11, 56, 19, 74);
    if (this.batteryLevel!=-1) {
      if (this.batteryLevel<25) g.setColor(1, 0, 0);
      else if (this.batteryLevel<50) g.setColor(1, 0.5, 0);
      else g.setColor(0, 1, 0);
      g.fillRect(11, 74-18*this.batteryLevel/100, 19, 74);
    }
    else g.setFontVector(14).setFontAlign(0, 0, 0).setColor(0xffff).drawString("?", 16, 66);
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
    var avespeed = (this.movingTime>3 ? Math.round(10*dist/(this.movingTime/3600))/10 : 0);
    var maxspeed = Math.round(10*this.distFactor*this.maxSpeed)/10;
    if (this.screenInit) {
      for (var i=0; i<6; ++i) {
        if ((i&1)==0) g.setColor(0, 0, 0);
        else g.setColor(0x30cd);
        g.fillRect(0, 48+i*32, 86, 48+(i+1)*32);
        if ((i&1)==1) g.setColor(0);
        else g.setColor(0x30cd);
        g.fillRect(87, 48+i*32, 239, 48+(i+1)*32);
        g.setColor(0.5, 0.5, 0.5).drawRect(87, 48+i*32, 239, 48+(i+1)*32).drawLine(0, 239, 239, 239);//.drawRect(0, 48, 87, 239);
        g.moveTo(0, 80).lineTo(30, 80).lineTo(30, 48).lineTo(87, 48).lineTo(87, 239).lineTo(0, 239).lineTo(0, 80);
      }
      g.setFontAlign(1, 0, 0).setFontVector(19).setColor(1, 1, 0);
      g.drawString("Time:", 87, 66);
      g.drawString("Speed:", 87, 98);
      g.drawString("Ave spd:", 87, 130);
      g.drawString("Max spd:", 87, 162);
      g.drawString("Trip:", 87, 194);
      g.drawString("Total:", 87, 226);
      this.drawBatteryIcon();
      this.screenInit = false;
    }
    g.setFontAlign(-1, 0, 0).setFontVector(26);
    g.setColor(0x30cd).fillRect(88, 49, 238, 79);
    g.setColor(0xffff).drawString(dmins+":"+dsecs, 92, 66);
    g.setColor(0).fillRect(88, 81, 238, 111);
    g.setColor(0xffff).drawString(dspeed+" "+this.speedUnit, 92, 98);
    g.setColor(0x30cd).fillRect(88, 113, 238, 143);
    g.setColor(0xffff).drawString(avespeed + " " + this.speedUnit, 92, 130);
    g.setColor(0).fillRect(88, 145, 238, 175);
    g.setColor(0xffff).drawString(maxspeed + " " + this.speedUnit, 92, 162);
    g.setColor(0x30cd).fillRect(88, 177, 238, 207);
    g.setColor(0xffff).drawString(ddist + " " + this.distUnit, 92, 194);
    g.setColor(0).fillRect(88, 209, 238, 238);
    g.setColor(0xffff).drawString(tdist + " " + this.distUnit, 92, 226);
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
      if (Math.abs(dT-dBT)>3) dT = dBT;
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
      if (this.speed>this.maxSpeed && (this.movingTime>3 || this.speed<20) && this.speed<50) this.maxSpeed = this.speed;
    }
    if (qChanged && this.qUpdateScreen) this.updateScreen();
  }
}

var mySensor = new CSCSensor();

function getSensorBatteryLevel(gatt) {
  gatt.getPrimaryService("180f").then(function(s) {
    return s.getCharacteristic("2a19");
  }).then(function(c) {
    c.on('characteristicvaluechanged', (event)=>mySensor.updateBatteryLevel(event));
    return c.startNotifications();
  });
}

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
  getSensorBatteryLevel(gatt);
  mySensor.updateScreen();
}).catch(function(e) {
  g.clearRect(0, 60, 239, 239).setColor(1, 0, 0).setFontAlign(0, 0, 0).drawString("ERROR"+e, 120, 120).flip();
  console.log(e);
})}

function connection_setup() {
  NRF.setScan();
  mySensor.screenInit = true;
  NRF.setScan(parseDevice, { filters: [{services:["1816"]}], timeout: 2000});
  g.clearRect(0, 48, 239, 239).setFontVector(18).setFontAlign(0, 0, 0).setColor(0, 1, 0);
  g.drawString("Scanning for CSC sensor...", 120, 120);
}

connection_setup();
setWatch(function() { mySensor.reset(); g.clearRect(0, 48, 239, 239); mySensor.updateScreen(); }, BTN1, {repeat:true, debounce:20});
E.on('kill',()=>{ if (gatt!=undefined) gatt.disconnect(); mySensor.settings.totaldist = mySensor.totaldist; storage.writeJSON(SETTINGS_FILE, mySensor.settings); });
setWatch(function() { if (Date.now()-mySensor.lastBangleTime>10000) connection_setup(); }, BTN3, {repeat:true, debounce:20});
NRF.on('disconnect', connection_setup);

Bangle.loadWidgets();
Bangle.drawWidgets();
