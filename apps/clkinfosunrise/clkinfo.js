(function() {
  // get today's sunlight times for lat/lon
  var sunrise, sunset;

  function calculate() {
    var SunCalc = require("https://raw.githubusercontent.com/mourner/suncalc/master/suncalc.js");
    const locale = require("locale");
    var location = require("Storage").readJSON("mylocation.json",1)||{};
    location.lat = location.lat||51.5072;
    location.lon = location.lon||0.1276;
    location.location = location.location||"London";
    var times = SunCalc.getTimes(new Date(), location.lat, location.lon);
    sunrise = locale.time(times.sunrise,1);
    sunset = locale.time(times.sunset,1);
    /* do we want to re-calculate this every day? Or we just assume
    that 'show' will get called once a day? */
  }

  return {
    name: "Bangle",
    items: [
      { name : "Sunrise",
        get : () => ({ text : sunrise,
                       img : atob("GBiBAAAAAAAAAAAAAAAYAAA8AAB+AAD/AAAAAAAAAAAAAAAYAAAYAAQYIA4AcAYAYAA8AAB+AAD/AAH/gD///D///AAAAAAAAAAAAA==") }),
        show : calculate, hide : () => {}
      }, { name : "Sunset",
        get : () => ({ text : sunset,
                       img : atob("GBiBAAAAAAAAAAAAAAB+AAA8AAAYAAAYAAAAAAAAAAAAAAAYAAAYAAQYIA4AcAYAYAA8AAB+AAD/AAH/gD///D///AAAAAAAAAAAAA==") }),
        show : calculate, hide : () => {}
      }
    ]
  };
})
