function parseWeather(response) {
  let owmData = JSON.parse(response);

  let isOwmData = owmData.coord && owmData.weather && owmData.main;

  if (isOwmData) {
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
    weather.hpa = owmData.main.pressure || 0;

    if (weather.wdir != null) {
      let deg = weather.wdir;
      while (deg < 0 || deg > 360) {
        deg = (deg + 360) % 360;
      }
      weather.wrose = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'n'][Math.floor((deg + 22.5) / 45)];
    }

    json.weather = weather;
    require("Storage").writeJSON('weather.json', json);
    if (require("Storage").read("weather")!==undefined) require("weather").emit("update", json.weather);
  } else {
    throw /*LANG*/"Not OWM data";
  }
}

exports.pull = function(completionCallback, errorCallback) {
  let location = require("Storage").readJSON("mylocation.json", 1) || {
    "lat": 51.50,
    "lon": 0.12,
    "location": "London"
  };
  let settings = require("Storage").readJSON("owmweather.json", 1);
  let uri = "https://api.openweathermap.org/data/2.5/weather?lat=" + location.lat.toFixed(2) + "&lon=" + location.lon.toFixed(2) + "&exclude=hourly,daily&appid=" + settings.apikey;
  if (Bangle.http){
    Bangle.http(uri, {timeout:10000}).then(event => {
      parseWeather(event.resp);
      if (completionCallback) completionCallback();
    }).catch((e)=>{
      if (errorCallback) errorCallback(e);
    });
  } else {
    if (errorCallback) errorCallback(/*LANG*/"No http method found");
  }
};
