(() => {
    var weather;
    var weatherLib = require("weather");

    function updateWeather() {
      weather = weatherLib.get();
      if(weather){
        weather.temp = require("locale").temp(weather.temp-273.15);
        weather.feels = require("locale").temp(weather.feels-273.15);
        weather.hum = `${weather.hum}%`;
        weather.wind = require("locale").speed(weather.wind).match(/^(\D*\d*)(.*)$/);
        weather.wind = Math.round(weather.wind[1]) +" "+ weather.wind[2];

      } else {
        weather = {
          temp: "?",
          hum: "?",
          wind: "?",
          feels: "?",
          txt: "?",
        };
      }
    }
    updateWeather();

    function weatherIcon(code) {
      var ovr = Graphics.createArrayBuffer(24,24,1,{msb:true});
      weatherLib.drawIcon({code:code},12,12,12,ovr,true);
      var img = ovr.asImage();
      img.transparent = 0;
      return img;
    }

    function _updater() {
      updateWeather();
      this.emit("redraw");
    }

    //FIXME ranges are somehow arbitrary
    var weatherItems = {
        name: "Weather",
        img: atob("GBiBAABAAARGAAYEAADgACP4wDf8gAf+AA/+AE/4AG/jwA/v4A8P8AR/8DH/8AH//AP//g///g///g///gf//AAAAABkwABMgABMgA=="),
        items: [
            {
              //TODO get this configurable
                name: "conditionWithData",
                hasRange : true,
                get: () => ({ text: weather.temp, img: weatherIcon(weather.code),
                  color: weatherLib.getColor(weather.code),
                  v: parseInt(weather.temp), min: -30, max: 55}),
                show: function() {
                  this.updater = _updater.bind(this);
                  weatherLib.on("update", this.updater);
                },
                hide: function () { weatherLib.removeListener("update", this.updater); }
              ,run : function() {load("weather.app.js");}
            },
            {
                name: "condition",
                get: () => ({ text: weather.txt, img: weatherIcon(weather.code),
                  color: weatherLib.getColor(weather.code),
                  v: weather.code}),
                show: function() {
                  this.updater = _updater.bind(this);
                  weatherLib.on("update", this.updater);
                },
                hide: function () { weatherLib.removeListener("update", this.updater); }
              ,run : function() {load("weather.app.js");}
            },
            {
                name: "temperature",
                hasRange : true,
                get: () => ({ text: weather.temp, img: atob("GBiBAAA8AAB+AADnAADDAADDAADDAADDAADDAADbAADbAADbAADbAADbAADbAAHbgAGZgAM8wAN+wAN+wAM8wAGZgAHDgAD/AAA8AA=="),
                  v: parseInt(weather.temp), min: -30, max: 55}),
                show: function() {
                  this.updater = _updater.bind(this);
                  weatherLib.on("update", this.updater);
                },
                hide: function () { weatherLib.removeListener("update", this.updater); }
              ,run : function() {load("weather.app.js");}
            },
          {
                name: "feelsLike",
                hasRange : true,
                get: () => ({ text: weather.feels, img: atob("GBiBAAAAAAHAAAPgAAfgAAfgAAfg4APhsAfxEB/5EB/5ED/9ED/9ED/9ED/9ED/9EB/9UB/7UA/yyAf26Afk7AfmyAfjGAfh8AAAAA=="),
                  v: parseInt(weather.temp), min: -30, max: 55}),
                show: function() {
                  this.updater = _updater.bind(this);
                  weatherLib.on("update", this.updater);
                },
                hide: function () { weatherLib.removeListener("update", this.updater); }
              ,run : function() {load("weather.app.js");}
            },
            {
                name: "humidity",
                hasRange : true,
                get: () => ({ text: weather.hum, img: atob("GBiBAAAEAAAMAAAOAAAfAAAfAAA/gAA/gAI/gAY/AAcfAA+AQA+A4B/A4D/B8D/h+D/j+H/n/D/n/D/n/B/H/A+H/AAH/AAD+AAA8A=="),
                  v: parseInt(weather.hum), min: 0, max: 100}),
                show: function() {
                  this.updater = _updater.bind(this);
                  weatherLib.on("update", this.updater);
                },
                hide: function () { weatherLib.removeListener("update", this.updater); }
              ,run : function() {load("weather.app.js");}
            },
            {
                name: "wind",
                hasRange : true,
                get: () => ({ text: weather.wind, img: atob("GBiBAAHgAAPwAAYYAAwYAAwMfAAY/gAZh3/xg//hgwAAAwAABg///g//+AAAAAAAAP//wH//4AAAMAAAMAAYMAAYMAAMcAAP4AADwA=="),
                  v: parseInt(weather.wind), min: 0, max: 118}),
                show: function() {
                  this.updater = _updater.bind(this);
                  weatherLib.on("update", this.updater);
                },
                hide: function () { weatherLib.removeListener("update", this.updater); }
              ,run : function() {load("weather.app.js");}
            },
        ]
    };

    return weatherItems;
})
