(function() {
    var weather = {
        temp: "?",
        hum: "?",
        wind: "?",
    };

    var weatherJson = require("Storage").readJSON('weather.json');
    if(weatherJson !== undefined && weatherJson.weather !== undefined){
        weather = weatherJson.weather;
        weather.temp = require("locale").temp(weather.temp-273.15);
        weather.hum = weather.hum + "%";
        weather.wind = require("locale").speed(weather.wind).match(/^(\D*\d*)(.*)$/);
        weather.wind = Math.round(weather.wind[1]) + "kph";
    }

    //FIXME ranges are somehow arbitrary
    var weatherItems = {
        name: "Weather",
        img: atob("GBiBAf+///u5//n7//8f/9wHP8gDf/gB//AB/7AH/5AcP/AQH/DwD/uAD84AD/4AA/wAAfAAAfAAAfAAAfgAA/////+bP/+zf/+zfw=="),
        items: [
            {
                name: "temperature",
                hasRange : true,
                get: () => ({ text: weather.temp, img: atob("GBiBAAA8AAB+AADnAADDAADDAADDAADDAADDAADbAADbAADbAADbAADbAADbAAHbgAGZgAM8wAN+wAN+wAM8wAGZgAHDgAD/AAA8AA=="),
                  v: parseInt(weather.temp), min: -30, max: 55}),
                show: function() { weatherItems.items[0].emit("redraw"); },
                hide: function () {}
            },
            {
                name: "humidity",
                hasRange : true,
                get: () => ({ text: weather.hum, img: atob("GBiBAAAEAAAMAAAOAAAfAAAfAAA/gAA/gAI/gAY/AAcfAA+AQA+A4B/A4D/B8D/h+D/j+H/n/D/n/D/n/B/H/A+H/AAH/AAD+AAA8A=="),
                  v: parseInt(weather.hum), min: 0, max: 100}),
                show: function() { weatherItems.items[1].emit("redraw"); },
                hide: function () {}
            },
            {
                name: "wind",
                hasRange : true,
                get: () => ({ text: weather.wind, img: atob("GBiBAAHgAAPwAAYYAAwYAAwMfAAY/gAZh3/xg//hgwAAAwAABg///g//+AAAAAAAAP//wH//4AAAMAAAMAAYMAAYMAAMcAAP4AADwA=="),
                  v: parseInt(weather.wind), min: 0, max: 118}),
                show: function() { weatherItems.items[2].emit("redraw"); },
                hide: function () {}
            },
        ]
    };

    return weatherItems;
})
