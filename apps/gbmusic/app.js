/* jshint esversion: 6 */
/**
 * Control the music on your Gadgetbridge-connected phone
 **/
let auto = false; // auto close if opened automatically
let stat = "";
let info = {
  artist: "",
  album: "",
  track: "",
  n: 0,
  c: 0,
};
const TOUT = 300000; // auto close timeout: 5 minutes (in ms)

///////////////////////
// Self-repeating timeouts
///////////////////////

// Clock
let tock = -1;
function tick() {
  if (!Bangle.isLCDOn()) {
    return;
  }
  const now = new Date;
  if (now.getHours()*60+now.getMinutes()!==tock) {
    drawDateTime();
    tock = now.getHours()*60+now.getMinutes();
  }
  setTimeout(tick, 1000); // we only show minute precision anyway
}

// Fade out while paused and auto closing
let fade = null;
function fadeOut() {
  if (!Bangle.isLCDOn() || !fade) {
    return;
  }
  drawMusic();
  setTimeout(fadeOut, 500);
}
function brightness() {
  if (!fade) {
    return 1;
  }
  return Math.max(0, 1-((Date.now()-fade)/TOUT));
}

// Scroll long track names
// use an interval to get smooth movement
let offset = null, // scroll Offset: null = no scrolling
  scrollI;
function scroll() {
  offset += 10;
  drawScroller();
}
function scrollStart() {
  if (offset!==null) {
    return; // already started
  }
  offset = 0;
  if (Bangle.isLCDOn()) {
    if (!scrollI) {
      scrollI = setInterval(scroll, 200);
    }
    drawScroller();
  }
}
function scrollStop() {
  if (scrollI) {
    clearInterval(scrollI);
    scrollI = null;
  }
  offset = null;
}

/**
 * @param {string} text
 * @return {number} Maximum font size to make text fit on screen
 */
function fitText(text) {
  if (!text.length) {
    return Infinity;
  }
  // make a guess, then shrink/grow until it fits
  const test = (s) => g.setFont("Vector", s).stringWidth(text);
  let best = Math.floor(24000/test(100));
  if (test(best)===240) { // good guess!
    return best;
  }
  if (test(best)<240) {
    do {
      best++;
    } while(test(best)<=240);
    return best-1;
  }
  // width > 240
  do {
    best--;
  } while(test(best)>240);
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
// dark magic
function hsv2rgb(h, s, v) {
  const f = (n) => {
    const k = (n+h/60)%6;
    return v-v*s*Math.max(Math.min(k, 4-k, 1), 0);
  };
  return {r: f(5), g: f(3), b: f(1)};
}
function f2hex(f) {
  return ("00"+(Math.round(f*255)).toString(16)).substr(-2);
}
/**
 * @param name
 * @return {string} Semi-random color to use for given info
 */
function infoColor(name) {
  let h, s, v;
  if (name==="num") {
    // always white
    h = 0;
    s = 0;
  } else {
    // make color depend deterministically on info
    let code = 0;
    switch(name) {
      case "track":
        code += textCode(info.track);
      // fallthrough: also use album+artist
      case "album":
        code += textCode(info.album);
      // fallthrough: also use artist
      default:
        code += textCode(info[name]);
    }
    h = code%360;
    s = 0.7;
  }
  v = brightness();
  const rgb = hsv2rgb(h, s, v);
  return "#"+f2hex(rgb.r)+f2hex(rgb.g)+f2hex(rgb.b);
}
/**
 * Remember track color until info changes
 * Because we need this every time we move the scroller
 * @return {string}
 */
function trackColor() {
  if (!("track_color" in info) || fade) {
    info.track_color = infoColor("track");
  }
  return info.track_color;
}

////////////////////
// Drawing functions
////////////////////
/**
 * Draw date and time
 * @return {*}
 */
function drawDateTime() {
  const now = new Date;
  const l = require("locale");
  const is12 = (require("Storage").readJSON("setting.json", 1) || {})["12hour"];
  let time;
  if (is12) {
    const d12 = new Date(now.getTime());
    const hour = d12.getHours();
    if (hour===0) {
      d12.setHours(12);
    } else if (hour>12) {
      d12.setHours(hour-12);
    }
    time = l.time(d12, true)+l.meridian(now);
  } else {
    time = l.time(now, true);
  }
  g.reset();
  g.setFont("Vector", 24)
    .setFontAlign(-1, -1) // top left
    .clearRect(10, 30, 119, 54)
    .drawString(time, 10, 30);

  const date = require("locale").date(now, true);
  g.setFont("Vector", 16)
    .setFontAlign(0, 1) // bottom center
    .setClipRect(35, 198, 199, 214)
    .clearRect(31, 198, 199, 214)
    .drawString(date, 119, 240-26);
}

/**
 * Draw track number and total count
 */
function drawNum() {
  let num = "";
  if ("n" in info && info.n>0) {
    num = "#"+info.n;
    if ("c" in info && info.c>0) { // I've seen { c:-1 }
      num += "/"+info.c;
    }
  }
  g.reset();
  g.setFont("Vector", 30)
    .setFontAlign(1, -1) // top right
    .clearRect(225, 30, 120, 60)
    .drawString(num, 225, 30);
}
/**
 * Clear rectangle used by track title
 */
function clearTrack() {
  g.clearRect(0, 60, 239, 119);
}
/**
 * Draw track title
 */
function drawTrack() {
  let size = fitText(info.track);
  if (size<25) {
    // the title is too long: start the scroller
    scrollStart();
    return;
  } else {
    scrollStop();
  }
  // stationary track
  if (size>40) {
    size = 40;
  }
  g.reset();
  g.setFont("Vector", size)
    .setFontAlign(0, 1) // center bottom
    .setColor(trackColor());
  clearTrack();
  g.drawString(info.track, 119, 109);
}
/**
 * Draw scrolling track title
 */
function drawScroller() {
  g.reset();
  g.setFont("Vector", 40);
  const w = g.stringWidth(info.track)+40;
  offset = offset%w;
  g.setFontAlign(-1, 1) // left bottom
    .setColor(trackColor());
  clearTrack();
  g.drawString(info.track, -offset+40, 109)
    .drawString(info.track, -offset+40+w, 109);
}

/**
 * Draw track artist and album
 */
function drawArtistAlbum() {
  // we just use small enough fonts to make these always fit
  // calculate stuff before clear+redraw
  const aCol = infoColor("artist");
  const bCol = infoColor("album");
  let aSiz = fitText(info.artist);
  if (aSiz>30) {
    aSiz = 30;
  }
  let bSiz = fitText(info.album);
  if (bSiz>20) {
    bSiz = 20;
  }
  g.reset();
  g.clearRect(0, 120, 240, 189);
  let top = 124;
  if (info.artist) {
    g.setFont("Vector", aSiz)
      .setFontAlign(0, -1) // center top
      .setColor(aCol)
      .drawString(info.artist, 119, top);
    top += aSiz+4; // fit album neatly under artist
  }
  if (info.album) {
    g.setFont("Vector", bSiz)
      .setFontAlign(0, -1) // center top
      .setColor(bCol)
      .drawString(info.album, 119, top);
  }
}

/**
 *
 * @param {string} icon Icon name
 * @param {number} x
 * @param {number} y
 * @param {number} s Icon size
 */
function drawIcon(icon, x, y, s) {
  ({
    pause: function(x, y, s) {
      const w1 = s/3;
      g.drawRect(x, y, x+w1, y+s);
      g.drawRect(x+s-w1, y, x+s, y+s);
    },
    play: function(x, y, s) {
      g.drawPoly([
        x, y,
        x+s, y+s/2,
        x, y+s,
      ], true);
    },
    previous: function(x, y, s) {
      const w2 = s*1/5;
      g.drawPoly([
        x+s, y,
        x+w2, y+s/2,
        x+s, y+s,
      ], true);
      g.drawRect(x, y, x+w2, y+s);
    },
    next: function(x, y, s) {
      const w2 = s*4/5;
      g.drawPoly([
        x, y,
        x+w2, y+s/2,
        x, y+s,
      ], true);
      g.drawRect(x+w2, y, x+s, y+s);
    },
  })[icon](x, y, s);
}
function controlColor(ctrl) {
  if (vCmd && ctrl===vCmd) {
    // volume button kept pressed down
    return "#ff0000";
  }
  return (ctrl in tCommand) ? "#ff0000" : "#008800";
}
function drawControl(ctrl, x, y) {
  g.setColor(controlColor(ctrl));
  const s = 20;
  if (stat!==controlState) {
    g.clearRect(x, y, x+s, y+s);
  }
  drawIcon(ctrl, x, y, s);
}
let controlState;
function drawControls() {
  g.reset();
  if (stat==="play") {
    // left touch
    drawControl("pause", 10, 190);
    // right touch
    drawControl("next", 200, 190);
  } else {
    drawControl("previous", 10, 190);
    drawControl("play", 200, 190);
  }
  g.setFont("6x8", 2);
  // BTN1
  g.setFontAlign(1, -1);
  g.setColor(controlColor("volumeup"));
  g.drawString("+", 240, 30);
  // BTN2
  g.setFontAlign(1, 1);
  g.setColor(controlColor("volumedown"));
  g.drawString("-", 240, 210);
  controlState = stat;
}

function drawMusic() {
  drawNum();
  drawTrack();
  drawArtistAlbum();
}

////////////////////////
// GB event handlers
///////////////////////
/**
 * Update music info
 * @param e
 */
function musicInfo(e) {
  info = e;
  delete (info.t);
  offset = null;
  if (Bangle.isLCDOn()) {
    drawMusic();
  }
}

let tXit;
function musicState(e) {
  stat = e.state;
  // if paused for five minutes, load the clock
  // (but timeout resets if we get new info, even while paused)
  if (tXit) {
    clearTimeout(tXit);
  }
  tXit = null;
  fade = null;
  delete info.track_color;
  if (stat!=="play" && auto) {
    if (stat==="stop") { // never actually happens with my phone :-(
      load();
    } else { // also quit when paused for a long time
      tXit = setTimeout(load, TOUT);
      fade = Date.now();
      fadeOut();
    }
  }
  if (Bangle.isLCDOn()) {
    drawControls();
  }
}

////////////////////
// Events
////////////////////

let tLauncher;
// we put starting of watches inside a function, so we can defer it until we
// asked the user about autoStart
function startLauncherWatch() {
  // long-press: launcher
  // short-press: toggle play/pause
  setWatch(function() {
    if (tLauncher) {
      clearTimeout(tLauncher);
    }
    tLauncher = setTimeout(Bangle.showLauncher, 1000);
  }, BTN2, {repeat: true, edge: "rising"});
  setWatch(function() {
    if (tLauncher) {
      clearTimeout(tLauncher);
      tLauncher = null;
    }
    togglePlay();
  }, BTN2, {repeat: true, edge: "falling"});
}

let tCommand = {};
/**
 * Send command and highlight corresponding control
 * @param command "play/pause/next/previous/volumeup/volumedown"
 */
function sendCommand(command) {
  Bluetooth.println(JSON.stringify({t: "music", n: command}));
  // for controlColor
  if (command in tCommand) {
    clearTimeout(tCommand[command]);
  }
  tCommand[command] = setTimeout(function() {
    delete tCommand[command];
    drawControls();
  }, 200);
  drawControls();
}

// BTN1/3: volume control (with repeat after long-press)
let tVol, vCmd;
function volUp() {
  volStart("up");
}
function volDown() {
  volStart("down");
}
function volStart(dir) {
  const command = "volume"+dir;
  stopVol();
  sendCommand(command);
  vCmd = command;
  tVol = setTimeout(repeatVol, 500);
}
function repeatVol() {
  sendCommand(vCmd);
  tVol = setTimeout(repeatVol, 100);
}
function stopVol() {
  if (tVol) {
    clearTimeout(tVol);
    tVol = null;
  }
  vCmd = null;
  drawControls();
}
function startVolWatches() {
  setWatch(volUp, BTN1, {repeat: true, edge: "rising"});
  setWatch(stopVol, BTN1, {repeat: true, edge: "falling"});
  setWatch(volDown, BTN3, {repeat: true, edge: "rising"});
  setWatch(stopVol, BTN3, {repeat: true, edge: "falling"});
}

// touch/swipe: navigation
function togglePlay() {
  sendCommand(stat==="play" ? "pause" : "play");
}
function startTouchWatches() {
  Bangle.on("touch", function(side) {
    switch(side) {
      case 1:
        sendCommand(stat==="play" ? "pause" : "previous");
        break;
      case 2:
        sendCommand(stat==="play" ? "next" : "play");
        break;
      case 3:
        togglePlay();
    }
  });
  Bangle.on("swipe", function(dir) {
    sendCommand(dir===1 ? "previous" : "next");
  });
}
/////////////////////
// Startup
/////////////////////
// check for saved music stat (by widget) to load
g.clear();
global.gbmusic_active = true; // we don't need our widget
Bangle.loadWidgets();
Bangle.drawWidgets();
delete (global.gbmusic_active);

function startEmulator() {
  if (typeof Bluetooth==="undefined") { // emulator!
    Bluetooth = {
      println: (line) => {console.log("Bluetooth:", line);},
    };
    // some example info
    GB({"t": "musicinfo", "artist": "Some Artist Name", "album": "The Album Name", "track": "The Track Title Goes Here", "dur": 241, "c": 2, "n": 2});
    GB({"t": "musicstate", "state": "play", "position": 0, "shuffle": 1, "repeat": 1});
  }
}
function startWatches() {
  startVolWatches();
  startLauncherWatch();
  startTouchWatches();
}

function start() {
  // start listening for music updates
  const _GB = global.GB;
  global.GB = (event) => {
    // we eat music events!
    switch(event.t) {
      case "musicinfo":
        musicInfo(event);
        break;
      case "musicstate":
        musicState(event);
        break;
      default:
        // pass on other events
        if (_GB) {
          setTimeout(_GB, 0, event);
        }
        return;
    }
  };
  drawMusic();
  drawControls();
  startWatches();
  tick();
  startEmulator();
  Bangle.on("lcdPower", (on) => {
    if (on) {
      tick();
      drawMusic();
      drawControls();
      fadeOut();
      if (offset!==null) {
        drawScroller();
        scrollI = setInterval(scroll, 200);
      }
    } else {
      if (scrollI) {
        clearInterval(scrollI);
        scrollI = null;
      }
    }
  });
}

function init() {
  let saved = require("Storage").readJSON("gbmusic.load.json", true);
  require("Storage").erase("gbmusic.load.json");
  if (saved) {
    // autoloaded: load state was saved by widget
    info = saved.info;
    stat = saved.state;
    delete (saved);
    auto = true;
    start();
  } else {
    const s = require("Storage").readJSON("gbmusic.json", 1) || {};
    if (!("autoStart" in s)) {
      // user opened the app, but has not picked a setting yet
      // ask them about autoloading now
      E.showPrompt(
        "Automatically load\n"+
        "when playing music?\n",
      ).then(function(autoStart) {
        s.autoStart = autoStart;
        require("Storage").writeJSON("gbmusic.json", s);
        setTimeout(start, 0);
      });
    } else {
      start();
    }
  }
}
init();

