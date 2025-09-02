var Layout = require("Layout");
const modHS = require('HSModule');
var layout;

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
const Schema_ThermistorPodBLE = {
  msgType: 'int32',
  ta: 'float32',
  rh: 'float32',
  batP: 'int32',
  temp: 'float32',
  tempAvg: 'float32',
  adc: 'int32',
  resistance: 'float32',
  ambLight: 'int32'
};

function getTcore(id) {
  layout = new Layout({
    type: "v", c: [
      {
        type: "h", c: [
          { type: "txt", font: "12x20:2", label: "Oral Temp", fillx: 1 },
        ]
      },
      {
        type: "h", c: [
          { type: "txt", font: "12x20:2", label: "Waiting...", fillx: 1 },
        ]
      }
    ]
  });
  g.clear();
  layout.render();
  var gatt;
  var startTime;
  var complete = false;
  var TCoreData = {
    "temp": null,
    "ta": null,
    "rh": null,
    "measures": []
  };
  NRF.connect(id).then(function (g) {
    gatt = g;
    startTime = parseInt((getTime()).toFixed(0));
    gatt.device.on('gattserverdisconnected', function (reason) {
      gatt = null;
      Bangle.load();
      log("Disconnected ", reason);
    });
    return gatt.getPrimaryService("1809");
  }).then(function (s) {
    return s.getCharacteristic("00002A1F-0000-1000-8000-00805F9B34FB");
  }).then(function (c) {
    c.on('characteristicvaluechanged', function (event) {
      const receivedData = modHS.parseBLEData(event.target.value, Schema_ThermistorPodBLE);
      TCoreData.temp = receivedData.tempAvg;
      TCoreData.ta = receivedData.ta;
      TCoreData.rh = receivedData.rh;
      TCoreData.measures.push(receivedData.adc);
      var timeNow = parseInt((getTime()).toFixed(0));
      var diff = timeNow - startTime;
      var display;
      if (diff > 90 && !complete) { // time to save the data and disconnect
        complete = true;
        if (modHS.saveDataToFile('coreTemp', 'coreTemperature', TCoreData)) {
          display = {
            type: "v", c: [
              {
                type: "h", c: [
                  { type: "txt", font: "12x20:2", label: "Saved!", fillx: 1 }
                ]
              }
            ]
          };

        }
      } else {
        var remaining = 90 - diff;
        display = {
          type: "v", c: [
            {
              type: "h", c: [
                { type: "txt", font: "12x20:2", label: remaining + " secs", fillx: 1 }
              ]
            },
            {
              type: "h", c: [
                { type: "txt", font: "4x6:2", label: receivedData.adc + " " + receivedData.temp.toFixed(2) + "C", fillx: 1 }
              ]
            }
          ]
        };
      }
      layout = new Layout(display);
      g.clear();
      layout.render();
      if (complete) {
        if(gatt){
          gatt.disconnect();
        }
        setTimeout(() => { Bangle.load() }, 2000);
      }
    });
    return c.startNotifications();
  }).then(function (d) {
  }).catch(function (e) {
    E.showAlert("error! " + e).then(function () { Bangle.load(); });
  });
}

let macID = settings.bt_coreTemperature_id.split(" ");
//so you can see timeout
Bangle.setOptions({backlightTimeout: 0}) // turn off the timeout
Bangle.setBacklight(1); // keep screen on
getTcore(macID[0]);