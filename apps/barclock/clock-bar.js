/* jshint esversion: 6 */
/**
 * A simple digital clock showing seconds as a bar
 **/
// Check settings for what type our clock should be
const is12Hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"];
let locale = require("locale");
{ // add some more info to locale
  let date = new Date();
  date.setFullYear(1111);
  date.setMonth(1, 3); // februari: months are zero-indexed
  const localized = locale.date(date, true);
  locale.dayFirst = /3.*2/.test(localized);

  locale.hasMeridian = false;
  if (typeof locale.meridian==="function") {  // function does not exist if languages  app is not installed
    locale.hasMeridian = (locale.meridian(date)!=="");
  }
}
Bangle.loadWidgets();
function renderBar(l) {
  if (!this.fraction) {
    // zero-size fillRect stills draws one line of pixels, we don't want that
    return;
  }
  const width = this.fraction*l.w;
  g.fillRect(l.x, l.y, l.x+width-1, l.y+l.height-1);
}

const Layout = require("Layout");
const layout = new Layout({
  type: "v", c: [
    {
      type: "h", c: [
        {id: "time", label: "88:88", type: "txt", font: "6x8:5", bgCol: g.theme.bg}, // size updated below
        {id: "ampm", label: "  ", type: "txt", font: "6x8:2", bgCol: g.theme.bg},
      ],
    },
    {id: "bar", type: "custom", fraction: 0, fillx: 1, height: 6, col: g.theme.fg2, render: renderBar},
    {height: 40},
    {id: "date", type: "txt", font: "10%", valign: 1},
  ],
}, {lazy: true});
// adjustments based on screen size and whether we display am/pm
let thickness; // bar thickness, same as time font "pixel block" size
if (is12Hour) {
  // Maximum font size = (<screen width> - <ampm: 2chars * (2*6)px>) / (5chars * 6px)
  thickness = Math.floor((g.getWidth()-24)/(5*6));
} else {
  layout.ampm.label = "";
  thickness = Math.floor(g.getWidth()/(5*6));
}
layout.bar.height = thickness+1;
layout.time.font = "6x8:"+thickness;
layout.update();

function timeText(date) {
  if (!is12Hour) {
    return locale.time(date, true);
  }
  const date12 = new Date(date.getTime());
  const hours = date12.getHours();
  if (hours===0) {
    date12.setHours(12);
  } else if (hours>12) {
    date12.setHours(hours-12);
  }
  return locale.time(date12, true);
}
function ampmText(date) {
  return (is12Hour && locale.hasMeridian)? locale.meridian(date) : "";
}
function dateText(date) {
  const dayName = locale.dow(date, true),
    month = locale.month(date, true),
    day = date.getDate();
  const dayMonth = locale.dayFirst ? `${day} ${month}` : `${month} ${day}`;
  return `${dayName}  ${dayMonth}`;
}

draw = function draw(force) {
  if (!Bangle.isLCDOn()) {return;} // no drawing, also no new update scheduled
  const date = new Date();
  layout.time.label = timeText(date);
  layout.ampm.label = ampmText(date);
  layout.date.label = dateText(date);
  const SECONDS_PER_MINUTE = 60;
  layout.bar.fraction = date.getSeconds()/SECONDS_PER_MINUTE;
  if (force) {
    Bangle.drawWidgets();
    layout.forgetLazyState();
  }
  layout.render();
  // schedule update at start of next second
  const millis = date.getMilliseconds();
  setTimeout(draw, 1000-millis);
};

// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.on("lcdPower", function(on) {
  if (on) {
    draw(true);
  }
});
g.reset().clear();
Bangle.drawWidgets();
draw();
