const storage = require("Storage");
const B2 = process.env.HWVERSION === 2;

let expiryTimeout;
function scheduleExpiry() {
  if (expiryTimeout) {
    clearTimeout(expiryTimeout);
    expiryTimeout = undefined;
  }

  const json = storage.readJSON("weatherSetting.json") || {};
  const expiry = "expiry" in json ? json.expiry : 2 * 3600000;
  expiryTimeout = setTimeout(() => {
    storage.write("weather.json", { t: "weather", weather: undefined });
    storage.write("weather2.json", {});
  }, expiry);
}

let refreshTimeout;
function scheduleRefresh() {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = undefined;
  }
  const json = storage.readJSON("weatherSetting.json") || {};
  const refresh = "refresh" in json ? json.refresh : 0;
  if (refresh === 0) {
    return;
  }
  refreshTimeout = setTimeout(() => {
    updateWeather(false);
    scheduleRefresh();
  }, refresh);
}

const angles = ["n", "ne", "e", "se", "s", "sw", "w", "nw", "n"];
function windDirection(angle) {
  return angles[Math.floor((angle + 22.5) / 45)];
}

function update(weatherEvent) {
  if (weatherEvent == null) {
    return;
  }

  if (weatherEvent.t !== "weather") {
    return;
  }

  const weatherSetting = storage.readJSON("weatherSetting.json") || {};

  if (weatherEvent.v == null || weatherEvent.v === 1) {
    let json = { "t": "weather", "weather": weatherEvent.clone() };
    let weather = json.weather;

    weather.time = Date.now();
    if (weather.wdir != null) {
      weather.wrose = windDirection(weather.wdir);
    }

    storage.write("weather.json", json);
    exports.emit("update", weather);

    // Request extended/forecast if supported by Weather Provider and set in settings
    if (weatherEvent.v != null && (weatherSetting.dataType ?? "basic") !== "basic") {
      updateWeather(true);
    }

    // Either Weather Provider doesn't support v2 and/or we don't need extended/forecast, so we use this event for refresh scheduling
    if (weatherEvent.v == null || (weatherSetting.dataType ?? "basic") === "basic") {
      weatherSetting.time = Date.now();
      storage.write("weatherSetting.json", weatherSetting);

      scheduleExpiry();
      scheduleRefresh();
    }
  } else if (weatherEvent.v === 2) {
    weatherSetting.time = Date.now();
    storage.write("weatherSetting.json", weatherSetting);

    // Store binary data for parsing when requested by other apps later
    let cloned = weatherEvent.clone();
    cloned.time = weatherSetting.time;
    storage.write("weather2.json", cloned);

    // If we stored weather v1 recently, we don't need to parse non-forecast from v2
    // Otherwise we need to parse part of it to refresh weather1.json
    let weather1 = storage.readJSON("weather.json") ?? {};
    if (weather1.weather == null || weather1.weather.time == null || Date.now() - weather1.weather.time >= 60 * 1000) {
      weather1 = undefined; // Clear memory
      const weather2 = decodeWeatherV2(weatherEvent, true, false);

      // Store simpler weather for apps that doesn't need forecast or backward compatibility
      const weather = downgradeWeatherV2(weather2);
      storage.write("weather.json", weather);
      exports.emit("update", weather);
    } else if (weather1.weather != null && weather1.weather.feels === undefined) {
      // Grab feels like temperature as we have it in v2
      weather1.weather.feels = decodeWeatherV2FeelsLike(weatherEvent) + 273;
      storage.write("weather.json", weather1);
      exports.emit("update", weather1);
    }

    cloned = undefined; // Clear memory

    scheduleExpiry();
    scheduleRefresh();

    exports.emit("update2");
  }
}

function updateWeather(force) {
  const settings = storage.readJSON("weatherSetting.json") || {};

  let lastFetch = settings.time ?? 0;

  // More than 5 minutes
  if (force || Date.now() - lastFetch >= 5 * 60 * 1000) {
    Bluetooth.println(""); // This empty line is important for correct communication with Weather Provider
    Bluetooth.println(JSON.stringify({ t: "weather", v: 2, f: settings.dataType === "forecast" }));
  }
}

function getWeather(extended) {
  const weatherSetting = storage.readJSON("weatherSetting.json") || {};

  if (extended === false || (weatherSetting.dataType ?? "basic") === "basic") {
    // biome-ignore lint/complexity/useOptionalChain: not supported by Espruino
    return (storage.readJSON("weather.json") ?? {}).weather;
  } else {
    const json2 = storage.readJSON("weather2.json");
    if (json2 == null) {
      // Fallback in case no weather v2 exists, but we have weather v1
      // biome-ignore lint/complexity/useOptionalChain: not supported by Espruino
      return (storage.readJSON("weather.json") ?? {}).weather;
    }

    if (json2.d == null) {
      // We have already parsed weather v2
      return json2;
    }

    // We have weather v2, but not decoded
    const decoded = decodeWeatherV2(json2, true, true);
    storage.write("weather2.json", decoded);

    return decoded;
  }
}

exports.update = update;
const _GB = global.GB;
global.GB = (event) => {
  if (event.t === "weather") update(event);
  if (_GB) setTimeout(_GB, 0, event);
};

exports.updateWeather = updateWeather;
exports.get = () => getWeather(false);
exports.getWeather = getWeather;

scheduleRefresh();

function decodeWeatherV2(jsonData, canDestroyArgument, parseForecast) {
  let time;
  if (jsonData != null && jsonData.time != null) {
    time = Math.round(jsonData.time);
  } else {
    time = Math.round(Date.now());
  }

  // Check if we have data to parse
  if (jsonData == null || jsonData.d == null) {
    return { t: "weather2", v: 2, time: time };
  }

  // This needs to be kept in sync with Weather Provider
  const weatherCodes = [
    [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
    [300, 301, 302, 310, 311, 312, 313, 314, 321],
    [],
    [500, 501, 502, 503, 504, 511, 520, 521, 522, 531],
    [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
    [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
    [800, 801, 802, 803, 804],
  ];
  const mapWCode = (code) => {
    return weatherCodes[code >> 5][code & 0x1f];
  };

  const buffer = E.toArrayBuffer(atob(jsonData.d));
  const dataView = new DataView(buffer);

  if (canDestroyArgument) {
    delete jsonData.d; // Free some memory if we can
  }

  const weather = {
    t: "weather2",
    v: 2,
    time: time,
    temp: dataView.getInt8(0),
    hi: dataView.getInt8(1),
    lo: dataView.getInt8(2),
    hum: dataView.getUint8(3),
    rain: dataView.getUint8(4),
    uv: dataView.getUint8(5) / 10,
    code: mapWCode(dataView.getUint8(6)),
    txt: jsonData.c,
    wind: dataView.getUint16(7, true) / 100,
    wdir: dataView.getUint16(9, true),
    loc: jsonData.l,
    dew: dataView.getInt8(11),
    pres: dataView.getUint16(12, true) / 10,
    cloud: dataView.getUint8(14),
    visib: dataView.getUint32(15, true) / 10,
    sunrise: dataView.getUint32(19, true),
    sunset: dataView.getUint32(23, true),
    moonrise: dataView.getUint32(27, true),
    moonset: dataView.getUint32(31, true),
    moonphase: dataView.getUint16(35, true),
    feels: dataView.getInt8(37, true),
  };
  weather.wrose = windDirection(weather.wdir);

  let offset = 38;
  if (offset < buffer.length && parseForecast) {
    // We have forecast data

    // Hourly forecast
    const hoursAmount = dataView.getUint8(offset++);

    const timestampBase = dataView.getUint32(offset, true);
    offset += 4;

    weather.hourfcast = {
      time: [].map.call(new Uint8Array(buffer, offset, hoursAmount), (v) => timestampBase + (v / 10) * 3600),
      temp: new Int8Array(buffer, offset + hoursAmount, hoursAmount),
      code: [].map.call(new Uint8Array(buffer, offset + hoursAmount * 2, hoursAmount), mapWCode),
      wind: new Uint8Array(buffer, offset + hoursAmount * 3, hoursAmount),
      wdir: [].map.call(new Uint8Array(buffer, offset + hoursAmount * 4, hoursAmount), (v) => v * 2),
      wrose: [].map.call(new Uint8Array(buffer, offset + hoursAmount * 4, hoursAmount), (v) => windDirection(v * 2)),
      rain: new Uint8Array(buffer, offset + hoursAmount * 5, hoursAmount),
    };
    offset += hoursAmount * 6;

    // Daily forecast
    const daysAmount = dataView.getUint8(offset++);

    weather.dayfcast = {
      hi: new Int8Array(buffer, offset, daysAmount),
      lo: new Int8Array(buffer, offset + daysAmount, daysAmount),
      code: [].map.call(new Uint8Array(buffer, offset + daysAmount * 2, daysAmount), mapWCode),
      wind: new Uint8Array(buffer, offset + daysAmount * 3, daysAmount),
      wdir: [].map.call(new Uint8Array(buffer, offset + daysAmount * 4, daysAmount), (v) => v * 2),
      wrose: [].map.call(new Uint8Array(buffer, offset + daysAmount * 4, daysAmount), (v) => windDirection(v * 2)),
      rain: new Uint8Array(buffer, offset + daysAmount * 5, daysAmount),
    };
  }

  return weather;
}

function decodeWeatherV2FeelsLike(jsonData) {
  if (jsonData == null || jsonData.d == null) {
    return undefined;
  }

  const buffer = E.toArrayBuffer(atob(jsonData.d));

  return new DataView(buffer).getInt8(37, true);
}

function downgradeWeatherV2(weather2) {
  const json = { t: "weather" };

  json.weather = {
    v: 1,
    time: weather2.time,
    temp: weather2.temp + 273,
    hi: weather2.hi + 273,
    lo: weather2.lo + 273,
    hum: weather2.hum,
    rain: weather2.rain,
    uv: weather2.uv,
    code: weather2.code,
    txt: weather2.txt,
    wind: weather2.wind,
    wdir: weather2.wdir,
    wrose: weather2.wrose,
    loc: weather2.loc,
    feels: weather2.feels + 273,
  };

  return json;
}

function getPalette(monochrome, ovr) {
  var palette;
  if (monochrome) {
    palette = {
      sun: "#FFF",
      cloud: "#FFF",
      bgCloud: "#FFF",
      rain: "#FFF",
      lightning: "#FFF",
      snow: "#FFF",
      mist: "#FFF",
      background: "#000",
    };
  } else {
    if (B2) {
      if (ovr.theme.dark) {
        palette = {
          sun: "#FF0",
          cloud: "#FFF",
          bgCloud: "#777", // dithers on B2, but that's ok
          rain: "#0FF",
          lightning: "#FF0",
          snow: "#FFF",
          mist: "#FFF",
        };
      } else {
        palette = {
          sun: "#FF0",
          cloud: "#777", // dithers on B2, but that's ok
          bgCloud: "#000",
          rain: "#00F",
          lightning: "#FF0",
          snow: "#0FF",
          mist: "#0FF",
        };
      }
    } else {
      if (ovr.theme.dark) {
        palette = {
          sun: "#FE0",
          cloud: "#BBB",
          bgCloud: "#777",
          rain: "#0CF",
          lightning: "#FE0",
          snow: "#FFF",
          mist: "#FFF",
        };
      } else {
        palette = {
          sun: "#FC0",
          cloud: "#000",
          bgCloud: "#777",
          rain: "#07F",
          lightning: "#FC0",
          snow: "#CCC",
          mist: "#CCC",
        };
      }
    }
  }
  return palette;
}

exports.getColor = (code) => {
  const codeGroup = Math.round(code / 100);
  const palette = getPalette(0, g);
  const cloud = g.blendColor(palette.cloud, palette.bgCloud, 0.5); //theme independent
  switch (codeGroup) {
    case 2: return g.blendColor(cloud, palette.lightning, .5);
    case 3: return palette.rain;
    case 5:
      switch (code) {
        case 511: return palette.snow;
        case 520: return g.blendColor(palette.rain, palette.sun, .5);
        case 521: return g.blendColor(palette.rain, palette.sun, .5);
        case 522: return g.blendColor(palette.rain, palette.sun, .5);
        case 531: return g.blendColor(palette.rain, palette.sun, .5);
        default: return palette.rain;
      }
    case 6: return palette.snow;
    case 7: return palette.mist;
    case 8:
      switch (code) {
        case 800: return palette.sun;
        case 801: return palette.sun;
        case 802: return cloud;
        default: return cloud;
      }
    default: return cloud;
  }
};

/**
 *
 * @param cond Weather condition, as one of:
 *             {number} code: (Preferred form) https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
 *             {string} weather description (in English: breaks for other languages!)
 *             {object} use cond.code if present, or fall back to cond.txt
 * @param x Left
 * @param y Top
 * @param r Icon Size
 * @param ovr Graphics instance (or undefined for g)
 * @param monochrome If true, produce a monochromatic icon
 */
exports.drawIcon = (cond, x, y, r, ovr, monochrome) => {
  var palette;
  if (!ovr) ovr = g;

  palette = getPalette(monochrome, ovr);

  function drawSun(x, y, r) {
    ovr.setColor(palette.sun);
    ovr.fillCircle(x, y, r);
  }

  function drawCloud(x, y, r, c) {
    const u = r/12;
    if (c==null) c = palette.cloud;
    ovr.setColor(c);
    ovr.fillCircle(x-8*u, y+3*u, 4*u);
    ovr.fillCircle(x-4*u, y-2*u, 5*u);
    ovr.fillCircle(x+4*u, y+0*u, 4*u);
    ovr.fillCircle(x+9*u, y+4*u, 3*u);
    ovr.fillPoly([
      x-8*u, y+7*u,
      x-8*u, y+3*u,
      x-4*u, y-2*u,
      x+4*u, y+0*u,
      x+9*u, y+4*u,
      x+9*u, y+7*u,
    ]);
  }

  function drawBrokenClouds(x, y, r) {
    drawCloud(x+1/8*r, y-1/8*r, 7/8*r, palette.bgCloud);
    if(monochrome)
      drawCloud(x-1/8*r, y+2/16*r, r, palette.background);
    drawCloud(x-1/8*r, y+1/8*r, 7/8*r);
  }

  function drawFewClouds(x, y, r) {
    drawSun(x+3/8*r, y-1/8*r, 5/8*r);
    if(monochrome)
      drawCloud(x-1/8*r, y+2/16*r, r, palette.background);
    drawCloud(x-1/8*r, y+1/8*r, 7/8*r);
  }

  function drawRainLines(x, y, r) {
    ovr.setColor(palette.rain);
    const y1 = y+1/2*r;
    const y2 = y+1*r;
    const poly = ovr.fillPolyAA ? p => ovr.fillPolyAA(p) : p => ovr.fillPoly(p);
    poly([
      x-6/12*r, y1,
      x-8/12*r, y2,
      x-7/12*r, y2,
      x-5/12*r, y1,
    ]);
    poly([
      x-2/12*r, y1,
      x-4/12*r, y2,
      x-3/12*r, y2,
      x-1/12*r, y1,
    ]);
    poly([
      x+2/12*r, y1,
      x+0/12*r, y2,
      x+1/12*r, y2,
      x+3/12*r, y1,
    ]);
  }

  function drawShowerRain(x, y, r) {
    drawFewClouds(x, y-1/3*r, r);
    drawRainLines(x, y, r);
  }

  function drawRain(x, y, r) {
    drawBrokenClouds(x, y-1/3*r, r);
    drawRainLines(x, y, r);
  }

  function drawThunderstorm(x, y, r) {
    function drawLightning(x, y, r) {
      ovr.setColor(palette.lightning);
      ovr.fillPoly([
        x-2/6*r, y-r,
        x-4/6*r, y+1/6*r,
        x-1/6*r, y+1/6*r,
        x-3/6*r, y+1*r,
        x+3/6*r, y-1/6*r,
        x+0/6*r, y-1/6*r,
        x+3/6*r, y-r,
      ]);
    }

    if(monochrome) drawBrokenClouds(x, y-1/3*r, r);
    drawLightning(x-1/12*r, y+1/2*r, 1/2*r);
    drawBrokenClouds(x, y-1/3*r, r);
  }

  function drawSnow(x, y, r) {
    function rotatePoints(points, pivotX, pivotY, angle) {
      for (let i = 0; i < points.length; i += 2) {
        const x = points[i];
        const y = points[i+1];
        points[i] = Math.cos(angle)*(x-pivotX)-Math.sin(angle)*(y-pivotY)+
          pivotX;
        points[i+1] = Math.sin(angle)*(x-pivotX)+Math.cos(angle)*(y-pivotY)+
          pivotY;
      }
    }

    ovr.setColor(palette.snow);
    const w = 1/12*r;
    for (let i = 0; i <= 6; ++i) {
      const points = [
        x+w, y,
        x-w, y,
        x-w, y+r,
        x+w, y+r,
      ];
      rotatePoints(points, x, y, i/3*Math.PI);
      ovr.fillPoly(points);

      for (let j = -1; j <= 1; j += 2) {
        const points = [
          x+w, y+7/12*r,
          x-w, y+7/12*r,
          x-w, y+r,
          x+w, y+r,
        ];
        rotatePoints(points, x, y+7/12*r, j/3*Math.PI);
        rotatePoints(points, x, y, i/3*Math.PI);
        ovr.fillPoly(points);
      }
    }
  }

  function drawMist(x, y, r) {
    const layers = [
      [-0.4, 0.5],
      [-0.8, 0.3],
      [-0.2, 0.9],
      [-0.9, 0.7],
      [-0.2, 0.3],
    ];

    ovr.setColor(palette.mist);
    for(let i = 0; i<5; ++i) {
      ovr.fillRect(x+layers[i][0]*r, y+(0.4*i-0.9)*r, x+layers[i][1]*r,
        y+(0.4*i-0.7)*r-1);
      ovr.fillCircle(x+layers[i][0]*r, y+(0.4*i-0.8)*r-0.5, 0.1*r-0.5);
      ovr.fillCircle(x+layers[i][1]*r, y+(0.4*i-0.8)*r-0.5, 0.1*r-0.5);
    }
  }

  function drawUnknown(x, y, r) {
    drawCloud(x, y, r, palette.bgCloud);
    ovr.setColor(ovr.theme.fg).setFontAlign(0, 0).setFont('Vector', r*2).drawString("?", x+r/10, y+r/6);
  }

  /*
   * Choose weather icon to display based on weather description
   */
  function chooseIconByTxt(txt) {
    if (!txt) return () => {};
    txt = txt.toLowerCase();
    if (txt.includes("thunderstorm")) return drawThunderstorm;
    if (txt.includes("freezing")||txt.includes("snow")||
      txt.includes("sleet")) {
      return drawSnow;
    }
    if (txt.includes("drizzle")||
      txt.includes("shower")) {
      return drawRain;
    }
    if (txt.includes("rain")) return drawShowerRain;
    if (txt.includes("clear")) return drawSun;
    if (txt.includes("few clouds")) return drawFewClouds;
    if (txt.includes("scattered clouds")) return drawCloud;
    if (txt.includes("clouds")) return drawBrokenClouds;
    if (
      txt.includes("mist") ||
      txt.includes("smoke") ||
      txt.includes("haze") ||
      txt.includes("sand") ||
      txt.includes("dust") ||
      txt.includes("fog") ||
      txt.includes("ash") ||
      txt.includes("squalls") ||
      txt.includes("tornado")
    ) {
      return drawMist;
    }
    return drawUnknown;
  }

  /*
   * Choose weather icon to display based on weather condition code
   * https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
   */
  function chooseIconByCode(code) {
    const codeGroup = Math.round(code / 100);
    switch (codeGroup) {
      case 2: return drawThunderstorm;
      case 3: return drawRain;
      case 5:
        switch (code) {
          case 511: return drawSnow;
          case 520: return drawShowerRain;
          case 521: return drawShowerRain;
          case 522: return drawShowerRain;
          case 531: return drawShowerRain;
          default: return drawRain;
        }
      case 6: return drawSnow;
      case 7: return drawMist;
      case 8:
        switch (code) {
          case 800: return drawSun;
          case 801: return drawFewClouds;
          case 802: return drawCloud;
          default: return drawBrokenClouds;
        }
      default: return drawUnknown;
    }
  }

  function chooseIcon(cond) {
    if (typeof cond === "object") {
      if ("code" in cond) return chooseIconByCode(cond.code);
      if ("txt" in cond) return chooseIconByTxt(cond.txt);
    } else if (typeof cond === "number") {
      return chooseIconByCode(cond.code);
    } else if (typeof cond === "string") {
      return chooseIconByTxt(cond.txt);
    }
    return drawUnknown;
  }
  chooseIcon(cond)(x, y, r);
};
