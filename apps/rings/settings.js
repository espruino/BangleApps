(function(back) {
  var FILE = "rings.settings.json";
  // Load settings
  var settings = Object.assign({
    minute: {
      numbers: false,
    },
    hour: {
      numbers: false
    },
    date: {
      numbers: false,
    },  
    bubble: false,   
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
        /*LANG*/"Number" : {
                  value: settings.date.numbers,
                  onchange: (m) => { 
                    settings.date.numbers = m,
                    writeSettings(); 
                    },
                  }
      }),
      /*LANG*/"BG Bubble?" : {
      value : settings.bubble,
      onchange: (m) => {
        settings.bubble = m;
        writeSettings();
      }
    },      
  }

  // Show the menu
  E.showMenu(mainmenu);
})