(function(back) {
  var FILE = "phoneremind.settings.json";
  // Load settings
  var settings = Object.assign({
    precision: 30,
    timeDelay:30000
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }
  function selectPrecisionLevel(lvl){
    settings.precision=lvl;
    writeSettings();
    load("phoneremind.settings.js");
    
  }
  function formatTime(ms) {
    if (ms < 60000) {
      // Less than a minute → show seconds
      return Math.round(ms / 1000) + 's';
    } else {
      // One minute or more → show minutes
      return Math.round(ms / 60000) + 'm';
    }
  }

  function showPrecisionMenu(back){
    
    let menu = {
      '': { 'title': 'Precision' },
      '< Back': back,
      'Country': function(){
        
        selectPrecisionLevel(20000);
        back();     
      },
      'Large City': function(){
        
        selectPrecisionLevel(1200);
        back();  
      },
       'Small City': function(){
        
        selectPrecisionLevel(230);
        back();  
      },
      'City Block': function(){
        
        selectPrecisionLevel(60);
        back();  
      },
      'Building': function(){
        
        selectPrecisionLevel(30);
        back();  
      },
      'Meters': function(){
        
        selectPrecisionLevel(1);
        back();  
      },
      
    }
    E.showMenu(menu)
  }
  
  function showMainMenu(){
    // Show the menu
    E.showMenu({
      "" : { "title" : "Phone Reminder" },
      "< Back" : () => back(),
      'Precision Lvl': function(){
          showPrecisionMenu(showMainMenu);
        
        // format: ... may be specified as a function which converts the value to a string
        // if the value is a boolean, showMenu() will convert this automatically, which
        // keeps settings menus consistent
      },
      
      'Delete All Locations': function(){
          E.showPrompt("Are you sure you want to delete all familiar locations?", {title:"Confirm"})
        .then(function(v) {
          if (v) {
            require("Storage").erase("phoneremind.json");
            E.showMessage("Successfully deleted saved locations!","Cleared");
          } else {
            eval(require("Storage").read("phoneremind.settings.js"))(()=>load());

          }
        });   
        
      },
      'Check Delay': {
      value: 0|settings.timeDelay,
      min: 0, max: 600000,
      step:5000,
      onchange: v => {
        settings.timeDelay = v; 
        writeSettings();
      },
      format : v => {
        return formatTime(v)
      }
    }
    });
  }
  showMainMenu()
  
})
