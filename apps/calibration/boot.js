let cal_settings = require('Storage').readJSON("calibration.json", true) || {active: false};
Bangle.on('touch', function(button, xy) {
  // do nothing if the calibration is deactivated
  if (cal_settings.active === false) return;

  // reload the calibration offset at each touch event /!\ bad for the flash memory
  if (cal_settings.reload === true) {
    cal_settings = require('Storage').readJSON("calibration.json", true);
  }

  // apply the calibration offset
  xy.x += cal_settings.xoffset;
  xy.y += cal_settings.yoffset;
});
