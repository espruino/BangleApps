// include modules
var ClockFace = require("ClockFace");
var Layout = require("Layout");
var decodeTime = require("time_utils").decodeTime;

// load local modules
var Storage = require("Storage");

// define global variable
var layout;
var cache = {};
var sel = {};

// define function to get the tile id from its field name
function getID(field, noCat) {
  var id;
  ["date", "tile"].some(cat => {
    id = (clock[cat] || []).findIndex(t => t === field) + 1;
    if (id) return noCat ? true : (id = cat + id);
  });
  return id || field;
}
// define function to get the field name from its id
function getField(ID) {
  return (clock[(ID.match(/^[^\d]*/) || [])[0]] || [])[(ID.match(/\d*$/) || [])[0] - 1];
}
// define function to get the selected page
function getPage(field) {
  return 0 | (sel[field] / (clock.sel[field] || {opt: 1}).opt);
}
// define function to get the selection option
function getOpt(field) {
  return sel[field] & ((clock.sel[field] || {opt: 1}).opt - 1);
}
// define function to format ms as human-readable time
function getHR(ms) {
  ms = decodeTime(0 | ms);
  return ms.h + ":" + ("0" + ms.m).substr(-2);
}
// define function to recalculate "time to" of an alarm object
function recalc(alarm, time) {
  alarm.tTo -= time.valueOf() - alarm.calcAt;
  alarm.tToHR = getHR(alarm.tTo);
  return alarm;
}

// define function for seperator lines
function lLine(dir) {
  var output = {
    bgCol: clock.lineColor
  };
  if (dir === "h") {
    Object.assign(output, {
      fillx: 1,
      height: 1
    });
  } else if (dir === "v") {
    Object.assign(output, {
      width: 1,
      filly: 1
    });
  }
  return output;
}
// define function for horizontal group elements
function lHGroup(id, elements) {
  return {
    id: id,
    type: "h",
    fillx: 1,
    c: elements
  };
}
// define function for text elements
function lDate(id) {
  return {
    id: id,
    type: "txt",
    font: "12x20",
    pady: -1,
    offsety: 2,
    pxClear: true,
    label: ""
  };
}
// define function for clock elements
function lClock(id) {
  return {
    id: id,
    type: "txt",
    font: "Vector:66",
    pady: -6,
    offsetx: 10,
    offsety: 4,
    pxClear: true,
    label: id
  };
}
// define function for tile elements
function lTile(id) {
  return {
    id: id,
    type: "custom",
    width: Bangle.appRect.w / 3,
    height: 36,
    value: "-",
    render: renderTile
  };
}
// define function for tile group elements
function lTileGroup(id) {
  return {
    id: id,
    type: "h",
    c: [
      lTile("tile" + id[2]),
      lLine("v"),
      lTile("tile" + id[3]),
      lLine("v"),
      lTile("tile" + id[4]),
    ]
  };
}

// define function to draw images
function drawImg(l) {
  // define draw function
  function draw(l, img) {
    g.drawImage(atob(img.str), l.x + l.w / 2 - img.w / 2 + (0|img.offset), l.y + (img.h ? l.h / 2 - img.h / 2 : 2));
  }
  // get field name from id
  var tile = getField(l.id);
  // draw main image
  switch (tile) {
    case "steps": {
      draw(l, {
        // steps icon
        str: "IBCBAAAAAYAAAAPgAAAH8AAAD/gAfAf8AP4D/gD+AfwA/gH5AP4B8gH+A+Qf/gfIf/4/kP/+fyD//n5AAAAAgP/+fwA=",
        w: 32
      });
      break;
    }
    case "sunrise": {
      draw(l, {
        // sunrise icon
        str: "GhCBAAAhAACIRAARIgBESIgIgEQBD8IED/wIx/+MC//0AP/8DH//jN//7Af/+AH//gN//7MP/8M=",
        w: 44
      });
      break;
    }
    case "sunset": {
      draw(l, {
        // sunset icon
        str: "JxCBAAAAgAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIEAAAAAAAAAEAAAAAIiAAAABAQAAACD4IAAAJ/yAAAAf/AAAAH/8EAAM//mAAAP/+A==",
        w: 44
      });
      break;
    }
    case "alarm": {
      if (l.value) {
        draw(l, {
          // alarm icon
          str: "EBCBAAGAY8ZH4s/zn/mf+R/4H/gf+B/4H/g//H/+AAADwAGA",
          w: 16,
          offset: -12
        });
      } else {
        draw(l, {
          // no alarm icon
          str: "JCCBAABwAOAAHwAPgAfgAH4A/D/D8A+OBx8B84Ac+B7gAHeDyAABPDmAB9nDEcAEjAMEAIwAIIAQQAYQAgYAQcBAIAQAZ8IAQB4AIAQHEAIAQcCAIAYABAYAIAAgQAMAAQwAEAAIgAGB+BgADA8DAABgAGAAAwAMAAA+B8AABz/OAADgAHAAHAADgAOAABwAcAAA4A==",
          w: 36,
          h: 32
        });
      }
      break;
    }
    case "timer": {
      if (l.value) {
        draw(l, {
          // timer icon
          str: "EBCBAABAAOAAsAGYAQwBBgF/H/5w+MGAf4A/gB+ADwAHAAIA",
          w: 16,
          offset: -12
        });
      } else {
        draw(l, {
          // no timer icon
          str: "JCCBAAVVVVYAaqqqoAKAABQAKAABQAKAABQAFAACgAFAACgAFAACgACgAFAACgAFAABQAKAAAoAUAAAUBoAAAKHQAAAFGgAAACtAAAACtAAAAFCgAAAKJQAAAUAoAAAoIUAABQAKAACg8FAACj/FAAFP/ygAF//+gAF//+gAL///QAL///QAL///QAVVVVYAaqqqoA==",
          w: 36,
          h: 32
        });
      }
      break;
    }
  }
  // draw secondary image and page for alarm or timer
  if (l.value && (tile === "alarm" || tile === "timer")) {
    // check for image type
    if (l.opt) {
      draw(l, {
        // "time to" icon
        str: "EBCBAADgALgAjBgGTALWA5MBoYGggYABwANAAmAGMAwcOAfg",
        w: 16,
        offset: 12
      });
    } else {
      // "at time" icon
      draw(l, {
        str: "EBCBAAfgHLgxDGEGQQLBE4EhwUGBg4ABwANAAmAGMAwdOAfg",
        w: 16,
        offset: 12
      });
    }
  }
}
// define function to render a tile
function renderTile(l) {
  // cache value
  var tmpVal = l.value;
  // if set override value with tile name
  if (clock.showTileIDs) l.value = "ID: " + l.id;
  // draw image
  drawImg(l);
  // draw value
  if (l.value !== undefined) g.setFontAlign(0, 1).setFont("12x20").drawString(l.value, l.x + l.w / 2, l.y + l.h + 3);
  // draw page if available
  if (l.page) g.setFontAlign(0, -1).setFont("6x8").drawString(l.page, l.x + l.w / 2, l.y + 8);
  // restore cached value
  l.value = tmpVal;
}

// touch listener for each tile
function touchListener(b, c) {
  // define fields with enabled selection
  var a = Object.keys(sel);
  // map fields to its layout objects and filter for pages
  a = a.map(field => Object.assign(layout[getID(field)], {
    funct: function() {
      sel[this.field]++;
      setValue(this.field, new Date(( 0 | Date.now() / 6E4 ) * 6E4));
    }
  })).filter(l => l.page);
  // check if inside any area
  for (var i = 0; i < a.length; i++) {
    if (!(c.x < a[i].x || c.x > (a[i].x + a[i].w) || c.y < a[i].y || c.y > (a[i].y + a[i].h))) {
      Bangle.buzz(25);
      a[i].funct();
    }
  }
}

// define function to load values from a module
function loadValues(module, time) {
  // return if module is not enabled
  if (!clock.modules[module]) return delete cache[module];
  // set module cache if unset
  if (!cache[module]) cache[module] = {};
  // define temporary cache
  var tmp;
  switch (module) {
    case "sundown": {
      // read location from myLocation app
      var loc = Storage.readJSON("mylocation.json", 1);
      // get sunrise/-set from sundown library
      var sun = loc ? require("sundown")(time, loc) : 0;
      // set sunrise/-set or error to temporary cache
      tmp = {
        sunrise: !loc ? "loc?" : sun ? sun.sunrise.time || "-" : "?",
        sunset: !loc ? "loc?" : sun ? sun.sunset.time || "-" : "?"
      };
      break;
    }
    case "sched": {
      // redefine temporary cache
      tmp = { alarm: [], timer: [] };
      // read active schedules
      require("sched").getAlarms().filter(a => a.on).map(a => {
        // calculat "time to" values
        var tTo = require("sched").getTimeToAlarm(a, time);
        // check for tTo and add properties to cache object
        if (tTo) tmp[a.timer ? "timer" : "alarm"].push({
          // add t, tTo, time of the calculation
          t: a.t, tTo: tTo, calcAt: time.valueOf(),
          // and calculated times in human-readable format
          tHR: getHR(a.t), tToHR: getHR(tTo),
        });
      });
      // sort cached schedules
      clock.modules.sched.forEach(field => {
        tmp[field] = tmp[field].sort((a, b) => a.tTo - b.tTo);
      });
      // reload touch listener if there are now new alarms/timers ?????
      break;
    }
  }
  // set to cache and return if it changed
  if (cache[module] !== tmp) {
    cache[module] = tmp;
    return true;
  } else {
    return false;
  }
}

// define function to get the value of a tile
function getValue(field, time) {
  switch(field) {
    case "hour": { // hour with/without leeding 0
      return ((this.leeding0 ? "0" : " ") + time.getHours()).substr(-2);
    }
    case "minute": { // minute
      return ("0" + time.getMinutes()).substr(-2);
    }
    case "date": { // short local date
      return require('locale').date(time, 1);
    }
    case "dow": { // first 2 letters of the day of the week
      return require("locale").dow(time, 1).substr(0, 2);
    }
    case "woy": { // week of the year
      var yf = new Date(time.getFullYear(), 0, 1);
      var dpy = Math.ceil((time - yf) / 86400000);
      var woy = (" " + Math.ceil((dpy + (yf.getDay() - 11) % 7 + 3) / 7)).slice(-2);
      return (clock.woy || (/*LANG*/"Week").substr(0, 1)) + woy;
    }
    case "steps": { // steps of the day
      return Bangle.getHealthStatus("day").steps;
    }
    case "sunrise":
    case "sunset": { // time of sunrise/-set
      return cache.sundown[field];
    }
    case "alarm":
    case "timer": { // upcomming alarms and timers
      // set default return value
      var value = "";
      // read selected page
      var page = getPage(field);
      // check if schedules of this field exist
      if (cache.sched[field].length) {
        // correct selection if necessary
        if (page >= cache.sched[field].length) sel[field] = page = 0;
        // check if tTo and tToHR needs to be recalculated
        var tToOpt = getOpt(field);
        // set selected value, recalculated if needed
        value = (tToOpt ?
          recalc(cache.sched[field][page], time) :
          cache.sched[field][page]
        )[tToOpt ? "tToHR" : "tHR"];
      }
      return value;
    }
  }
}

// define function to change txt and tile values
function setValue(field, time) {
  // get field id and abort if not set
  var id = getID(field);
  if (!id) return;
  // update field value
  var value = getValue(field, time);
  // get layout object
  var l = layout[id];
  // clear object if layout is generated
  if (l.x !== undefined) layout.clear(l);
  // check for a custom field
  if (l.type === "custom") {
    // set field name and value
    l.field = field;
    l.value = value;
    // set option and page if value and selection true
    if (value && sel[field] !== undefined) {
      l.opt = getOpt(field);
      l.page = getPage(field) + 1;
    }
  } else {
    // set text label
    l.label = value;
  }
  // render object if layout is generated
  if (l.x !== undefined) layout.render(l);
}

// define function to initalise the layout
function initLayout() {
  // setup layout
  layout = new Layout({
    type: "v",
    c: [
      { fillx: 1, height: 1 },
      lLine("h"),
      lHGroup("h_date", ["date1", "date2", "date3"].map(lDate)),
      lLine("h"),
      lHGroup("h_time", ["hour", ":", "minute"].map(lClock)),
      lLine("h"),
      lTileGroup("h_123"),
      lLine("h"),
      lTileGroup("h_456")
    ]
  });
  // adjust layout
  layout.date1.padx = 1;
  layout.date2.fillx = 1;
  layout.hour.fillx = 1;
  // remove unavailable or unused modules
  Object.keys(clock.modules).filter(module => {
    // check if module is available
    if (!Storage.read(module, 0, 1)) {
      // remove tiles with unavailable modules
      clock.modules[module].forEach(tile => {
        clock.tiles[getID(tile, true)] = "";
      });
      return false;
    }
    // check if module is used or not
    return clock.modules[module].some(field => clock.tile.includes(field)) ? true : false;
  });
  // set selection enabeled tiles
  Object.keys(clock.sel).forEach(field => {
    // check if tile used
    if (clock.tile.includes(field)) sel = Object.defineProperty(sel, field, {value: field.def || 0});
  });
}

// setup clock
var clock = new ClockFace({
  init: initLayout,
  draw: function(time, changed) {
    // use update and render afterwards
    this.update(time, changed);
    layout.render();
    // setup UI as custom clock
    Bangle.setUI({
      mode: "custom",
      clock: 1,
      touch: touchListener,
      btn: (n) => { if (n===1) Bangle.showLauncher(); },
    });
  },
  update: function(time, changed) {
    // cut time to full minutes
    time = new Date(( 0 | time / 6E4 ) * 6E4);
    // new day
    if (changed.d) {
      // set values
      setValue("date", time);
      setValue("dow", time);
      setValue("woy", time);
      // get and set sundown values
      if (loadValues("sundown", time)) clock.modules.sundown.forEach(field => { setValue(field, time); });
    }
    // new hour
    if (changed.h) {
      setValue("hour", time);
      // update cached values of schedules
      if (loadValues("sched", time)) clock.modules.sched.forEach(field => { changed[field] = true; });
    }
    // new minute
    if (changed.m) {
      setValue("minute", time);
      setValue("steps");
      // also update schedules with "time to" selected
      if (clock.modules.sched) {
        clock.modules.sched.forEach(field => {
          if (getOpt(field)) changed[field] = true;
        });
      }
    }
    // update schedules
    if (clock.modules.sched) {
      clock.modules.sched.forEach(field => {
        if (changed[field]) setValue(field, time);
      });
    }
  },
  pause: function() {
    // ?
  },
  settingsFile: 'infoclk.settings.json',
});
clock.start();