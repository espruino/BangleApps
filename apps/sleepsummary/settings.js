(function(back) {
  var FILE = "sleepsummary.settings.json";
  // Load settings
  var settings = Object.assign({
      useTrueSleep:true,
      showMessage:true,
      deepSleepHours:5,
      idealSleepHours:10,
      timeSinceAwake: 1800000,

    }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Sleep Summary" },
    "< Back" : () => back(),
    'Use True Sleep': {
      value: !!settings.useTrueSleep, 
      onchange: v => {
        settings.useTrueSleep = v;
        writeSettings();
      }
    },
    'Show Message': {
      value: !!settings.showMessage,  
      onchange: v => {
        settings.showMessage = v;
        writeSettings();
      }
      
    },
    'Message Time': {
      value: 0|settings.timeAfterAwake,
      min: 0, max: 7200000,
      step:15,
      onchange: v => {
        settings.timeAfterAwake = v; //Convert minutes to hours
        writeSettings();
      },
      format : v => {
        let h = Math.floor(v/60000);
        let m = v % 60;
        let str = "";
        if (h) str += h+"h";
        if (m) str += " "+m+"m";
        return str || "0m";
      }
    },
    'Ideal Deep Sleep': {
      value: 0|settings.deepSleepHours*60,
      min: 60, max: 600,
      step:15,
      onchange: v => {
        settings.deepSleepHours = v/60; //Convert minutes to hours
        writeSettings();
      },
      format : v => {
        let h = Math.floor(v/60);
        let m = v % 60;
        let str = "";
        if (h) str += h+"h";
        if (m) str += " "+m+"m";
        return str || "0m";
      }
    },
    'Ideal Sleep Time': {
      value: 0|settings.idealSleepHours*60, 
      min: 120, max: 60*14 ,
      step:15,
      onchange: v => {
        settings.idealSleepHours = v/60,
        writeSettings();
      },
      format : v => {
        let h = Math.floor(v/60);
        let m = v % 60;
        let str = "";
        if (h) str += h+"h";
        if (m) str += " "+m+"m";
        return str || "0m";
      }
    },
  });
})

