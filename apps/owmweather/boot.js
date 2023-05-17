{
  let waiting = false;
  let settings = Object.assign(
    require('Storage').readJSON("owmweather.default.json", true) || {},
    require('Storage').readJSON("owmweather.json", true) || {}
  );
  
  let completion = function(){
    waiting = false;
  }

  if (settings.enabled) {    
    let weather = require("Storage").readJSON('weather.json') || {};
    let lastUpdate;
    if (weather && weather.weather && weather.weather.time) lastUpdate = weather.weather.time;

    if (!lastUpdate || lastUpdate + settings.refresh * 1000 * 60 < Date.now()){
      setTimeout(() => {
        if (!waiting){
          waiting = true;
          require("owmweather").pull(completion);
        }
      }, 5000);
    }
    setInterval(() => {
      if (!waiting && NRF.getSecurityStatus().connected){
        waiting = true;
        require("owmweather").pull(completion);
      }
    }, settings.refresh * 1000 * 60);
  }
}
