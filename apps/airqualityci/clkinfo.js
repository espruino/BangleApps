(function() {
  let data = require("Storage").readJSON("airqualityci.json", 1) || {};
  let config = require("Storage").readJSON("airqualityci.settings.json") || {};

  function checkAQI(cb) {
    let d = new Date();
    if (config.apiKey && config.rows) {
      config.rows.forEach((row) => {
        if (row.url) {
          let el = row.url.replace(/\/$/, "").split("/").reverse();
          let url = `https://api.airvisual.com/v2/city?city=${el[0]}&state=${el[1]}&country=${el[2]}&key=${config.apiKey}`;
          data[row.url] = data[row.url] || {};
          // If neither attempt nor time are set, then we have never tried
          // If attempt was set more than 1 minute ago, try again
          // If time was set more than 1 hour ago, refresh
          if ((!data[row.url].time && !data[row.url].attempt) ||
              (data[row.url].attempt && data[row.url].attempt + 60000 < d.getTime()) ||
              (data[row.url].time && data[row.url].time + 3600000 < d.getTime())) {
            data[row.url].attempt = d.getTime();
            Bangle.http(url).then((r) => {
              let resp = JSON.parse(r.resp);
              data[row.url] = {
                aqius: resp.data.current.pollution.aqius,
                temp: resp.data.current.weather.tp,
                time: d.getTime()
              }
              cb();
              require("Storage").writeJSON("airqualityci.json", data);
            });
          }
        }
      });
    }
  }

  let locs = {
    name: "AirQuality",
    items: []
  };

  if (config.rows) {
    config.rows.forEach((row, id) => {
      locs.items.push({
        name: "AQI " + row.name,
        show: () => {},
        hide: () => {},
        run: function() {
          if ( ! config.rows[id].mode ) {
             config.rows[id].mode = 2;
          } else if ( config.rows[id].mode === 5 ){
             config.rows[id].mode = 1;
          } else {
             config.rows[id].mode += 1;
          }
          this.emit("redraw");
          require("Storage").writeJSON("airqualityci.settings.json", config);
        },
        get: function() {
          checkAQI(() => this.emit("redraw"));
          let aqi = data[config.rows[id].url]
          let txt = "";
          switch ( config.rows[id].mode) {
            case 2:
              txt = ((aqi && aqi.aqius) || "...") + " " + ((aqi && aqi.temp) || "...") + "°";
              break;
            case 3:
              txt = row.name + " " + ((aqi && aqi.aqius) || "...");
              break;
            case 4:
              txt = row.name + " " + ((aqi && aqi.aqius) || "...") + " " + ((aqi && aqi.temp) || "...") + "°";
              break;
            case 5:
              txt = row.name;
              break;
            default:
              txt = ((aqi && aqi.aqius) || "...");
          }
          return {
            text: txt,
            short: ((aqi && aqi.aqius) || "..."),
            img: atob("GBiBAAA4AAB8AAd+AA++QB/d8D/t8D/p+DvqcBUPsA7vgB9fwA7vgAXvgAH/AAHwgAD3wAbfwA9/wA+/gA/fAA/OAA/gAAfAAAAAAA==")
          };
        }
      });
    });
  }

  return locs;
})
