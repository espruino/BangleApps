/**
 * Regatta Timer
 * speed of advance
 */
const Layout = require("Layout");
const locale = require("locale").name.substring(0, 2);

// "Anton" bold font
Graphics.prototype.setFontAnton = function(scale) {
  // Actual height 69 (68 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAA/gAAAAAAAAAAP/gAAAAAAAAAH//gAAAAAAAAB///gAAAAAAAAf///gAAAAAAAP////gAAAAAAD/////gAAAAAA//////gAAAAAP//////gAAAAH///////gAAAB////////gAAAf////////gAAP/////////gAD//////////AA//////////gAA/////////4AAA////////+AAAA////////gAAAA///////wAAAAA//////8AAAAAA//////AAAAAAA/////gAAAAAAA////4AAAAAAAA///+AAAAAAAAA///gAAAAAAAAA//wAAAAAAAAAA/8AAAAAAAAAAA/AAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////AAAAAB///////8AAAAH////////AAAAf////////wAAA/////////4AAB/////////8AAD/////////+AAH//////////AAP//////////gAP//////////gAP//////////gAf//////////wAf//////////wAf//////////wAf//////////wA//8AAAAAB//4A//wAAAAAAf/4A//gAAAAAAP/4A//gAAAAAAP/4A//gAAAAAAP/4A//wAAAAAAf/4A///////////4Af//////////wAf//////////wAf//////////wAf//////////wAP//////////gAP//////////gAH//////////AAH//////////AAD/////////+AAB/////////8AAA/////////4AAAP////////gAAAD///////+AAAAAf//////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAP/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/AAAAAAAAAAA//AAAAAAAAAAA/+AAAAAAAAAAB/8AAAAAAAAAAD//////////gAH//////////gAP//////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/4AAAAB/gAAD//4AAAAf/gAAP//4AAAB//gAA///4AAAH//gAB///4AAAf//gAD///4AAA///gAH///4AAD///gAP///4AAH///gAP///4AAP///gAf///4AAf///gAf///4AB////gAf///4AD////gA////4AH////gA////4Af////gA////4A/////gA//wAAB/////gA//gAAH/////gA//gAAP/////gA//gAA///8//gA//gAD///w//gA//wA////g//gA////////A//gA///////8A//gA///////4A//gAf//////wA//gAf//////gA//gAf/////+AA//gAP/////8AA//gAP/////4AA//gAH/////gAA//gAD/////AAA//gAB////8AAA//gAA////wAAA//gAAP///AAAA//gAAD//8AAAA//gAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/+AAAAAD/wAAB//8AAAAP/wAAB///AAAA//wAAB///wAAB//wAAB///4AAD//wAAB///8AAH//wAAB///+AAP//wAAB///+AAP//wAAB////AAf//wAAB////AAf//wAAB////gAf//wAAB////gA///wAAB////gA///wAAB////gA///w//AAf//wA//4A//AAA//wA//gA//AAAf/wA//gB//gAAf/wA//gB//gAAf/wA//gD//wAA//wA//wH//8AB//wA///////////gA///////////gA///////////gA///////////gAf//////////AAf//////////AAP//////////AAP/////////+AAH/////////8AAH///+/////4AAD///+f////wAAA///8P////gAAAf//4H///+AAAAH//gB///wAAAAAP4AAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAA//wAAAAAAAAAP//wAAAAAAAAB///wAAAAAAAAf///wAAAAAAAH////wAAAAAAA/////wAAAAAAP/////wAAAAAB//////wAAAAAf//////wAAAAH///////wAAAA////////wAAAP////////wAAA///////H/wAAA//////wH/wAAA/////8AH/wAAA/////AAH/wAAA////gAAH/wAAA///4AAAH/wAAA//+AAAAH/wAAA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gAAAAAAAAH/4AAAAAAAAAAH/wAAAAAAAAAAH/wAAAAAAAAAAH/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//8AAA/////+B///AAA/////+B///wAA/////+B///4AA/////+B///8AA/////+B///8AA/////+B///+AA/////+B////AA/////+B////AA/////+B////AA/////+B////gA/////+B////gA/////+B////gA/////+A////gA//gP/gAAB//wA//gf/AAAA//wA//gf/AAAAf/wA//g//AAAAf/wA//g//AAAA//wA//g//gAAA//wA//g//+AAP//wA//g////////gA//g////////gA//g////////gA//g////////gA//g////////AA//gf///////AA//gf//////+AA//gP//////+AA//gH//////8AA//gD//////4AA//gB//////wAA//gA//////AAAAAAAH////8AAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////gAAAAB///////+AAAAH////////gAAAf////////4AAB/////////8AAD/////////+AAH//////////AAH//////////gAP//////////gAP//////////gAf//////////wAf//////////wAf//////////wAf//////////wAf//////////4A//wAD/4AAf/4A//gAH/wAAP/4A//gAH/wAAP/4A//gAP/wAAP/4A//gAP/4AAf/4A//wAP/+AD//4A///wP//////4Af//4P//////wAf//4P//////wAf//4P//////wAf//4P//////wAP//4P//////gAP//4H//////gAH//4H//////AAH//4D/////+AAD//4D/////8AAB//4B/////4AAA//4A/////wAAAP/4AP////AAAAB/4AD///4AAAAAAAAAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAAAAAAAAA//gAAAAAAAAAA//gAAAAAAAAAA//gAAAAAAADgA//gAAAAAAP/gA//gAAAAAH//gA//gAAAAB///gA//gAAAAP///gA//gAAAD////gA//gAAAf////gA//gAAB/////gA//gAAP/////gA//gAB//////gA//gAH//////gA//gA///////gA//gD///////gA//gf///////gA//h////////gA//n////////gA//////////gAA/////////AAAA////////wAAAA///////4AAAAA///////AAAAAA//////4AAAAAA//////AAAAAAA/////4AAAAAAA/////AAAAAAAA////8AAAAAAAA////gAAAAAAAA///+AAAAAAAAA///4AAAAAAAAA///AAAAAAAAAA//4AAAAAAAAAA/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gB///wAAAAP//4H///+AAAA///8P////gAAB///+f////4AAD///+/////8AAH/////////+AAH//////////AAP//////////gAP//////////gAf//////////gAf//////////wAf//////////wAf//////////wA///////////wA//4D//wAB//4A//wB//gAA//4A//gA//gAAf/4A//gA//AAAf/4A//gA//gAAf/4A//wB//gAA//4A///P//8AH//4Af//////////wAf//////////wAf//////////wAf//////////wAf//////////gAP//////////gAP//////////AAH//////////AAD/////////+AAD///+/////8AAB///8f////wAAAf//4P////AAAAH//wD///8AAAAA/+AAf//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//gAAAAAAAAB///+AA/+AAAAP////gA//wAAAf////wA//4AAB/////4A//8AAD/////8A//+AAD/////+A///AAH/////+A///AAP//////A///gAP//////A///gAf//////A///wAf//////A///wAf//////A///wAf//////A///wA///////AB//4A//4AD//AAP/4A//gAB//AAP/4A//gAA//AAP/4A//gAA/+AAP/4A//gAB/8AAP/4A//wAB/8AAf/4Af//////////wAf//////////wAf//////////wAf//////////wAf//////////wAP//////////gAP//////////gAH//////////AAH/////////+AAD/////////8AAB/////////4AAAf////////wAAAP////////AAAAB///////4AAAAAD/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAB/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("EiAnGicnJycnJycnEw=="), 78 + (scale << 8) + (1 << 16));
};

/*
function Dial(dial) {
  return {
    "numeric": {
      splash: function() {

      },
      start: function() {
      },
      race: function() {
      }
    },
    "circle": {
      start: function() {
      },
      race: function() {
      }
    }
  }[dial];
}
*/
function Regattatimer() {
  return {
    layout: undefined,
    mode: "idle", // idle, start, race"
    countdown: 300, // 5 minutes
    counter: undefined,
    interval: undefined,
    raceTimeStart: undefined,

    // compass settings
    calibrated: false,
    directions: [
      "N",
      //       NNO: {22.5, 22.5},
      "NE",
      //       ONO: {67.5, 67.5},
      "E",
      //       OSO: {112.5, 112.5},
      "SE",
      //       SSO: {157.5, 157.5},
      "S",
      //       SSW: {202.5, 202.5},
      "SW",
      //       WSW: {247.5, 247.5},
      "W",
      //       WNW: {292.5, 292.5},
      "NW",
      //       NNW: {337.5, 337.5},
    ],

    settings: Object.assign({
      "debug": false,
      "dial": "numeric",
      "gps": false,
      "compass": false,
      "fgColor": "#FFFF00",
      "bgColor": "#000000"
    }, require('Storage').readJSON("regattatimer.json", true) || {}),

    translations: Object.assign({
       "de": {
        "speed": "FüG",
        "speed_unit": "kn"
      },
      "en": {
        "speed": "SOA",
        "speed_unit": "kn"
      }
    }, require('Storage').readJSON("translations.json", true) || {}),

    translate: function(slug) {
      return this.translations[locale][slug];
    },
    /**
     * During the start phase, the the clock counts down 5 4 1 minutes.
     * On button press, the countdown begins again.
     */
    startCounter: function() {

      this.counter --;

      if(this.counter >= 0) {
        var counterMinutes = parseInt(this.counter / 60);

        if(counterMinutes > 0) {
          this.layout.minutes.label = counterMinutes;
          this.layout.seconds.label = "0".concat(this.counter - counterMinutes * 60).toString().slice(-2);
          this.layout.render();
        }
        else {
          this.setLayoutStartSec();
          //this.layout.seconds.label = "0".concat(this.counter.toString()).slice(-2);
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
    padZeroLeft: function(s) {
      return "0".concat(s).slice(-2);
    },
    formatTime: function(time) {
      var hours = parseInt(time / 3600);
      var minutes = parseInt(time / 60);
      var seconds = time - (minutes * 60);

      return this.padZeroLeft(hours.toString())
        .concat(":")
        .concat(this.padZeroLeft(minutes.toString()))
        .concat(":")
        .concat(this.padZeroLeft(seconds.toString()));
    },
    raceCounter: function() {
      Bangle.setLCDPower(1);

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

      Bangle.buzz();

      this.counter = 0;

      // switch to race mode
      this.mode = "race";
      this.setLayoutRace();
      this.raceCounter();
      this.interval = setInterval((() => {
        this.raceCounter();
      }).bind(this), 1000);
    },
    /**
     * Show an initial splash screen
     */
    /*
    setLayoutSplash: function() {

      g.clear();

      (new Layout({
        type: "v",
        bgCol: this.settings.bgColor,
        c: [
          {type: "txt", font: "17%", label: ""},
          {type: "txt", font: "17%", col: this.settings.fgColor, label: "REGATTA\nTIMER"},
          {type: "txt", font: "6x8", col: this.settings.fgColor, label: "v0.1"},
          {type: "txt", font: "6x8", col: this.settings.fgColor, fillx: true, filly: true, pad: 4, label: "BUTTON PUSH -> start"},
          {type: "txt", font: "6x8", col: this.settings.fgColor, fillx: true, pad: 4, label: "(c) 2021-2023\nNaden Badalgogtapeh"}
        ]}, {lazy:true})).render();
    },
    */

    setLayoutIdle: function() {

      g.clear();

      this.mode = "idle";

      (new Layout({
        type: "v",
        bgCol: this.settings.bgColor,
        c: [
          {
            type: "h",
            c: [
              {type: "txt", font: "Anton", label: "5", col: this.settings.fgColor, id: "minutes", fillx: 1, filly: 1},
            ]
          }
        ]}, {lazy:true})).render();
    },
    resetCounter: function() {
      if(this.interval) {
        clearInterval(this.interval);
        this.interval = undefined;
      }
      this.counter = this.countdown;
    },
    setLayoutStartMinSec: function() {
      g.clear();

      this.layout = new Layout({
        type: "v",
        bgCol: this.settings.bgColor,
        c: [
          {
            type: "h",
            c: [
              {type: "txt", font: "Anton", label: "4", col: this.settings.fgColor, id: "minutes", fillx: 1, filly: 1},
              {type: "txt", font: "Anton", label: "59", col: this.settings.fgColor, id: "seconds", fillx: 1, filly: 1},
            ]
          }
        ]}, {lazy:true});

      //this.layout.render();
    },
    setLayoutStartSec: function() {
      g.clear();

      this.layout = new Layout({
        type: "v",
        bgCol: this.settings.bgColor,
        c:[
          {type: "txt", font: "Anton", label: "", fillx: true, filly: true, col: this.settings.fgColor, id: "seconds"},
        ]}, {lazy:true});
    },
    setLayoutRace: function() {
      g.clear();

      this.layout = new Layout({
        type: "v",
        bgCol: this.settings.bgColor,
        c: [
          {type: "txt", font: "20%", label: "00:00:00", col: this.settings.fgColor, pad: 4, filly: 1, fillx: 1, id: "racetime"},
          {type: "txt", font: "20%", label: "-", col: this.settings.fgColor, pad: 4, filly:1, fillx:1, id: "compass"},
          // horizontal
          {type: "h", c: [
            {type:"txt", font:"10%", label: this.translate("speed"), col: this.settings.fgColor, pad:4, fillx:1, filly:1},
            {type:"txt", font:"15%", label: "...", col: this.settings.fgColor, pad:4, fillx:1, filly:1, id: "speed"},
            {type:"txt", font:"10%", label: this.translate("speed_unit"), col: this.settings.fgColor, pad:4, fillx:1, filly:1},
          ]},
          {type: "h", c: [
            {type: "txt", font: "10%", label: "-", col: this.settings.fgColor, pad: 4, filly: 1, fillx: 1, id: "satellites"},
            {type: "txt", font: "10%", label: "00:00", col: this.settings.fgColor, pad: 4, filly: 1, fillx: 1, halign: 1, id: "daytime"},
          ]}
      ]},{lazy:true});
    },
    onGPS: function(fix) {
      if(this.mode == "race") {
        if(fix.fix && isFinite(fix.speed)) {
          this.layout.speed.label = fix.speed.toFixed(2); //m[1];
        }
        this. layout.satellites.label = "Sats: ".concat(fix.satellites);
      }
    },
    /*
    onCompass: function(data) {

      if(this.mode == "race") {
        if(this.calibrated) {
          this.layout.compass.label = this.directions[data.heading.toFixed(0) % 8];
        }
        else {
          this.layout.compass.label = "turn 360°";
        }

        var start = data.heading.toFixed(0) - 90;

        if(start<0) {
          start += 360;
        }

        var frag = 15 - start%15;
        if (frag<15) {}else frag = 0;
        var res = start + frag;

        var label = '?';

       if(res%90==0){
        label = this.directions[Math.floor(res/45)%8];
      } else if (res%45==0) {
        label = this.directions[Math.floor(res/45)%8];
      }

       //this.layout.compass.label = this.directions[data.heading.toFixed(0) % 8].concat(" ").concat(data.heading.toFixed(0).toString())
       this.layout.compass.label = label.concat(" ").concat(data.heading.toFixed(0).toString().concat("°"))
      }
    },
    */
    init: function() {

      if(this.settings.debug) {
        this.countdown = 1;
      }

      Bangle.setLCDPower(1);
      Bangle.setLCDTimeout(0);

      this.setLayoutIdle();

      var onButtonClick = ((ev) => {

        // "idle" or "start" mode, a button click (re)starts the start counter
        switch(this.mode) {
          case "idle":
            this.resetCounter();
            this.mode = "start";
            this.setLayoutStartMinSec();
            this.startCounter();
            this.interval = setInterval((() => {
              this.startCounter();
            }).bind(this), 1000);
            break;
          case "stoped":
          case "start":
            this.resetCounter();
            this.setLayoutIdle();
            break;
          // "race" mode, a button click triggers a time snapshot and stops
          case "race":
            this.raceCounterStop();
            break;
        }

      }).bind(this);

      setWatch(onButtonClick, BTN1, true);
    }
  }
}

var regattatimer = Regattatimer()

regattatimer.init();

if(regattatimer.settings.gps) {
  Bangle.setGPSPower(1);
  Bangle.on('GPS', regattatimer.onGPS.bind(regattatimer));
}

if(regattatimer.settings.compass) {
  Bangle.setCompassPower(1);
  Bangle.on('mag', regattatimer.onCompass.bind(regattatimer));
}

Bangle.on('kill',function() {
  if(regattatimer.settings.gps) {
    Bangle.setGPSPower(0);
  }

  if(regattatimer.settings.compass) {
    Bangle.setCompassPower(0);
  }
});
