var device;
var gatt;
var service;
var characteristic;

const SETTINGS_FILE = 'cscsensor.json';
const storage = require('Storage');
const W = g.getWidth();
const H = g.getHeight();
const yStart = 48;
const rowHeight = (H-yStart)/6;
const yCol1 = W/2.7586;
const fontSizeLabel = W/12.632;
const fontSizeValue = W/9.2308;

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
    this.lastRevsStart = -1;
    this.qMetric = !require("locale").speed(1).toString().endsWith("mph");
    this.speedUnit = this.qMetric ? "km/h" : "mph";
    this.distUnit = this.qMetric ? "km" : "mi";
    this.distFactor = this.qMetric ? 1.609344 : 1;
    this.screenInit = true;
    this.batteryLevel = -1;
    this.lastCrankTime = 0;
    this.lastCrankRevs = 0;
    this.showCadence = false;
    this.cadence = 0;
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

  toggleDisplayCadence() {
    this.showCadence = !this.showCadence;
    this.screenInit = true;
    g.setBgColor(0, 0, 0);
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
    g.setColor(1, 1, 1).drawRect(10*W/240, yStart+0.029167*H, 20*W/240, yStart+0.1125*H)
      .fillRect(14*W/240, yStart+0.020833*H, 16*W/240, yStart+0.029167*H)
      .setColor(0).fillRect(11*W/240, yStart+0.033333*H, 19*W/240, yStart+0.10833*H);
    if (this.batteryLevel!=-1) {
      if (this.batteryLevel<25) g.setColor(1, 0, 0);
      else if (this.batteryLevel<50) g.setColor(1, 0.5, 0);
      else g.setColor(0, 1, 0);
      g.fillRect(11*W/240, (yStart+0.10833*H)-18*this.batteryLevel/100, 19*W/240, yStart+0.10833*H);
    }
    else g.setFontVector(W/17.143).setFontAlign(0, 0, 0).setColor(0xffff).drawString("?", 16*W/240, yStart+0.075*H);
  }

  updateScreenRevs() {
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
        g.fillRect(0, yStart+i*rowHeight, yCol1-1, yStart+(i+1)*rowHeight);
        if ((i&1)==1) g.setColor(0);
        else g.setColor(0x30cd);
        g.fillRect(yCol1, yStart+i*rowHeight, H-1, yStart+(i+1)*rowHeight);
        g.setColor(0.5, 0.5, 0.5).drawRect(yCol1, yStart+i*rowHeight, H-1, yStart+(i+1)*rowHeight).drawLine(0, H-1, W-1, H-1);
        g.moveTo(0, yStart+0.13333*H).lineTo(30*W/240, yStart+0.13333*H).lineTo(30*W/240, yStart).lineTo(yCol1, yStart).lineTo(yCol1, H-1).lineTo(0, H-1).lineTo(0, yStart+0.13333*H);
      }
      g.setFontAlign(1, 0, 0).setFontVector(fontSizeLabel).setColor(1, 1, 0);
      g.drawString("Time:", yCol1, yStart+rowHeight/2+0*rowHeight);
      g.drawString("Speed:", yCol1, yStart+rowHeight/2+1*rowHeight);
      g.drawString("Avg spd:", yCol1, yStart+rowHeight/2+2*rowHeight);
      g.drawString("Max spd:", yCol1, yStart+rowHeight/2+3*rowHeight);
      g.drawString("Trip:", yCol1, yStart+rowHeight/2+4*rowHeight);
      g.drawString("Total:", yCol1, yStart+rowHeight/2+5*rowHeight);
      this.drawBatteryIcon();
      this.screenInit = false;
    }
    g.setFontAlign(-1, 0, 0).setFontVector(fontSizeValue);
    g.setColor(0x30cd).fillRect(yCol1+1, 49+rowHeight*0, 238, 47+1*rowHeight);
    g.setColor(0xffff).drawString(dmins+":"+dsecs, yCol1+5, 50+rowHeight/2+0*rowHeight);
    g.setColor(0).fillRect(yCol1+1, 49+rowHeight*1, 238, 47+2*rowHeight);
    g.setColor(0xffff).drawString(dspeed+" "+this.speedUnit, yCol1+5, 50+rowHeight/2+1*rowHeight);
    g.setColor(0x30cd).fillRect(yCol1+1, 49+rowHeight*2, 238, 47+3*rowHeight);
    g.setColor(0xffff).drawString(avespeed + " " + this.speedUnit, yCol1+5, 50+rowHeight/2+2*rowHeight);
    g.setColor(0).fillRect(yCol1+1, 49+rowHeight*3, 238, 47+4*rowHeight);
    g.setColor(0xffff).drawString(maxspeed + " " + this.speedUnit, yCol1+5, 50+rowHeight/2+3*rowHeight);
    g.setColor(0x30cd).fillRect(yCol1+1, 49+rowHeight*4, 238, 47+5*rowHeight);
    g.setColor(0xffff).drawString(ddist + " " + this.distUnit, yCol1+5, 50+rowHeight/2+4*rowHeight);
    g.setColor(0).fillRect(yCol1+1, 49+rowHeight*5, 238, 47+6*rowHeight);
    g.setColor(0xffff).drawString(tdist + " " + this.distUnit, yCol1+5, 50+rowHeight/2+5*rowHeight);
  }

  updateScreenCadence() {
    if (this.screenInit) {
      for (var i=0; i<2; ++i) {
        if ((i&1)==0) g.setColor(0, 0, 0);
        else g.setColor(0x30cd);
        g.fillRect(0, yStart+i*rowHeight, yCol1-1, yStart+(i+1)*rowHeight);
        if ((i&1)==1) g.setColor(0);
        else g.setColor(0x30cd);
        g.fillRect(yCol1, yStart+i*rowHeight, H-1, yStart+(i+1)*rowHeight);
        g.setColor(0.5, 0.5, 0.5).drawRect(yCol1, yStart+i*rowHeight, H-1, yStart+(i+1)*rowHeight).drawLine(0, H-1, W-1, H-1);
        g.moveTo(0, yStart+0.13333*H).lineTo(30*W/240, yStart+0.13333*H).lineTo(30*W/240, yStart).lineTo(yCol1, yStart).lineTo(yCol1, H-1).lineTo(0, H-1).lineTo(0, yStart+0.13333*H);
      }
      g.setFontAlign(1, 0, 0).setFontVector(fontSizeLabel).setColor(1, 1, 0);
      g.drawString("Cadence:", yCol1, yStart+rowHeight/2+1*rowHeight);
      this.drawBatteryIcon();
      this.screenInit = false;
    }
    g.setFontAlign(-1, 0, 0).setFontVector(fontSizeValue);
    g.setColor(0).fillRect(yCol1+1, 49+rowHeight*1, 238, 47+2*rowHeight);
    g.setColor(0xffff).drawString(Math.round(this.cadence), yCol1+5, 50+rowHeight/2+1*rowHeight);
  }

  updateScreen() {
    if (!this.showCadence) {
      this.updateScreenRevs();
    } else {
      this.updateScreenCadence();
    }
  }

  updateSensor(event) {
    var qChanged = false;
    if (event.target.uuid == "0x2a5b") {
      if (event.target.value.getUint8(0, true) & 0x2) {
        // crank revolution - if enabled
        const crankRevs = event.target.value.getUint16(1, true);
        const crankTime = event.target.value.getUint16(3, true);
        if (crankTime > this.lastCrankTime) {
          this.cadence = (crankRevs-this.lastCrankRevs)/(crankTime-this.lastCrankTime)*(60*1024);
          qChanged = true;
        }
        this.lastCrankRevs = crankRevs;
        this.lastCrankTime = crankTime;
      } else {
        // wheel revolution
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
        } else if (!this.showCadence) {
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
    }
    if (qChanged) this.updateScreen();
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

function connection_setup() {
  mySensor.screenInit = true;
  E.showMessage("Scanning for CSC sensor...");
  NRF.requestDevice({ filters: [{services:["1816"]}], maxInterval: 100}).then(function(d) {
    device = d;
    E.showMessage("Found device");
    return device.gatt.connect();
  }).then(function(ga) {
    gatt = ga;
    E.showMessage("Connected");
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
    g.reset().clearRect(Bangle.appRect).flip();
    getSensorBatteryLevel(gatt);
    mySensor.updateScreen();
  }).catch(function(e) {
    E.showMessage(e.toString(), "ERROR");
    console.log(e);
    setTimeout(connection_setup, 1000);
  });
}

connection_setup();
E.on('kill',()=>{
  if (gatt!=undefined) gatt.disconnect();
  mySensor.settings.totaldist = mySensor.totaldist;
  storage.writeJSON(SETTINGS_FILE, mySensor.settings);
});
NRF.on('disconnect', connection_setup); // restart if disconnected
Bangle.setUI("updown", d=>{
  if (d<0) { mySensor.reset(); g.clearRect(0, yStart, W, H); mySensor.updateScreen(); }
  else if (d>0) { if (Date.now()-mySensor.lastBangleTime>10000) connection_setup(); }
  else { mySensor.toggleDisplayCadence(); g.clearRect(0, yStart, W, H); mySensor.updateScreen(); }
});

Bangle.loadWidgets();
Bangle.drawWidgets();
