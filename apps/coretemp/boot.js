(function() {

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

connection_setup();

E.on('kill', () => { connection_end(); });

// move into setup
NRF.on('disconnect', connection_setup);  // restart if disconnected

// Bangle.loadWidgets();
// Bangle.drawWidgets();
})();
