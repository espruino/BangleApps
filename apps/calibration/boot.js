let cal_settings = require('Storage').readJSON("calibration.json", true) || {active: false};
Bangle.on('touch', function(button, xy) {
  // do nothing if the calibration is deactivated
  if (cal_settings.active === false || Bangle.disableCalibration) return;

  // reload the calibration offset at each touch event /!\ bad for the flash memory
  if (cal_settings.reload === true) {
    cal_settings = require('Storage').readJSON("calibration.json", true);
  }

  // apply the calibration offset
  xy.x = E.clip(Math.round((xy.x + (cal_settings.xoffset || 0)) * (cal_settings.xscale || 1)),0,g.getWidth());
  xy.y = E.clip(Math.round((xy.y + (cal_settings.yoffset || 0)) * (cal_settings.yscale || 1)),0,g.getHeight());
});
