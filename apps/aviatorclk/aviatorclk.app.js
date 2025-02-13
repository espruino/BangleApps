/*
 * Aviator Clock - Bangle.js
 *
 */

const COLOUR_DARK_GREY     = 0x4208;   // same as: g.setColor(0.25, 0.25, 0.25)
const COLOUR_GREY          = 0x8410;   // same as: g.setColor(0.5, 0.5, 0.5)
const COLOUR_LIGHT_GREY    = 0xc618;   // same as: g.setColor(0.75, 0.75, 0.75)
const COLOUR_RED           = 0xf800;   // same as: g.setColor(1, 0, 0)
const COLOUR_BLUE          = 0x001f;   // same as: g.setColor(0, 0, 1)
const COLOUR_YELLOW        = 0xffe0;   // same as: g.setColor(1, 1, 0)
const COLOUR_LIGHT_CYAN    = 0x87ff;   // same as: g.setColor(0.5, 1, 1)
const COLOUR_DARK_YELLOW   = 0x8400;   // same as: g.setColor(0.5, 0.5, 0)
const COLOUR_DARK_CYAN     = 0x0410;   // same as: g.setColor(0, 0.5, 0.5)
const COLOUR_ORANGE        = 0xfc00;   // same as: g.setColor(1, 0.5, 0)

const APP_NAME = 'aviatorclk';

const horizontalCenter = g.getWidth()/2;
const mainTimeHeight = 38;
const secondaryFontHeight = 22;
require("Font8x16").add(Graphics); // tertiary font
const dateColour = ( g.theme.dark ? COLOUR_YELLOW : COLOUR_BLUE );
const UTCColour = ( g.theme.dark ? COLOUR_LIGHT_CYAN : COLOUR_DARK_CYAN );
const separatorColour = ( g.theme.dark ? COLOUR_LIGHT_GREY : COLOUR_DARK_GREY );

const avwx = require('avwx');


// read in the settings
var settings = Object.assign({
  showSeconds: true,
  invertScrolling: false,
}, require('Storage').readJSON(APP_NAME+'.json', true) || {});


// globals
var drawTimeout;
var secondsInterval;
var avwxTimeout;
var gpsTimeout;

var AVWXrequest;
var METAR = '';
var METARlinesCount = 0;
var METARscollLines = 0;
var METARts;



// date object to time string in format HH:MM[:SS]
// (with a leading 0 for hours if required, unlike the "locale" time() function)
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


// draw the METAR info
function drawAVWX() {
  let now = new Date();
  let METARage = 0;  // in minutes
  if (METARts) {
    METARage = Math.floor((now - METARts) / 60000);
  }

  g.setBgColor(g.theme.bg);

  let y = Bangle.appRect.y + mainTimeHeight + secondaryFontHeight + 4;
  g.clearRect(0, y, g.getWidth(), y + (secondaryFontHeight * 4));

  g.setFontAlign(0, -1).setFont("Vector", secondaryFontHeight);
  if (METARage > 90) {    // older than 1.5h
    g.setColor(COLOUR_RED);
  } else if (METARage > 60) {    // older than 1h
    g.setColor( g.theme.dark ? COLOUR_ORANGE : COLOUR_DARK_YELLOW );
  } else {
    g.setColor(g.theme.fg);
  }
  let METARlines = g.wrapString(METAR, g.getWidth());
  METARlinesCount = METARlines.length;
  METARlines.splice(0, METARscollLines);
  g.drawString(METARlines.join("\n"), horizontalCenter, y, true);

  if (! avwxTimeout) { avwxTimeout = setTimeout(updateAVWX, 5 * 60000); }
}

// show AVWX update status
function showUpdateAVWXstatus(status) {
  let y = Bangle.appRect.y + 10;
  g.setBgColor(g.theme.bg);
  g.clearRect(0, y, horizontalCenter - 54, y + 16);
  if (status) {
    g.setFontAlign(0, -1).setFont("8x16").setColor( g.theme.dark ? COLOUR_ORANGE : COLOUR_DARK_YELLOW );
    g.drawString(status, horizontalCenter - 71, y, true);
  }
}

// re-try if the GPS doesn't return a fix in time
function GPStookTooLong() {
  Bangle.setGPSPower(false, APP_NAME);
  if (gpsTimeout) clearTimeout(gpsTimeout);
  gpsTimeout = undefined;

  showUpdateAVWXstatus('X');

  if (! avwxTimeout) { avwxTimeout = setTimeout(updateAVWX, 5 * 60000); }
}

// update the METAR info
function updateAVWX() {
  if (avwxTimeout) clearTimeout(avwxTimeout);
  avwxTimeout = undefined;
  if (gpsTimeout) clearTimeout(gpsTimeout);
  gpsTimeout = undefined;

  if (! NRF.getSecurityStatus().connected) {
    // if Bluetooth is NOT connected, try again in 5min
    showUpdateAVWXstatus('X');
    avwxTimeout = setTimeout(updateAVWX, 5 * 60000);
    return;
  }

  showUpdateAVWXstatus('GPS');
  if (! METAR) {
    METAR = '\nUpdating METAR';
    METARlinesCount = 0; METARscollLines = 0;
    METARts = undefined;
  }
  drawAVWX();

  gpsTimeout = setTimeout(GPStookTooLong, 30 * 60000);
  Bangle.setGPSPower(true, APP_NAME);
  Bangle.on('GPS', fix => {
    // prevent multiple, simultaneous requests
    if (AVWXrequest) { return; }

    if ('fix' in fix && fix.fix != 0 && fix.satellites >= 4) {
      Bangle.setGPSPower(false, APP_NAME);
      if (gpsTimeout) clearTimeout(gpsTimeout);
      gpsTimeout = undefined;

      let lat = fix.lat;
      let lon = fix.lon;

      showUpdateAVWXstatus('AVWX');
      if (! METAR) {
        METAR = '\nUpdating METAR';
        METARlinesCount = 0; METARscollLines = 0;
        METARts = undefined;
      }
      drawAVWX();

      // get latest METAR from nearest airport (via AVWX API)
      AVWXrequest = avwx.request('metar/'+lat+','+lon, 'onfail=nearest', data => {
        if (avwxTimeout) clearTimeout(avwxTimeout);
        avwxTimeout = undefined;

        let METARjson = JSON.parse(data.resp);

        if ('sanitized' in METARjson) {
          METAR = METARjson.sanitized;
        } else {
          METAR = 'No "sanitized" METAR data found!';
        }
        METARlinesCount = 0; METARscollLines = 0;

        if ('time' in METARjson) {
          METARts = new Date(METARjson.time.dt);
          let now = new Date();
          let METARage = Math.floor((now - METARts) / 60000);  // in minutes
          if (METARage <= 30) {
            // some METARs update every 30 min -> attempt to update after METAR is 35min old
            avwxTimeout = setTimeout(updateAVWX, (35 - METARage) * 60000);
          } else if (METARage <= 60) {
            // otherwise, attempt METAR update after it's 65min old
            avwxTimeout = setTimeout(updateAVWX, (65 - METARage) * 60000);
          }
        } else {
          METARts = undefined;
        }

        showUpdateAVWXstatus('');
        drawAVWX();
        AVWXrequest = undefined;

      }, error => {
        // AVWX API request failed
        console.log(error);
        METAR = 'ERR: ' + error;
        METARlinesCount = 0; METARscollLines = 0;
        METARts = undefined;
        showUpdateAVWXstatus('');
        drawAVWX();
        AVWXrequest = undefined;
      });
    }
  });
}


// draw only the seconds part of the main clock
function drawSeconds() {
  let now = new Date();
  let seconds = now.getSeconds().toString();
  if (seconds.length == 1) seconds = '0' + seconds;
  let y = Bangle.appRect.y + mainTimeHeight - 3;
  g.setBgColor(g.theme.bg);
  g.setFontAlign(-1, 1).setFont("Vector", secondaryFontHeight).setColor(COLOUR_GREY);
  g.drawString(seconds, horizontalCenter + 54, y, true);
}

// sync seconds update
function syncSecondsUpdate() {
  drawSeconds();
  setTimeout(function() {
    drawSeconds();
    secondsInterval = setInterval(drawSeconds, 1000);
  }, 1000 - (Date.now() % 1000));
}

// set timeout for per-minute updates
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    if (METARts) {
      let now = new Date();
      let METARage = Math.floor((now - METARts) / 60000);
      if (METARage > 60) {
        // the METAR colour might have to be updated:
        drawAVWX();
      }
    }
    draw();
  }, 60000 - (Date.now() % 60000));
}

// draw top part of clock (main time, date and UTC)
function draw() {
  let now = new Date();
  let nowUTC = new Date(now + (now.getTimezoneOffset() * 1000 * 60));

  // prepare main clock area
  let y = Bangle.appRect.y;

  g.setBgColor(g.theme.bg);

  // main time display
  g.setFontAlign(0, -1).setFont("Vector", mainTimeHeight).setColor(g.theme.fg);
  g.drawString(timeStr(now, false), horizontalCenter, y, true);

  // prepare second line (UTC and date)
  y += mainTimeHeight;
  g.clearRect(0, y, g.getWidth(), y + secondaryFontHeight - 1);

  // weekday and day of the month
  g.setFontAlign(-1, -1).setFont("Vector", secondaryFontHeight).setColor(dateColour);
  g.drawString(require("locale").dow(now, 1).toUpperCase() + ' ' + now.getDate(), 0, y, false);

  // UTC
  g.setFontAlign(1, -1).setFont("Vector", secondaryFontHeight).setColor(UTCColour);
  g.drawString(timeStr(nowUTC, false) + "Z", g.getWidth(), y, false);

  queueDraw();
}


// initialise
g.clear(true);

// scroll METAR lines (either by touch or tap)
function scrollAVWX(action) {
  switch (action) {
    case -1:  // top touch/tap
      if (settings.invertScrolling) {
        if (METARscollLines > 0)
          METARscollLines--;
      } else {
        if (METARscollLines < METARlinesCount - 4)
          METARscollLines++;
      }
      break;
    case 1:   // bottom touch/tap
      if (settings.invertScrolling) {
        if (METARscollLines < METARlinesCount - 4)
          METARscollLines++;
      } else {
        if (METARscollLines > 0)
          METARscollLines--;
      }
      break;
    default:
      // ignore other actions
  }
  drawAVWX();
}

Bangle.on('tap', data => {
  switch (data.dir) {
    case 'top':
      scrollAVWX(-1);
      break;
    case 'bottom':
      scrollAVWX(1);
      break;
    case 'front':
      // toggle seconds display on double tap on front/watch-face
      // (if watch is un-locked)
      if (data.double && ! Bangle.isLocked()) {
        if (settings.showSeconds) {
          clearInterval(secondsInterval);
          let y = Bangle.appRect.y + mainTimeHeight - 3;
          g.clearRect(horizontalCenter + 54, y - secondaryFontHeight, g.getWidth(), y);
          settings.showSeconds = false;
        } else {
          settings.showSeconds = true;
          syncSecondsUpdate();
        }
      }
      break;
    default:
      // ignore other taps
  }
});

Bangle.setUI("clockupdown", scrollAVWX);

// load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// draw static separator line
let y = Bangle.appRect.y + mainTimeHeight + secondaryFontHeight;
g.setColor(separatorColour);
g.drawLine(0, y, g.getWidth(), y);

// draw times and request METAR
draw();
if (settings.showSeconds)
  syncSecondsUpdate();
updateAVWX();


// TMP for debugging:
//METAR = 'YAAA 011100Z 21014KT CAVOK 23/08 Q1018 RMK RF000/0000'; drawAVWX();
//METAR = 'YAAA 150900Z 14012KT 9999 SCT045 BKN064 26/14 Q1012 RMK RF000/0000 DL-W/DL-NW'; drawAVWX();
//METAR = 'YAAA 020030Z VRB CAVOK'; drawAVWX();
//METARts = new Date(Date.now() - 61 * 60000);   // 61 to trigger warning, 91 to trigger alert

