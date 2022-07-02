(function() {
  let responsePromise;
  let settings = require("Storage").readJSON("owmweather.json", 1) || {
    enabled: false
  };
  console.log("Settings", settings);
  if (settings.enabled) {
    let location = require("Storage").readJSON("mylocation.json", 1) || {
      "lat": 51.50,
      "lon": 0.12,
      "location": "London"
    };

    Bangle.pullOwmWeather = function(force) {
      if (!force && responsePromise){
        print("Waiting for response");
        return;
      }
      let settings = require("Storage").readJSON("owmweather.json", 1);
      let uri = "https://api.openweathermap.org/data/2.5/weather?lat=" + location.lat.toFixed(2) + "&lon=" + location.lon.toFixed(2) + "&exclude=hourly,daily&appid=" + settings.apikey;
      print("Calling uri " + uri);
      if (Bangle.http){
        responsePromise = Bangle.http(uri, {id:"debug"}).then(event => {
          print("Got event ", event);
          parseWeather(event.resp);
          responsePromise = false;
        }).catch((e)=>{
          print("Rejected call", e);
          responsePromise = false;
        });
      } else {
        print("No http method found");
      }
    };

    var parseWeather = function(response) {
      let owmData = JSON.parse(response);
      console.log("OWM Data", owmData);

      let isOwmData = owmData.coord && owmData.weather && owmData.main;

      if (isOwmData) {
        console.log("Converting data");
        let json = require("Storage").readJSON('weather.json') || {};
        let weather = {};
        weather.time = Date.now();
        weather.hum = owmData.main.humidity;
        weather.temp = owmData.main.temp;
        weather.code = owmData.weather[0].id;
        weather.wdir = owmData.wind.deg;
        weather.wind = owmData.wind.speed;
        weather.loc = owmData.name;
        weather.txt = owmData.weather[0].main;

        if (weather.wdir != null) {
          let deg = weather.wdir;
          while (deg < 0 || deg > 360) {
            deg = (deg + 360) % 360;
          }
          weather.wrose = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'n'][Math.floor((deg + 22.5) / 45)];
        }

        json.weather = weather;
        print("Parsed data", json);
        require("Storage").writeJSON('weather.json', json);
        require("weather").emit("update", json.weather);
      }
    };
    
    let weather = require("Storage").readJSON('weather.json') || {};
    if (weather.time + settings.refresh * 1000 * 60 < Date.now()){
      Bangle.pullOwmWeather();
    }
    console.log("Setting interval");
    setInterval(() => {
      Bangle.pullOwmWeather();
    }, settings.refresh * 1000 * 60);
    delete settings;
  }
})();
