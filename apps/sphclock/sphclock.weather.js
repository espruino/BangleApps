// curl wttr.in/sorocaba?format=j1 | jq "[.weather[] | {hourly:[.hourly[] | {tempC: .tempC|tonumber, chanceofrain: .chanceofrain|tonumber}], date, mintempC: .mintempC | tonumber, maxtempC: .maxtempC|tonumber}]"
// curl wttr.in/sorocaba?format=j1 | jq "[.weather[] | {hourly:[.hourly[] | {tempC: .tempC|tonumber, chanceofrain: .chanceofrain|tonumber, weatherDesc: .weatherDesc[0].value}], date, mintempC: .mintempC | tonumber, maxtempC: .maxtempC|tonumber, avgtempC: .avgtempC | tonumber}]"
// curl wttr.in/sorocaba?format=j1 | jq "[.weather[] | {hourly:[.hourly[] | {tempC: .tempC|tonumber, chanceofrain: .chanceofrain|tonumber, weatherDesc: .weatherDesc[0].value, weatherCode: .weatherCode | tonumber}], date, mintempC: .mintempC | tonumber, maxtempC: .maxtempC|tonumber, avgtempC: .avgtempC | tonumber}]"

// Source: http://www.worldweatheronline.com/feed/wwoConditionCodes.txt

exports.drawWeather = function () {
  let hoje = new Date();

  let weather = require("Storage").readJSON("sphclock.json", false).weather;
  if (weather) {
    weather = weather.filter((v) => v.date >= hoje.toISOString().split("T")[0]);

    g.setColor("#000");
    g.drawRect(65, 7, 152, 49);
    g.setPixel(65, 7, "#FFF");
    g.setPixel(65, 49, "#FFF");
    g.setPixel(152, 49, "#FFF");
    g.setPixel(152, 7, "#FFF");

    g.setColor("#F00");
    g.fillRect(67, 33, 150, 47);

    g.setFontLECO1976Regular12();
    g.setFontAlign(0, -1);
    sphweather = require("sphweather.icons.js")
    for (let i = 0; i < 3; i++) {
      if (i < weather.length) {
        let icon = sphweather.getIcon(sphweather.getDayWeather(weather[i]));
        g.drawImage(icon, 67 + i * 30, 8);
        let temp = weather[i].avgtempC;
      } else {
        // let icon = icon_unknown();
        g.setFontLECO1976Regular20();
        g.setColor("#888");
        g.drawString("?", 67 + i * 30 + 12, 13);
        let temp = "-";
        g.setFontLECO1976Regular12();
      }

      g.setColor("#000");
      g.drawString(temp, 80 + i * 30, 37);
      g.setColor("#FFF");
      g.drawString(temp, 79 + i * 30, 36);
    }
  }
};
