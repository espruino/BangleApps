{
    let locationsFile = "phoneremind.json";
    let connected;
    let promptShown = false;
    let addLocation = function (location) {
        
        let locs = require("Storage").readJSON(locationsFile, 1) || [];
        locs.push(location);
        require("Storage").writeJSON(locationsFile, locs);

    }
    let getSettings=function(){
      return Object.assign({
        precision: 30,
        timeDelay:30000
      }, require('Storage').readJSON("phoneremind.settings.json", true) || {});
    }
    let getAllLocations = function () {
        return require("Storage").readJSON(locationsFile, 1) || [];
    };

    let getMyLocation = function () {
        if (!require("Storage").read("mylocation.json")) {
            require("Storage").writeJSON("mylocation.json", {
                location: "Unknown",
                lat: 0,
                lon: 0
            });
        }
        return require("Storage").readJSON("mylocation.json", 1);
    };

    let buzz = function () {
        Bangle.buzz(230);
    }

    let convertCoordsToMeters = function (lat, lon) {
        return {
            lat: 110574 * lat,
            lon: 111320 * Math.cos(lat * Math.PI / 180) * lon

        }
    }




    let disconnected = function () {
        connected = false;
        var myLocation = getMyLocation();
        var locs = getAllLocations();
        print(locs);
        var useGPS = false;
        if (useGPS) {

        } else {

            myLocation = getMyLocation();
            var convLoc = convertCoordsToMeters(myLocation.lat, myLocation.lon)
            myLocation.lat = convLoc.lat;
            myLocation.lon = convLoc.lon;

            locs = getAllLocations();

            print(myLocation);

            for (let location of locs) {
                if (Math.abs(myLocation.lat - location.lat) < getSettings().precision && Math.abs(myLocation.lon - location.lon) < getSettings().precision) {
                    //at a familiar location, no action needed.
                    return;
                }
            }
            //no location matched the current one...
            
            
          
            setTimeout(function(){
              if(connected==true)return;
              buzz();
              if (require("Storage").readJSON("setting.json", true).quiet != 2) {

                  setTimeout(function () {
                      buzzInterval = setInterval(buzz, 850);
                  }, 750);
              }
              promptShown = true;  
              E.showPrompt("Phone was disconnected. It may have been left in " + myLocation.location + ".", {

                  title: "Phone Left Behind",
                  buttons: { "Ok": true, "Save Location": false }

              }).then(function (answer) {
                  promptShown = false;
                  clearInterval(buzzInterval);
                  if (answer) {
                      Bangle.load();
                  } else {
                      addLocation({
                          city: myLocation.location,
                          lat: myLocation.lat,
                          lon: myLocation.lon
                      });
                      E.showPrompt("Added location in " + myLocation.location + " to familiar locations.", {
                          title: "Location Saved",
                          buttons: { "Ok": true }
                      })
                          .then(function () {
                              Bangle.load();
                          });
                  }
              });
            },getSettings().timeDelay)

        }
    }

    let connectHandler = function () {
        connected = true;
        if (promptShown) {
            //prompt is shown, dismiss
            if (buzzInterval) clearInterval(buzzInterval);
            load();

        }

    }

    NRF.on('disconnect', disconnected);
    NRF.on('connect', connectHandler);
}
