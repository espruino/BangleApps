Bangle.HID = E.toUint8Array(atob("BQEJBqEBhQIFBxngKecVACUBdQGVCIEClQF1CIEBlQV1AQUIGQEpBZEClQF1A5EBlQZ1CBUAJXMFBxkAKXOBAAkFFQAm/wB1CJUCsQLABQwJAaEBhQEVACUBdQGVAQm1gQIJtoECCbeBAgm4gQIJzYECCeKBAgnpgQIJ6oECwA=="));

(function() {
  var s = require('Storage').readJSON('@setting');
  var adv = { uart: true };
  if (s.ble) {
    if (s.dev)
      Bluetooth.setConsole(true);
    else
      Terminal.setConsole(true);
    if (s.HID) {
      adv.hid = Bangle.HID;
    } else
      delete Bangle.HID;
  }
  NRF.setServices({}, adv);
  // we just reset, so BLE should be on
  try { // disable advertising if BLE should be off
    if (!s.ble) NRF.sleep();
    else  NRF.wake();
  } catch(e) {}
  if (!s.vibrate) Bangle.buzz=Promise.resolve;
  if (!s.beep) Bangle.beep=Promise.resolve;
  Bangle.setLCDTimeout(s.timeout);
  if (!s.timeout) Bangle.setLCDPower(1);
  E.setTimeZone(s.timezone);
})()
