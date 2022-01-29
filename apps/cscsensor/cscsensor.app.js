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
    g.setColor(1, 1, 1).drawRect(6, 38, 16, 58).fillRect(10, 36, 12, 38).setColor(0).fillRect(7, 39, 15, 57);
    if (this.batteryLevel!=-1) {
      if (this.batteryLevel<25) g.setColor(1, 0, 0);
      else if (this.batteryLevel<50) g.setColor(1, 0.5, 0);
      else g.setColor(0, 1, 0);
      g.fillRect(7, 57-18*this.batteryLevel/100, 15, 57);
    }
    else g.setFontVector(14).setFontAlign(0, 0, 0).setColor(0xffff).drawString("?", 12, 49);
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
    layout.vtime.label = dmins+":"+dsecs;
    layout.vspeed.label = dspeed + "" + this.speedUnit;
    layout.vaspeed.label = avespeed + "" + this.speedUnit;
    layout.vmspeed.label = maxspeed + "" + this.speedUnit;
    layout.vtrip.label = ddist + "" + this.distUnit;
    layout.vtotal.label = tdist + "" + this.distUnit;
    layout.render();
    this.drawBatteryIcon();
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
  g.clearRect(0, 24, 239, 239).setFontAlign(0, 0, 0).setColor(0, 1, 0).drawString("Found device", 120, 120).flip();
  device.gatt.connect().then(function(ga) {
  gatt = ga;
  g.clearRect(0, 24, 239, 239).setFontAlign(0, 0, 0).setColor(0, 1, 0).drawString("Connected", 120, 120).flip();
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
  g.clearRect(0, 24, 239, 239).setColor(1, 1, 1).flip();
//  setWatch(function() { mySensor.reset(); g.clearRect(0, 24, 239, 239); mySensor.updateScreen(); }, BTN1, {repeat:true, debounce:20});
  E.on('kill',()=>{ if (gatt!=undefined) gatt.disconnect(); mySensor.settings.totaldist = mySensor.totaldist;  storage.writeJSON(SETTINGS_FILE, mySensor.settings); });
//  setWatch(function() { if (Date.now()-mySensor.lastBangleTime>10000) connection_setup(); }, BTN3, {repeat:true, debounce:20});     getSensorBatteryLevel(gatt);
  mySensor.updateScreen();
}).catch(function(e) {
  g.clear().setColor(1, 0, 0).setFontAlign(0, 0, 0).drawString("ERROR"+e, 120, 120).flip();
  console.log(e);
})}

function scan() {
  menu = {
    "": { "title": "Select sensor" },
    "re-scan":  () => scan()
  };
  waitMessage();
  NRF.findDevices(devices => {
    devices.forEach(device =>{
      let deviceName = device.id.substring(0,17);
      if (device.name) {
        deviceName = device.name;
      }
      if (device.services!=undefined && device.services.find(e => e=="1816")) deviceName = "* "+deviceName;
      menu[deviceName] = () => { E.showMenu(); parseDevice(device); }
    });
    E.showMenu(menu);
  }, { active: true });
}

function waitMessage() {
  E.showMenu();
  E.showMessage("scanning");
}

function connection_setup() {
  if (mySensor.settings.autoconnect) {
    NRF.setScan();
    mySensor.screenInit = true;
    NRF.setScan(parseDevice, { filters: [{services:["1816"]}], timeout: 2000});
    g.clearRect(0, 24, 239, 239).setFontVector(18).setFontAlign(0, 0, 0).setColor(0, 1, 0);
    g.drawString("Scanning for CSC sensor...", 120, 120);
  }
  else scan();
}

var Layout = require("Layout");
var layout = new Layout( {
  lazy: true,
  type:"h", c: [
    {type: "v", c: [
      {type:"txt", font:"12%", label:"Time", id:"time", halign:1, bgCol:0x30cd, col:"#ffff00"},
      {type:"txt", font:"12%", label:"Speed", id:"speed", halign:1, col:"#ffff00"},
      {type:"txt", font:"12%", label:"AveSpd", id:"aspeed", halign:1, bgCol:0x30cd, col:"#ffff00"},
      {type:"txt", font:"12%", label:"MaxSpd", id:"mspeed", halign:1, col:"#ffff00"},
      {type:"txt", font:"12%", label:"Trip", id:"trip", halign:1, bgCol:0x30cd, col:"#ffff00"},
      {type:"txt", font:"12%", label:"Total", id:"total", halign:1, col:"#ffff00"}]
    },
    {type: "v", c: [
      {type:"txt", font:"12%", label:": ", id:"vtimes", halign:-1},
      {type:"txt", font:"12%", label:": ", id:"vspeeds", halign:-1},
      {type:"txt", font:"12%", label:": ", id:"vaspeeds", halign:-1},
      {type:"txt", font:"12%", label:": ", id:"vmspeeds", halign:-1},
      {type:"txt", font:"12%", label:": ", id:"vtrips", halign:-1},
      {type:"txt", font:"12%", label:": ", id:"vtotals", halign:-1}]
    },
    {type: "v", fillx:1.2, c: [
      {type:"txt", font:"12%", label:"0:00", id:"vtime", halign:-1},
      {type:"txt", font:"12%", label:"0", id:"vspeed", halign:-1, bgCol:0x30cd},
      {type:"txt", font:"12%", label:"0", id:"vaspeed", halign:-1},
      {type:"txt", font:"12%", label:"0", id:"vmspeed", halign:-1, bgCol:0x30cd},
      {type:"txt", font:"12%", label:"0", id:"vtrip", halign:-1},
      {type:"txt", font:"12%", label:"0", id:"vtotal", halign:-1, bgCol:0x30cd}]
    }
  ]
});

connection_setup();
NRF.on('disconnect', connection_setup);

Bangle.loadWidgets();
Bangle.drawWidgets();
