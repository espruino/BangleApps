(function() {
  let waiting = false;
  let settings = require("Storage").readJSON("owmweather.json", 1) || {
    enabled: false
  };
  
  function completion(){
    waiting = false;
  }
  
  if (settings.enabled) {    
    let weather = require("Storage").readJSON('weather.json') || {};
    if (weather.time + settings.refresh * 1000 * 60 < Date.now()){
      if (!waiting){
        waiting = true;
        require("owmweather").pull(completion);
      }
    }
    setInterval(() => {
      if (!waiting && NRF.getSecurityStatus().connected){
        waiting = true;
        require("owmweather").pull(completion);
      }
    }, settings.refresh * 1000 * 60);
    delete settings;
  }
})();
