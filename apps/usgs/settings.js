(function(back) {
  var FILE = "usgs.json";
  var settings = Object.assign({
    loc: '03272100',
    keys: {'Gage height': true, 'Discharge': true, 'Temperature, water': true},
    shortenedName: {"Gage height":"Ga","Discharge":"Dis","Temperature, water":"Temp"},
    tempUnitF: true,
  }, require('Storage').readJSON(FILE, true) || {});
  
  var submenu = {
    "" : {
      "title" : "DataStreams"
    },
    "< Back" : function() { E.showMenu(menu); },
  };

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

function popSubMenu() {
  // FIXME: Linter complains that `data` is not defined. When I defined it 
  // instead complained that it's not used (no-unused-vars).
  // Also looking at `getDataStreams` it doesn't return anything so this seems wrong.
  data = getDataStreams();
}
function popSubMenuData(data) {
  console.log(data);
    Object.keys(data).forEach(function(k){
      var name = data[k].description.split(" / ")[0];
      console.log(name);
      if (!settings.keys[name]) {
        // Setting doesn't exist, so we assume it's false
        settings.keys[name] = false;
      }
      submenu[name]= {value:settings.keys[name], onchange: v => {
        settings.keys[name] = v;
        writeSettings();
      }};
    });
  E.showMenu(submenu);
  }
  var menu = {
    "" : { "title" : "USGS" },
    "< Back" : () => back(),
    'Temp unit': {
      value: !!settings.tempUnitF,  // !! converts undefined to false
      format: v => v?"F":"C",
      onchange: v => {
        settings.tempUnitF = v;
        writeSettings();
      }
    },
    'Location': {
      value: settings.loc,
      onchange: () => {
        setTimeout(() => {
            keyboard.input({text:settings.loc}).then(result => {
            settings.loc = result;
            writeSettings();
          });
        }, 100);
      }
    },
    "DataStreams" : function() { popSubMenu();},
  };
  
  var keyboard = "textinput";
  try {keyboard = require(keyboard);} catch(e) {keyboard = null;}
  if (!keyboard) delete menu.Location;


function getDataStreams() {
  const uri = "https://labs.waterdata.usgs.gov/sta/v1.1/Things('USGS-" +
    settings.loc +
    "')/Datastreams?$select=description";
  if (Bangle.http) {
    Bangle.http(uri, {timeout:10000}).then(d => {popSubMenuData(JSON.parse(d.resp).value);});
  }
}

  // Show the menu
  E.showMenu(menu);
})
