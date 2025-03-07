var Layout = require("Layout");
const modHS = require('HSModule');
var layout;
let characteristic;
var settings = modHS.getSettings();
//var appCache = modHS.getCache();
function log(msg) {
    if (!settings.DEBUG) {
      return;
    } else {
      console.log(msg);
    }
}

//Schema for the message coming from the BLE ThermistorPod:
function analyzeBPData(data) {
  const flags = data.getUint8(0,1);
  const buf = data.buffer;
  let index = 1;
  const result = {};
  result.sbp = buf[index];
  index += 2;
  result.dbp = buf[index];
  index += 2;
  result.map = buf[index];
  index += 2;
  if (flags & 0x02) {
      result.date = {
          year: buf[index] + (buf[index + 1] << 8),
          month: buf[index + 2],
          day: buf[index + 3],
          hour: buf[index + 4],
          minute: buf[index + 5],
          second: buf[index + 6],
      };
      index += 7;
  }
  if (flags & 0x04) {
      result.hr = buf[index];
      index += 2;
  }
  if (flags & 0x08) {
      index += 1;
  }
  if (flags & 0x10) {
      const ms = buf[index];
      result.moved = (ms & 0b1) ? 1 : 0;
      result.cuffLoose = (ms & 0b10) ? 1 : 0;
      result.irregularPulse = (ms & 0b100) ? 1 : 0;
      result.improperMeasure = (ms & 0b100000) ? 1 : 0;
      index += 1;
  }
  return result;
}

function getBP(id) {
  layout = new Layout({
    type: "v", c: [
      {
        type: "h", c: [
          { type: "txt", font: "6x8:2", label: "Blood Pressure", fillx: 1 },
        ]
      },
      {
        type: "h", c: [
          { type: "txt", font: "6x8:2", label: "Waiting...", fillx: 1 },
        ]
      }
    ]
  });
  g.clear();
  layout.render();
  var device;
  var service;
  log("connecting to ", id);
  NRF.connect(id).then(function (d) {
    device = d;
    return new Promise(resolve => setTimeout(resolve, 1000));
  }).then(function () {
    log("connected");
    if (device.getSecurityStatus().bonded) {
      log("Already bonded");
      return true;
    } else {
      log("Start bonding");
      return device.startBonding();
    }
  }).then(function () {
    device.device.on('gattserverdisconnected', function (reason) {
      Bangle.load();
      log("Disconnected ", reason);
    });
    return device.getPrimaryService("1810");
  }).then(function (s) {
    service = s;
    return service.getCharacteristic("2A08");
  }).then(function (characteristic) {
    //set time on device during pairing
    var date = new Date();
    var b = new ArrayBuffer(7);
    var v = new DataView(b);
    v.setUint16(0, date.getFullYear(), true);
    v.setUint8(2, date.getMonth() + 1);
    v.setUint8(3, date.getDate());
    v.setUint8(4, date.getHours());
    v.setUint8(5, date.getMinutes());
    v.setUint8(5, date.getSeconds());
    var arr = [];
    for (let i = 0; i < v.buffer.length; i++) {
      arr[i] = v.buffer[i];
    }
    return characteristic.writeValue(arr);
  }).then(function () {
    return service.getCharacteristic("2A35");
  }).then(function (c) {
    characteristic = c;
    c.on('characteristicvaluechanged', function (event) {
      //log("-> "); // this is a DataView
      //log(event.target.value);
      const receivedData = analyzeBPData(event.target.value);
      //and now we repackage the data into the array we want:
      var bp_arr = {};
      var keys = settings.StudyTasks.bloodPressure.headers;
      keys.forEach(function(key) {
        if (receivedData.hasOwnProperty(key)) {
          bp_arr[key] = receivedData[key];
        } else {
          bp_arr[key] = null;
        }
      });
      modHS.saveDataToFile('bpres', 'bloodPressure', bp_arr);
      layout = new Layout({
        type: "v", c: [
          {
            type: "h", c: [
              { type: "txt", font: "12x20:2", label: bp_arr.sbp, fillx: 1 },
              { type: "txt", font: "12x20:2", label: "/", fillx: 1 },
              { type: "txt", font: "12x20:2", label: bp_arr.dbp, fillx: 1 }
            ]
          },
          {
            type: "h", c: [
              { type: "txt", font: "12x20:2", label: bp_arr.hr, fillx: 1 },
              { type: "txt", font: "12x20:2", label: "BPM", fillx: 1 },
            ]
          },
          {
            type: "h", c: [
              { type: "txt", font: "12x20:2", label: "Saved!", fillx: 1 }
            ]
          },
        ]
      });
      g.clear();
      layout.render();
    });
    return c.startNotifications();
  }).then(function (d) {
    log("Setting Notification Interval");
    log("Waiting for notifications");
  }).catch(function (e) {
    log("GATT ", device);
    layout = new Layout({
      type: "v", c: [
        {
          type: "h", c: [
            { type: "txt", font: "6x8:2", label: "ERROR!", fillx: 1 },
          ]
        },
        {
          type: "h", c: [
            { type: "txt", font: "6x8:1", label: e, fillx: 1 },
          ]
        }
      ]
    });
    g.clear();
    layout.render();
    if (!device.connected) {
      getBP(id);
    }
  });
}
var macID = settings.bt_bloodPressure_id.split(" ");
setTimeout(() => {getBP(macID[0])}, 2000);