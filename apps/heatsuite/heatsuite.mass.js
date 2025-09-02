var Layout = require("Layout");
var modHS = require("HSModule");
var layout;

/** --------- MI SCALE --------------------------- */
function getMass(service) {
  var datareceived = [];
  layout = new Layout({
    type: "v", c: [
      {
        type: "h", c: [
          { type: "txt", font: "12x20:2", label: "Body Mass", fillx: 1 },
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

  NRF.setScan();//clear other scans

  NRF.setScan(function (devices) {
    var data = devices.serviceData[service];
    datareceived.push(data);
    var ctlByte = data[1];
    var stabilized = ctlByte & (1 << 5);
    var weight = ((data[12] << 8) + data[11]) / 200;
    var impedance = (data[10] << 8) + data[9];
    if (stabilized && datareceived.length > 1 && impedance > 0 && impedance < 65534) {
      NRF.setScan();
      datareceived = [];
      var dataOut ={
        'mass' : weight, 
        'impedance' : impedance
      };
      modHS.saveDataToFile('mass', 'bodyMass', dataOut);
      layout = new Layout({
        type: "v", c: [
          {
            type: "h", c: [
              { type: "txt", font: "12x20:2", label: weight, fillx: 1 },
              { type: "txt", font: "12x20:2", label: "kg", fillx: 1 }
            ]
          },
          {
            type: "h", c: [
              { type: "txt", font: "6x8:2", label: impedance, fillx: 1 },
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
      setTimeout(function () { Bangle.load(); }, 3000);
    }
  }, { timeout: 2000, filters: [{ services: [service] }] });
}

//init
getMass('181b');