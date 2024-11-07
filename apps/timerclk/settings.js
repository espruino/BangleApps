(function(back) {
  const FILE = "timerclk.json";
  // Load settings
  var settings = require('Storage').readJSON(FILE, true) || {}
  settings.clock = Object.assign({
    "timeFont":"Anton",
    "timeFontSize":0,
    "dateFont":"6x8",
    "dateFontSize":2,
    "dowFont":"6x8",
    "dowFontSize":2,
    "specialFont":"6x8",
    "specialFontSize":2,
    "srssFont":"6x8",
    "srssFontSize":2,
    "shortDate":true,
    "showStopwatches":true,
    "showTimers":true,
    "showSrss":false,
  }, settings.clock||{});
  settings.stopwatch = Object.assign({
    "font":"Vector",
    "fontSize":40,
    "indexFont":"6x8",
    "indexFontSize":3,
    "buttonHeight":40,
  }, settings.stopwatch||{});
  settings.timer = Object.assign({
    "font":"Vector",
    "fontSize":40,
    "indexFont":"6x8",
    "indexFontSize":3,
    "buttonHeight":40,
    "vibrate":10,
  }, settings.timer||{});
  settings.alarm = Object.assign({
    "font":"Vector",
    "fontSize":40,
    "indexFont":"6x8",
    "indexFontSize":3,
    "buttonHeight":40,
    "vibrate":10,
  }, settings.alarm||{});
  var timeFonts = ["Anton"].concat(g.getFonts());

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  var mainMenu = {
    "" : { "title" : "Timer Clock" },
    "< Back" : () => back(),
    "Clock": ()=>{E.showMenu(clockMenu);},
    "Stopwatch": ()=>{E.showMenu(stopwatchMenu);},
    "Timer": ()=>{E.showMenu(timerMenu);},
    "Alarm": ()=>{E.showMenu(alarmMenu);},
  };
  var clockMenu = {
    "" : { "title" : "Clock" },
    "< Back" : () => E.showMenu(mainMenu),
    "time font":{
      value: 0|timeFonts.indexOf(settings.clock.timeFont),
      format: v => timeFonts[v],
      min: 0, max: timeFonts.length-1,
      onchange: v => {
        settings.clock.timeFont = timeFonts[v];
        writeSettings();
      }
    },
    "time size":{
      value: 0|settings.clock.timeFontSize,
      min: 0,
      onchange: v => {
        settings.clock.timeFontSize = v;
        writeSettings();
      }
    },
    "date font":{
      value: 0|g.getFonts().indexOf(settings.clock.dateFont),
      format: v => g.getFonts()[v],
      min: 0, max: g.getFonts().length-1,
      onchange: v => {
        settings.clock.dateFont = g.getFonts()[v];
        writeSettings();
      }
    },
    "date size":{
      value: 0|settings.clock.dateFontSize,
      min: 0,
      onchange: v => {
        settings.clock.dateFontSize = v;
        writeSettings();
      }
    },
    "dow font":{
      value: 0|g.getFonts().indexOf(settings.clock.dowFont),
      format: v => g.getFonts()[v],
      min: 0, max: g.getFonts().length-1,
      onchange: v => {
        settings.clock.dowFont = g.getFonts()[v];
        writeSettings();
      }
    },
    "dow size":{
      value: 0|settings.clock.dowFontSize,
      min: 0,
      onchange: v => {
        settings.clock.dowFontSize = v;
        writeSettings();
      }
    },
    "sun font":{
      value: 0|g.getFonts().indexOf(settings.clock.srssFont),
      format: v => g.getFonts()[v],
      min: 0, max: g.getFonts().length-1,
      onchange: v => {
        settings.clock.srssFont = g.getFonts()[v];
        writeSettings();
      }
    },
    "sun size":{
      value: 0|settings.clock.srssFontSize,
      min: 0,
      onchange: v => {
        settings.clock.srssFontSize = v;
        writeSettings();
      }
    },
    "short date": {
      value: !!settings.clock.shortDate,
      onchange: v => {
        settings.clock.shortDate = v;
        writeSettings();
      }
    },
    "stopwatches": {
      value: !!settings.clock.showStopwatches,
      onchange: v => {
        settings.clock.showStopwatches = v;
        writeSettings();
      }
    },
    "timers": {
      value: !!settings.clock.showTimers,
      onchange: v => {
        settings.clock.showTimers = v;
        writeSettings();
      }
    },
    "sun times": {
      value: !!settings.clock.showSrss,
      onchange: v => {
        settings.clock.showSrss = v;
        writeSettings();
      }
    },
  };
  
  var stopwatchMenu = {
    "" : { "title" : "Stopwatch" },
    "< Back" : () => E.showMenu(mainMenu),
    "font":{
      value: 0|g.getFonts().indexOf(settings.stopwatch.font),
      format: v => g.getFonts()[v],
      min: 0, max: g.getFonts().length-1,
      onchange: v => {
        settings.settings.stopwatch.font = g.getFonts()[v];
        writeSettings();
      }
    },
    "fontsize":{
      value: 0|settings.stopwatch.fontSize,
      min: 0,
      onchange: v => {
        settings.stopwatch.fontSize = v;
        writeSettings();
      }
    },
    "index font":{
      value: 0|g.getFonts().indexOf(settings.stopwatch.indexFont),
      format: v => g.getFonts()[v],
      min: 0, max: g.getFonts().length-1,
      onchange: v => {
        settings.settings.stopwatch.indexFont = g.getFonts()[v];
        writeSettings();
      }
    },
    "index size":{
      value: 0|settings.stopwatch.indexFontSize,
      min: 0,
      onchange: v => {
        settings.stopwatch.indexFontSize = v;
        writeSettings();
      }
    },
    "button height":{
      value: 0|settings.stopwatch.buttonHeight,
      min: 0,
      onchange: v => {
        settings.stopwatch.buttonHeight = v;
        writeSettings();
      }
    },
  };
  var timerMenu = {
    "" : { "title" : "Timer" },
    "< Back" : () => E.showMenu(mainMenu),
    "font":{
      value: 0|g.getFonts().indexOf(settings.timer.font),
      format: v => g.getFonts()[v],
      min: 0, max: g.getFonts().length-1,
      onchange: v => {
        settings.settings.timer.font = g.getFonts()[v];
        writeSettings();
      }
    },
    "fontsize":{
      value: 0|settings.timer.fontSize,
      min: 0,
      onchange: v => {
        settings.timer.fontSize = v;
        writeSettings();
      }
    },
    "index font":{
      value: 0|g.getFonts().indexOf(settings.timer.indexFont),
      format: v => g.getFonts()[v],
      min: 0, max: g.getFonts().length-1,
      onchange: v => {
        settings.settings.timer.indexFont = g.getFonts()[v];
        writeSettings();
      }
    },
    "index size":{
      value: 0|settings.timer.indexFontSize,
      min: 0,
      onchange: v => {
        settings.timer.indexFontSize = v;
        writeSettings();
      }
    },
    "button height":{
      value: 0|settings.timer.buttonHeight,
      min: 0,
      onchange: v => {
        settings.timer.buttonHeight = v;
        writeSettings();
      }
    },
    "vibrate":{
      value: 0|settings.timer.vibrate,
      min: 0,
      onchange: v=>{
        settings.timer.vibrate = v;
        writeSettings();
      }
    }
  };
  var alarmMenu = {
    "" : { "title" : "Alarm" },
    "< Back" : () => E.showMenu(mainMenu),
    "font":{
      value: 0|g.getFonts().indexOf(settings.alarm.font),
      format: v => g.getFonts()[v],
      min: 0, max: g.getFonts().length-1,
      onchange: v => {
        settings.settings.alarm.font = g.getFonts()[v];
        writeSettings();
      }
    },
    "fontsize":{
      value: 0|settings.alarm.fontSize,
      min: 0,
      onchange: v => {
        settings.alarm.fontSize = v;
        writeSettings();
      }
    },
    "index font":{
      value: 0|g.getFonts().indexOf(settings.alarm.indexFont),
      format: v => g.getFonts()[v],
      min: 0, max: g.getFonts().length-1,
      onchange: v => {
        settings.settings.alarm.indexFont = g.getFonts()[v];
        writeSettings();
      }
    },
    "index size":{
      value: 0|settings.alarm.indexFontSize,
      min: 0,
      onchange: v => {
        settings.alarm.indexFontSize = v;
        writeSettings();
      }
    },
    "button height":{
      value: 0|settings.alarm.buttonHeight,
      min: 0,
      onchange: v => {
        settings.alarm.buttonHeight = v;
        writeSettings();
      }
    },
    "vibrate":{
      value: 0|settings.alarm.vibrate,
      min: 0,
      onchange: v=>{
        settings.alarm.vibrate = v;
        writeSettings();
      }
    }
  };
  E.showMenu(mainMenu);
})
