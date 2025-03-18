(function(back) {
  var FILE = 'backswipe.json';
  // Mode can be 'blacklist', 'whitelist', 'on' or 'disabled'
  // Apps is an array of app info objects, where all the apps that are there are either blocked or allowed, depending on the mode
  var DEFAULTS = {
    'mode': 0,
    'apps': [],
    'standardNumSwipeHandlers': 0,
    'standardNumDragHandlers': 0
  };

  var settings = {};

  var loadSettings = function() {
    settings = require('Storage').readJSON(FILE, 1) || DEFAULTS;
  };

  var saveSettings = function(settings) {
    require('Storage').write(FILE, settings);
  };

  // Get all app info files
  var getApps = function() {
    var apps = require('Storage').list(/\.info$/).map(appInfoFileName => {
      var appInfo = require('Storage').readJSON(appInfoFileName, 1);
      return appInfo && {
        'name': appInfo.name,
        'sortorder': appInfo.sortorder,
        'src': appInfo.src,
        'files': appInfo.files
      };
    }).filter(app => app && !!app.src);
    apps.sort((a, b) => {
      var n = (0 | a.sortorder) - (0 | b.sortorder);
      if (n) return n; // do sortorder first
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    return apps;
  };

  var showMenu = function() {
    var menu = {
      '': { 'title': 'Backswipe' },
      '< Back': () => {
        back();
      },
      'Mode': {
        value: settings.mode,
        min: 0,
        max: 3,
        format: v => ["Blacklist", "Whitelist", "Always On", "Disabled"][v],
        onchange: v => {
          settings.mode = v;
          saveSettings(settings);
        },
      },
      'App List': () => {
        showAppSubMenu();
      },
      'Standard # of swipe handlers' : { // If more than this many handlers are present backswipe will not go back
        value: 0|settings.standardNumSwipeHandlers,
        min: 0,
        max: 10,
        format: v=>v,
        onchange: v => {
          settings.standardNumSwipeHandlers = v;
          saveSettings(settings);
        },
      },
      'Standard # of drag handlers' : { // If more than this many handlers are present backswipe will not go back
        value: 0|settings.standardNumDragHandlers,
        min: 0,
        max: 10,
        format: v=>v,
        onchange: v => {
          settings.standardNumDragHandlers = v;
          saveSettings(settings);
        },
      }
    };

    E.showMenu(menu);
  };
  
  var showAppSubMenu = function() {
    var menu = {
      '': { 'title': 'Backswipe' },
      '< Back': () => {
        showMenu();
      },
      'Add App': () => {
        showAppList();
      }
    };
    settings.apps.forEach(app => {
      menu[app.name] = () => {
        settings.apps.splice(settings.apps.indexOf(app), 1);
        saveSettings(settings);
        showAppSubMenu();
      }
    });
    E.showMenu(menu);
  }
  
  var showAppList = function() {
    var apps = getApps();
    var menu = {
      '': { 'title': 'Backswipe' },
      '< Back': () => {
        showMenu();
      }
    };
    apps.forEach(app => {
      menu[app.name] = () => {
        settings.apps.push(app); 
        saveSettings(settings);
        showAppSubMenu();
      }
    });
    E.showMenu(menu);
  }
  
  loadSettings();
  showMenu();
})
