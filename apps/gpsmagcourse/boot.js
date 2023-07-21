{
  const settings = Object.assign({
    speed: 6, // when lower then this use direction from compass
    compassSrc: 2, // [off, built-in, magnav]
    resetCompassOnPwr: true, // reset compass on power on
  }, require("Storage").readJSON("gpsmagcourse.json", true) || {});
  const CALIBDATA = (settings.compassSrc === 2) ? require("Storage").readJSON("magnav.json",1) : undefined;
  let cntAboveSpeed = 0;
  let lastGPS;

  // Check if magnav is installed
  try {
    require("magnav");
  } catch(err) {
    // not installed, adjust settings to work without magnav
    if (settings.compassSrc === 2) {
      settings.compassSrc = 1;
    }
  }
  if (settings.compassSrc === 2 && !CALIBDATA) {
    // No calibration for magnav, fallback to built-in compass
    settings.compassSrc = 1;
  }

  // execute Bangle.resetCompass() after Bangle.setCompassPower();
  if (settings.resetCompassOnPwr) {
    const origSetCompassPower = Bangle.setCompassPower;
      Bangle.setCompassPower = function(on, id) {
        const isOn = origSetCompassPower(on, id);
        if (on) {
          Bangle.resetCompass();
        }
        return isOn;
    };
  } // if (settings.resetCompassOnPwr)

  if (settings.compassSrc > 0) {
    const isFaceUp = (acc) => {
      return (acc.z<-6700/8192) && (acc.z>-9000/8192) && Math.abs(acc.x)<2048/8192 && Math.abs(acc.y)<2048/8192;
    };

    const changeGpsCourse = (gps) => {
      cntAboveSpeed = gps.speed < settings.speed ? 0 : cntAboveSpeed+1;
      if (cntAboveSpeed < 10) { // need to stay x events above or equal threshold
        if (settings.compassSrc === 1 && isFaceUp(Bangle.getAccel())) { // Use built-in compass heading only if face is up
          const heading = Bangle.getCompass().heading;
          if (!isNaN(heading)) {
            gps.courseOrig = gps.course;
            gps.course = Bangle.getCompass().heading;
          }
        } else if (settings.compassSrc === 2) { // magnav
          gps.courseOrig = gps.course;
          gps.course = require("magnav").tiltfixread(CALIBDATA.offset,CALIBDATA.scale);
        }
      }
      return gps;
    };

    // Modify GPS event
    Bangle.on('GPS', gps => {
      lastGPS = gps;
      if (!isNaN(gps.course)) {
        changeGpsCourse(gps);
      }
    });
    const origGetGPSFix = Bangle.getGPSFix;
    Bangle.getGPSFix = function() {
      return lastGPS === undefined ? origGetGPSFix() : lastGPS;
    };

    // Enable Compass with GPS
    const origSetGPSPower = Bangle.setGPSPower;
    Bangle.setGPSPower = function(on, id) {
      const isGPSon = origSetGPSPower(on, id);
      Bangle.setCompassPower(isGPSon, "gpsmagcourse" + (id || ''));
      return isGPSon;
    };
  } // if (settings.compassSrc > 0)
}
