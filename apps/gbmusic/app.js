/* jshint esversion: 6 */
/**
 * Control the music on your Gadgetbridge-connected phone
 **/
{
  let autoClose = false // only if opened automatically
  let state = ""
  let info = {
    artist: "",
    album: "",
    track: "",
    n: 0,
    c: 0,
  }

  const screen = {
    width: g.getWidth(),
    height: g.getHeight(),
    center: g.getWidth()/2,
    middle: g.getHeight()/2,
  }

  const TIMEOUT = 5*1000*60 // auto close timeout: 5 minutes
  // drawText defaults
  const defaults = {
    time: { // top center
      color: -1,
      font: "Vector",
      size: 24,
      left: 10,
      top: 30,
    },
    date: { // bottom center
      color: -1,
      font: "Vector",
      size: 16,
      bottom: 26,
      center: screen.width/2,
    },
    num: { // top right
      font: "Vector",
      size: 30,
      top: 30,
      right: 15,
    },
    track: { // center above middle
      font: "Vector",
      size: 40, // maximum size
      min_size: 25, // scroll (at maximum size) if this doesn't fit
      bottom: (screen.height/2)+10,
      center: screen.width/2,
      // Smaller interval+step might be smoother, but flickers :-(
      interval: 200, // scroll interval in ms
      step: 10, // scroll speed per interval
    },
    artist: { // center below middle
      font: "Vector",
      size: 30, // maximum size
      middle: (screen.height/2)+17,
      center: screen.width/2,
    },
    album: { // center below middle
      font: "Vector",
      size: 20, // maximum size
      middle: (screen.height/2)+18, // moved down if artist is present
      center: screen.width/2,
    },
    // these work a bit different, as they apply to all controls
    controls: {
      color: "#008800",
      highlight: 200, // highlight pressed controls for this long, ms
      activeColor: "#ff0000",
      size: 20, // icons
      left: 10, // for right-side
      right: 20, // for left-side (more space because of +- buttons)
      top: 30,
      bottom: 30,
      font: "6x8", // volume buttons
      volSize: 2, // volume buttons
    },
  }

  class Ticker {
    constructor(interval) {
      this.i = null
      this.interval = interval
      this.active = false
    }
    clear() {
      if (this.i) {
        clearInterval(this.i)
      }
      this.i = null
    }
    start() {
      this.active = true
      this.resume()
    }
    stop() {
      this.active = false
      this.clear()
    }
    pause() {
      this.clear()
    }
    resume() {
      this.clear()
      if (this.active && Bangle.isLCDOn()) {
        this.tick()
        this.i = setInterval(() => {this.tick()}, this.interval)
      }
    }
  }

  /**
   * Draw time and date
   */
  class Clock extends Ticker {
    constructor() {
      super(1000)
    }
    tick() {
      g.reset()
      const now = new Date
      drawText("time", this.text(now))
      drawText("date", require("locale").date(now, true))
    }
    text(time) {
      const l = require("locale")
      const is12hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"]
      if (!is12hour) {
        return l.time(time, true)
      }
      const date12 = new Date(time.getTime())
      const hours = date12.getHours()
      if (hours===0) {
        date12.setHours(12)
      } else if (hours>12) {
        date12.setHours(hours-12)
      }
      return l.time(date12, true)+l.meridian(time)
    }
  }

  /**
   * Update all info every second while fading out
   */
  class Fader extends Ticker {
    constructor() {
      super(defaults.track.interval) // redraw at same speed as scroller
    }
    tick() {
      drawMusic()
    }
    start() {
      this.since = Date.now()
      super.start()
    }
    stop() {
      super.stop()
      this.since = Date.now() // force redraw at 100% brightness
      drawMusic()
      this.since = null
    }
    brightness() {
      if (fadeOut.since) {
        return Math.max(0, 1-((Date.now()-fadeOut.since)/TIMEOUT))
      }
      return 1
    }
  }

  /**
   * Scroll long track names
   */
  class Scroller extends Ticker {
    constructor() {
      super(defaults.track.interval)
    }
    tick() {
      this.offset += defaults.track.step
      this.draw()
    }
    draw() {
      const s = defaults.track
      const sep = "   "
      g.setFont(s.font, s.size)
      g.setColor(infoColor("track"))
      const text = sep+info.track,
        text2 = text.repeat(2),
        w1 = g.stringWidth(text),
        bottom = screen.height-s.bottom
      this.offset = this.offset%w1
      g.setFontAlign(-1, 1)
      g.clearRect(0, bottom-s.size, screen.width, bottom)
        .drawString(text2, -this.offset, screen.height-s.bottom)
    }
    start() {
      this.offset = 0
      super.start()
    }
    stop() {
      super.stop()
      const s = defaults.track,
        bottom = screen.height-s.bottom
      g.clearRect(0, bottom-s.size, screen.width, bottom)
    }
  }

  function drawInfo(name, options) {
    drawText(name, info[name], Object.assign({
      color: infoColor(name),
      size: infoSize(name),
      force: fadeOut.active,
    }, options))
  }
  let oldText = {}
  function drawText(name, text, options) {
    if (name in oldText && oldText[name].text===text && !(options || {}).force) {
      return // nothing to do
    }
    const s = Object.assign(
      // deep clone defaults to prevent them being overwritten with options
      JSON.parse(JSON.stringify(defaults[name])),
      options || {},
    )
    g.setColor(s.color)
    g.setFont(s.font, s.size)
    const ax = "left" in s ? -1 : ("right" in s ? 1 : 0),
      ay = "top" in s ? -1 : ("bottom" in s ? 1 : 0)
    g.setFontAlign(ax, ay)
    // drawString coordinates
    const x = "left" in s ? s.left : ("right" in s ? screen.width-s.right : s.center),
      y = "top" in s ? s.top : ("bottom" in s ? screen.height-s.bottom : s.middle)
    // bounding rectangle
    const w = g.stringWidth(text), h = g.getFontHeight(),
      left = "left" in s ? x : ("right" in s ? x-w : x-w/2),
      top = "top" in s ? y : ("bottom" in s ? y-h : y-h/2)
    if (name in oldText) {
      const old = oldText[name]
      // only clear if text/area has changed
      if (old.text!==text
        || old.left!==left || old.top!==top
        || old.w!==w || old.h!==h) {
        g.clearRect(old.left, old.top, old.left+old.w, old.top+old.h)
      }
    }
    if (text.length) {
      g.drawString(text, x, y)
      // remember which rectangle to clear before next draw
      oldText[name] = {
        text: text,
        left: left, top: top,
        w: w, h: h,
      }
    } else {
      delete oldText[name]
    }
  }

  /**
   *
   * @param text
   * @return {number} Maximum font size to make text fit on screen
   */
  function fitText(text) {
    if (!text.length) {
      return Infinity
    }
    // Vector: make a guess, then shrink/grow until it fits
    const getWidth = (size) => g.setFont("Vector", size).stringWidth(text)
      , sw = screen.width
    let guess = Math.round(sw/(text.length*0.6))
    if (getWidth(guess)===sw) { // good guess!
      return guess
    }
    if (getWidth(guess)<sw) {
      do {
        guess++
      } while(getWidth(guess)<=sw)
      return guess-1
    }
    // width > target
    do {
      guess--
    } while(getWidth(guess)>sw)
    return guess
  }

  /**
   * @param name
   * @return {number} Font size to use for given info
   */
  function infoSize(name) {
    if (name==="num") { // fixed size
      return defaults[name].size
    }
    return Math.min(
      defaults[name].size,
      fitText(info[name]),
    )
  }
  /**
   * @param name
   * @return {string} Semi-random color to use for given info
   */
  let infoColors = {}
  function infoColor(name) {
    let h, s, v
    if (name==="num") {
      // always white
      h = 0
      s = 0
    } else {
      // complicated scheme to make color depend deterministically on info
      // s=1 and hue depends on the text, so we always get a bright color
      let text = ""
      switch(name) {
        case "track":
          text = info.track
        // fallthrough: also use album+artist
        case "album":
          text += info.album
        // fallthrough: also use artist
        case "artist":
          text += info.artist
          break
        default:
          text = info[name]
      }
      if (name in infoColors && infoColors[name].text===text && !fadeOut.active) {
        return infoColors[name].color
      }
      let code = 0 // just the sum of all ascii values of text
      text.split("").forEach(c => code += c.charCodeAt(0))
      // dark magic
      h = code%360
      s = 1
    }
    v = fadeOut.brightness()
    const hsv2rgb = (h, s, v) => {
      const f = (n) => {
        const k = (n+h/60)%6
        return v-v*s*Math.max(Math.min(k, 4-k, 1), 0)
      }
      return {r: f(5), g: f(3), b: f(1)}
    }
    const rgb = hsv2rgb(h, s, v)
    const f2hex = (f) => ("00"+(Math.round(f*255)).toString(16)).substr(-2)
    const color = "#"+f2hex(rgb.r)+f2hex(rgb.g)+f2hex(rgb.b)
    infoColors[name] = color
    return color
  }

  let lastTrack
  function drawTrack() {
    // we try if we can squeeze this in with a slightly smaller font, but if
    // the title is too long we start up the scroller instead
    const trackInfo = ([info.artist, info.album, info.n, info.track]).join("-")
    if (trackInfo===lastTrack) {
      return // already visible
    }
    if (infoSize("track")<defaults.track.min_size) {
      scroller.start()
    } else {
      scroller.stop()
      drawInfo("track")
    }
    lastTrack = trackInfo
  }

  function drawArtistAlbum() {
    // we just use small enough fonts to make these always fit
    let album_middle = defaults.album.middle
    const artist_size = infoSize("artist")
    if (info.artist) {
      album_middle += defaults.artist.size
    }
    drawInfo("artist", {
      size: artist_size,
    })
    drawInfo("album", {
      middle: album_middle,
    })
  }
  const icons = {
    pause: function(x, y, s) {
      const w1 = s/3
      g.drawRect(x, y, x+w1, y+s)
      g.drawRect(x+s-w1, y, x+s, y+s)
    },
    play: function(x, y, s) {
      g.drawPoly([
        x, y,
        x+s, y+s/2,
        x, y+s,
      ], true)
    },
    previous: function(x, y, s) {
      const w2 = s*1/5
      g.drawPoly([
        x+s, y,
        x+w2, y+s/2,
        x+s, y+s,
      ], true)
      g.drawRect(x, y, x+w2, y+s)
    },
    next: function(x, y, s) {
      const w2 = s*4/5
      g.drawPoly([
        x, y,
        x+w2, y+s/2,
        x, y+s,
      ], true)
      g.drawRect(x+w2, y, x+s, y+s)
    },
  }
  function controlColor(control) {
    const s = defaults.controls
    if (volCmd && control===volCmd) {
      // volume button kept pressed down
      return s.activeColor
    }
    return (control in tCommand) ? s.activeColor : s.color
  }
  function drawControl(control, x, y) {
    g.setColor(controlColor(control))
    const s = defaults.controls.size
    if (state!==controlState) {
      g.clearRect(x, y, x+s, y+s)
    }
    icons[control](x, y, s)
  }
  let controlState
  function drawControls() {
    const s = defaults.controls
    if (state==="play") {
      // left touch
      drawControl("pause", s.left, screen.height-(s.bottom+s.size))
      // right touch
      drawControl("next", screen.width-(s.right+s.size), screen.height-(s.bottom+s.size))
    } else {
      drawControl("previous", s.left, screen.height-(s.bottom+s.size))
      drawControl("play", screen.width-(s.right+s.size), screen.height-(s.bottom+s.size))
    }
    g.setFont("6x8", s.volSize)
    // BTN1
    g.setFontAlign(1, -1)
    g.setColor(controlColor("volumeup"))
    g.drawString("+", screen.width, s.top)
    // BTN2
    g.setFontAlign(1, 1)
    g.setColor(controlColor("volumedown"))
    g.drawString("-", screen.width, screen.height-s.bottom)
    controlState = state
  }

  function setNumInfo() {
    info.num = ""
    if ("n" in info && info.n>0) {
      info.num = "#"+info.n
      if ("c" in info && info.c>0) { // I've seen { c:-1 }
        info.num += "/"+info.c
      }
    }
  }
  function drawMusic() {
    g.reset()
    setNumInfo()
    drawInfo("num")
    drawTrack()
    drawArtistAlbum()
    drawControls()
  }
  let tQuit
  function updateMusic() {
    // if paused for five minutes, load the clock
    // (but timeout resets if we get new info, even while paused)
    if (tQuit) {
      clearTimeout(tQuit)
    }
    tQuit = null
    if (state!=="play" && autoClose) {
      if (state==="stop") { // never actually happens with my phone :-(
        load()
      } else { // also quit when paused for a long time
        tQuit = setTimeout(load, TIMEOUT)
        fadeOut.start()
      }
    } else {
      fadeOut.stop()
    }
    drawMusic()
  }

  // create tickers
  const clock = new Clock()
  const fadeOut = new Fader()
  const scroller = new Scroller()

  ////////////////////
  // Events
  ////////////////////

  // pause timers while screen is off
  Bangle.on("lcdPower", on => {
    if (on) {
      clock.resume()
      scroller.resume()
      fadeOut.resume()
    } else {
      clock.pause()
      scroller.pause()
      fadeOut.pause()
    }
  })

  let tLauncher
  // we put starting of watches inside a function, so we can defer it until we
  // asked the user about autoStart
  function startLauncherWatch() {
    // long-press: launcher
    // short-press: toggle play/pause
    setWatch(function() {
      if (tLauncher) {
        clearTimeout(tLauncher)
      }
      tLauncher = setTimeout(Bangle.showLauncher, 1000)
    }, BTN2, {repeat: true, edge: "rising"})
    setWatch(function() {
      if (tLauncher) {
        clearTimeout(tLauncher)
        tLauncher = null
      }
      togglePlay()
    }, BTN2, {repeat: true, edge: "falling"})
  }

  let tCommand = {}
  /**
   * Send command and highlight corresponding control
   * @param command "play/pause/next/previous/volumeup/volumedown"
   */
  function sendCommand(command) {
    Bluetooth.println(JSON.stringify({t: "music", n: command}))
    // for controlColor
    if (command in tCommand) {
      clearTimeout(tCommand[command])
    }
    tCommand[command] = setTimeout(function() {
      delete tCommand[command]
      drawControls()
    }, defaults.controls.highlight)
    drawControls()
  }

  // BTN1/3: volume control (with repeat after long-press)
  let tVol, volCmd
  function volUp() {
    volStart("up")
  }
  function volDown() {
    volStart("down")
  }
  function volStart(dir) {
    const command = "volume"+dir
    stopVol()
    sendCommand(command)
    volCmd = command
    tVol = setTimeout(repeatVol, 500)
  }
  function repeatVol() {
    sendCommand(volCmd)
    tVol = setTimeout(repeatVol, 100)
  }
  function stopVol() {
    if (tVol) {
      clearTimeout(tVol)
      tVol = null
    }
    volCmd = null
    drawControls()
  }
  function startVolWatches() {
    setWatch(volUp, BTN1, {repeat: true, edge: "rising"})
    setWatch(stopVol, BTN1, {repeat: true, edge: "falling"})
    setWatch(volDown, BTN3, {repeat: true, edge: "rising"})
    setWatch(stopVol, BTN3, {repeat: true, edge: "falling"})
  }

  // touch/swipe: navigation
  function togglePlay() {
    sendCommand(state==="play" ? "pause" : "play")
  }
  function startTouchWatches() {
    Bangle.on("touch", function(side) {
      switch(side) {
        case 1:
          sendCommand(state==="play" ? "pause" : "previous")
          break
        case 2:
          sendCommand(state==="play" ? "next" : "play")
          break
        case 3:
          togglePlay()
      }
    })
    Bangle.on("swipe", function(dir) {
      sendCommand(dir===1 ? "previous" : "next")
    })
  }
  /////////////////////
  // Startup
  /////////////////////
  // check for saved music state (by widget) to load
  g.clear()
  global.gbmusic_active = true // we don't need our widget
  Bangle.loadWidgets()
  Bangle.drawWidgets()
  delete (global.gbmusic_active)

  function startEmulator() {
    if (typeof Bluetooth==="undefined") { // emulator!
      Bluetooth = {
        println: (line) => {console.log("Bluetooth:", line)},
      }
      // some example info
      GB({"t": "musicinfo", "artist": "Some Artist Name", "album": "The Album Name", "track": "The Track Title Goes Here", "dur": 241, "c": 2, "n": 2})
      GB({"t": "musicstate", "state": "play", "position": 0, "shuffle": 1, "repeat": 1})
    }
  }
  function startWatches() {
    startVolWatches()
    startLauncherWatch()
    startTouchWatches()
  }
  function start() {
    // start listening for music updates
    const _GB = global.GB
    global.GB = (event) => {
      // we eat music events!
      switch(event.t) {
        case "musicinfo":
          info = event
          delete (info.t)
          break
        case "musicstate":
          state = event.state
          break
        default:
          // pass on other events
          if (_GB) {
            setTimeout(_GB, 0, event)
          }
          return // no drawMusic
      }
      updateMusic()
    }
    startWatches()
    drawMusic()
    clock.start()
    startEmulator()
  }

  let saved = require("Storage").readJSON("gbmusic.load.json", true)
  require("Storage").erase("gbmusic.load.json")
  if (saved) {
    // autoloaded: load state was saved by widget
    info = saved.info
    state = saved.state
    delete (saved)
    autoClose = true
    start()
  } else {
    const s = require("Storage").readJSON("gbmusic.json", 1) || {}
    if (!("autoStart" in s)) {
      // user opened the app, but has not picked a setting yet
      // ask them about autoloading now
      E.showPrompt(
        "Automatically load\n"+
        "when playing music?\n",
      ).then(function(autoStart) {
        s.autoStart = autoStart
        require("Storage").writeJSON("gbmusic.json", s)
        setTimeout(start, 0)
      })
    } else {
      start()
    }
  }
}
