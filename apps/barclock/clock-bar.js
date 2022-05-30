/* jshint esversion: 6 */
/**
 * A simple digital clock showing seconds as a bar
 **/
// Check settings for what type our clock should be
let locale = require("locale");
{ // add some more info to locale
  let date = new Date();
  date.setFullYear(1111);
  date.setMonth(1, 3); // februari: months are zero-indexed
  const localized = locale.date(date, true);
  locale.dayFirst = /3.*2/.test(localized);
  locale.hasMeridian = (locale.meridian(date)!=="");
}

function renderBar(l) {
  if (!this.fraction) {
    // zero-size fillRect stills draws one line of pixels, we don't want that
    return;
  }
  const width = this.fraction*l.w;
  g.fillRect(l.x, l.y, l.x+width-1, l.y+l.height-1);
}


function timeText(date) {
  if (!clock.is12Hour) {
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
  return (clock.is12Hour && locale.hasMeridian) ? locale.meridian(date) : "";
}
function dateText(date) {
  const dayName = locale.dow(date, true),
    month = locale.month(date, true),
    day = date.getDate();
  const dayMonth = locale.dayFirst ? `${day} ${month}` : `${month} ${day}`;
  return `${dayName}  ${dayMonth}`;
}


const ClockFace = require("ClockFace"),
  clock = new ClockFace({
    precision:1,
    settingsFile:'barclock.settings.json',
    init: function() {
      const Layout = require("Layout");
      this.layout = new Layout({
        type: "v", c: [
          {
            type: "h", c: [
              {id: "time", label: "88:88", type: "txt", font: "6x8:5", col:g.theme.fg, bgCol: g.theme.bg}, // updated below
              {id: "ampm", label: "  ", type: "txt", font: "6x8:2", col:g.theme.fg, bgCol: g.theme.bg},
            ],
          },
          {id: "bar", type: "custom", fraction: 0, fillx: 1, height: 6, col: g.theme.fg2, render: renderBar},
          this.showDate ? {height: 40} : {},
          this.showDate ? {id: "date", type: "txt", font: "10%", valign: 1} : {},
        ],
      }, {lazy: true});
      // adjustments based on screen size and whether we display am/pm
      let thickness; // bar thickness, same as time font "pixel block" size
      if (this.is12Hour && locale.hasMeridian) {
        // Maximum font size = (<screen width> - <ampm: 2chars * (2*6)px>) / (5chars * 6px)
        thickness = Math.floor((Bangle.appRect.w-24)/(5*6));
      } else {
        this.layout.ampm.label = "";
        thickness = Math.floor(Bangle.appRect.w/(5*6));
      }
      this.layout.bar.height = thickness+1;
      if (this.font===1) { // vector
        const B2 = process.env.HWVERSION>1;
        if (this.is12Hour && locale.hasMeridian) {
          this.layout.time.font = "Vector:"+(B2 ? 50 : 60);
          this.layout.ampm.font = "Vector:"+(B2 ? 20 : 40);
        } else {
          this.layout.time.font = "Vector:"+(B2 ? 60 : 80);
        }
      } else {
        this.layout.time.font = "6x8:"+thickness;
      }
      this.layout.update();
    },
    update: function(date, c) {
      if (c.m) this.layout.time.label = timeText(date);
      if (c.h) this.layout.ampm.label = ampmText(date);
      if (c.d && this.showDate) this.layout.date.label = dateText(date);
      const SECONDS_PER_MINUTE = 60;
      if (c.s) this.layout.bar.fraction = date.getSeconds()/SECONDS_PER_MINUTE;
      this.layout.render();
    },
    resume: function() {
      this.layout.forgetLazyState();
    },
  });
clock.start();
