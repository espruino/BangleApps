/* jshint esversion: 6 */
/**
 * Control the music on your Gadgetbridge-connected phone
 **/
let auto = false; // auto close if opened automatically
let stat = "";
const POUT = 300000; // auto close timeout when paused: 5 minutes (in ms)
const IOUT = 3600000; // auto close timeout for inactivity: 1 hour (in ms)
const BANGLE2 = process.env.HWVERSION===2;

/**
 * @param {string} text
 * @param {number} w Width to fit text in
 * @return {number} Maximum font size to make text fit
 */
function fitText(text, w) {
  if (!text.length) {
    return Infinity;
  }
  // make a guess, then shrink/grow until it fits
  const test = (s) => g.setFont("Vector", s).stringWidth(text);
  let best = Math.floor(100*w/test(100));
  if (test(best)===w) { // good guess!
    return best;
  }
  if (test(best)<w) {
    do {
      best++;
    } while(test(best)<=w);
    return best-1;
  }
  // width > w
  do {
    best--;
  } while(test(best)>w);
  return best;
}

/**
 * @param {string} text
 * @return {number} Randomish but deterministic number from 0-360 for text
 */
function textCode(text) {
  "ram";
  let code = 0;
  for(let i = 0; i<text.length; i++) {
    code += text.charCodeAt(i);
  }
  return code%360;
}
function f2hex(f) {
  return ("00"+(Math.round(f*255)).toString(16)).substr(-2);
}
/**
 * @param {string} name - musicinfo property "num"/"artist"/"album"/"track"
 * @return {string} Semi-random color to use for given info
 */
function infoColor(name) {
  // make color depend deterministically on info
  let code = textCode(layout[name].label);
  switch(name) {
    case "title": // also use album and artist
      code += textCode(layout.album.label);
    // fallthrough
    case "album": // also use artist
      code += textCode(layout.artist.label);
  }
  let rgb;
  if (g.getBPP()===3) {
    // only pick 3-bit colors, always at full brightness
    rgb = [code&1, (code&2)/2, (code&4)/4];
    if (g.setColor(rgb[0], rgb[1], rgb[2]).getColor()===g.theme.bg) {
      // avoid picking the bg color
      rgb = rgb.map(c => 1-c);
    }
    return "#"+f2hex(rgb[0])+f2hex(rgb[1])+f2hex(rgb[2]);
  } else {
    // pick any hue, adjust for brightness
    const h = code%360, s = 0.7, b = brightness();
    return E.HSBtoRGB(h/360, s, b);
  }
}

/**
 * Render scrolling title
 * @param l
 */
function rScroller(l) {
  var size=l.font.split(":")[1].slice(0,-1);
  g.setFont("Vector", Math.round(g.getHeight()*size/100));
  const w = g.stringWidth(l.label)+40,
    y = l.y+l.h/2;
  l.offset = l.offset%w;
  g.setClipRect(l.x, l.y, l.x+l.w-1, l.y+l.h-1)
    .setColor(l.col).setBgColor(l.bgCol) // need to set colors: iScroll calls this function outside Layout
    .setFontAlign(-1, 0) // left center
    .clearRect(l.x, l.y, l.x+l.w-1, l.y+l.h-1)
    .drawString(l.label, l.x-l.offset+40, y)
    .drawString(l.label, l.x-l.offset+40+w, y);
}
/**
 * Render title
 * @param l
 */
function rTitle(l) {
  if (l.offset!==null) {
    rScroller(l); // already scrolling
    return;
  }
  let size = fitText(l.label, l.w);
  if (size<l.h/2) {
    // the title is too long: start the scroller
    scrollStart();
  } else {
    rInfo(l);
  }
}
/**
 * Render info field
 * @param l
 */
function rInfo(l) {
  let size = fitText(l.label, l.w);
  if (size>l.h) {
    size = l.h;
  }
  g.setFont("Vector", size)
    .setFontAlign(0, -1) // center top
    .drawString(l.label, l.x+l.w/2, l.y);
}
/**
 * Render icon
 * @param l
 */
function rIcon(l) {
  const x2 = l.x+l.w-1,
    y2 = l.y+l.h-1;
  switch(l.icon) {
    case "pause": {
      const w13 = l.w/3;
      g.drawRect(l.x, l.y, l.x+w13, y2);
      g.drawRect(l.x+l.w-w13, l.y, x2, y2);
      break;
    }
    case "play": {
      g.drawPoly([
        l.x, l.y,
        x2, l.y+l.h/2,
        l.x, y2,
      ], true);
      break;
    }
    case "previous": {
      const w15 = l.w*1/5;
      g.drawPoly([
        x2, l.y,
        l.x+w15, l.y+l.h/2,
        x2, y2,
      ], true);
      g.drawRect(l.x, l.y, l.x+w15, y2);
      break;
    }
    case "next": {
      const w45 = l.w*4/5;
      g.drawPoly([
        l.x, l.y,
        l.x+w45, l.y+l.h/2,
        l.x, y2,
      ], true);
      g.drawRect(l.x+w45, l.y, x2, y2);
      break;
    }
    default: { // red X
      console.log(`Unknown icon: ${l.icon}`);
      g.setColor("#f00")
        .drawRect(l.x, l.y, x2, y2)
        .drawLine(l.x, l.y, x2, y2)
        .drawLine(l.x, y2, x2, l.y);
    }
  }
}
let layout;
function makeUI() {
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  const Layout = require("Layout");
  layout = new Layout({
    type: "v", c: [
      {
        type: "h", fillx: 1, c: [
          {fillx: 1},
          {id: "num", type: "txt", label: "", valign: -1, halign: -1, font: "12%", bgCol: g.theme.bg},
          BANGLE2 ? {} : {id: "up", type: "txt", label: " +", halign: 1, font: "6x8:2"},
        ],
      },
      {id: "title", type: "custom", label: "", fillx: 1, filly: 2, offset: null, font: "Vector:20%", render: rTitle, bgCol: g.theme.bg},
      {id: "artist", type: "custom", label: "", fillx: 1, filly: 1, size: 30, render: rInfo, bgCol: g.theme.bg},
      {
        type: "h", c: [
          {id: "album", type: "custom", label: "", fillx: 1, filly: 1, size: 20, render: rInfo, bgCol: g.theme.bg},
          BANGLE2 ? {} : {id: "down", type: "txt", label: " -", font: "6x8:2"},
        ],
      },
      {height: 10},
    ],
  }, {lazy: true});
  layout.render();
}

///////////////////////
// Self-repeating timeouts
///////////////////////

// Fade out while paused and auto closing
let fade = null;
function fadeOut() {
  if (BANGLE2 || !Bangle.isLCDOn() || !fade) {
    return;
  }
  layout.render();
  setTimeout(fadeOut, 500);
}
function brightness() {
  if (!fade) {
    return 1;
  }
  return Math.max(0, 1-((Date.now()-fade)/POUT));
}

// Scroll long track names
// use an interval to get smooth movement
let iScroll;
function scroll() {
  layout.title.offset += 10;
  rScroller(layout.title);
}
function scrollStart() {
  if (layout.title.offset!==null) {
    return; // already started
  }
  layout.title.offset = 0;
  if (BANGLE2 || Bangle.isLCDOn()) {
    if (!iScroll) {
      iScroll = setInterval(scroll, 200);
    }
    rScroller(layout.title);
  }
}
function scrollStop() {
  if (iScroll) {
    clearInterval(iScroll);
    iScroll = null;
  }
  layout.title.offset = null;
}

////////////////////
// Drawing functions
////////////////////

function drawControls() {
  if (BANGLE2) return;
  const cc = a => (a ? "#f00" : "#0f0"); // control color: red for active, green for inactive
  layout.up.col = cc("volumeup" in tCommand);
  layout.down.col = cc("volumedown" in tCommand);
  layout.render();
}

////////////////////////
// GB event handlers
///////////////////////
/**
 * Mangle track number and total count for display
 */
function formatNum(info) {
  let num = "";
  if ("n" in info && info.n>0) {
    num = "#"+info.n;
    if ("c" in info && info.c>0) { // I've seen { c:-1 }
      num += "/"+info.c;
    }
  }
  return num;
}

/**
 * Update music info
 * @param {Object} info - Gadgetbridge musicinfo event
 */
function info(info) {
  scrollStop();
  layout.title.label = info.track || "";
  layout.album.label = info.album || "";
  layout.artist.label = info.artist || "";
  // color depends on all labels
  layout.title.col = infoColor("title");
  layout.album.col = infoColor("album");
  layout.artist.col = infoColor("artist");
  layout.num.label = formatNum(info);
  layout.update();
  layout.render();
  rTitle(layout.title); // force redraw of title, or scroller might break
  // reset auto exit interval
  if (tIxt) {
    clearTimeout(tIxt);
    tIxt = null;
  }
  if (auto && stat==="play") {
    // if inactive for double song duration (or an hour if unknown), load the clock
    // i.e. phone finished playing without bothering to notify the watch
    tIxt = setTimeout(load, (info.dur*2000) || IOUT);
  }
}

let tPxt, tIxt; // Timeouts to eXiT when Paused/Inactive for too long
/**
 * Update music state
 * @param {Object} e - Gadgetbridge musicstate event
 */
function state(e) {
  stat = e.state;
  // if paused for five minutes, load the clock
  // (but timeout resets if we get new info, even while paused)
  if (tPxt) {
    clearTimeout(tPxt);
    tPxt = null;
  }
  if (tIxt) {
    clearTimeout(tIxt);
    tIxt = null;
  }
  fade = null;
  if (auto) { // auto opened -> auto close
    switch(stat) {
      case "stop": // never actually happens with my phone :-(
        load();
        break;
      case "play":
        // if inactive for double song duration (or an hour if unknown), load the clock
        // i.e. phone finished playing without bothering to notify the watch
        tIxt = setTimeout(load, (e.dur*2000) || IOUT);
        break;
      case "pause":
      default:
        // quit when paused for a long time
        // also fade out track info while waiting for this
        tPxt = setTimeout(load, POUT);
        fade = Date.now();
        fadeOut();
        break;
    }
  }
  if (BANGLE2 || Bangle.isLCDOn()) {
    drawControls();
  }
}

////////////////////
// Events
////////////////////

// we put starting of watches inside a function, so we can defer it until
// we asked the user about autoStart
/**
 * Start watching for BTN2 presses
 */
let tPress, nPress = 0;
function startButtonWatches() {
  let btn = BTN1;
  if (!BANGLE2) {
    // BTN1/3: volume control
    // Wait for falling edge to avoid messing with volume while long-pressing BTN3
    // to reload the watch (and same for BTN2 for consistency)
    setWatch(() => { sendCommand("volumeup"); }, BTN1, {repeat: true, edge: "falling"});
    setWatch(() => { sendCommand("volumedown"); }, BTN3, {repeat: true, edge: "falling"});
    btn = BTN2;
  }

  // middle button: long-press for launcher, otherwise depends on number of presses
  setWatch(() => {
    if (nPress===0) {
      tPress = setTimeout(() => {Bangle.showLauncher();}, 3000);
    }
  }, btn, {repeat: true, edge: "rising"});
  const s = require("Storage").readJSON("gbmusic.json", 1) || {};
  if (s.simpleButton) {
    setWatch(() => {
      clearTimeout(tPress);
      togglePlay();
    }, btn, {repeat: true, edge: "falling"});
  } else {
    setWatch(() => {
      nPress++;
      clearTimeout(tPress);
      tPress = setTimeout(handleButton2Press, 500);
    }, btn, {repeat: true, edge: "falling"});
  }
}
function handleButton2Press() {
  tPress = null;
  switch(nPress) {
    case 1:
      togglePlay();
      break;
    case 2:
      sendCommand("next");
      break;
    case 3:
      sendCommand("previous");
      break;
    default: // invalid
      Bangle.buzz(50);
  }
  nPress = 0;
}

let tCommand = {};
/**
 * Send command and highlight corresponding control
 * @param {string} command - "play"/"pause"/"next"/"previous"/"volumeup"/"volumedown"
 */
function sendCommand(command) {
  Bluetooth.println("");
  Bluetooth.println(JSON.stringify({t: "music", n: command}));
  // for control color
  if (command in tCommand) {
    clearTimeout(tCommand[command]);
  }
  tCommand[command] = setTimeout(function() {
    delete tCommand[command];
    drawControls();
  }, 200);
  drawControls();
}

function togglePlay() {
  sendCommand(stat==="play" ? "pause" : "play");
}

/**
 * Setup touch+swipe for Bangle.js 1
 */
function touch1() {
  Bangle.on("touch", togglePlay);
  Bangle.on("swipe", dir => {
    sendCommand(dir===1 ? "previous" : "next");
  });
}
/**
 * Setup touch+swipe for Bangle.js 2
 */
function touch2() {
  Bangle.on("touch", togglePlay);
  // swiping
  let drag;
  Bangle.on("drag", e => {
    if (!drag) { // start dragging
      drag = {x: e.x, y: e.y};
    } else if (!e.b) { // released
      const dx = e.x-drag.x, dy = e.y-drag.y;
      drag = null;
      if (Math.abs(dx)>Math.abs(dy)+10) {
        // horizontal
        sendCommand(dx>0 ? "previous" : "next");
      } else if (Math.abs(dy)>Math.abs(dx)+10) {
        // vertical
        sendCommand(dy>0 ? "volumedown" : "volumeup");
      }
    }
  });
}
function startTouchWatches() {
  if (BANGLE2) {
    touch2();
  } else {
    touch1();
  }
}
function startLCDWatch() {
  if (BANGLE2) {
    return; // always keep drawing
  }
  Bangle.on("lcdPower", (on) => {
    if (on) {
      // redraw and resume scrolling
      tick();
      layout.render();
      fadeOut();
      if (offset.offset!==null) {
        if (!iScroll) {
          iScroll = setInterval(scroll, 200);
        }
      }
    } else {
      // pause scrolling
      if (iScroll) {
        clearInterval(iScroll);
        iScroll = null;
      }
    }
  });
}

/////////////////////
// Startup
/////////////////////
g.clear();

function startEmulator() {
  if (typeof Bluetooth==="undefined" || typeof Bluetooth.println==="undefined") { // emulator!
    Bluetooth = {
      println: (line) => {console.log("Bluetooth:", line);},
    };
    // some example info
    info({"t": "musicinfo", "artist": "Some Artist Name", "album": "The Album Name", "track": "The Track Title Goes Here", "dur": 241, "c": 2, "n": 2});
    state({"t": "musicstate", "state": "play", "position": 0, "shuffle": 1, "repeat": 1});
  }
}
function startWatches() {
  startButtonWatches();
  startTouchWatches();
  startLCDWatch();
}

function start() {
  makeUI();
  startWatches();
  startEmulator();
}

function init() {
  // check for saved music status (by widget) to load
  let saved = require("Storage").readJSON("gbmusic.load.json", true);
  require("Storage").erase("gbmusic.load.json");
  if (saved) {
    // autoloaded: load state as saved by widget
    auto = true;
    start();
    info(saved.info);
    state(saved.state);
    return;
  }

  let s = require("Storage").readJSON("gbmusic.json", 1) || {};
  if ("autoStart" in s) {
    start();
    return;
  }

  // user opened the app, but has not picked a autoStart setting yet
  // ask them about autoloading now
  E.showPrompt(
    "Automatically load\n"+
    "when playing music?\n"
  ).then(choice => {
    s.autoStart = choice;
    require("Storage").writeJSON("gbmusic.json", s);
    setTimeout(start, 0);
  });
}
init();