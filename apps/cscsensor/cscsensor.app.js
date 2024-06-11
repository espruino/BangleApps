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
    this.lastRevs = -1;
    this.settings = storage.readJSON(SETTINGS_FILE, 1) || {};
    this.settings.totaldist = this.settings.totaldist || 0;
    this.totaldist = this.settings.totaldist;
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
    var dist = this.distFactor*(this.lastRevs-this.lastRevsStart)*csc.settings.circum/63360.0;
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

}

var mySensor = new CSCSensor();

var csc = require("blecsc").getInstance();
csc.on("data", e => {
  mySensor.totaldist += e.wr * csc.settings.circum/*mm*/ / 1000000; // finally in km
  mySensor.lastRevs = e.cwr;
  if (mySensor.lastRevsStart<0) mySensor.lastRevsStart = e.cwr;
  mySensor.speed = e.kph;
  mySensor.movingTime += e.wdt;
  if (mySensor.speed>mySensor.maxSpeed && (mySensor.movingTime>3 || mySensor.speed<20) && mySensor.speed<50)
    mySensor.maxSpeed = mySensor.speed;
  mySensor.cadence = e.crps*60;
  mySensor.updateScreen();
  mySensor.updateScreen();
});

csc.on("status", txt => {
  //print("->", txt);
  E.showMessage(txt);
});
E.on('kill',()=>{
  csc.stop();
  mySensor.settings.totaldist = mySensor.totaldist;
  storage.writeJSON(SETTINGS_FILE, mySensor.settings);
});
Bangle.setUI("updown", d=>{
  if (d<0) { mySensor.reset(); g.clearRect(0, yStart, W, H); mySensor.updateScreen(); }
  else if (!d) { mySensor.toggleDisplayCadence(); g.clearRect(0, yStart, W, H); mySensor.updateScreen(); }
});

Bangle.loadWidgets();
Bangle.drawWidgets();
csc.start(); // start a connection