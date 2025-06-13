{
  let loading = false;
  let timeoutRef = null;
  let settings = Object.assign(
    require('Storage').readJSON("owmweather.default.json", true) || {},
    require('Storage').readJSON("owmweather.json", true) || {}
  );

  let refreshMillis = function () {
    return settings.refresh * 1000 * 60 + 1;  // +1 <- leave some slack
  };

  let onCompleted = function () {
    loading = false;
    settings.updated = Date.now();
    require('Storage').writeJSON("owmweather.json", settings);
    if (timeoutRef) clearTimeout(timeoutRef);
    timeoutRef = setTimeout(loadIfDueAndReschedule, refreshMillis());
  };

  let onError = function(e) {
    console.log("owmweather error:", e);
    loading = false;
    if (timeoutRef) clearTimeout(timeoutRef);
    timeoutRef = setTimeout(loadIfDueAndReschedule, refreshMillis());
  };

  let loadIfDueAndReschedule = function () {
    // also check if the weather.json file has been updated (e.g. force refresh)
    let weather = require("Storage").readJSON('weather.json') || {};
    let lastWeatherUpdate = weather && weather.weather && weather.weather.time && weather.weather.time || 0;
    if (lastWeatherUpdate > settings.updated) {
      settings.updated = lastWeatherUpdate;
    }

    let MillisUntilDue = settings.updated + refreshMillis() - Date.now();
    if (!MillisUntilDue || MillisUntilDue <= 0) {
      if (!loading) {
        loading = true;
        require("owmweather").pull(onCompleted, onError);
      }
    } else {
      // called to early, reschedule
      // console.log('Weather data is not due yet, rescheduling in ' + (MillisUntilDue || 0) + 'ms');
      if (timeoutRef) clearTimeout(timeoutRef);
      timeoutRef = setTimeout(loadIfDueAndReschedule, MillisUntilDue + 1);
    }
  };

  if (settings.enabled) {
    setTimeout(loadIfDueAndReschedule, 5000);  // run 5 seconds after boot
    NRF.on('connect', loadIfDueAndReschedule);  // after reconnect, fetch the weather data right away if it's due
  }
}