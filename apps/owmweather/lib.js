function parseWeather(response) {
  let owmData = JSON.parse(response);

  let isOwmData = false;
  try {
    isOwmData = (
        // Paid API 3.0: onecall
        (owmData.lat && owmData.lon && owmData.current.weather && owmData.current)
        ||
        // Free API 2.5
        (owmData.coord && owmData.weather && owmData.main)
  );
  } catch (_e) {}

  if (isOwmData) {
    let json = require("Storage").readJSON('weather.json') || {};
    let weather = {};
    if (owmData.current) {
      // API 3.0: paid onecall
      weather.time = Date.now();
      weather.hum = owmData.current.humidity;
      weather.temp = owmData.current.temp;
      weather.code = owmData.current.weather[0].id;
      weather.wdir = owmData.current.wind_deg;
      weather.wind = owmData.current.wind_speed;
      weather.loc = owmData.name || "";
      weather.txt = owmData.current.weather[0].main;
      weather.hpa = owmData.current.pressure || 0;
    } else {
      // API 2.5: free
      weather.time = Date.now();
      weather.hum = owmData.main.humidity;
      weather.temp = owmData.main.temp;
      weather.code = owmData.weather[0].id;
      weather.wdir = owmData.wind.deg;
      weather.wind = owmData.wind.speed;
      weather.loc = owmData.name;
      weather.txt = owmData.weather[0].main;
    }

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
    return undefined;
  } else {
    return /*LANG*/"Not OWM data";
  }
}

exports.pull = function(completionCallback) {
  let location = require("Storage").readJSON("mylocation.json", 1) || {
    "lat": 51.50,
    "lon": 0.12,
    "location": "London"
  };
  let settings = require("Storage").readJSON("owmweather.json", 1);
  let uri;
  if (!!settings.useOneCall) {
    uri = "https://api.openweathermap.org/data/3.0/onecall?lat=" + location.lat.toFixed(2) + "&lon=" + location.lon.toFixed(2) + "&exclude=minutely,hourly,daily,alerts&appid=" + settings.apikey;
  } else {
    uri = "https://api.openweathermap.org/data/2.5/weather?lat=" + location.lat.toFixed(2) + "&lon=" + location.lon.toFixed(2) + "&exclude=hourly,daily&appid=" + settings.apikey;
  }

  if (Bangle.http){
    Bangle.http(uri, {timeout:10000}).then(event => {
      let result = parseWeather(event.resp);
      if (completionCallback) completionCallback(result);
    }).catch((e)=>{
      if (completionCallback) completionCallback(e);
    });
  } else {
    if (completionCallback) completionCallback(/*LANG*/"No http method found");
  }
};
