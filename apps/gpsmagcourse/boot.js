{
  const settings = Object.assign({
    speed: 6, // when lower then this use direction from compass
    compassSrc: 1, // [off, built-in, magnav]
    resetCompassOnPwr: true, // reset compass on power on
    tiltCompensation: true, // tilt compensation on built-in compass
  }, require("Storage").readJSON("gpsmagcourse.json", true) || {});
  const CALIBDATA = (settings.compassSrc === 2) ? require("Storage").readJSON("magnav.json",1) : undefined;

  // Check if magnav is installed
  try {
    require("magnav");
  } catch(err) {
    // not installed, adjust settings to work without magnav
    if (settings.compassSrc === 2) {
      settings.compassSrc = 1;
    }
    if (settings.tiltCompensation) {
      settings.tiltCompensation = false;
    }
  }
  if (settings.compassSrc === 2 && !CALIBDATA) {
    // No calibration for magnav, fallback to default compass
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

  if (settings.tiltCompensation) {
    const origGetCompass = Bangle.getCompass;
    Bangle.getCompass = function(argObj) {
      const mag = origGetCompass();
      if (!isNaN(mag.heading) && (argObj === undefined || !argObj.noTiltComp)) {
        const d = require("magnav").tiltfix(mag, Bangle.getAccel());
        mag.headingOrig = mag.heading;
        mag.heading = d;
      }
      return mag;
    };

    Bangle.on('mag', function(mag) {
      if (!isNaN(mag.heading)) {
        const d = require("magnav").tiltfix(mag, Bangle.getAccel());
        mag.headingOrig = mag.heading;
        mag.heading = d;
      }
    });
  } // if (settings.tiltCompensation)

  if (settings.compassSrc > 0) {
    const isFaceUp = (acc) => {
      return (acc.z<-6700/8192) && (acc.z>-9000/8192) && Math.abs(acc.x)<2048/8192 && Math.abs(acc.y)<2048/8192;
    };

    const changeGpsCourse = (gps) => {
      if (gps.speed < settings.speed) {
        if (settings.compassSrc === 1 && (settings.tiltCompensation || isFaceUp(Bangle.getAccel()))) { // Use uncompensated built-in compass heading only if face is up
          const heading = Bangle.getCompass().heading;
          if (!isNaN(heading)) {
            gps.courseOrig = gps.course;
            gps.course = Bangle.getCompass().heading;
          }
        } else if (settings.compassSrc === 2) { // magnav tilt correction with magnav calibration
          gps.courseOrig = gps.course;
          gps.course = require("magnav").tiltfixread(CALIBDATA.offset,CALIBDATA.scale);
        }
      }
      return gps;
    };

    // Modify GPS event
    Bangle.on('GPS', gps => {
      changeGpsCourse(gps);
    });
    const origGetGPSFix = Bangle.getGPSFix;
    Bangle.getGPSFix = function() {
      return changeGpsCourse(origGetGPSFix());
    };

    // Enable Compass with GPS
    const origSetGPSPower = Bangle.setGPSPower;
    Bangle.setGPSPower = function(on, id) {
      const isGPSon = origSetGPSPower(on, id);
      Bangle.setCompassPower(isGPSon, "gpsmagcourse");
      return isGPSon;
    };
  } // if (settings.compassSrc > 0)
}
