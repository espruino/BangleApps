(function() {

var state = {gatt : null, primary : null, temp : null, data : null};
// Would it be better to scan by uuid rather than name?
NRF.requestDevice({timeout : 20000, filters : [ {namePrefix : 'CORE'} ]})
    // NRF.requestDevice({timeout : 20000, filters : [ {services :
    // '1809','2100'} ]})
    .then(function(device) {
      return device.gatt.connect();
    })
    .then(function(g) {
      state.gatt = g;
      return state.gatt
          .getPrimaryService('00002100-5b1e-4347-b07c-97b514dae121')
          .then(function(service) {
            state.primary = service;
            return state.primary.getCharacteristic(
                '00002101-5b1e-4347-b07c-97b514dae121');
          })
          .then(function(c) {
            state.data = c;
            state.data.on('characteristicvaluechanged', function(event) {
              var dv = event.target.value;
              var flags = dv.buffer[0];
              var unit, core = -1, skin = -1;

              if (flags & 8) {
                unit = "F";
              } else {
                unit = "C";
              }

              if (flags & 1)
                skin = (dv.buffer[4] * 256 + dv.buffer[3]) / 100;
              if (flags & 2)
                core = (dv.buffer[2] * 256 + dv.buffer[1]) / 100;

              Bangle.emit('CoreTemp', {core : core, skin : skin, unit : unit});
            });
            return c.startNotifications();
          })
          .catch(function(e) {
            E.showMessage(e.toString(), "ERROR");
            console.log(e);
          });
    });
})();
