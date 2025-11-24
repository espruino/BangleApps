(function(back) {
  var FILE = "smartbatt.settings.json";
  var settings = Object.assign({
      doLogging:false,
      updateInterval:18000000 
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  E.showMenu({
    "" : { "title" : "Smart Battery" },
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
    'Update Interval': {
      value: 0|settings.updateInterval,
      min:1800000,
      max:172800000,
      step:1800000,
      format: v=>{
        var totalMinutes = Math.floor(v / 60000); 
        var h = Math.floor(totalMinutes / 60);
        var m = totalMinutes % 60;

        let result = '';
        if (h > 0) result += `${h}h${m > 0 ? ' ' : ''}`;
        if (m > 0) result += `${m}m`;

        return result || '0m';
      },
      onchange: v => {
        settings.updateInterval = v;
        writeSettings();
      }
    }, 
    'Log Battery': { 
      value: !!settings.doLogging,  
      onchange: v => {
        settings.doLogging = v;
        writeSettings();
      }
    }
  });
})
