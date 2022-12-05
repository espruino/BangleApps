/*** link modules ***/
var ClockFace = require("ClockFace");
var Locale = require("locale");
var TUdecodeTime = require("time_utils").decodeTime;
var DUdows = require("date_utils").dows;

/*** define global variables ***/
var triggerHandler = {}, modCache = {}, selection = {};

/*** storage functions ***/
function tileRect(tile) { return [
  {x: 1, y: 100, w: 55, h: 35, x2: 56, y2: 135},
  {x: 60, y: 100, w: 55, h: 35, x2: 115, y2: 135},
  {x: 119, y: 100, w: 55, h: 35, x2: 174, y2: 135},
  {x: 1, y: 139, w: 55, h: 35, x2: 56, y2: 174},
  {x: 60, y: 139, w: 55, h: 35, x2: 115, y2: 174},
  {x: 119, y: 139, w: 55, h: 35, x2: 174, y2: 174}
][tile]; }
function infoRect(full) { return [
  {x: 1, y: 139, w: 173, h: 35, x2: 174, y2: 174},
  {x: 1, y: 100, w: 173, h: 74, x2: 174, y2: 174}
][full ? 1 : 0]; }
function imgs(name) { return {
  steps:   {str: "IBCBAAAAAYAAAAPgAAAH8AAAD/gAfAf8AP4D/gD+AfwA/gH5AP4B8gH+A+Qf/gfIf/4/kP/+fyD//n5AAAAAgP/+fwA="},
  sunrise: {offset: -9, str: "GhCBAAAhAACIRAARIgBESIgIgEQBD8IED/wIx/+MC//0AP/8DH//jN//7Af/+AH//gN//7MP/8M="},
  sunset:  {str: "JxCBAAAAgAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIEAAAAAAAAAEAAAAAIiAAAABAQAAACD4IAAAJ/yAAAAf/AAAAH/8EAAM//mAAAP/+A=="},
  alarm0:  {str: "JCCBAABwAOAAHwAPgAfgAH4A/D/D8A+OBx8B84Ac+B7gAHeDyAABPDmAB9nDEcAEjAMEAIwAIIAQQAYQAgYAQcBAIAQAZ8IAQB4AIAQHEAIAQcCAIAYABAYAIAAgQAMAAQwAEAAIgAGB+BgADA8DAABgAGAAAwAMAAA+B8AABz/OAADgAHAAHAADgAOAABwAcAAA4A=="},
  alarm1:  {str: "EBCBAAGAY8ZH4s/zn/mf+R/4H/gf+B/4H/g//H/+AAADwAGA"},
  timer0:  {str: "JCCBAAVVVVYAaqqqoAKAABQAKAABQAKAABQAFAACgAFAACgAFAACgACgAFAACgAFAABQAKAAAoAUAAAUBoAAAKHQAAAFGgAAACtAAAACtAAAAFCgAAAKJQAAAUAoAAAoIUAABQAKAACg8FAACj/FAAFP/ygAF//+gAF//+gAL///QAL///QAL///QAVVVVYAaqqqoA=="},
  timer1:  {str: "EBCBAABAAOAAsAGYAQwBBgF/H/5w+MGAf4A/gB+ADwAHAAIA"},
  timeto:  {str: "EBCBAAfgDDIBhgBsABgAMABhAMEBgQABAAN4AkAGUAxcOAfg"},
  timeat:  {str: "EBCBAAfgHLgxDGEGQQLBE4EhwUGBg4ABwANAAmAGMAwdOAfg"}
}[name]; }
function updateOn(field) {
  var ret = "x";
  [ ["d", "sundown,sched"],
    ["h", ""],
    ["m", "steps"]
  ].some(a => {
    if (a[1].includes(field || 0)) ret = a[0];
  });
  return ret;
}

/*** helper functions ***/
function outerRect(r) {
  return {x: r.x-1, y: r.y-1, w: r.w+2, h: r.h+2, x2: r.x2+1, y2: r.y2+1};
}
function centerSpot(r) {
  return {x: r.x + r.w / 2, y: r.y + r.h / 2};
}
// define function to format ms as human-readable time
function getReadableTime(ms) {
  ms = TUdecodeTime(ms);
  return ms.h + ":" + ("0" + ms.m).substr(-2);
}

/*** get functions ***/
// define function to get a fields value and view object
function getField(field, time) {
  switch(field) {
    case "minute": {
      return {value: ("0" + time.getMinutes()).substr(-2)};
    }
    case "hour": {
      return {value: ((clock.leading0 ? "0" : " ") + (clock.is12Hour ?
        Locale.time(time).split(":")[0] : time.getHours()
      )).substr(-2) + ":"};
    }
    case "meridian": {
      return Locale.meridian(time);
    }
    case "date": { // short local date
      return {value: Locale.date(time, 1)};
    }
    case "dow": { // first 2 letters of the day of the week
      //return Locale.dow(time, 1).substr(0, 2);
      return {value: DUdows(0, 1)[time.getDay()]};
    }
    case "woy": { // week of the year
      var yf = new Date(time.getFullYear(), 0, 1);
      var dpy = Math.ceil((time - yf) / 86400000);
      var woy = (" " + Math.ceil((dpy + (yf.getDay() - 11) % 7 + 3) / 7)).slice(-2);
      return {value: (clock.woy || (/*LANG*/"Week").substr(0, 1)) + woy};
    }
    case "steps": { // steps of the day
      return {
        value: Bangle.getHealthStatus("day").steps,
        view: {type: "val_1stat_icon", img: "steps"}
      };
    }
    case "sunrise":
    case "sunset": { // time of sunrise/-set
      return {
        value: modCache.sundown ? modCache.sundown[field] : "\\ 'o' /",
        view: {type: "val_1stat_icon", img: field}
      };
    }
    case "alarm":
    case "timer": { // upcomming alarms and timers
      return {
        value: modCache.getSched ? modCache.getSched(field, time) : "\\ 'o' /",
        view: {type: "val_1-2dyn_icon", img1: field, img2: "time"}
      };
    }
    default: return {};
  }
}

/*** draw functions ***/
function drawFrame() {
  g.reset().setColor(clock.lineColor);
  g.drawRect(-1, 25, 176, 43);
  g.drawRect(-1, 98, 176, 137);
  g.drawRect(58, 98, 117, 176);
}
function drawDate(time) {
  var values = clock.dateLine.map(s => getField(s, time).value);
  g.reset().clearRect(1, 27, 174, 41).setFont12x20();
  g.setFontAlign(-1).drawString(values[0], 1, 36);
  g.setFontAlign(1).drawString(values[2], 176, 36);
  var v0x2 = 1 + g.stringWidth(values[0]);
  var v2x1 = 176 - g.stringWidth(values[2]);
  g.setFontAlign().drawString(values[1], (v0x2 + v2x1) / 2 + 1.4, 36);
}
function drawHour(time) {
  g.reset().clearRect(2, 46, 99, 95).setFont("Vector:66").setFontAlign(1);
  g.drawString(getField("hour", time).value, 100, 75);
  if (clock.is12Hour) g.setFont6x15().setFontAlign().drawString(
    getField("meridian", time).value, 88, 54);
}
function drawMinute(time) {
  g.reset().clearRect(100, 46, 173, 95).setFont("Vector:66").setFontAlign(1);
  g.drawString(getField("minute", time).value, 182, 75);
}
function drawValue(field, time) {
  var tile = clock.tiles.indexOf(field);
  var rect = tileRect(tile);
  var fObj = Object.assign(
    {rect: rect, center: centerSpot(rect)},
    selection[tile],
    getField(field, time)
  );
  g.reset().clearRect(rect);
  drawView(fObj);
}
function drawView(fObj) {
  if (fObj.view.type.startsWith("val_") && fObj.value !== undefined) {
    g.reset().setFont12x20().setFontAlign().drawString(
      fObj.value, fObj.center.x + 1.4, fObj.rect.y2 - 6
    );
  }
  if (fObj.view.type === "val_1stat_icon") {
    var img = imgs(fObj.view.img);
    g.drawImages([{
      x: fObj.center.x + (img.offset || 0), y: fObj.rect.y + 9,
      image: atob(img.str), center: true
    }]);
  }
  if (fObj.view.type === "val_1-2dyn_icon") {
    var img1 = imgs(fObj.view.img1 + (fObj.value ? "1" : "0"));
    if (fObj.value) {
      var img2 = imgs(fObj.view.img2 + (fObj.opt ? "to" : "at"));
      var xGap = 12;
      if (fObj.pages > 1) {
        xGap = 18;
        g.reset().setFont("6x8").setFontAlign().drawString(
          fObj.page + 1 + " \n " + fObj.pages, fObj.center.x + 0.5, fObj.rect.y + 9
        ).drawLine(fObj.center.x - 5.5,  fObj.rect.y + 15, fObj.center.x + 4.5,  fObj.rect.y + 3);
      }
      g.drawImages([{
        x: fObj.center.x - xGap + 0.5, y: fObj.rect.y + 9,
        image: atob(img1.str), center: true
      }, {
        x: fObj.center.x + xGap, y: fObj.rect.y + 9,
        image: atob(img2.str), center: true
      }]);
    } else {
      g.drawImages([{
        x: fObj.center.x, y: fObj.center.y,
        image: atob(img1.str), center: true
      }]);
    }
  }
}
function drawInfo(full, viewObj) {
  var rect = infoRect(full);
  var center = centerSpot(rect);
  g.reset().clearRect(outerRect(rect));
  g.setFont12x20().setFontAlign();
  g.drawString("info " + (full ? "full" : "half"), center.x, center.y);
}

/*** module update function ***/
function updateMod(module, time) {
  // define temporary cache
  var tmp;
  if (module === "sundown") {
    // load sundown
    var sun = require("sundown")(time);
    tmp = {
      sunrise: sun ? sun.sunrise.time || "-" : "?",
      sunset: sun ? sun.sunset.time || "-" : "?"
    };
  } else if (module === "sched") {
    // set function to return the selected alarm value if it doesn't exist
    if (!modCache.getSched) modCache.getSched = function(field, time) {
      // get selection for tile of this field
      var sel = selection[clock.tiles.indexOf(field)];
      // get the selected alarm
      var alarm = modCache.sched[field][sel.page];
      // check for alarm entries
      if (alarm) {
        // calculate selected value
        alarm = sel.opt ?
          // as time to value
          alarm.tTo + alarm.calcAt - time.valueOf() :
          // as time at value or none
          alarm.t;
        // return as human readable value
        return getReadableTime(alarm);
      } else {
        return "";
      }
    };
    // load sched
    var sched = require("sched");
    // read active alarms/timers
    tmp = sched.getAlarms().filter(a => a.on).map(
      function (a) { return {
        timer: a.timer,
        t: a.t,
        tTo: sched.getTimeToAlarm(a, time),
        calcAt: time.valueOf()
      }; }
    ).filter(a => a.tTo).sort((a, b) => a.tTo - b.tTo);
    // rearrange alarms and timers into seperate objects
    tmp = {
      alarm: tmp.filter(a => !a.timer),
      timer: tmp.filter(a => a.timer)
    };
    // setup alarms and timers
    Object.keys(tmp).forEach(field => {
      // get tile of this field
      var tile = clock.tiles.indexOf(field);
      // set numer of pages for the selection 
      selection[tile].pages = tmp[field].length;
      // check if pages available
      if (selection[tile].pages) {
        // activate selection
        selection[tile].active = true;
      } else {
        // remove trigger
        triggerHandler.remove(updateOn(field), field);
      }
    });
  }
  // use cache and draw depending values if changed
  if (modCache[module] !== tmp) {
    modCache[module] = tmp;
    clock.modules[module].forEach(field => drawValue(field, time));
  }
}

/*** register activated tiles ***/
function registerTriggers() {
  // setup handler for triggers
  triggerHandler = {
    add: function(c, field, fn) {
      if ("odhm".includes(c)) this[c][field] = fn;
    },
    remove: function(c, field) {
      if ("odhm".includes(c)) return delete this[c][field];
    },
    trigger: function(c, time) {
      Object.keys(this[c]).forEach(field => this[c][field](time));
    },
    onChanged: function(time, changed) {
      Object.keys(changed).forEach(c => {
        if (changed[c]) this.trigger(c, time);
      });
    },
    o: {}, // once
    d: {date: time => drawDate(time)},
    h: {hour: time => drawHour(time)},
    m: {minute: time => drawMinute(time)}
  };
  // register trigger and default selection for all active fields
  clock.tiles.forEach(field => {
    triggerHandler.add(updateOn(field), field,
      time => drawValue(field, time));
    if (clock.sel[field]) {
      // get tile of this field
      var tile = clock.tiles.indexOf(field);
      // set selection object
      selection[tile] = {
        active: false,
        opt: clock.sel[field][0],
        opts: clock.sel[field][1],
        page: 0,
        pages: 0
      };
    }
  });
  // look for needed modules
  Object.keys(clock.modules).forEach(module => {
    // check if module is in use
    if (clock.modules[module].some(field => clock.tiles.includes(field))) {
      // check if module is installed
      if (require("Storage").read(module) !== undefined) {
        // register trigger for the module
        triggerHandler.add(updateOn(module), module,
          time => updateMod(module, time));
      } else {
        clock.modules[module].forEach(field => {
          // remove possible field triggers
          triggerHandler.remove(updateOn(field), field);
          // register trigger to be triggered just once
          triggerHandler.add("o", field, time => drawValue(field, time));
        });
      }
    }
  });
}

/*** hid functions ***/
function touchHandler(tile) {
  var sel = selection[tile];
  if (++sel.opt >= sel.opts) {
    sel.opt = 0;
    if (++sel.page >= sel.pages) sel.page = 0;
  }
  drawValue(clock.tiles[tile], new Date(( 0 | Date.now() / 6E4 ) * 6E4));
}
function touchListener(b, c) {
  // check if inside any active tile
  Object.keys(selection).filter(t => selection[t].active).forEach(tile => {
    var a = tileRect(tile);
    if (!(c.x < a.x || c.x > (a.x + a.w) || c.y < a.y || c.y > (a.y + a.h))) {
      Bangle.buzz(25);
      touchHandler(tile);
    }
  });
}
function setupHID() {
  // setup user interface
  Bangle.setUI({
    mode: "custom",
    clock: 1,
    touch: touchListener,
    btn: (n) => { if (n===1) Bangle.showLauncher(); },
  });
}

/*** clock function ***/
var clock = new ClockFace({
  init: registerTriggers,
  draw: function(time, changed) {
    drawFrame();
    triggerHandler.onChanged(time, Object.assign({o: true}, changed));
    setupHID();
  },
  update: triggerHandler.onChanged,
  settingsFile: "6tilesclk.settings.json"
});

clock.start();