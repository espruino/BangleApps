(function(back) {
  var FILE = "rings.settings.json";
  // Load settings
  var settings = Object.assign({
    minute: {
      bubble: true,
      numbers: true,
    },
    hour: {
      bubble: true,
      numbers: true
    },
    date: {
      bubble: true,
      numbers: true,
    },    
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings(key, value) {
    settings[key] = value;
    require("Storage").write("rings.settings.json",settings);
  }
  var mainmenu = {
    "" : { "title" : "Rings" },
    "< Back" : () => back(),
    /*LANG*/"Minute" : () => E.showMenu({
        "" : { "title" : /*LANG*/"Minute" },
        "< Back" : ()=>E.showMenu(mainmenu),
        /*LANG*/"Bubble" : {
                  value: settings.minute.bubble,
                  onchange: (m) => { 
                    settings.minute.bubble = m,
                    writeSettings(); 
                    },
                  },
        /*LANG*/"Number" : {
                  value: settings.minute.numbers,
                  onchange: (m) => { 
                    settings.minute.numbers = m,
                    writeSettings(); 
                    },
                  }
      }),    
      /*LANG*/"Hour" : () => E.showMenu({
        "" : { "title" : /*LANG*/"Hour" },
        "< Back" : ()=>E.showMenu(mainmenu),
        /*LANG*/"Bubble" : {
                  value: settings.hour.bubble,
                  onchange: (m) => { 
                    settings.hour.bubble = m,
                    writeSettings(); 
                    },
                  },
        /*LANG*/"Number" : {
                  value: settings.hour.numbers,
                  onchange: (m) => { 
                    settings.hour.numbers = m,
                    writeSettings(); 
                    },
                  }
      }),    
      /*LANG*/"Date" : () => E.showMenu({
        "" : { "title" : /*LANG*/"Date" },
        "< Back" : ()=>E.showMenu(mainmenu),
        /*LANG*/"Bubble" : {
                  value: settings.date.bubble,
                  onchange: (m) => { 
                    settings.date.bubble = m,
                    writeSettings(); 
                    },
                  },
        /*LANG*/"Number" : {
                  value: settings.date.numbers,
                  onchange: (m) => { 
                    settings.date.numbers = m,
                    writeSettings(); 
                    },
                  }
      }),      
  }

  // Show the menu
  E.showMenu(mainmenu);
})