(function(back) {
  const APP_NAME = 'flightdash';
  const FILE = APP_NAME+'.json';

  // if the avwx module is available, include an extra menu item to query nearest airports via AVWX
  var avwx;
  try {
    avwx = require('avwx');
  } catch (error) {
    // avwx module not installed
  }

  // Load settings
  var settings = Object.assign({
    useBaro: false,
    speedUnits: 0,      // KTS
    altimeterUnits: 0,  // FT
    destID: 'KOSH',
    destLat: 43.9844,
    destLon: -88.5570,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // update the nav destination
  function updateNavDest(destID, destLat, destLon) {
    settings.destID = destID.replace(/[\W]+/g, '').slice(0, 7);
    settings.destLat = parseFloat(destLat);
    settings.destLon = parseFloat(destLon);
    writeSettings();
    createDestMainMenu();
  }

  var airports;    // cache list of airports
  function readAirportsList(empty_cb) {
    if (airports) {  // airport list has already been read in
      return true;
    }
    airports = require('Storage').readJSON(APP_NAME+'.airports.json', true);
    if (! airports) {
      E.showPrompt('No airports stored - download from the Bangle Apps Loader!',
                   {title: 'Flight-Dash', buttons: {OK: true} }).then((v) => {
        empty_cb();
      });
      return false;
    }
    return true;
  }

  // use GPS fix
  var afterGPSfixMenu = 'destNearest';
  function getLatLon(fix) {
    if (!('fix' in fix) || fix.fix == 0 || fix.satellites < 4) return;
    Bangle.setGPSPower(false, APP_NAME+'-settings');
    Bangle.removeListener('GPS', getLatLon);
    switch (afterGPSfixMenu) {
      case 'destNearest':
        loadNearest(fix.lat, fix.lon);
        break;
      case 'createUserWaypoint':
        {
          if (!('userWaypoints' in settings))
            settings.userWaypoints = [];
          let newIdx = settings.userWaypoints.length;
          settings.userWaypoints[newIdx] = {
            'ID': 'USER'+(newIdx + 1),
            'lat': fix.lat,
            'lon': fix.lon,
          };
          writeSettings();
          showUserWaypoints();
          break;
        }
      case 'destAVWX':
        // the free ("hobby") account of AVWX is limited to 10 nearest stations
        avwx.request('station/near/'+fix.lat+','+fix.lon, 'n=10&airport=true&reporting=false', data => {
          loadAVWX(data);
        }, error => {
          console.log(error);
          E.showPrompt('AVWX query failed: '+error, {title: 'Flight-Dash', buttons: {OK: true} }).then((v) => {
            createDestMainMenu();
          });
        });
        break;
      default:
        back();
    }
  }

  // find nearest airports
  function loadNearest(lat, lon) {
    if (! readAirportsList(createDestMainMenu))
      return;

    const latRad1 = lat * Math.PI/180;
    const lonRad1 = lon * Math.PI/180;
    for (let i = 0; i < airports.length; i++) {
      const latRad2 = airports[i].la * Math.PI/180;
      const lonRad2 = airports[i].lo * Math.PI/180;
      let x = (lonRad2 - lonRad1) * Math.cos((latRad1 + latRad2) / 2);
      let y = (latRad2 - latRad1);
      airports[i].distance = Math.sqrt(x*x + y*y) * 6371;
    }
    let nearest = airports.sort((a, b) => a.distance - b.distance).slice(0, 14);

    let destNearest = {
      '' : { 'title' : 'Nearest' },
      '< Back' : () => createDestMainMenu(),
    };
    for (let i in nearest) {
      let airport = nearest[i];
      destNearest[airport.i+' - '+airport.n] =
        () => setTimeout(updateNavDest, 10, airport.i, airport.la, airport.lo);
    }

    E.showMenu(destNearest);
  }

  // process the data returned by AVWX
  function loadAVWX(data) {
    let AVWXairports = JSON.parse(data.resp);

    let destAVWX = {
      '' : { 'title' : 'Nearest (AVWX)' },
      '< Back' : () => createDestMainMenu(),
    };
    for (let i in AVWXairports) {
      let airport = AVWXairports[i].station;
      let airport_id = ( airport.icao ? airport.icao : airport.gps );
      destAVWX[airport_id+' - '+airport.name] =
        () => setTimeout(updateNavDest, 10, airport_id, airport.latitude, airport.longitude);
    }

    E.showMenu(destAVWX);
  }

  // individual user waypoint menu
  function showUserWaypoint(idx) {
    let wayptID = settings.userWaypoints[idx].ID;
    let wayptLat = settings.userWaypoints[idx].lat;
    let wayptLon = settings.userWaypoints[idx].lon;
    let destUser = {
      '' : { 'title' : wayptID },
      '< Back' : () => showUserWaypoints(),
    };
    destUser['Set as Dest.'] =
        () => setTimeout(updateNavDest, 10, wayptID, wayptLat, wayptLon);
    destUser['Edit ID'] = function() {
      require('textinput').input({text: wayptID}).then(result => {
        if (result) {
          if (result.length > 7) {
            console.log('test');
            E.showPrompt('ID is too long!\n(max. 7 chars)',
                         {title: 'Flight-Dash', buttons: {OK: true} }).then((v) => {
              showUserWaypoint(idx);
            });
          } else {
            settings.userWaypoints[idx].ID = result;
            writeSettings();
            showUserWaypoint(idx);
          }
        } else {
          showUserWaypoint(idx);
        }
      });
    };
    destUser['Delete'] = function() {
      E.showPrompt('Delete user waypoint '+wayptID+'?',
                   {'title': 'Flight-Dash'}).then((v) => {
        if (v) {
          settings.userWaypoints.splice(idx, 1);
          writeSettings();
          showUserWaypoints();
        } else {
          showUserWaypoint(idx);
        }
      });
    };

    E.showMenu(destUser);
  }

  // user waypoints menu
  function showUserWaypoints() {
    let destUser = {
      '' : { 'title' : 'User Waypoints' },
      '< Back' : () => createDestMainMenu(),
    };
    for (let i in settings.userWaypoints) {
      let waypt = settings.userWaypoints[i];
      let idx = i;
      destUser[waypt.ID] =
        () => setTimeout(showUserWaypoint, 10, idx);
    }
    destUser['Create New'] = function() {
      E.showMessage('Waiting for GPS fix', {title: 'Flight-Dash'});
      afterGPSfixMenu = 'createUserWaypoint';
      Bangle.setGPSPower(true, APP_NAME+'-settings');
      Bangle.on('GPS', getLatLon);
    };

    E.showMenu(destUser);
  }

  // destination main menu
  function createDestMainMenu() {
    let destMainMenu = {
      '' : { 'title' : 'Nav Dest.' },
      '< Back' : () => E.showMenu(mainMenu),
    };
    destMainMenu['Is: '+settings.destID] = {};
    destMainMenu['Nearest'] = function() {
        E.showMessage('Waiting for GPS fix', {title: 'Flight-Dash'});
        afterGPSfixMenu = 'destNearest';
        Bangle.setGPSPower(true, APP_NAME+'-settings');
        Bangle.on('GPS', getLatLon);
      };
    destMainMenu['Search'] = function() {
      require('textinput').input({text: ''}).then(result => {
        if (result) {
          if (! readAirportsList(createDestMainMenu))
            return;

          result = result.toUpperCase();
          let matches = [];
          let tooManyFound = false;
          for (let i in airports) {
            if (airports[i].i.toUpperCase().includes(result) ||
                airports[i].n.toUpperCase().includes(result)) {
              matches.push(airports[i]);
              if (matches.length >= 15) {
                tooManyFound = true;
                break;
              }
            }
          }
          if (! matches.length) {
            E.showPrompt('No airports found!', {title: 'Flight-Dash', buttons: {OK: true} }).then((v) => {
              createDestMainMenu();
            });
            return;
          }

          let destSearch = {
            '' : { 'title' : 'Search Results' },
            '< Back' : () => createDestMainMenu(),
          };
          for (let i in matches) {
            let airport = matches[i];
            destSearch[airport.i+' - '+airport.n] =
              () => setTimeout(updateNavDest, 10, airport.i, airport.la, airport.lo);
          }
          if (tooManyFound) {
            destSearch['More than 15 airports found!'] = {};
          }

          E.showMenu(destSearch);
        } else {
          createDestMainMenu();
        }
      });
    };
    destMainMenu['User waypts'] = function() { showUserWaypoints(); };
    if (avwx) {
      destMainMenu['Nearest (AVWX)'] = function() {
        E.showMessage('Waiting for GPS fix', {title: 'Flight-Dash'});
        afterGPSfixMenu = 'destAVWX';
        Bangle.setGPSPower(true, APP_NAME+'-settings');
        Bangle.on('GPS', getLatLon);
      };
    }
    E.showMenu(destMainMenu);
  }

  // main menu
  mainMenu = {
    '' : { 'title' : 'Flight-Dash' },
    '< Back' : () => {
      Bangle.setGPSPower(false, APP_NAME+'-settings');
      Bangle.removeListener('GPS', getLatLon);
      back();
    },
    'Nav Dest.': () => createDestMainMenu(),
    'Speed': {
      value: parseInt(settings.speedUnits) || 0,
      min: 0,
      max: 2,
      format: v => {
        switch (v) {
          case 0: return 'Knots';
          case 1: return 'km/h';
          case 2: return 'MPH';
        }
      },
      onchange: v => {
        settings.speedUnits = v;
        writeSettings();
      }
    },
    'Altitude': {
      value: parseInt(settings.altimeterUnits) || 0,
      min: 0,
      max: 1,
      format: v => {
        switch (v) {
          case 0: return 'Feet';
          case 1: return 'Meters';
        }
      },
      onchange: v => {
        settings.altimeterUnits = v;
        writeSettings();
      }
    },
    'Use Baro': {
      value: !!settings.useBaro,  // !! converts undefined to false
      onchange: v => {
        settings.useBaro = v;
        writeSettings();
      }
    },
   };

  E.showMenu(mainMenu);
})
