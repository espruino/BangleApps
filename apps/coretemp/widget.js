// Widget to run sensors
// BT HRM / coretemp / csc
(() => {
  var settings = {};

var device;
var gatt;
var service;
var characteristic;

class CoreSensor {
  constructor() {
    this.unit = "";
    this.core = -1;
    this.skin = -1;
    this.battery = 0;
  }

  updateSensor(event) {
    if (event.target.uuid == "00002101-5b1e-4347-b07c-97b514dae121") {
      var dv = event.target.value;
      var flags = dv.buffer[0];

      if (flags & 8) {
        this.unit = "F";
      } else {
        this.unit = "C";
      }

      if (flags & 1) this.skin = (dv.buffer[4] * 256 + dv.buffer[3]) / 100;
      if (flags & 2) this.core = (dv.buffer[2] * 256 + dv.buffer[1]) / 100;

      Bangle.emit('CoreTemp',
                  {core : this.core, skin : this.skin, unit : this.unit});
    }
  }

  updateBatteryLevel(event) {
    if (event.target.uuid == "0x2a19")
      this.battery = event.target.value.getUint8(0);
  }
}

var mySensor = new CoreSensor();

function getSensorBatteryLevel(gatt) {
  gatt.getPrimaryService("180f")
      .then(function(s) { return s.getCharacteristic("2a19"); })
      .then(function(c) {
        c.on('characteristicvaluechanged',
             (event) => mySensor.updateBatteryLevel(event));
        return c.startNotifications();
      });
}

function connection_setup() {
  E.showMessage("Scanning for CoreTemp sensor...");
  NRF.requestDevice({timeout : 20000, filters : [ {namePrefix : 'CORE'} ]})
      .then(function(d) {
        device = d;
        E.showMessage("Found device");
        return device.gatt.connect();
      })
      .then(function(g) {
        gatt = g;
        return gatt.getPrimaryService('00002100-5b1e-4347-b07c-97b514dae121');
      })
      .then(function(s) {
        service = s;
        return service.getCharacteristic(
            '00002101-5b1e-4347-b07c-97b514dae121');
      })
      .then(function(c) {
        characteristic = c;
        characteristic.on('characteristicvaluechanged',
                          (event) => mySensor.updateSensor(event));
        return characteristic.startNotifications();
      })
      .then(function() {
        console.log("Done!");
//        getSensorBatteryLevel(gatt);
        g.reset().clearRect(Bangle.appRect).flip();
      })
      .catch(function(e) {
        E.showMessage(e.toString(), "ERROR");
        console.log(e);
      });
}
function connection_end() {
  if (gatt != undefined) gatt.disconnect();
}

  // draw your widget
  function draw() {
//    if (!) return;
    g.reset();
    g.setFontAlign(0,0);
    g.clearRect(this.x,this.y,this.x+23,this.y+23);
    g.setColor(settings.enabled?"#00ff00":"#80ff00");
    g.fillCircle(this.x+6,this.y+6,4);
    g.fillCircle(this.x+16,this.y+16,4);
    g.setColor(-1); // change color back to be nice to other apps
  }

//  function onHRM(hrm) {
//    WIDGETS["sensors"].draw();
//  }

  // Called by sensor app to enable listeners
  function reload() {
    settings = require("Storage").readJSON("coretemp.json",1)||{};
//    settings.fileNbr |= 0;

//    Bangle.removeListener('HRM',onHRM);

    if (settings.coreOn) {
      WIDGETS["sensors"].width = 24;
      connection_setup();
    } else {
      WIDGETS["sensors"].width = 0;
      connection_end();
    }
    
  }
  // add the widget
  WIDGETS["sensors"]={area:"tl",width:24,draw:draw,reload:function() {
    reload();
    Bangle.drawWidgets(); // relayout all widgets
  }};
  // load settings, set correct widget width
  reload();
})()
