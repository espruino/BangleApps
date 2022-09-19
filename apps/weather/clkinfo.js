(function() {
    var weather = {
        temp: "?",
        hum: "?",
        wind: "?",
    };

    var weatherJson = storage.readJSON('weather.json');
    if(weatherJson !== undefined && weatherJson.weather !== undefined){
        weather = weatherJson.weather;
        weather.temp = locale.temp(weather.temp-273.15);
        weather.hum = weather.hum + "%";
        weather.wind = locale.speed(weather.wind).match(/^(\D*\d*)(.*)$/);
        weather.wind = Math.round(weather.wind[1]) + "kph";
    }

    var weatherItems = {
        name: "Weather",
        img: atob("GBiBAf+///u5//n7//8f/9wHP8gDf/gB//AB/7AH/5AcP/AQH/DwD/uAD84AD/4AA/wAAfAAAfAAAfAAAfgAA/////+bP/+zf/+zfw=="),
        items: [
            {
                name: "temperature",
                get: () => ({ text: weather.temp, img: atob("GBiBAf/D//+B//8Y//88//88//88//88//88//8k//8k//8k//8k//8k//8k//4kf/5mf/zDP/yBP/yBP/zDP/5mf/48f/8A///D/w==")}),
                show: function() { weatherItems.items[0].emit("redraw"); },
                hide: function () {}
            },
            {
                name: "humidity",
                get: () => ({ text: weather.hum, img: atob("GBiBAf/7///z///x///g///g///Af//Af/3Af/nA//jg//B/v/B/H+A/H8A+D8AeB8AcB4AYA8AYA8AYA+A4A/B4A//4A//8B///Dw==")}),
                show: function() { weatherItems.items[1].emit("redraw"); },
                hide: function () {}
            },
            {
                name: "wind",
                get: () => ({ text: weather.wind, img: atob("GBiBAf4f//wP//nn//Pn//Pzg//nAf/meIAOfAAefP///P//+fAAAfAAB////////wAAP4AAH///z///z//nz//nz//zj//wH//8Pw==")}),
                show: function() { weatherItems.items[2].emit("redraw"); },
                hide: function () {}
            },
        ]
    };

    return weatherItems;
})