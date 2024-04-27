function parseWeather(response) {
  let owmData = JSON.parse(response);

  let isOwmData = false;
  try {
    isOwmData = (owmData.lat && owmData.lon) && owmData.current.weather && owmData.current;
  } catch (_e) {}

  if (isOwmData) {
    let json = require("Storage").readJSON('weather.json') || {};
    let weather = {};
    weather.time = Date.now();
    weather.hum = owmData.current.humidity;
    weather.temp = owmData.current.temp;
    weather.code = owmData.current.weather[0].id;
    weather.wdir = owmData.current.wind_deg;
    weather.wind = owmData.current.wind_speed;
    weather.loc = owmData.name || "";
    weather.txt = owmData.current.weather[0].main;
    weather.hpa = owmData.current.pressure || 0;

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
  let uri = "https://api.openweathermap.org/data/3.0/onecall?lat=" + location.lat.toFixed(2) + "&lon=" + location.lon.toFixed(2) + "&exclude=minutely,hourly,daily,alerts&appid=" + settings.apikey;
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
