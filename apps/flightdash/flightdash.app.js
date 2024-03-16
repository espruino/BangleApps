/*
 * Flight Dashboard - Bangle.js
 */

const COLOUR_BLACK         = 0x0000;   // same as: g.setColor(0, 0, 0)
const COLOUR_WHITE         = 0xffff;   // same as: g.setColor(1, 1, 1)
const COLOUR_GREEN         = 0x07e0;   // same as: g.setColor(0, 1, 0)
const COLOUR_YELLOW        = 0xffe0;   // same as: g.setColor(1, 1, 0)
const COLOUR_MAGENTA       = 0xf81f;   // same as: g.setColor(1, 0, 1)
const COLOUR_CYAN          = 0x07ff;   // same as: g.setColor(0, 1, 1)
const COLOUR_LIGHT_BLUE    = 0x841f;   // same as: g.setColor(0.5, 0.5, 1)

const APP_NAME = 'flightdash';

const horizontalCenter = g.getWidth() / 2;
//const verticalCenter = g.getHeight() / 2;

const dataFontHeight = 22;
const secondaryFontHeight = 18;
const labelFontHeight = 12;


//globals
var settings = {};

//var updateInterval;

var speed = '-'; var speedPrev = -1;
var track = '-'; var trackPrev = -1;
var lat = 0; var lon = 0;
var distance = '-'; var distancePrev = -1;
var bearing = '-'; var bearingPrev = -1;
var relativeBearing = 0; var relativeBearingPrev = -1;
var fromCardinal = '-';
var ETAdate = new Date();
var ETA = '-'; var ETAPrev = '';

var QNH = Math.round(Bangle.getOptions().seaLevelPressure); var QNHPrev = -1;

var altitude = '-'; var altitudePrev = -1;

var VSI = '-'; var VSIPrev = -1;
var VSIraw = 0;
var VSIprevTimestamp = Date.now();
var VSIprevAltitude;
var VSIsamples = 0; var VSIsamplesCount = 0;

var speedUnit = 'N/A';
var distanceUnit = 'N/A';
var altUnit = 'N/A';


// date object to time string in format (HH:MM[:SS])
function timeStr(date, seconds) {
  let timeStr = date.getHours().toString();
  if (timeStr.length == 1) timeStr = '0' + timeStr;
  let minutes = date.getMinutes().toString();
  if (minutes.length == 1) minutes = '0' + minutes;
  timeStr += ':' + minutes;
  if (seconds) {
    let seconds = date.getSeconds().toString();
    if (seconds.length == 1) seconds = '0' + seconds;
    timeStr += ':' + seconds;
  }
  return timeStr;
}

// add thousands separator to number
function addThousandSeparator(n) {
  let s = n.toString();
  if (s.length > 3) {
    return s.substr(0, s.length - 3) + ',' + s.substr(s.length - 3, 3);
  } else {
    return s;
  }
}


// update VSI
function updateVSI(alt) {
  VSIsamples += alt; VSIsamplesCount += 1;
  let VSInewTimestamp = Date.now();
  if (VSIprevTimestamp + 1000 <= VSInewTimestamp) {  // update VSI every 1 second
    let VSInewAltitude = VSIsamples / VSIsamplesCount;
    if (VSIprevAltitude) {
      let VSIinterval = (VSInewTimestamp - VSIprevTimestamp) / 1000;
      VSIraw = (VSInewAltitude - VSIprevAltitude) * 60 / VSIinterval;   // extrapolate to change / minute
    }
    VSIprevTimestamp = VSInewTimestamp;
    VSIprevAltitude = VSInewAltitude;
    VSIsamples = 0; VSIsamplesCount = 0;
  }

  VSI = Math.floor(VSIraw / 10) * 10; // "smooth" VSI value
  if (settings.altimeterUnits == 0) {         // Feet
    VSI = Math.round(VSI * 3.28084);
  } // nothing else required since VSI is already in meters ("smoothed")

  if (VSI > 9999) VSI = 9999;
  else if (VSI < -9999) VSI = -9999;
}

// update GPS-derived information
function updateGPS(fix) {
  if (!('fix' in fix) || fix.fix == 0 || fix.satellites < 4) return;

  speed = 'N/A';
  if (settings.speedUnits == 0) {         // Knots
    speed = Math.round(fix.speed * 0.539957);
  } else if (settings.speedUnits == 1) {  // km/h
    speed = Math.round(fix.speed);
  } else if (settings.speedUnits == 2) {  // MPH
    speed = Math.round(fix.speed * 0.621371);
  }
  if (speed > 9999) speed = 9999;

  if (! settings.useBaro) {    // use GPS altitude
    altitude = 'N/A';
    if (settings.altimeterUnits == 0) {         // Feet
      altitude = Math.round(fix.alt * 3.28084);
    } else if (settings.altimeterUnits == 1) {  // Meters
      altitude = Math.round(fix.alt);
    }
    if (altitude > 99999) altitude = 99999;

    updateVSI(fix.alt);
  }

  track = Math.round(fix.course);
  if (isNaN(track)) track = '-';
  else if (track < 10) track = '00'+track;
  else if (track < 100) track = '0'+track;

  lat = fix.lat;
  lon = fix.lon;

  // calculation from https://www.movable-type.co.uk/scripts/latlong.html
  const latRad1 = lat * Math.PI/180;
  const latRad2 = settings.destLat * Math.PI/180;
  const lonRad1 = lon * Math.PI/180;
  const lonRad2 = settings.destLon * Math.PI/180;

  // distance (using "Equirectangular approximation")
  let x = (lonRad2 - lonRad1) * Math.cos((latRad1 + latRad2) / 2);
  let y = (latRad2 - latRad1);
  let distanceNumber = Math.sqrt(x*x + y*y) * 6371;    // in km - 6371 = mean Earth radius
  if (settings.speedUnits == 0) {         // NM
    distanceNumber = distanceNumber * 0.539957;
  } else if (settings.speedUnits == 2) {  // miles
    distanceNumber = distanceNumber * 0.621371;
  }
  if (distanceNumber > 99.9) {
    distance = '>100';
  } else {
    distance = (Math.round(distanceNumber * 10) / 10).toString();
    if (! distance.includes('.'))
      distance += '.0';
  }

  // bearing
  y = Math.sin(lonRad2 - lonRad1) * Math.cos(latRad2);
  x = Math.cos(latRad1) * Math.sin(latRad2) -
        Math.sin(latRad1) * Math.cos(latRad2) * Math.cos(lonRad2 - lonRad1);
  let nonNormalisedBearing = Math.atan2(y, x);
  bearing = Math.round((nonNormalisedBearing * 180 / Math.PI + 360) % 360);

  if (bearing > 337 || bearing < 23) {
    fromCardinal = 'S';
  } else if (bearing < 68) {
    fromCardinal = 'SW';
  } else if (bearing < 113) {
    fromCardinal = 'W';
  } else if (bearing < 158) {
    fromCardinal = 'NW';
  } else if (bearing < 203) {
    fromCardinal = 'N';
  } else if (bearing < 248) {
    fromCardinal = 'NE';
  } else if (bearing < 293) {
    fromCardinal = 'E';
  } else{
    fromCardinal = 'SE';
  }

  if (bearing < 10) bearing = '00'+bearing;
  else if (bearing < 100) bearing = '0'+bearing;

  relativeBearing = parseInt(bearing) - parseInt(track);
  if (isNaN(relativeBearing)) relativeBearing = 0;
  if (relativeBearing > 180) relativeBearing -= 360;
  else if (relativeBearing < -180) relativeBearing += 360;

  // ETA
  if (speed) {
    let ETE = distanceNumber * 3600 / speed;
    let now = new Date();
    ETAdate = new Date(now + (now.getTimezoneOffset() * 1000 * 60) + ETE*1000);
    if (ETE < 86400) {
      ETA = timeStr(ETAdate, false);
    } else {
      ETA = '>24h';
    }
  } else {
    ETAdate = new Date();
    ETA = '-';
  }
}


// update barometric information
function updatePressure(e) {
  altitude = 'N/A';
  if (settings.altimeterUnits == 0) {         // Feet
    altitude = Math.round(e.altitude * 3.28084);
  } else if (settings.altimeterUnits == 1) {  // Meters
    altitude = Math.round(e.altitude);         // altitude is given in meters
  }
  if (altitude > 99999) altitude = 99999;

  updateVSI(e.altitude);
}


// (re-)draw all read-outs
function draw(initial) {

  g.setBgColor(COLOUR_BLACK);

  // speed
  if (speed != speedPrev || initial) {
    g.setFontAlign(-1, -1).setFont("Vector", dataFontHeight).setColor(COLOUR_GREEN);
    g.clearRect(0, 0, 55, dataFontHeight);
    g.drawString(speed.toString(), 0, 0, false);
    if (initial) {
      g.setFontAlign(-1, -1).setFont("Vector", labelFontHeight).setColor(COLOUR_CYAN);
      g.drawString(speedUnit, 0, dataFontHeight, false);
    }
    speedPrev = speed;
  }


  // distance
  if (distance != distancePrev || initial) {
    g.setFontAlign(1, -1).setFont("Vector", dataFontHeight).setColor(COLOUR_WHITE);
    g.clearRect(g.getWidth() - 58, 0, g.getWidth(), dataFontHeight);
    g.drawString(distance, g.getWidth(), 0, false);
    if (initial) {
      g.setFontAlign(1, -1).setFont("Vector", labelFontHeight).setColor(COLOUR_CYAN);
      g.drawString(distanceUnit, g.getWidth(), dataFontHeight, false);
    }
    distancePrev = distance;
  }


  // track (+ static track/bearing content)
  let trackY = 18;
  let destInfoY = trackY + 53;
  if (track != trackPrev || initial) {
    g.setFontAlign(0, -1).setFont("Vector", dataFontHeight).setColor(COLOUR_WHITE);
    g.clearRect(horizontalCenter - 29, trackY, horizontalCenter + 28, trackY + dataFontHeight);
    g.drawString(track.toString() + "\xB0", horizontalCenter + 3, trackY, false);
    if (initial) {
      let y = trackY + dataFontHeight + 1;
      g.setColor(COLOUR_YELLOW);
      g.drawRect(horizontalCenter - 30, trackY - 3, horizontalCenter + 29, y);
      g.drawLine(0, y, g.getWidth(), y);
      y += dataFontHeight + 5;
      g.drawLine(0, y, g.getWidth(), y);

      g.setFontAlign(1, -1).setFont("Vector", secondaryFontHeight).setColor(COLOUR_MAGENTA);
      g.drawString(settings.destID, horizontalCenter, destInfoY, false);
    }
    trackPrev = track;
  }


  // bearing
  if (bearing != bearingPrev || relativeBearing != relativeBearingPrev || initial) {
    let bearingY = trackY + 27;

    g.clearRect(0, bearingY, g.getWidth(), bearingY + dataFontHeight);

    g.setColor(COLOUR_YELLOW);
    for (let i = Math.floor(relativeBearing * 2.5) % 25; i <= g.getWidth(); i += 25) {
      g.drawLine(i, bearingY + 3, i, bearingY + 16);
    }

    let bearingX = horizontalCenter + relativeBearing * 2.5;
    if (bearingX > g.getWidth() - 26) bearingX = g.getWidth() - 26;
    else if (bearingX < 26) bearingX = 26;
    g.setFontAlign(0, -1).setFont("Vector", dataFontHeight).setColor(COLOUR_MAGENTA);
    g.drawString(bearing.toString() + "\xB0", bearingX + 3, bearingY, false);

    g.clearRect(horizontalCenter + 42, destInfoY, horizontalCenter + 69, destInfoY + secondaryFontHeight);
    g.setFontAlign(-1, -1).setFont("Vector", secondaryFontHeight).setColor(COLOUR_MAGENTA);
    g.drawString(fromCardinal, horizontalCenter + 42, destInfoY, false);
    if (initial) {
      g.setFontAlign(-1, -1).setFont("Vector", labelFontHeight).setColor(COLOUR_CYAN);
      g.drawString(' from', horizontalCenter, destInfoY, false);
    }

    bearingPrev = bearing;
    relativeBearingPrev = relativeBearing;
  }


  let row3y = g.getHeight() - 48;

  // QNH
  if (settings.useBaro) {
    if (QNH != QNHPrev || initial) {
      let QNHy = row3y - secondaryFontHeight - 2;
      g.setFontAlign(0, 1).setFont("Vector", secondaryFontHeight).setColor(COLOUR_WHITE);
      g.clearRect(horizontalCenter - 29, QNHy - secondaryFontHeight, horizontalCenter + 22, QNHy);
      g.drawString(QNH.toString(), horizontalCenter - 3, QNHy, false);
      if (initial) {
        g.setFontAlign(0, -1).setFont("Vector", labelFontHeight).setColor(COLOUR_CYAN);
        g.drawString('QNH', horizontalCenter - 3, QNHy, false);
      }
      QNHPrev = QNH;
    }
  }


  // VSI
  if (VSI != VSIPrev || initial) {
    g.setFontAlign(-1, 1).setFont("Vector", secondaryFontHeight).setColor(COLOUR_WHITE);
    g.clearRect(0, row3y - secondaryFontHeight, 51, row3y);
    g.drawString(VSI.toString(), 0, row3y, false);
    if (initial) {
      g.setFontAlign(-1, 1).setFont("Vector", labelFontHeight).setColor(COLOUR_CYAN);
      g.drawString(altUnit + '/min', 0, row3y - secondaryFontHeight, false);
    }

    let VSIarrowX = 6;
    let VSIarrowY = row3y - 42;
    g.clearRect(VSIarrowX - 7, VSIarrowY - 10, VSIarrowX + 6, VSIarrowY + 10);
    g.setColor(COLOUR_WHITE);
    if (VSIraw > 30) {          // climbing
      g.fillRect(VSIarrowX - 1, VSIarrowY, VSIarrowX + 1, VSIarrowY + 10);
      g.fillPoly([ VSIarrowX    , VSIarrowY - 11,
                   VSIarrowX + 7, VSIarrowY,
                   VSIarrowX - 7, VSIarrowY]);
    } else if (VSIraw < -30) {    // descending
      g.fillRect(VSIarrowX - 1, VSIarrowY - 10, VSIarrowX + 1, VSIarrowY);
      g.fillPoly([ VSIarrowX    , VSIarrowY + 11,
                   VSIarrowX + 7, VSIarrowY,
                   VSIarrowX - 7, VSIarrowY ]);
    }
  }


  // altitude
  if (altitude != altitudePrev || initial) {
    g.setFontAlign(1, 1).setFont("Vector", secondaryFontHeight).setColor(COLOUR_WHITE);
    g.clearRect(g.getWidth() - 65, row3y - secondaryFontHeight, g.getWidth(), row3y);
    g.drawString(addThousandSeparator(altitude), g.getWidth(), row3y, false);
    if (initial) {
      g.setFontAlign(1, 1).setFont("Vector", labelFontHeight).setColor(COLOUR_CYAN);
      g.drawString(altUnit, g.getWidth(), row3y - secondaryFontHeight, false);
    }
    altitudePrev = altitude;
  }


  // time
  let now = new Date();
  let nowUTC = new Date(now + (now.getTimezoneOffset() * 1000 * 60));
  g.setFontAlign(-1, 1).setFont("Vector", dataFontHeight).setColor(COLOUR_LIGHT_BLUE);
  let timeStrMetrics = g.stringMetrics(timeStr(now, false));
  g.drawString(timeStr(now, false), 0, g.getHeight(), true);

  let seconds = now.getSeconds().toString();
  if (seconds.length == 1) seconds = '0' + seconds;
  g.setFontAlign(-1, 1).setFont("Vector", secondaryFontHeight);
  g.drawString(seconds, timeStrMetrics.width + 2, g.getHeight() - 1, true);

  if (initial) {
    g.setFontAlign(-1, 1).setFont("Vector", labelFontHeight).setColor(COLOUR_CYAN);
    g.drawString('LOCAL', 0, g.getHeight() - dataFontHeight, false);
  }


  // ETE
  let ETEy = g.getHeight() - dataFontHeight;
  let ETE = '-';
  if (ETA != '-') {
    let ETEseconds = Math.floor((ETAdate - nowUTC) / 1000);
    if (ETEseconds < 0) ETEseconds = 0;
    ETE = ETEseconds % 60;
    if (ETE < 10) ETE = '0' + ETE;
    ETE = Math.floor(ETEseconds / 60) + ':' + ETE;
    if (ETE.length > 6) ETE = '>999m';
  }
  g.clearRect(horizontalCenter - 35, ETEy - secondaryFontHeight, horizontalCenter + 29, ETEy);
  g.setFontAlign(0, 1).setFont("Vector", secondaryFontHeight).setColor(COLOUR_WHITE);
  g.drawString(ETE, horizontalCenter - 3, ETEy, false);
  if (initial) {
    g.setFontAlign(0, 1).setFont("Vector", labelFontHeight).setColor(COLOUR_CYAN);
    g.drawString('ETE', horizontalCenter - 3, ETEy - secondaryFontHeight, false);
  }


  // ETA
  if (ETA != ETAPrev || initial) {
    g.clearRect(g.getWidth() - 63, g.getHeight() - dataFontHeight, g.getWidth(), g.getHeight());
    g.setFontAlign(1, 1).setFont("Vector", dataFontHeight).setColor(COLOUR_WHITE);
    g.drawString(ETA, g.getWidth(), g.getHeight(), false);
    if (initial) {
      g.setFontAlign(1, 1).setFont("Vector", labelFontHeight).setColor(COLOUR_CYAN);
      g.drawString('UTC ETA', g.getWidth(), g.getHeight() - dataFontHeight, false);
    }
    ETAPrev = ETA;
  }
}


function handleSwipes(directionLR, directionUD) {
  if (directionUD == -1) {          // up -> increase QNH
    QNH = Math.round(Bangle.getOptions().seaLevelPressure);
    QNH++;
    Bangle.setOptions({'seaLevelPressure': QNH});
  } else if (directionUD == 1) {    // down -> decrease QNH
    QNH = Math.round(Bangle.getOptions().seaLevelPressure);
    QNH--;
    Bangle.setOptions({'seaLevelPressure': QNH});
  }
}

function handleTouch(button, xy) {
  if ('handled' in xy && xy.handled) return;
  Bangle.removeListener('touch', handleTouch);
  if (settings.useBaro) {
    Bangle.removeListener('swipe', handleSwipes);
  }

  // any touch -> show settings
  clearInterval(updateTimeInterval);
  Bangle.setGPSPower(false, APP_NAME);
  if (settings.useBaro)
    Bangle.setBarometerPower(false, APP_NAME);

  eval(require("Storage").read(APP_NAME+'.settings.js'))( () => {
    E.showMenu();
    // "clear" values potentially affected by a settings change
    speed = '-'; distance = '-';
    altitude = '-'; VSI = '-';
    // re-launch
    start();
  });
}


/*
 * main
 */
function start() {

  // read in the settings
  settings = Object.assign({
    useBaro: false,
    speedUnits: 0,      // KTS
    altimeterUnits: 0,  // FT
    destID: 'KOSH',
    destLat: 43.9844,
    destLon: -88.5570,
  }, require('Storage').readJSON(APP_NAME+'.json', true) || {});

  // set units
  if (settings.speedUnits == 0) {         // Knots
    speedUnit = 'KTS';
    distanceUnit = 'NM';
  } else if (settings.speedUnits == 1) {  // km/h
    speedUnit = 'KPH';
    distanceUnit = 'KM';
  } else if (settings.speedUnits == 2) {  // MPH
    speedUnit = 'MPH';
    distanceUnit = 'SM';
  }

  if (settings.altimeterUnits == 0) {         // Feet
    altUnit = 'FT';
  } else if (settings.altimeterUnits == 1) {  // Meters
    altUnit = 'M';
  }

  // initialise
  g.reset();
  g.setBgColor(COLOUR_BLACK);
  g.clear();

  // draw incl. static components
  draw(true);

  // enable timeout/interval and sensors
  setTimeout(function() {
    draw();
    updateTimeInterval = setInterval(draw, 1000);
  }, 1000 - (Date.now() % 1000));

  Bangle.setGPSPower(true, APP_NAME);
  Bangle.on('GPS', updateGPS);

  if (settings.useBaro) {
    Bangle.setBarometerPower(true, APP_NAME);
    Bangle.on('pressure', updatePressure);
  }

  // handle interaction
  if (settings.useBaro) {
    Bangle.on('swipe', handleSwipes);
  }
  Bangle.on('touch', handleTouch);
  setWatch(e => { Bangle.showClock(); }, BTN1);   // exit on button press
}

start();


/*
// TMP for testing:
//settings.speedUnits = 1;
//settings.altimeterUnits = 1;
QNH = 1013;
updateGPS({"fix":1,"speed":228,"alt":3763,"course":329,"lat":36.0182,"lon":-75.6713});
updatePressure({"altitude":3700});
*/
