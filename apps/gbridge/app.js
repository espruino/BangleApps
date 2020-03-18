const storage = require('Storage');
const boolFormat = v => v ? "On" : "Off";
let settings;

function updateSettings() {
  storage.write('gbridge.json', settings);
}

function resetSettings() {
  settings = {
    showIcon: true,
    notificationsEnabled: true,
    fullscreenNotifications: false
  };
  updateSettings();
}

settings = storage.readJSON('gbridge.json',1);
if (!settings) resetSettings();

function gb(j) {
  Bluetooth.println(JSON.stringify(j));
}

var mainmenu = {
  "" : { "title" : "Gadgetbridge" },
  "Connected" : { value : NRF.getSecurityStatus().connected },
  "Show Icon" : {
    value: settings.showIcon,
    format: boolFormat,
    onchange: () => {
      settings.showIcon = !settings.showIcon;
      updateSettings();
    }
  },
  "Notifications": function() { E.showMenu(notifications); },
  "Find Phone" : function() { E.showMenu(findPhone); },
  "Exit" : ()=> {load();}
};

var findPhone = {
  "" : { "title" : "-- Find Phone --" },
  "On" : _=>gb({t:"findPhone",n:true}),
  "Off" : _=>gb({t:"findPhone",n:false}),
  "< Back" : function() { E.showMenu(mainmenu); },
};

var notifications = {
  "": { "title" : " -- Notifications --" },
  "Enabled": {
    value: settings.notificationsEnabled,
    format: boolFormat,
    onchange: () => {
      settings.notificationsEnabled = !settings.notificationsEnabled;
      updateSettings();
    }
  }
}
if (require("Storage").list("notify.app.js").length > 0) {
  notifications["Fullscreen"] = {
    value: settings.fullscreenNotifications,
    format: boolFormat,
    onchange: () => {
      settings.fullscreenNotifications = !settings.fullscreenNotifications;
      updateSettings();
    }
  }
}
notifications["< Back"] = function() { E.showMenu(mainmenu); };

E.showMenu(mainmenu);
