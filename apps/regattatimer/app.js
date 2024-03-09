/**
 * Regatta Timer
 */
const Layout = require("Layout");
const locale = require("locale").name == "system" ? "en" : require("locale").name.substring(0, 2);

// "Anton" bold font
Graphics.prototype.setFontAnton = function(scale) {
  // Actual height 69 (68 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAA/gAAAAAAAAAAP/gAAAAAAAAAH//gAAAAAAAAB///gAAAAAAAAf///gAAAAAAAP////gAAAAAAD/////gAAAAAA//////gAAAAAP//////gAAAAH///////gAAAB////////gAAAf////////gAAP/////////gAD//////////AA//////////gAA/////////4AAA////////+AAAA////////gAAAA///////wAAAAA//////8AAAAAA//////AAAAAAA/////gAAAAAAA////4AAAAAAAA///+AAAAAAAAA///gAAAAAAAAA//wAAAAAAAAAA/8AAAAAAAAAAA/AAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////AAAAAB///////8AAAAH////////AAAAf////////wAAA/////////4AAB/////////8AAD/////////+AAH//////////AAP//////////gAP//////////gAP//////////gAf//////////wAf//////////wAf//////////wAf//////////wA//8AAAAAB//4A//wAAAAAAf/4A//gAAAAAAP/4A//gAAAAAAP/4A//gAAAAAAP/4A//wAAAAAAf/4A///////////4Af//////////wAf//////////wAf//////////wAf//////////wAP//////////gAP//////////gAH//////////AAH//////////AAD/////////+AAB/////////8AAA/////////4AAAP////////gAAAD///////+AAAAAf//////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAP/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/AAAAAAAAAAA//AAAAAAAAAAA/+AAAAAAAAAAB/8AAAAAAAAAAD//////////gAH//////////gAP//////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/4AAAAB/gAAD//4AAAAf/gAAP//4AAAB//gAA///4AAAH//gAB///4AAAf//gAD///4AAA///gAH///4AAD///gAP///4AAH///gAP///4AAP///gAf///4AAf///gAf///4AB////gAf///4AD////gA////4AH////gA////4Af////gA////4A/////gA//wAAB/////gA//gAAH/////gA//gAAP/////gA//gAA///8//gA//gAD///w//gA//wA////g//gA////////A//gA///////8A//gA///////4A//gAf//////wA//gAf//////gA//gAf/////+AA//gAP/////8AA//gAP/////4AA//gAH/////gAA//gAD/////AAA//gAB////8AAA//gAA////wAAA//gAAP///AAAA//gAAD//8AAAA//gAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/+AAAAAD/wAAB//8AAAAP/wAAB///AAAA//wAAB///wAAB//wAAB///4AAD//wAAB///8AAH//wAAB///+AAP//wAAB///+AAP//wAAB////AAf//wAAB////AAf//wAAB////gAf//wAAB////gA///wAAB////gA///wAAB////gA///w//AAf//wA//4A//AAA//wA//gA//AAAf/wA//gB//gAAf/wA//gB//gAAf/wA//gD//wAA//wA//wH//8AB//wA///////////gA///////////gA///////////gA///////////gAf//////////AAf//////////AAP//////////AAP/////////+AAH/////////8AAH///+/////4AAD///+f////wAAA///8P////gAAAf//4H///+AAAAH//gB///wAAAAAP4AAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAA//wAAAAAAAAAP//wAAAAAAAAB///wAAAAAAAAf///wAAAAAAAH////wAAAAAAA/////wAAAAAAP/////wAAAAAB//////wAAAAAf//////wAAAAH///////wAAAA////////wAAAP////////wAAA///////H/wAAA//////wH/wAAA/////8AH/wAAA/////AAH/wAAA////gAAH/wAAA///4AAAH/wAAA//+AAAAH/wAAA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gAAAAAAAAH/4AAAAAAAAAAH/wAAAAAAAAAAH/wAAAAAAAAAAH/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//8AAA/////+B///AAA/////+B///wAA/////+B///4AA/////+B///8AA/////+B///8AA/////+B///+AA/////+B////AA/////+B////AA/////+B////AA/////+B////gA/////+B////gA/////+B////gA/////+A////gA//gP/gAAB//wA//gf/AAAA//wA//gf/AAAAf/wA//g//AAAAf/wA//g//AAAA//wA//g//gAAA//wA//g//+AAP//wA//g////////gA//g////////gA//g////////gA//g////////gA//g////////AA//gf///////AA//gf//////+AA//gP//////+AA//gH//////8AA//gD//////4AA//gB//////wAA//gA//////AAAAAAAH////8AAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////gAAAAB///////+AAAAH////////gAAAf////////4AAB/////////8AAD/////////+AAH//////////AAH//////////gAP//////////gAP//////////gAf//////////wAf//////////wAf//////////wAf//////////wAf//////////4A//wAD/4AAf/4A//gAH/wAAP/4A//gAH/wAAP/4A//gAP/wAAP/4A//gAP/4AAf/4A//wAP/+AD//4A///wP//////4Af//4P//////wAf//4P//////wAf//4P//////wAf//4P//////wAP//4P//////gAP//4H//////gAH//4H//////AAH//4D/////+AAD//4D/////8AAB//4B/////4AAA//4A/////wAAAP/4AP////AAAAB/4AD///4AAAAAAAAAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAAAAAAAAA//gAAAAAAAAAA//gAAAAAAAAAA//gAAAAAAADgA//gAAAAAAP/gA//gAAAAAH//gA//gAAAAB///gA//gAAAAP///gA//gAAAD////gA//gAAAf////gA//gAAB/////gA//gAAP/////gA//gAB//////gA//gAH//////gA//gA///////gA//gD///////gA//gf///////gA//h////////gA//n////////gA//////////gAA/////////AAAA////////wAAAA///////4AAAAA///////AAAAAA//////4AAAAAA//////AAAAAAA/////4AAAAAAA/////AAAAAAAA////8AAAAAAAA////gAAAAAAAA///+AAAAAAAAA///4AAAAAAAAA///AAAAAAAAAA//4AAAAAAAAAA/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gB///wAAAAP//4H///+AAAA///8P////gAAB///+f////4AAD///+/////8AAH/////////+AAH//////////AAP//////////gAP//////////gAf//////////gAf//////////wAf//////////wAf//////////wA///////////wA//4D//wAB//4A//wB//gAA//4A//gA//gAAf/4A//gA//AAAf/4A//gA//gAAf/4A//wB//gAA//4A///P//8AH//4Af//////////wAf//////////wAf//////////wAf//////////wAf//////////gAP//////////gAP//////////AAH//////////AAD/////////+AAD///+/////8AAB///8f////wAAAf//4P////AAAAH//wD///8AAAAA/+AAf//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//gAAAAAAAAB///+AA/+AAAAP////gA//wAAAf////wA//4AAB/////4A//8AAD/////8A//+AAD/////+A///AAH/////+A///AAP//////A///gAP//////A///gAf//////A///wAf//////A///wAf//////A///wAf//////A///wA///////AB//4A//4AD//AAP/4A//gAB//AAP/4A//gAA//AAP/4A//gAA/+AAP/4A//gAB/8AAP/4A//wAB/8AAf/4Af//////////wAf//////////wAf//////////wAf//////////wAf//////////wAP//////////gAP//////////gAH//////////AAH/////////+AAD/////////8AAB/////////4AAAf////////wAAAP////////AAAAB///////4AAAAAD/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAB/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("EiAnGicnJycnJycnEw=="), 78 + (scale << 8) + (1 << 16));
};

function Regattatimer() {
  return {
    layout: undefined,
    /*
    layouts: {
      idle: function() {
        switch(settings.dial) {
          case "Discs":
            break;
          case "Numeric":
          default:
            break;
        }
      },
      start: function(phase) {
        switch(settings.dial) {
          case "Discs":
            break;
          case "Numeric":
          default:
            break;
        }
      },
      race: function() {
      }
    },
    */
    mode: "idle", // idle, start, race"
    countdown: 300, // 5 minutes
    counter: undefined,
    interval: undefined,
    theme: null,
    themes: {
      "Light": {
        "fgColor": "#000000",
        "bgColor": "#FFFF00",
      },
      "Dark": {
        "fgColor": "#FFFF00",
        "bgColor": "#000000",
      }
    },
    icons: {
      "battery": function() {
        return Graphics.createImage(`
 XXXX
X    X
X XX X
X    X
X XX X
X    X
X XX X
X    X
X XX X
X    X
XXXXXX`);
      },
      "satellites": function() {
        return Graphics.createImage(`
      X
     XoX
    XoX
   XoX
  XoX o   X
 XoX o o XoX
XoX o o XoX
 X   o XoX
      XoX
     XoX
    XoX
     X`);
      },
    },
    settings: Object.assign({
      "debug": false,
      "buzzer": true,
      "dial": "Numeric",
      "gps": true,
      "record": false,
      "theme": "Dark",
    }, require('Storage').readJSON("regattatimer.json", true) || {}),

    translations: Object.assign({
       "de": {
        "speed": "FüG", // Fahrt über Grund
        "speed_unit": "kn"
      },
      "en": {
        "speed": "SOA", // SOA speed of advance
        "speed_unit": "kn"
      }
    }, require('Storage').readJSON("translations.json", true) || {}),

    init: function() {

      if(this.settings.debug) {
        this.countdown = 1;
      }

      this.theme = this.themes[this.settings.theme];

      Bangle.setLCDPower(1);
      Bangle.setLCDTimeout(0);

      // in "idle", "start" or "stoped" mode, a button click (re)starts the countdown
      // in "race" mode, a button click stops the counter
      var onButtonClick = (function(ev) {
        switch(this.mode) {
          case "idle":
            this.resetCounter();
            this.mode = "start";
            this.setLayoutStartMinSec();
            this.startCounter();
            this.interval = setInterval((function() {
              this.startCounter();
            }).bind(this), 1000);
            break;
          case "stoped":
          case "start":
            this.resetCounter();
            this.setLayoutIdle();
            break;
          case "race":
            this.raceCounterStop();
            break;
        }
      }).bind(this);

      setWatch(onButtonClick, BTN1, true);

      this.setLayoutIdle();
    },

    onGPS: function(fix) {
      if(this.mode == "race") {
        if(fix.fix && isFinite(fix.speed)) {
          this.layout.clear(layout.speed);
          this.layout.speed.label = fix.speed.toFixed(2);
          this.layout.render(this.layout.speed);
        }
        this.layout.satellites.label = fix.satellites;
      }
    },

    translate: function(slug) {
      return this.translations[locale][slug];
    },
    // during the start phase, the clock counts down 5 4 1 0 minutes
    // a button click restarts the countdown
    startCounter: function() {

      this.counter --;

      if(this.counter >= 0) {
        var counterMinutes = parseInt(this.counter / 60);

        if(counterMinutes > 0) {
          this.layout.minutes.label = counterMinutes;
          // this.layout.seconds.label = "0".concat(this.counter - counterMinutes * 60).toString().slice(-2);
          this.layout.seconds.label = this.padZeroLeft(this.counter - counterMinutes * 60);
          this.layout.render();
        }
        else {
          this.setLayoutStartSec();
          this.layout.seconds.label = this.counter.toString();
          this.layout.render();
        }
        // this keeps the watch LCD lit up
        g.flip();
      }
      // time is up
      else {
        this.raceCounterStart();
      }
    },
    padZeroLeft: function(str) {
      return str.toString().padStart(2, "0");
    },
    formatTime: function(time) {
      var
        minutes = parseInt(time / 60),
        seconds = time - (minutes * 60);

      return this.padZeroLeft(parseInt(time / 3600)) + ":" + this.padZeroLeft(minutes) + ":" + this.padZeroLeft(seconds);
    },
    raceCounter: function() {

      if(this.counter % 60 == 0) {
        this.layout.clear(this.layout.battery);
        this.layout.battery.label = E.getBattery() + "%";
        this.layout.render(this.layout.battery);
      }

      this.counter ++;

      this.layout.racetime.label = this.formatTime(this.counter);
      this.layout.daytime.label = require("locale").time(new Date(), 1);
      this.layout.render();

      // keeps the watch screen lit up
      g.flip();
    },
    raceCounterStop: function() {
      if(this.interval) {
        clearInterval(this.interval);
        this.interval = undefined;
      }
      this.mode = "stoped";
    },
    raceCounterStart: function() {
      if(this.interval) {
        clearInterval(this.interval);
        this.interval = undefined;
      }

      if(this.settings.buzzer) {
        Bangle.buzz();
      }

      this.counter = 0;
      // switch to race mode
      this.mode = "race";
      this.setLayoutRace();
      this.raceCounter();
      this.interval = setInterval((function() {
        this.raceCounter();
      }).bind(this), 1000);
    },

    resetCounter: function() {
      if(this.interval) {
        clearInterval(this.interval);
        this.interval = undefined;
      }
      this.counter = this.countdown;
    },

    setLayoutIdle: function() {

      g.clear();

      this.mode = "idle";

      this.layout = new Layout({
        type: "v",
        bgCol: this.theme.bgColor,
        c: [
          {
            type: "v",
            c: [
              {type: "txt", font: "Anton", label: "5", col: this.theme.fgColor, id: "minutes", fillx: 1, filly: 1},
              {type: "txt", font: "20%", label: "--:--", col: this.theme.fgColor, id: "daytime", fillx: 1, filly: 1}
            ]
          }
        ]}, {lazy: true});

        this.interval = setInterval((function() {
          this.layout.daytime.label = require("locale").time(new Date(), 1);
          this.layout.render();

          // keeps the watch screen lit up
          g.flip();
        }).bind(this), 1000);
    },
    setLayoutStartMinSec: function() {
      g.clear();

      this.layout = new Layout({
        type: "v",
        bgCol: this.theme.bgColor,
        c: [
          {
            type: "h",
            c: [
              {type: "txt", font: "Anton", label: "4", col: this.theme.fgColor, id: "minutes", fillx: 1, filly: 1},
              {type: "txt", font: "Anton", label: "59", col: this.theme.fgColor, id: "seconds", fillx: 1, filly: 1},
            ]
          }
        ]}, {lazy: true}
      );
    },
    setLayoutStartSec: function() {
      g.clear();

      this.layout = new Layout({
        type: "v",
        bgCol: this.theme.bgColor,
        c:[
          {type: "txt", font: "Anton", label: "", fillx: true, filly: true, col: this.theme.fgColor, id: "seconds"},
        ]}, {lazy: true});
    },
    setLayoutRace: function() {
      g.clear();

      this.layout = new Layout({
        type: "v",
        bgCol: this.theme.bgColor,
        c: [
          {type: "txt", font: "20%", label: "00:00:00", col: this.theme.fgColor, pad: 4, filly: 1, fillx: 1, id: "racetime"},
          {type: "txt", font: "15%", label: "-", col: this.theme.fgColor, pad: 4, filly:1, fillx:1, id: "daytime"},
          // horizontal
          {type: "h", c: [
            {type: "txt", font: "10%", label: this.translate("speed"), col: this.theme.fgColor, pad:4, fillx:1, filly:1},
            {type: "txt", font: "20%", label: "0", col: this.theme.fgColor, pad:4, fillx:1, filly:1, id: "speed"},
            {type: "txt", font: "10%", label: this.translate("speed_unit"), col: this.theme.fgColor, pad:4, fillx:1, filly:1},
          ]},
          {type: "h", c: [
            {type:"img", pad: 2, col: this.theme.fgColor, bgCol: this.theme.bgColor, src: this.icons.satellites()},
            {type: "txt", font: "10%", label: "0", col: this.theme.fgColor, pad: 2, filly:1, id: "satellites"},
            // hacky, use empty element with fillx to push the other elments to the left an right side
            {type: undefined, pad: 2, fillx: 1},
            {type:"img", pad: 2, col: this.theme.fgColor, bgCol: this.theme.bgColor, src: this.icons.battery()},
            {type: "txt", font: "10%", label: "-", col: this.theme.fgColor, pad: 2, filly: 1, id: "battery"},
          ]}
      ]}, {lazy: true});
    }
  };
}

var regattatimer = Regattatimer();
regattatimer.init();

if(regattatimer.settings.gps) {
  Bangle.setGPSPower(1);
  Bangle.on('GPS', regattatimer.onGPS.bind(regattatimer));
}

Bangle.on('kill', function() {
  Bangle.setLCDPower(0);
  Bangle.setLCDTimeout(10);
  /*
  if(regattatimer.settings.gps) {
    Bangle.setGPSPower(0);
  }
  */
});
