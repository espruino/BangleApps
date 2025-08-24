
(function(back) {
  var FILE = "smartbatt.settings.json";
  // Load settings
  var settings = Object.assign({
    //Record Interval stored in ms
      doLogging:false
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Smart Day Battery" },
    "< Back" : () => back(),
    
    'Clear Data': function () {
      E.showPrompt("Are you sure you want to delete all learned data?", {title:"Confirm"})
      .then(function(v) {
        if (v) {
          require("smartbatt").deleteData();
          E.showMessage("Successfully cleared data!","Cleared");
        } else {
          eval(require("Storage").read("smartbatt.settings.js"))(()=>load());

        }
      });     
      },
    'Log Battery': {
      value: !!settings.doLogging,  // !! converts undefined to false
      onchange: v => {
        settings.doLogging = v;
        writeSettings();
      }
      // format: ... may be specified as a function which converts the value to a string
      // if the value is a boolean, showMenu() will convert this automatically, which
      // keeps settings menus consistent
    },
  });
})
