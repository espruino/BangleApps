(function(back) {
  function writeSettings(key, value) {
    var s = require('Storage').readJSON(FILE, true) || {};
    s[key] = value;
    require('Storage').writeJSON(FILE, s);
    readSettings();
  }

  function writeSettingsParent(parent, key, value) {
    var s = require('Storage').readJSON(FILE, true) || {};
    if (!s[parent]) s[parent] = {};
    s[parent][key] = value;
    require('Storage').writeJSON(FILE, s);
    readSettings();
  }

  function readSettings(){
    settings = Object.assign(
      require('Storage').readJSON("sensortools.default.json", true) || {},
      require('Storage').readJSON(FILE, true) || {}
    );
  }

  var FILE="sensortools.json";
  var settings;
  readSettings();


  let modes = ["nop", "emulate", "modify"];
  let modesPower = ["nop", "emulate", "passthrough", "delay", "on"];

  function showSubMenu(name,key,typesEmulate,typesModify){
    var menu = {
      '': { 'title': name,
          back: ()=>{E.showMenu(buildMainMenu());}},
      'Enabled': {
        value: !!settings[key].enabled,
        onchange: v => {
          writeSettingsParent(key, "enabled",v);
        }
      },
      'Mode': {
        value: modes.indexOf(settings[key].mode||"nop"),
        min: 0, max: modes.length-1,
        format: v => { return modes[v]; },
        onchange: v => {
          writeSettingsParent(key,"mode",modes[v]);
          showSubMenu(name,key,typesEmulate,typesModify);
        }
      },
      'Name': {},
      'Power': {
        value: modesPower.indexOf(settings[key].power||"nop"),
        min: 0, max: modesPower.length-1,
        format: v => { return modesPower[v]; },
        onchange: v => {
          writeSettingsParent(key,"power",modesPower[v]);
        }
      },
    };
    
    if (settings[key].mode != "nop"){
      let types = typesEmulate;
      if (settings[key].mode == "modify") types = typesModify;
      menu.Name = {
        value: types.indexOf(settings[key].name||"static"),
        min: 0, max: types.length-1,
        format: v => { return types[v]; },
        onchange: v => {
          writeSettingsParent(key,"name",types[v]);
        }
      };
    } else {
      delete menu.Name;
    }
    
    E.showMenu(menu);
  }


  function buildMainMenu(){
    var mainmenu = {
      '': { 'title': 'Sensor tools' },
      '< Back': back,
      'Enabled': {
        value: !!settings.enabled,
        onchange: v => {
          writeSettings("enabled",v);
        },
      },
      'Log': {
        value: !!settings.log,
        onchange: v => {
          writeSettings("log",v);
        },
      },
      'GPS': ()=>{showSubMenu("GPS","gps",["nop", "staticfix", "nofix", "changingfix", "route", "routeFuzzy"],[]);},
      'Compass': ()=>{showSubMenu("Compass","mag",["nop", "static", "rotate"],[]);},
      'HRM': ()=>{showSubMenu("HRM","hrm",["nop", "static"],["bpmtrippled"],["sin"]);}
    };
    return mainmenu;
  }

  E.showMenu(buildMainMenu());
})
