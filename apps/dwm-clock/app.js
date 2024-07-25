// daylight world map clock
// equirectangular projected map and approximated daylight graph

// load font for timezone, weekday and day in month
require("FontDennis8").add(Graphics);

const W = g.getWidth();
const H = g.getHeight();

const TZOFFSET = new Date().getTimezoneOffset();

const UTCSTRING = ((TZOFFSET > 0 ? "-" : "+")
                   + ("0" + Math.floor(Math.abs(TZOFFSET) / 60)).slice(-2))
                  + (TZOFFSET % 60 ? Math.abs(TZOFFSET) % 60 : "");

function getMap() {
  return {
    width: 176, height: 88, bpp: 1,
    transparent: 1,
    buffer: require("heatshrink").decompress(atob("/4A/AA0Av+Ag4UQwBhDn//1//8///AUI3MAhAUBgIQBh4LC/kfCg34rmAngVD/1/CYICBA4IAF8EOwF/+AVCAAXj//AA4PjDQIVDgkQj/4gBtEx+EGgXwCoJ8Bv+8geQgIVE4P/553Egf/nwFCgUE4H8gBqB/0AhLxHggFE+E8gJoBDIIAI5wFE4F8h/4v5FBABA2BAAUf7n+VYXgoAVNn/Dv+fCoPACo8MEQPHHAUf4DuB//58FgCgsHeoWfMgUDConw4AVFh/wXIRDDwBWC8jfBFY3xaAa5DYYXkKw8D+YVDHAcXAwKuIgIUDSIIJCsYVKeAIVHj5fGNogVHgN/AwPyEgPhCokZCo40D8E0wcwTYhsECoY0D8H2hEACocBCoqnCKwQVB/nICokJ+4VL/RGBQQkdw4VESQTwCDgIVBNgkeEQaSEQQReC4QrEhwUECoUECooAFVwoABgF+CoY+DAYZAFAAOgv4VGoFgCpXwGIoABkEHDQUvCo9zD4YVE4EIgIUGCoNnZwYVCiEP8E8hYVH/kHII0Qj/wvkP94WH4IVGhE/MQMH54VH+IVGKYIJBgfnCo/98IVFcYP5/9HMYbdGn7FFv/4/9vCpH/4DmC4AVCD4P/n4VKUoXgCwQ2Cz42CCpX//BtCCoMeCpJTBZgcAgYFCjElCpA7BEIQVBZoeYp4sICoIQCIIJzC/+Mp+DCpJSC/kAj4KC5/f4GfK5AVIeYPgNpIVEIIf/6f/v6ZHPwYVG//7V5BtDCoMOEof+jYVH8AVFhgLD/EZCo6UBCokYBYa2BCp04G4oVJNAX+gF4XYqDHCoKqCCoIrDAoL9DCowfCB4N9CorMDCooPEfowVMB4IVPeAQABwIVPeAQABw4LEg/ANo/wTAQAI8E//YVS+F//IIGGg4AFCo7OHAAf+v/jCowqM//HAwvhCpuPOwwVNAAwrOAA3xCqhtOAH4AfW4wAN/0/A4sP//AgFygYVH/V/AwlwgE8gAACDYIAF9ArC+uACAUgCocAHIn8k/gj4FBCgYAGBoXwgEYDof+ChMAJ4PmAwcBDgIUKgANBJIkZ/0cCpYrBIAIADzkwChQ5B/tgBAh7FNpANMAGg="))
  };
}

const YOFFSET = H - getMap().height;

// map offset in degree
// -180 to 180 / default: 0
function getLongitudeOffset() {
  return require("Storage").readJSON("dwm-clock.json", 1) || {"lon": 0};
}

function drawMap() {
  g.setBgColor(0, 0, 0);

  // does not flip on it's own, but there is a draw function after that does
  g.drawImages([{
    x: -lonOffset * W / 360,
    y: YOFFSET,
    image: getMap(),
    scale: 1,
    rotate: 0,
    center: false,
    repeat: true,
    nobounds: false
  }], {
    x: 0,
    y: YOFFSET,
    width: getMap().width,
    height: getMap().height
  });
}

function drawDaylightMap() {
  // number of xy points, < 40 looks very skewed around solstice
  const STEPS = 40;
  const YFACTOR = getMap().height / 2;
  const YOFF = H / 2 + YFACTOR;
  var graph = [];

  // progress of day, float 0 to 1
  var dayOffset = (now.getHours() + (now.getMinutes() + TZOFFSET) / 60) / 24;

  // sun position modifier
  var sunPosMod;

  var solarNoon = require("suncalc").getTimes(now, 0, 0, 0).solarNoon;

  var altitude = require("suncalc").getPosition(solarNoon, 0, 0).altitude;

  // this is trial and error. no thought went into this
  sunPosMod = Math.pow(altitude - 0.08, 8);

  // switch sign on equinox
  // this is an approximation
  if (require("suncalc").getPosition(solarNoon, 0, 0).azimuth < -1) {
    sunPosMod = -sunPosMod;
  }

  for (var x = 0; x < (STEPS + 1) / STEPS; x += 1 / STEPS) {
    // this is an approximation instead of projecting a circle onto a sphere
    // y = arctan(sin(x) * n)
    var y = Math.atan(Math.sin(2 * Math.PI * x + dayOffset * 2 * Math.PI
    //                user defined map offset         fixed offset
    //                               v                 v
                     + 2 * Math.PI * lonOffset / 360 - Math.PI / 2) * sunPosMod)
            * (2 / Math.PI);
    //        ^
    //       factor keeps y <= 1

    graph.push(x * W, y * YFACTOR + YOFF);
  }

  // day area, yellow
  g.setColor(0.8, 0.8, 0.3);
  g.fillRect(0, YOFFSET, W, H);

  // night area, blue
  g.setColor(0, 0, 0.5);
  // switch on equinox
  if (sunPosMod < 0) {
    g.fillPoly([0, H - 1].concat(graph, W - 1, H - 1));
  } else {
    g.fillPoly([0, YOFFSET].concat(graph, W, YOFFSET));
  }

  drawMap();

  // day-night line, white
  g.setColor(1, 1, 1);
  g.drawPoly(graph, false);
}

function drawClock() {
  // clock area
  g.clearRect(0, YOFFSET, W, 24);

  // clock text
  g.setColor(1, 1, 1);
  g.setFontAlign(0, -1);
  g.setFont("Vector", 58);
  // with the vector font this leaves 26px above the text
  g.drawString(require("locale").time(now, 1), W / 2, 24 - 2);


  // timezone text
  g.setFontAlign(-1, 1);
  g.setFont("6x8", 2);
  g.drawString("UTC" + UTCSTRING, 3, YOFFSET);


  // day text
  g.setFontAlign(1, 1);
  g.setFont("Dennis8", 2);
  g.drawString(require("locale").dow(now, 1) + " " + now.getDate(),
               W - 1, YOFFSET);
}

function renderScreen() {
  now = new Date();

  drawClock();
  drawDaylightMap();
}

function renderAndQueue() {
  /*timeoutID =*/ setTimeout(renderAndQueue, 60000 - (Date.now() % 60000));
  renderScreen();
}

g.reset().clearRect(Bangle.appRect);

Bangle.setUI("clock");

Bangle.loadWidgets();
Bangle.drawWidgets();

g.setBgColor(0, 0, 0);

var now = new Date();

// map offsets
var defLonOffset = getLongitudeOffset().lon;
var lonOffset = defLonOffset;

//var timeoutID;
var timeoutIDTouch;

Bangle.on('drag', function(touch) {

  if (timeoutIDTouch) {
    clearTimeout(timeoutIDTouch);
  }

  // return after not touching for 5 seconds
  timeoutIDTouch = setTimeout(renderAndQueue, 5 * 1000);

  // touch map
  if (touch.y >= YOFFSET) {
    lonOffset -= touch.dx * 360 / W;

    // wrap map offset
    if (lonOffset < -180) {
      lonOffset += 360;
    } else if (lonOffset >= 180) {
      lonOffset -= 360;
    }

    // snap to 0° longitude
    if (lonOffset > -5 && lonOffset < 5) {
      lonOffset = 0;
    }

    lonOffset = Math.round(lonOffset);

    // clock area
    g.clearRect(0, YOFFSET, W, 24);

    // text
    g.setColor(1, 1, 1);
    g.setFontAlign(0, -1);
    g.setFont("Dennis8", 2);
    // could not get ° (degree sign) to render
    g.drawString("select lon offset\n< tap: save\nreset: tap >\n"
                 + lonOffset + " degree", W / 2, 24);

    drawDaylightMap();

  // touch clock, left side, save offset
  } else if (touch.x < W / 2) {
    if (defLonOffset != lonOffset) {
      require("Storage").writeJSON("dwm-clock.json", {"lon": lonOffset});
      defLonOffset = lonOffset;
    }

    renderScreen();

  // touch clock, right side, reset offset
  } else {
    lonOffset = defLonOffset;
    renderScreen();
  }
});

renderAndQueue();
