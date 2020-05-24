const storage = require('Storage');

let expiryTimeout = undefined;
function scheduleExpiry(json) {
  if (expiryTimeout) {
    clearTimeout(expiryTimeout);
    expiryTimeout = undefined;
  }
  if (json.weather && json.weather.time && json.expiry) {
    let t = json.weather.time + json.expiry - Date.now();
    expiryTimeout = setTimeout(() => {
      expiryTimeout = undefined;

      let json = storage.readJSON('weather.json')||{};
      delete json.weather;
      storage.write('weather.json', json);

      exports.current = undefined;
      exports.emit("update");
    }, t);
  }
}

function setCurrentWeather(json) {
  scheduleExpiry(json);
  exports.current = json.weather;
}

function update(weatherEvent) {
  let weather = Object.assign({}, weatherEvent);
  weather.time = Date.now();
  delete weather.t;

  let json = storage.readJSON('weather.json')||{};
  json.weather = weather;
  storage.write('weather.json', json);

  setCurrentWeather(json);

  exports.emit("update");
}

const _GB = global.GB;
global.GB = (event) => {
  if (event.t==="weather") update(event);
  if (_GB) setTimeout(_GB, 0, event);
};

setCurrentWeather(storage.readJSON('weather.json')||{});

exports.drawIcon = function(cond, x, y, r) {
  function drawSun(x, y, r) {
    g.setColor("#FF7700");
    g.fillCircle(x, y, r);
  }

  function drawCloud(x, y, r, c) {
    const u = r/12;
    if (c==null) c = "#EEEEEE";
    g.setColor(c);
    g.fillCircle(x-8*u, y+3*u, 4*u);
    g.fillCircle(x-4*u, y-2*u, 5*u);
    g.fillCircle(x+4*u, y+0*u, 4*u);
    g.fillCircle(x+9*u, y+4*u, 3*u);
    g.fillPoly([
      x-8*u, y+7*u,
      x-8*u, y+3*u,
      x-4*u, y-2*u,
      x+4*u, y+0*u,
      x+9*u, y+4*u,
      x+9*u, y+7*u,
    ]);
  }

  function drawBrokenClouds(x, y, r) {
    drawCloud(x+1/8*r, y-1/8*r, 7/8*r, "#777777");
    drawCloud(x-1/8*r, y+1/8*r, 7/8*r);
  }

  function drawFewClouds(x, y, r) {
    drawSun(x+3/8*r, y-1/8*r, 5/8*r);
    drawCloud(x-1/8*r, y+1/8*r, 7/8*r);
  }

  function drawRainLines(x, y, r) {
    g.setColor("#FFFFFF");
    const y1 = y+1/2*r;
    const y2 = y+1*r;
    g.fillPoly([
      x-6/12*r+1, y1,
      x-8/12*r+1, y2,
      x-7/12*r, y2,
      x-5/12*r, y1,
    ]);
    g.fillPoly([
      x-2/12*r+1, y1,
      x-4/12*r+1, y2,
      x-3/12*r, y2,
      x-1/12*r, y1,
    ]);
    g.fillPoly([
      x+2/12*r+1, y1,
      x+0/12*r+1, y2,
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
      g.setColor("#FF7700");
      g.fillPoly([
        x-2/6*r, y-r,
        x-4/6*r, y+1/6*r,
        x-1/6*r, y+1/6*r,
        x-3/6*r, y+1*r,
        x+3/6*r, y-1/6*r,
        x+0/6*r, y-1/6*r,
        x+3/6*r, y-r,
      ]);
    }

    drawBrokenClouds(x, y-1/3*r, r);
    drawLightning(x-1/12*r, y+1/2*r, 1/2*r);
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

    g.setColor("#FFFFFF");
    const w = 1/12*r;
    for(let i = 0; i<=6; ++i) {
      const points = [
        x+w, y,
        x-w, y,
        x-w, y+r,
        x+w, y+r,
      ];
      rotatePoints(points, x, y, i/3*Math.PI);
      g.fillPoly(points);

      for(let j = -1; j<=1; j += 2) {
        const points = [
          x+w, y+7/12*r,
          x-w, y+7/12*r,
          x-w, y+r,
          x+w, y+r,
        ];
        rotatePoints(points, x, y+7/12*r, j/3*Math.PI);
        rotatePoints(points, x, y, i/3*Math.PI);
        g.fillPoly(points);
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

    g.setColor("#FFFFFF");
    for(let i = 0; i<5; ++i) {
      g.fillRect(x+layers[i][0]*r, y+(0.4*i-0.9)*r, x+layers[i][1]*r,
        y+(0.4*i-0.7)*r-1);
      g.fillCircle(x+layers[i][0]*r, y+(0.4*i-0.8)*r-0.5, 0.1*r-0.5);
      g.fillCircle(x+layers[i][1]*r, y+(0.4*i-0.8)*r-0.5, 0.1*r-0.5);
    }
  }

  function chooseIcon(condition) {
    if (!condition) return () => {};
    condition = condition.toLowerCase();
    if (condition.includes("thunderstorm")) return drawThunderstorm;
    if (condition.includes("freezing")||condition.includes("snow")||
      condition.includes("sleet")) {
      return drawSnow;
    }
    if (condition.includes("drizzle")||
      condition.includes("shower")) {
      return drawRain;
    }
    if (condition.includes("rain")) return drawShowerRain;
    if (condition.includes("clear")) return drawSun;
    if (condition.includes("few clouds")) return drawFewClouds;
    if (condition.includes("scattered clouds")) return drawCloud;
    if (condition.includes("clouds")) return drawBrokenClouds;
    return drawMist;
  }

  chooseIcon(cond)(x, y, r);
};
