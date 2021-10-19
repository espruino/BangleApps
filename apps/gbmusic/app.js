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
const POUT = 300000; // auto close timeout when paused: 5 minutes (in ms)
const IOUT = 3600000; // auto close timeout for inactivity: 1 hour (in ms)

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
  drawMusic(false); // don't clear: draw over existing text to prevent flicker
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
let offset = null, // scroll Offset: null = no scrolling
  iScroll;
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
    if (!iScroll) {
      iScroll = setInterval(scroll, 200);
    }
    drawScroller();
  }
}
function scrollStop() {
  if (iScroll) {
    clearInterval(iScroll);
    iScroll = null;
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
 * @param {string} name - musicinfo property "num"/"artist"/"album"/"track"
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
    let code = textCode(info[name]);
    switch(name) {
      case "track": // also use album
        code += textCode(info.album);
      // fallthrough
      case "album": // also use artist
        code += textCode(info.artist);
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
 * @param {boolean} clr - Clear area before redrawing?
 */
function drawNum(clr) {
  let num = "";
  if ("n" in info && info.n>0) {
    num = "#"+info.n;
    if ("c" in info && info.c>0) { // I've seen { c:-1 }
      num += "/"+info.c;
    }
  }
  g.reset();
  g.setFont("Vector", 30)
    .setFontAlign(1, -1); // top right
  if (clr) {
    g.clearRect(225, 30, 120, 60);
  }
  g.drawString(num, 225, 30);
}
/**
 * Clear rectangle used by track title
 */
function clearTrack() {
  g.clearRect(0, 60, 239, 119);
}
/**
 * Draw track title
 * @param {boolean} clr - Clear area before redrawing?
 */
function drawTrack(clr) {
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
  if (clr) {
    clearTrack();
  }
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
 * @param {boolean} clr - Clear area before redrawing?
 */
function drawArtistAlbum(clr) {
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
  if (clr) {
    g.clearRect(0, 120, 240, 189);
  }
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

/**
 * @param {boolean} [clr=true] Clear area before redrawing?
 */
function drawMusic(clr) {
  clr = !(clr===false); // undefined means yes
  drawNum(clr);
  drawTrack(clr);
  drawArtistAlbum(clr);
}

////////////////////////
// GB event handlers
///////////////////////
/**
 * Update music info
 * @param {Object} e - Gadgetbridge musicinfo event
 */
function musicInfo(e) {
  info = e;
  delete (info.t);
  offset = null;
  if (Bangle.isLCDOn()) {
    drawMusic();
  }
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
function musicState(e) {
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
  delete info.track_color;
  if (auto) { // auto opened -> auto close
    switch(stat) {
      case "stop": // never actually happens with my phone :-(
        load();
        break;
      case "play":
        // if inactive for double song duration (or an hour if unknown), load the clock
        // i.e. phone finished playing without bothering to notify the watch
        tIxt = setTimeout(load, (info.dur*2000) || IOUT);
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
  if (Bangle.isLCDOn()) {
    drawMusic(false); // redraw in case we were fading out but resumed play
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
  // BTN1/3: volume control
  // Wait for falling edge to avoid messing with volume while long-pressing BTN3
  // to reload the watch (and same for BTN2 for consistency)
  setWatch(() => { sendCommand("volumeup"); }, BTN1, {repeat: true, edge: "falling"});
  setWatch(() => { sendCommand("volumedown"); }, BTN3, {repeat: true, edge: "falling"});

  // BTN2: long-press for launcher, otherwise depends on number of presses
  setWatch(() => {
    if (nPress===0) {
      tPress = setTimeout(() => {Bangle.showLauncher();}, 3000);
    }
  }, BTN2, {repeat: true, edge: "rising"});
  const s = require("Storage").readJSON("gbmusic.json", 1) || {};
  if (s.simpleButton) {
    setWatch(() => {
      clearTimeout(tPress);
      togglePlay();
    }, BTN2, {repeat: true, edge: "falling"});
  } else {
    setWatch(() => {
      nPress++;
      clearTimeout(tPress);
      tPress = setTimeout(handleButton2Press, 500);
    }, BTN2, {repeat: true, edge: "falling"});
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

// touch/swipe: navigation
function togglePlay() {
  sendCommand(stat==="play" ? "pause" : "play");
}
function startTouchWatches() {
  Bangle.on("touch", side => {
    if (!Bangle.isLCDOn()) {return;} // for <2v10 firmware
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
  Bangle.on("swipe", dir => {
    if (!Bangle.isLCDOn()) {return;} // for <2v10 firmware
    sendCommand(dir===1 ? "previous" : "next");
  });
}
function startLCDWatch() {
  Bangle.on("lcdPower", (on) => {
    if (on) {
      // redraw and resume scrolling
      tick();
      drawMusic();
      drawControls();
      fadeOut();
      if (offset!==null) {
        drawScroller();
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
// check for saved music stat (by widget) to load
g.clear();
global.gbmusic_active = true; // we don't need our widget (needed for <2.09 devices)
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
  startButtonWatches();
  startTouchWatches();
  startLCDWatch();
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
}

function init() {
  let saved = require("Storage").readJSON("gbmusic.load.json", true);
  require("Storage").erase("gbmusic.load.json");
  if (saved) {
    // autoloaded: load state was saved by widget
    info = saved.info;
    stat = saved.state;
    delete saved;
    auto = true;
    start();
  } else {
    delete saved;
    let s = require("Storage").readJSON("gbmusic.json", 1) || {};
    if (!("autoStart" in s)) {
      // user opened the app, but has not picked a setting yet
      // ask them about autoloading now
      E.showPrompt(
        "Automatically load\n"+
        "when playing music?\n",
      ).then(choice => {
        s.autoStart = choice;
        require("Storage").writeJSON("gbmusic.json", s);
        delete s;
        setTimeout(start, 0);
      });
    } else {
      delete s;
      start();
    }
  }
}
init();

