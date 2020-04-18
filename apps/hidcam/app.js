var controls = require("ble_hid_controls");
var storage = require('Storage');

const settings = storage.readJSON('setting.json',1) || { HID: false };

g.clear();
E.showMessage('BTN2 to trigger','camTrigger');
Bangle.loadWidgets();
Bangle.drawWidgets();

if (settings.HID) {
  NRF.setServices(undefined, { hid : controls.report });
  shotTrigger = function() {controls.volumeUp();};
} else {
  E.showMessage('HID disabled');
  setTimeout(load, 1000);
}

setWatch(function(e){
  E.showMessage('capture');
  Bangle.beep();
  shotTrigger();
  set.Timeout(load,1000);
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  E.showMessage('BTN2 to trigger','camTrigger');
},BTN2,{ repeat:true, edge:'falling' });
