var storage = require('Storage');

const settings = storage.readJSON('setting.json',1) || { HID: false };

// hidcontrol module selective and manual import :
report = new Uint8Array([
  0x05, 0x0c,                    // USAGE_PAGE (Consumer Devices)
  0x09, 0x01,                    // USAGE (Consumer Control)
  0xa1, 0x01,                    // COLLECTION (Application)
                                 // -------------------- common global items
  0x15, 0x00,                    //   LOGICAL_MINIMUM (0)
  0x25, 0x01,                    //   LOGICAL_MAXIMUM (1)
  0x75, 0x01,                    //   REPORT_SIZE (1)    - each field occupies 1 bit
                                 // -------------------- misc bits
  0x95, 0x05,                    //   REPORT_COUNT (5)
  0x09, 0xb5,                    //   USAGE (Scan Next Track)
  0x09, 0xb6,                    //   USAGE (Scan Previous Track)
  0x09, 0xb7,                    //   USAGE (Stop)
  0x09, 0xcd,                    //   USAGE (Play/Pause)
  0x09, 0xe2,                    //   USAGE (Mute)
  0x81, 0x06,                    //   INPUT (Data,Var,Rel)  - relative inputs
                                 // -------------------- volume up/down bits
  0x95, 0x02,                    //   REPORT_COUNT (2)
  0x09, 0xe9,                    //   USAGE (Volume Up)
  0x09, 0xea,                    //   USAGE (Volume Down)
  0x81, 0x02,                    //   INPUT (Data,Var,Abs)  - absolute inputs
                                 // -------------------- padding bit
  0x95, 0x01,                    //   REPORT_COUNT (1)
  0x81, 0x01,                    //   INPUT (Cnst,Ary,Abs)
  0xc0                           // END_COLLECTION
]);
function p(c,cb) { NRF.sendHIDReport(c, function() { NRF.sendHIDReport(0, cb) }); }
volumeUp = function(cb) { p(0x80,cb) };
//end of manual selective import

NRF.setServices(undefined, { hid : report });

g.clear();
E.showMessage('BTN2 to trigger','camTrigger');
Bangle.loadWidgets();
Bangle.drawWidgets();

if (settings.HID) {
  NRF.setServices(undefined, { hid : report });
  shotTrigger = function() {volumeUp();};
} else {
  E.showMessage('HID disabled');
  setTimeout(load, 1000);
}

setWatch(function(e){
  E.showMessage('capture');
  Bangle.beep();
  shotTrigger();
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  E.showMessage('BTN2 to trigger','camTrigger');
},BTN2,{ repeat:true, edge:'falling' });
