// set battery calibration value by either applying the given value or setting the currently read battery voltage
exports.setCalibration = function(calibration){
  let s = require('Storage').readJSON("setting.json", true) || {};
  s.batFullVoltage = calibration?calibration:((analogRead(D3) + analogRead(D3) + analogRead(D3) + analogRead(D3)) / 4);
  require('Storage').writeJSON("setting.json", s);
}
