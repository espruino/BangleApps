(function(back) {
  const FILE="gpstrek.json";
  let settings;
  
  function writeSettings(key, value) {
    var s = require('Storage').readJSON(FILE, true) || {};
    s[key] = value;
    require('Storage').writeJSON(FILE, s);
    readSettings();
  }

  function readSettings(){
    settings = Object.assign(
      require('Storage').readJSON("gpstrek.default.json", true) || {},
      require('Storage').readJSON(FILE, true) || {}
    );
  }
  

  function showMapMenu(){
    var menu = {
      '': { 'title': 'Map', back: showMainMenu },
      'Show compass on map': {
        value: !!settings.mapCompass,
        onchange: v => {
          writeSettings("mapCompass",v);
        },
      },
      'Initial map scale': {
        value: settings.mapScale,
        min: 0.01,max: 2, step:0.01,
        onchange: v => {
          writeSettings("mapScale",v);
        },
      },
      'Rendered waypoints': {
        value: settings.mapChunkSize,
        min: 5,max: 60, step:5,
        onchange: v => {
          writeSettings("mapChunkSize",v);
        }
      },
      'Overview scroll': {
        value: settings.overviewScroll,
        min: 10,max: 100, step:10,
        format: v => v + "px",
        onchange: v => {
          writeSettings("overviewScroll",v);
        }
      },
      'Initial overview scale': {
        value: settings.overviewScale,
        min: 0.005,max: 0.1, step:0.005,
        onchange: v => {
          writeSettings("overviewScale",v);
        }
      },
      'Show direction': {
        value: !!settings.mapDirection,
        onchange: v => {
          writeSettings("mapDirection",v);
        }
      }
    };
    E.showMenu(menu);
  }

  function showRoutingMenu(){
    var menu = {
      '': { 'title': 'Routing', back: showMainMenu },
      'Auto search closest waypoint': {
        value: !!settings.autosearch,
        onchange: v => {
          writeSettings("autosearch",v);
        },
      },
      'Auto search limit': {
        value: settings.autosearchLimit,
        onchange: v => {
          writeSettings("autosearchLimit",v);
        },
      },
      'Waypoint change distance': {
        value: settings.waypointChangeDist,
        format: v => v + "m",
        min: 5,max: 200, step:5,
        onchange: v => {
          writeSettings("waypointChangeDist",v);
        },
      }
    };
    E.showMenu(menu);
  }

  function showRefreshMenu(){
    var menu = {
      '': { 'title': 'Refresh', back: showMainMenu },
      'Unlocked refresh': {
        value: settings.refresh,
        format: v => v + "ms",
        min: 250,max: 5000, step:250,
        onchange: v => {
          writeSettings("refresh",v);
        }
      },
      'Locked refresh': {
        value: settings.refreshLocked,
        min: 1000,max: 60000, step:1000,
        format: v => v + "ms",
        onchange: v => {
          writeSettings("refreshLocked",v);
        }
      },
      'Minimum refresh': {
        value: settings.mapRefresh,
        format: v => v + "ms",
        min: 250,max: 5000, step:250,
        onchange: v => {
          writeSettings("mapRefresh",v);
        }
      },
      'Minimum course change': {
        value: settings.minCourseChange,
        min: 0,max: 180, step:1,
        format: v => v + "°",
        onchange: v => {
          writeSettings("minCourseChange",v);
        }
      },
      'Minimum position change': {
        value: settings.minPosChange,
        min: 0,max: 50, step:1,
        format: v => v + "px",
        onchange: v => {
          writeSettings("minPosChange",v);
        }
      }
    };
    E.showMenu(menu);
  }


  function showMainMenu(){
    var mainmenu = {
      '': { 'title': 'GPS Trekking', back: back },
      'Map': showMapMenu,
      'Routing': showRoutingMenu,
      'Refresh': showRefreshMenu,
      "Info rows" : {
        value : settings.numberOfSlices,
        min:1,max:6,step:1,
        onchange : v => {
          writeSettings("numberOfSlices",v);
        }
      },
    };
    E.showMenu(mainmenu);
  }

  readSettings();
  showMainMenu();
})