/* jshint esversion: 6 */
/**
 * Control the music on your Gadgetbridge-connected phone
 **/
{
  let autoClose = false; // only if opened automatically
  let state = "";
  let info = {
    artist: "",
    album: "",
    track: "",
    n: 0,
    c: 0,
  };
  const TIMEOUT = 5*1000*60; // auto close timeout: 5 minutes

  /**
   * Base ticker class, needs children to implement `redraw`
   */
  class Ticker {
    constructor(ms) {
      this.i = null;
      this.ms = ms;
      this.active = false;
      this.onLCD = (on) => {
        if (this.i) {
          clearInterval(this.i);
          this.i = null;
        }
        if (on) {
          this.i = setInterval(() => {this.tick();}, this.ms);
          this.redraw();
        }
      };
    }
    start() {
      if (this.i) {
        clearInterval(this.i);
      }
      this.i = setInterval(() => {this.tick();}, this.ms);
      this.active = true;
      Bangle.on("lcdPower", this.onLCD);
    }
    stop() {
      if (this.i) {
        clearInterval(this.i);
        this.i = null;
      }
      this.active = false;
      Bangle.removeListener("lcdPower", this.onLCD);
    }
    tick() {
      // default: just redraw
      if (Bangle.isLCDOn()) {
        this.redraw();
      }
    }
  }

  /**
   * Draw time and date
   */
  class Clock extends Ticker {
    constructor() {
      super(1000);
      this.lastTime = -1;
    }
    tick() {
      // only redraw if time has changed
      const now = new Date;
      if (Bangle.isLCDOn() && now.getHours()*60+now.getMinutes()!==this.lastTime) {
        this.redraw();
        this.lastTime = now.getHours()*60+now.getMinutes();
      }
    }
    redraw() {
      drawDateTime();
    }
  }

  /**
   * Keep redrawing music while fading out
   */
  class Fader extends Ticker {
    constructor() {
      super(500);
    }
    redraw() {
      drawMusic();
    }
    start() {
      this.since = Date.now();
      super.start();
    }
    stop() {
      super.stop();
      this.since = Date.now(); // force redraw at 100% brightness
      this.redraw();
      this.since = null;
    }
    brightness() {
      if (!fadeOut.since) {
        return 1;
      }
      return Math.max(0, 1-((Date.now()-fadeOut.since)/TIMEOUT));
    }
  }

  /**
   * Scroll long track names
   */
  class Scroller extends Ticker {
    constructor() {
      super(200);
    }
    tick() {
      this.offset += 10;
      if (Bangle.isLCDOn()) {
        this.redraw();
      }
    }
    redraw() {
      drawScroller();
    }
    start() {
      this.offset = 0;
      super.start();
    }
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
    const getWidth = (size) => g.setFont("Vector", size).stringWidth(text);
    let guess = Math.floor(24000/getWidth(100));
    if (getWidth(guess)===240) { // good guess!
      return guess;
    }
    if (getWidth(guess)<240) {
      do {
        guess++;
      } while(getWidth(guess)<=240);
      return guess-1;
    }
    // width > 240
    do {
      guess--;
    } while(getWidth(guess)>240);
    return guess;
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
      const textCode = t => {
        let c = 0;
        for(let i = 0; i<t.length; i++) {
          c += t.charCodeAt(i);
        }
        return c%360;
      };
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
    v = fadeOut.brightness();
    // dark magic
    const hsv2rgb = (h, s, v) => {
      const f = (n) => {
        const k = (n+h/60)%6;
        return v-v*s*Math.max(Math.min(k, 4-k, 1), 0);
      };
      return {r: f(5), g: f(3), b: f(1)};
    };
    const rgb = hsv2rgb(h, s, v);
    const f2hex = (f) => ("00"+(Math.round(f*255)).toString(16)).substr(-2);
    return "#"+f2hex(rgb.r)+f2hex(rgb.g)+f2hex(rgb.b);
  }
  /**
   * Remember track color until info changes
   * Because we need this every time we move the scroller
   * @return {string}
   */
  function trackColor() {
    if (!("track_color" in info) || fadeOut.active) {
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
    const is12hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"];
    let time;
    if (is12hour) {
      const date12 = new Date(now.getTime());
      const hours = date12.getHours();
      if (hours===0) {
        date12.setHours(12);
      } else if (hours>12) {
        date12.setHours(hours-12);
      }
      time = l.time(date12, true)+l.meridian(now);
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
      .setClipRect(225, 30, 120, 60)
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
    if (size>40) {
      size = 40;
    }
    if (size<25) {
      // the title is too long: start up the scroller
      if (!scroller.active) {
        scroller.start();
      }
      return;
    } else if (scroller.active) {
      scroller.stop();
    }
    // stationary track
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
    scroller.offset = scroller.offset%w;
    g.setFontAlign(-1, 1) // left bottom
      .setColor(trackColor());
    clearTrack();
    g.drawString(info.track, -scroller.offset+40, 109)
      .drawString(info.track, -scroller.offset+40+w, 109);
  }

  /**
   * Draw track artist and album
   */
  function drawArtistAlbum() {
    // we just use small enough fonts to make these always fit
    // calculate stuff before clear+redraw
    const artistColor = infoColor("artist");
    const albumColor = infoColor("album");
    let artistSize = fitText(info.artist);
    if (artistSize>30) {
      artistSize = 30;
    }
    let albumSize = fitText(info.album);
    if (albumSize>20) {
      albumSize = 20;
    }
    g.reset();
    g.clearRect(0, 120, 240, 189);
    let top = 124;
    if (info.artist) {
      g.setFont("Vector", artistSize)
        .setFontAlign(0, -1) // center top
        .setColor(artistColor)
        .drawString(info.artist, 119, top);
      top += artistSize+4; // fit album neatly under artist
    }
    if (info.album) {
      g.setFont("Vector", albumSize)
        .setFontAlign(0, -1) // center top
        .setColor(albumColor)
        .drawString(info.album, 119, top);
    }
  }

  const icons = {
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
  };
  function controlColor(control) {
    if (volCmd && control===volCmd) {
      // volume button kept pressed down
      return "#ff0000";
    }
    return (control in tCommand) ? "#ff0000" : "#008800";
  }
  function drawControl(control, x, y) {
    g.setColor(controlColor(control));
    const s = 20;
    if (state!==controlState) {
      g.clearRect(x, y, x+s, y+s);
    }
    icons[control](x, y, s);
  }
  let controlState;
  function drawControls() {
    g.reset();
    if (state==="play") {
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
    controlState = state;
  }

  function drawMusic() {
    drawNum();
    drawTrack();
    drawArtistAlbum();
  }

  /////////////////////////

  /**
   * Update music info
   * @param event
   */
  function setInfo(event) {
    info = event;
    delete (info.t);
    scroller.offset = 0;
    if (Bangle.isLCDOn()) {
      drawMusic();
    }
  }

  let tQuit;
  function updateState() {
    // if paused for five minutes, load the clock
    // (but timeout resets if we get new info, even while paused)
    if (tQuit) {
      clearTimeout(tQuit);
    }
    tQuit = null;
    fadeOut.stop();
    if (state!=="play" && autoClose) {
      if (state==="stop") { // never actually happens with my phone :-(
        load();
      } else { // also quit when paused for a long time
        tQuit = setTimeout(load, TIMEOUT);
        fadeOut.start();
      }
    }
    if (Bangle.isLCDOn()) {
      drawControls();
    }
  }

  // create tickers
  const clock = new Clock();
  const fadeOut = new Fader();
  const scroller = new Scroller();

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
  let tVol, volCmd;
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
    volCmd = command;
    tVol = setTimeout(repeatVol, 500);
  }
  function repeatVol() {
    sendCommand(volCmd);
    tVol = setTimeout(repeatVol, 100);
  }
  function stopVol() {
    if (tVol) {
      clearTimeout(tVol);
      tVol = null;
    }
    volCmd = null;
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
    sendCommand(state==="play" ? "pause" : "play");
  }
  function startTouchWatches() {
    Bangle.on("touch", function(side) {
      switch(side) {
        case 1:
          sendCommand(state==="play" ? "pause" : "previous");
          break;
        case 2:
          sendCommand(state==="play" ? "next" : "play");
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
  // check for saved music state (by widget) to load
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
          setInfo(event);
          break;
        case "musicstate":
          state = event.state;
          updateState();
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
    updateState();
    startWatches();
    clock.start();
    startEmulator();
    Bangle.on("lcdPower", function(on) {
      if (on) {
        drawMusic();
        drawControls();
      }
    });
  }

  let saved = require("Storage").readJSON("gbmusic.load.json", true);
  require("Storage").erase("gbmusic.load.json");
  if (saved) {
    // autoloaded: load state was saved by widget
    info = saved.info;
    state = saved.state;
    delete (saved);
    autoClose = true;
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
