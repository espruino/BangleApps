const storage = require('Storage');
const B2 = process.env.HWVERSION===2;

let expiryTimeout;
function scheduleExpiry(json) {
  if (expiryTimeout) {
    clearTimeout(expiryTimeout);
    expiryTimeout = undefined;
  }
  let expiry = "expiry" in json ? json.expiry : 2*3600000;
  if (json.weather && json.weather.time && expiry) {
    let t = json.weather.time + expiry - Date.now();
    expiryTimeout = setTimeout(update, t);
  }
}

function update(weatherEvent) {
  let json = storage.readJSON('weather.json')||{};

  if (weatherEvent) {
    let weather = weatherEvent.clone();
    delete weather.t;
    weather.time = Date.now();
    if (weather.wdir != null) {
      // Convert numeric direction into human-readable label
      let deg = weather.wdir;
      while (deg<0 || deg>360) {
        deg = (deg+360)%360;
      }
      weather.wrose = ['n','ne','e','se','s','sw','w','nw','n'][Math.floor((deg+22.5)/45)];
    }

    json.weather = weather;
  }
  else {
    delete json.weather;
  }

  storage.write('weather.json', json);
  scheduleExpiry(json);
  exports.emit("update", json.weather);
}

const _GB = global.GB;
global.GB = (event) => {
  if (event.t==="weather") update(event);
  if (_GB) setTimeout(_GB, 0, event);
};

exports.get = function() {
  return (storage.readJSON('weather.json')||{}).weather;
}

scheduleExpiry(storage.readJSON('weather.json')||{});

function getPalette(monochrome, ovr) {
  var palette;
  if(monochrome) {
    palette = {
      sun: '#FFF',
      cloud: '#FFF',
      bgCloud: '#FFF',
      rain: '#FFF',
      lightning: '#FFF',
      snow: '#FFF',
      mist: '#FFF',
      background: '#000'
    };
  } else {
    if (B2) {
      if (ovr.theme.dark) {
        palette = {
          sun: '#FF0',
          cloud: '#FFF',
          bgCloud: '#777', // dithers on B2, but that's ok
          rain: '#0FF',
          lightning: '#FF0',
          snow: '#FFF',
          mist: '#FFF'
        };
      } else {
        palette = {
          sun: '#FF0',
          cloud: '#777', // dithers on B2, but that's ok
          bgCloud: '#000',
          rain: '#00F',
          lightning: '#FF0',
          snow: '#0FF',
          mist: '#0FF'
        };
      }
    } else {
      if (ovr.theme.dark) {
        palette = {
          sun: '#FE0',
          cloud: '#BBB',
          bgCloud: '#777',
          rain: '#0CF',
          lightning: '#FE0',
          snow: '#FFF',
          mist: '#FFF'
        };
      } else {
        palette = {
          sun: '#FC0',
          cloud: '#000',
          bgCloud: '#777',
          rain: '#07F',
          lightning: '#FC0',
          snow: '#CCC',
          mist: '#CCC'
        };
      }
    }
  }
  return palette;
}

exports.getColor = function(code) {
  const codeGroup = Math.round(code / 100);
  const palette = getPalette(0, g);
  const cloud = g.blendColor(palette.cloud, palette.bgCloud, .5); //theme independent
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
}

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
exports.drawIcon = function(cond, x, y, r, ovr, monochrome) {
  var palette;
  if(!ovr) ovr = g;

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
      for(let i = 0; i<points.length; i += 2) {
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
    for(let i = 0; i<=6; ++i) {
      const points = [
        x+w, y,
        x-w, y,
        x-w, y+r,
        x+w, y+r,
      ];
      rotatePoints(points, x, y, i/3*Math.PI);
      ovr.fillPoly(points);

      for(let j = -1; j<=1; j += 2) {
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
    if (txt.includes("mist") ||
      txt.includes("smoke") ||
      txt.includes("haze") ||
      txt.includes("sand") ||
      txt.includes("dust") ||
      txt.includes("fog") ||
      txt.includes("ash") ||
      txt.includes("squalls") ||
      txt.includes("tornado")) {
      return drawMist;
    }
    return drawUnknown;
  }

  /*
  * Choose weather icon to display based on weather conditition code
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
    if (typeof (cond)==="object") {
      if ("code" in cond) return chooseIconByCode(cond.code);
      if ("txt" in cond) return chooseIconByTxt(cond.txt);
    } else if (typeof (cond)==="number") {
      return chooseIconByCode(cond.code);
    } else if (typeof (cond)==="string") {
      return chooseIconByTxt(cond.txt);
    }
    return drawUnknown;
  }
  chooseIcon(cond)(x, y, r);

};
