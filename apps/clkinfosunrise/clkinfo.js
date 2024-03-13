(function() {
  // get today's sunlight times for lat/lon
  var sunrise, sunset, date;
  var SunCalc = require("suncalc"); // from modules folder
  const locale = require("locale");

  function calculate() {
    var location = require("Storage").readJSON("mylocation.json",1)||{};
    location.lat = location.lat||51.5072;
    location.lon = location.lon||0.1276; // London
    date = new Date(Date.now());
    var times = SunCalc.getTimes(date, location.lat, location.lon);
    sunrise = times.sunrise;
    sunset = times.sunset;
    /* do we want to re-calculate this every day? Or we just assume
    that 'show' will get called once a day? */
  }

  function show() {
    this.interval = setTimeout(()=>{
      this.emit("redraw");
      this.interval = setInterval(()=>{
        this.emit("redraw");
      }, 60000);
    }, 60000 - (Date.now() % 60000));
  }
  function hide() {
    clearInterval(this.interval);
    this.interval = undefined;
  }

  return {
    name: "Bangle",
    items: [
      { name : "Sunrise",
        get : () => { calculate();
                     return { text : locale.time(sunrise,1),
                       img : atob("GBiBAAAAAAAAAAAAAAAYAAA8AAB+AAD/AAAAAAAAAAAAAAAYAAAYAAQYIA4AcAYAYAA8AAB+AAD/AAH/gD///D///AAAAAAAAAAAAA==") }},
        show : show, hide : hide
      }, { name : "Sunset",
        get : () => { calculate();
                     return { text : locale.time(sunset,1),
                       img : atob("GBiBAAAAAAAAAAAAAAB+AAA8AAAYAAAYAAAAAAAAAAAAAAAYAAAYAAQYIA4AcAYAYAA8AAB+AAD/AAH/gD///D///AAAAAAAAAAAAA==") }},
        show : show, hide : hide
      }, { name : "Sunrise/set", // Time in day (uses v/min/max to show percentage through day)
        hasRange : true,
        get : () => {
          calculate();
          let day = true;
          let d = date.getTime();
          let dayLength = sunset.getTime()-sunrise.getTime();
          let timePast;
          let timeTotal;
          if (d < sunrise.getTime()) {
            day = false; // early morning
            timePast = sunrise.getTime()-d;
            timeTotal = 86400000-dayLength;
          } else  if (d > sunset.getTime()) {
            day = false; // evening
            timePast = d-sunset.getTime();
            timeTotal = 86400000-dayLength;
          } else { // day!
            timePast = d-sunrise.getTime();
            timeTotal = dayLength;
          }
          let v = Math.round(100 * timePast / timeTotal);
          let minutesTo = (timeTotal-timePast)/60000;
          return { text : (minutesTo>90) ? (Math.round(minutesTo/60)+"h") : (Math.round(minutesTo)+"m"),
                   v : v, min : 0, max : 100,
                   img : day ? atob("GBiBAAAYAAAYAAAYAAgAEBwAOAx+MAD/AAH/gAP/wAf/4Af/4Of/5+f/5wf/4Af/4AP/wAH/gAD/AAx+MBwAOAgAEAAYAAAYAAAYAA==") : atob("GBiBAAfwAA/8AAP/AAH/gAD/wAB/wAB/4AA/8AA/8AA/8AAf8AAf8AAf8AAf8AA/8AA/8AA/4AB/4AB/wAD/wAH/gAf/AA/8AAfwAA==")
                  }
        },
        show : show, hide : hide
      }
    ]
  };
})
