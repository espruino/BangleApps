const SETTINGS_FILE = "quietSwitch.json";
const storage = require("Storage");
let settings = storage.readJSON('setting.json', 1);
let saved = storage.readJSON(SETTINGS_FILE, 1) || {};

// Main menu
var mainmenu = {
"" : {
  "title" : "Quiet Switch"
  },

  "Quiet Switch" : {
    value : saved.quietWhenSleep,
    format : v => v?"On":"Off",
    min:0,max:1,step:1,
      onchange :v=>{
      saved.quietWhenSleep = v;
      storage.writeJSON(SETTINGS_FILE,saved);
    }
  },
  "Quiet Mode" :  {
    value : saved.quietMode,
    format : v => v?"Alerts":"Silent",
    min:0,max:1,step:1,
      onchange :v=>{
      saved.quietMode = v;
      storage.writeJSON(SETTINGS_FILE,saved);
    }
  },
  "Exit" : function() {load();},
};

// Actually display the menu
E.showMenu(mainmenu);

// Function to fix time format
function fixTime(h, m) {
  if (h.toString().length <2) {
    h = "0" + h.toString();
  }
   if (m.toString().length <2) {
    m = "0" + m.toString();
  }
    return h.toString() +":" + m.toString();
}
