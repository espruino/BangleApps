/* jshint esversion: 6 */
{
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

  let barW = 0, prevX = 0;
  const renderBar = function (l) {
    "ram";
    if (l) prevX = 0; // called from Layout: drawing area was cleared
    else l = clock.layout.bar;
    let x2 = l.x+barW;
    if (clock.powerSave && Bangle.isLocked()) x2 = 0; // hide bar
    if (x2===prevX) return; // nothing to do
    if (x2===0) x2--; // don't leave 1px line
    if (x2<Math.max(0, prevX)) g.setBgColor(l.bgCol || g.theme.bg).clearRect(x2+1, l.y, prevX, l.y2);
    else g.setColor(l.col || g.theme.fg).fillRect(prevX+1, l.y, x2, l.y2);
    prevX = x2;
  }

  const timeText = function(date) {
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
  const ampmText = date => (clock.is12Hour && locale.hasMeridian) ? locale.meridian(date) : "";
  const dateText = date => {
    const dayName = locale.dow(date, true),
      month = locale.month(date, true),
      day = date.getDate();
    const dayMonth = locale.dayFirst ? `${day} ${month}` : `${month} ${day}`;
    return `${dayName}  ${dayMonth}`;
  };

  const ClockFace = require("ClockFace"),
    clock = new ClockFace({
      precision: 1,
      settingsFile: "barclock.settings.json",
      init: function() {
        const Layout = require("Layout");
        this.layout = new Layout({
          type: "v", c: [
            {
              type: "h", c: [
                {id: "time", label: "88:88", type: "txt", font: "6x8:5", col: g.theme.fg, bgCol: g.theme.bg}, // updated below
                {id: "ampm", label: "  ", type: "txt", font: "6x8:2", col: g.theme.fg, bgCol: g.theme.bg},
              ],
            },
            {id: "bar", type: "custom", fillx: 1, height: 6, col: g.theme.fg2, render: renderBar},
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
        let bar = this.layout.bar;
        bar.height = thickness+1;
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
        bar.y2 = bar.y+bar.height-1;
      },
      update: function(date, c) {
        "ram";
        if (c.m) this.layout.time.label = timeText(date);
        if (c.h) this.layout.ampm.label = ampmText(date);
        if (c.d && this.showDate) this.layout.date.label = dateText(date);
        if (c.m) this.layout.render();
        if (c.s) {
          barW = Math.round(date.getSeconds()/60*this.layout.bar.w);
          renderBar();
        }
      },
      resume: function() {
        prevX = 0; // force redraw of bar
        this.layout.forgetLazyState();
      },
      remove: function() {
        if (this.onLock) Bangle.removeListener("lock", this.onLock);
      },
    });

  // power saving: only update once a minute while locked, hide bar
  if (clock.powerSave) {
    clock.onLock = lock => {
      clock.precision = lock ? 60 : 1;
      clock.tick();
      renderBar(); // hide/redraw bar right away
    }
    Bangle.on("lock", clock.onLock);
  }

  clock.start();
}