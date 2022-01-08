// curl wttr.in/sorocaba?format=j1 | jq "[.weather[] | {hourly:[.hourly[] | {tempC: .tempC|tonumber, chanceofrain: .chanceofrain|tonumber}], date, mintempC: .mintempC | tonumber, maxtempC: .maxtempC|tonumber}]"
// curl wttr.in/sorocaba?format=j1 | jq "[.weather[] | {hourly:[.hourly[] | {tempC: .tempC|tonumber, chanceofrain: .chanceofrain|tonumber, weatherDesc: .weatherDesc[0].value}], date, mintempC: .mintempC | tonumber, maxtempC: .maxtempC|tonumber, avgtempC: .avgtempC | tonumber}]"
// curl wttr.in/sorocaba?format=j1 | jq "[.weather[] | {hourly:[.hourly[] | {tempC: .tempC|tonumber, chanceofrain: .chanceofrain|tonumber, weatherDesc: .weatherDesc[0].value, weatherCode: .weatherCode | tonumber}], date, mintempC: .mintempC | tonumber, maxtempC: .maxtempC|tonumber, avgtempC: .avgtempC | tonumber}]"

// Source: http://www.worldweatheronline.com/feed/wwoConditionCodes.txt

function wwoCodeToIcon(code) {
  switch (code) {
    case 113:
      return 0; // Clear
    case 116:
      return 1; // Few Clouds
    case 119:
    case 122:
      return 2; // Cloudy, VeryCloudy
    case 143:
    case 248:
    case 260:
      return 3; // Fog;
    case 176:
    case 179:
    case 182:
    case 185:
    case 266:
    case 281:
    case 284:
    case 293:
    case 296:
    case 311:
    case 314:
    case 317:
    case 350:
    case 353:
    case 362:
    case 365:
    case 374:
    case 377:
      return 4; // LightShowers, LightSleetShowers, LightSleet, LightRain
    case 200:
    case 386:
    case 389:
    case 392:
      return 5; // ThunderyShowers, ThunderyHeavyRain, ThunderySnowShowers
    case 227:
    case 230:
    case 320:
    case 323:
    case 326:
    case 329:
    case 332:
    case 335:
    case 338:
    case 368:
    case 371:
    case 395:
      return 6; // LightSnow, HeavySnow, LightSnowShowers, HeavySnowShowers
    case 299:
    case 302:
    case 305:
    case 308:
    case 356:
    case 359:
      return 7; // HeavyShowers, HeavyRain
    default:
      return 0; //
  }
}

function getIcon(icon) {
  switch (icon) {
    case 0:
      return icon_clear();
    case 1:
      return icon_few_clouds();
    case 2:
      return icon_overcast();
    case 3:
      return icon_fog();
    case 4:
      return icon_scattered();
    case 5:
      return icon_storm();
    case 7:
      return icon_showers();
    default:
      return icon_unknown();
  }
}

function icon_few_clouds() {
  return require("heatshrink").decompress(
    atob(
      "jEYxH+AE0ACKwFLFSA0QOohcS2gADFqIWEDBw/CC5JMNF6gXYRYgABL6HXAAoYBCynX1gWT1usAAQYLC4oVDC6HQCooXKQwYUHC4bVGFYQMCCxOBAAIYEFZYTCAAYXOCowXOCpAXMCpQXGR4gANeRYAO"
    )
  );
}
function icon_overcast() {
  return require("heatshrink").decompress(
    atob(
      "jEYxH+AH4A//yLGCyHXAAoYOCw/X1gYMCw2t1gACDBYXFCoYXQ6AVFC5SGDCg4XDSgwrCBgQWJwIABDAgrLCYQADC5wVGC5wVIC5gVKC4yPEABryLAH4A/AAwA=="
    )
  );
}
function icon_clear() {
  return require("heatshrink").decompress(
    atob(
      "jEYxH+AEUAC8oOIBB4/PD5yICEyQVC2gZHCpoADDJ4VFDIguNC5IYLCxIwMFxQwINIYWLGAaxIF6RfbR7C/Xd7AZFCp6xJBpIILB5ofRFBw3PC6g"
    )
  );
}
function icon_storm() {
  return require("heatshrink").decompress(
    atob(
      "jEYxH+AHBDGCyGsAAXXAAIYOCwYVCAAOsDBgWBCgmtGgYYLgAVDUw4XN6AoB2gADC5IjDH4YXEGJIrCCgQCCFw2BAAIYEUIgvDCxAXMIxAXPIwgZCC5ouFC5aPECxLBPC44TKGIQ0Eao4wHBgwXECyQXCBQYWOMIgWSC4ZnEPBaRGCaAXFFaLeGBpQA="
    )
  );
}
function icon_severe() {
  return require("heatshrink").decompress(
    atob(
      "jEYxH+AHBDGCyGBAAoYOCwJ1IFp0A2gAEEAQXLq1WC44IBC75UDC5ZiGgErAAQEBC44ODDAgXEBYQXGBYgXcAAxHHYY4XXDBjyRDwIXECRoODGowOHC0ReDCyBfHCx4XGRhwbEI4oAQXKAAT"
    )
  );
}
function icon_showers() {
  return require("heatshrink").decompress(
    atob(
      "jEYxH+AHBDGCyGsAAXXAAIYOCwYVCAAOsDBgWBCgmtGgYYLgArFAAgXO6AVFC5SGDCg4XDSgwrCBgQWJwIABDAgrLCYQADC5wVGC5wVIC5gVKC4yPEABryLACYhEAhwW/CzwA/AA4A=="
    )
  );
}
function icon_scattered() {
  return require("heatshrink").decompress(
    atob(
      "jEYxH+AHBDGCyHXAAoYOCw/X1gYMCw2t1gACDBYXFCoYXQ6AVFC5SGDCg4XDSgwrCBgQWJwIABDAgrLCYQADC5wVGC5wVIC5gVKC4yPEABryLACQfDAZ4ZVF/4vlAFY="
    )
  );
}

function icon_fog() {
  return require("heatshrink").decompress(
    atob(
      "jEYxH+AH4A//yLGCyHXAAoYOCwowDAggdHFo2t1gACCZAkICoYXJF43QCooXKFRIXFLowrCBgQWJwIABDAgSHYAwACC5oABFIQAFC4aLGDoIQEAArdEF4orIF46PFABrBKADQvNHVhITEbo="
    )
  );
}

function icon_unknown() {
  return require("heatshrink").decompress(
    atob(
      "jEYxH+AGhHOC5PXABYXr62sAAIXQCYQADC5etBoIAEC5yFHC5yqJC6JcGC/4XG02BAAIXQCIIAFR6IRLC7xYCLJoX/O8oAnA"
    )
  );
}

function getDayWeather(json) {
  let codes = json.hourly.map((v) => wwoCodeToIcon(v.weatherCode));
  return mode(codes);
}

function mode(a) {
  counts = a.reduce((count, e) => {
    if (!(e in count)) count[e] = 1;
    else count[e]++;
    return count;
  }, {});
  return Object.keys(counts).reduce(
    (acc, key) => (acc[0] < counts[key] ? [counts[key], key] : acc),
    [0, null]
  )[1];
}

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

    g.setFontLECO1976sph12();
    g.setFontAlign(0, -1);
    for (let i = 0; i < 3; i++) {
      if (i < weather.length) {
        let icon = getIcon(getDayWeather(weather[i]));
        g.drawImage(icon, 67 + i * 30, 8);
        let temp = weather[i].avgtempC;
      } else {
        // let icon = icon_unknown();
        g.setFontLECO1976Regular20();
        g.setColor("#888");
        g.drawString("?", 67 + i * 30 + 12, 13);
        let temp = "-";
        g.setFontLECO1976sph12();
      }

      g.setColor("#000");
      g.drawString(temp, 80 + i * 30, 37);
      g.setColor("#FFF");
      g.drawString(temp, 79 + i * 30, 36);
    }
  }
};
