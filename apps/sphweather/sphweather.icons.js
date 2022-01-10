wwoCodeToIcon = function (code) {
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
};

getIcon = function (icon, night) {
  switch (icon) {
    case 0:
      return icon_clear(night);
    case 1:
      return icon_few_clouds(night);
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
};

function icon_few_clouds(night) {
  if (night)
    return require("heatshrink").decompress(
      atob(
        "jEYxH+AG4+CCqu0DKIVDAAYXQCoovPFqwuILqAubC6R2IAAYwPgHXAAoYKGAYWH6+sDBYWH1usAAQYJKwQrFAAhiMCgPQCooXKQwYUHC4aUGFYQMCCxOBAAIYEFZYTCAAYXOCowXOCpAXMCpQXGR4gANYJQAPA=="
      )
    );
  else
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
function icon_clear(night) {
  if (night)
    return require("heatshrink").decompress(
      atob(
        "jEYxH+AH4ApOAQVV2gZRCoYADC6AVFF54tWFxBdQFzYXSF6xfXGELvnDIovRDIwVSAH4AvA="
      )
    );
  else
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

getDayWeather = function (json) {
  let codes = json.hourly.map((v) => wwoCodeToIcon(v.weatherCode));
  return mode(codes);
};

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

exports.wwoCodeToIcon = wwoCodeToIcon
exports.getIcon = getIcon
exports.getDayWeather = getDayWeather
