var data = require("Storage").readJSON("mtnclock.json", 1) || {};

let weather;
try {
  weather = require('weather');
} catch (_err) {
  weather = undefined;
}

//seeded RNG to generate stars, snow, etc
function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
}

//scale x, y coords to screen
function px(x) {
  return x*g.getWidth()/100;
}

function py(y) {
  return y*g.getHeight()/100;
}

function drawMtn(color, coord, dimen) {
  //scale mountains to different sizes
  g.setColor(color.mtn1).fillPoly([
    coord.x,coord.y,
    coord.x,coord.y+dimen.h,
    coord.x-dimen.w/2,coord.y+dimen.h
  ]);
  g.setColor(color.mtn2).fillPoly([
    coord.x,coord.y,
    coord.x,coord.y+dimen.h,
    coord.x+dimen.w/2,coord.y+dimen.h
  ]);
}

function drawTree(color, coord, dimen) {
  //scale trees to different sizes
  g.setColor(color.tree1).fillPoly([
    coord.x,coord.y,
    coord.x-dimen.w/5,coord.y+dimen.h/4,
    coord.x-dimen.w/12,coord.y+dimen.h/4,
    coord.x-dimen.w/2.8,coord.y+1.95*dimen.h/4,
    coord.x-dimen.w/8,coord.y+1.95*dimen.h/4,
    coord.x-dimen.w/2,coord.y+3*dimen.h/4,
    coord.x,coord.y+3*dimen.h/4
  ]);
  g.setColor(color.tree2).fillPoly([
    coord.x,coord.y,
    coord.x+dimen.w/5,coord.y+dimen.h/4,
    coord.x+dimen.w/12,coord.y+dimen.h/4,
    coord.x+dimen.w/2.8,coord.y+1.95*dimen.h/4,
    coord.x+dimen.w/8,coord.y+1.95*dimen.h/4,
    coord.x+dimen.w/2,coord.y+3*dimen.h/4,
    coord.x,coord.y+3*dimen.h/4
  ]);
  g.setColor(color.tree3).fillRect(
    coord.x-dimen.w/12,coord.y+3*dimen.h/4,
    coord.x+dimen.w/12,coord.y+dimen.h
  );
}

function drawSnow(color, coord, size) {
  g.setColor(color).drawLine(coord.x-px(size),coord.y-py(size),coord.x+px(size),coord.y+py(size));
  g.drawLine(coord.x-px(size),coord.y+py(size),coord.x+px(size),coord.y-py(size));
  g.drawLine(coord.x,coord.y+py(size),coord.x,coord.y-py(size));
  g.drawLine(coord.x-px(size),coord.y,coord.x+px(size),coord.y);
}

function draw(color) {

var seed;
var rand;

g.clear();
//background
  g.setColor(color.bg1).fillRect(
    px(0),py(0),
    px(100),py(45)
  );
  g.setColor(color.bg2).fillRect(
    px(0),py(45),
    px(100),py(100)
  );
  //lightning
  if (color.ltn) {
    g.setColor(color.ltn).fillPoly([
    px(70),py(20),
    px(60),py(28),
    px(71),py(29),
    px(63),py(40),
    px(75),py(28),
    px(64),py(27)
    ]);
    g.fillPoly([
    px(40),py(20),
    px(30),py(28),
    px(41),py(29),
    px(33),py(40),
    px(45),py(28),
    px(34),py(27)
    ]);
  }
  //stars
  if (color.star) {
    seed = 4;
    rand = sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
    for (let i = 0; i < 40; i++) {
  g.setColor(color.star).drawCircle(Math.floor(rand() * px(100)),Math.floor(rand() * py(33)),Math.floor(rand() * 2));
    }
  }
  //birds
  if (color.bird) {
    g.setColor(color.bird).fillCircle(px(17),py(12),px(5)).fillCircle(px(23),py(10),px(5));
    g.setColor(color.bg1).fillCircle(px(18),py(15),px(6)).fillCircle(px(24),py(13),px(6));
    g.setColor(color.bird).fillCircle(px(28),py(19),px(4)).fillCircle(px(33),py(19),px(4));
    g.setColor(color.bg1).fillCircle(px(28),py(21),px(5)).fillCircle(px(34),py(21),px(5));
  }
  //sun/moon
  if (color.sun) g.setColor(color.sun).fillCircle(px(65), py(22), py(20));
  //path
  g.setColor(color.path).fillPoly([
    px(60),py(44),
    px(39),py(55),
    px(72),py(57),
    px(30),py(100),
    px(70),py(100),
    px(78),py(55),
    px(46),py(53)
  ]);
  //fog
  if (color.fog) {
    g.setColor(color.fog);
    for (let i = 1; i <= 47; i = i+2) {
      g.drawLine(px(0),py(i),px(100),py(i));
    }
  }
  //rain
  if (color.rain1) {
    g.setColor(color.rain1);
    for (let i = 0; i <= 6; i++) {
      g.drawLine(px(6+i*20),py(20),px(-14+i*20),py(45));
    }
    if (color.rain2) {
      for (let i = 0; i <= 6; i++) {
        g.drawLine(px(16+i*20),py(20),px(-4+i*20),py(45));
      }
    }
  }
  //snow
  if (color.snow) {
    seed = 11;
    rand = sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
    for (let i = 0; i < 30; i++) {
      drawSnow(color.snow, {x:Math.floor(rand() * px(100)), y:(Math.floor(rand() * py(25))+py(20))}, Math.floor(rand() * 3));
    }
  }
  //mountains
  drawMtn({mtn1:color.mtn2, mtn2:color.mtn1}, {x:px(35), y:py(30)}, {w:px(38), h:py(17)});
  drawMtn({mtn1:color.mtn2, mtn2:color.mtn1}, {x:px(10), y:py(20)}, {w:px(50), h:py(30)});
  drawMtn({mtn1:color.mtn1, mtn2:color.mtn2}, {x:px(90), y:py(20)}, {w:px(70), h:py(30)});
  //lake
  g.setColor(color.lake).fillEllipse(px(-15), py(52), px(30), py(57));
  //trees
  drawTree({tree1:color.tree2, tree2:color.tree1, tree3:color.tree3}, {x:px(12),y:py(52)}, {w:px(13),h:py(13)});
  drawTree({tree1:color.tree2, tree2:color.tree1, tree3:color.tree3}, {x:px(48),y:py(52)}, {w:px(13),h:py(13)});
  drawTree({tree1:color.tree2, tree2:color.tree1, tree3:color.tree3}, {x:px(34),y:py(46)}, {w:px(6),h:py(6)});
  drawTree({tree1:color.tree1, tree2:color.tree2, tree3:color.tree3}, {x:px(70),y:py(46)}, {w:px(6),h:py(6)});
  drawTree({tree1:color.tree1, tree2:color.tree2, tree3:color.tree3}, {x:px(90),y:py(52)}, {w:px(13),h:py(13)});
  //clouds
  if (color.cloud1) {
    g.setColor(color.cloud1);
    if (color.cloud2) g.fillRect(0, 0, px(100), py(10));
    g.fillCircle(px(3), py(12), py(4));
    g.fillCircle(px(10), py(12), py(5));
    g.fillCircle(px(16), py(11), py(6));
    g.fillCircle(px(24), py(10), py(8));
    g.fillCircle(px(30), py(11), py(6));
    g.fillCircle(px(35), py(12), py(5));
    g.fillCircle(px(40), py(12), py(6));
    g.fillCircle(px(48), py(13), py(5));
    g.fillCircle(px(55), py(14), py(5));
    g.fillCircle(px(60), py(12), py(5));
    g.fillCircle(px(65), py(11), py(6));
    g.fillCircle(px(75), py(10), py(8));
    g.fillCircle(px(85), py(11), py(6));
    g.fillCircle(px(90), py(12), py(5));
    g.fillCircle(px(97), py(13), py(4));
  }

  //clock text
  (color.clock == undefined) ? g.setColor(0xFFFF) : g.setColor(color.clock);
  g.setFont("Vector", py(20)).setFontAlign(-1, -1).drawString((require("locale").time(new Date(), 1).replace(" ", "")), px(2), py(67));
  g.setFont("Vector", py(10)).drawString(require('locale').dow(new Date(), 1)+" "+new Date().getDate()+" "+require('locale').month(new Date(), 1)+((data.temp == undefined) ? "" : " | "+require('locale').temp(Math.round(data.temp-273.15)).replace(".0", "")), px(2), py(87));

  if (data.showWidgets) {
    Bangle.drawWidgets();
  }
}

function setWeather() {
  var a = {};
  //clear day/night is default weather
  if ((data.code >= 800 && data.code <=802) || data.code == undefined) {
    if (new Date().getHours() >= 7 && new Date().getHours() <= 19) {
      //day-clear
      a = {
      bg1:0x4FFF, bg2:0x03E0,
      sun:0xFD20,
      path:0x8200,
      mtn1:0x045f, mtn2:0x000F,
      lake:0x000F,
      tree1:0x07E0, tree2:0, tree3:0x7BE0,
      bird:0xFFFF
      };
      //day-cloudy
      if (data.code == 801 || data.code == 802) a.cloud1 = 0xFFFF;
    }
    else {
      //night-clear
      a = {
      bg1:0, bg2:0x0005,
      sun:0xC618,
      path:0,
      mtn1:0x0210, mtn2:0x0010,
      lake:0x000F,
      tree1:0x0200, tree2:0, tree3:0x59E0,
      star:0xFFFF
      };
      //night-cloudy
      if (data.code == 801 || data.code == 802) a.cloud1 = 0x4208;
    }
  }
  else if (((data.code >= 300) && (data.code < 600)) || ((data.code >= 200) && (data.code < 300)) || data.code == 803 || data.code == 804) {
    if (new Date().getHours() >= 7 && new Date().getHours() <= 19) {
      //day-overcast
      a = {
      bg1:0xC618, bg2:0x0200,
      path:0x3000,
      mtn1:0x3B38, mtn2:0x0005,
      lake:0x000F,
      tree1:0x03E0, tree2:0, tree3:0x59E0,
      cloud1:0x7BEF, cloud2:1
      };
      //day-lightning
      if (data.code >= 200 && data.code < 300) a.ltn = 0xFFFF;
      //day-drizzle
      if ((data.code >= 300 && data.code < 600) || (data.code >= 200 && data.code <= 202) || (data.code >= 230 && data.code <= 232)) a.rain1 = 0xFFFF;
      //day-rain
      if ((data.code >= 500 && data.code < 600) || (data.code >= 200 && data.code <= 202)) a.rain2 = 1;
    }
    else {
      //night-overcast
      a = {
      bg1:0, bg2:0x0005,
      path:0,
      mtn1:0x0010, mtn2:0x000F,
      lake:0x000F,
      tree1:0x0200, tree2:0, tree3:0x59E0,
      cloud1:0x4208, cloud2:1
      };
      //night-lightning
      if (data.code >= 200 && data.code < 300) a.ltn = 0xFFFF;
      //night-drizzle
      if ((data.code >= 300 && data.code < 600) || (data.code >= 200 && data.code <= 202) || (data.code >= 230 && data.code <= 232)) a.rain1 = 0xC618;
      //night-rain
      if ((data.code >= 500 && data.code < 600) || (data.code >= 200 && data.code <= 202)) a.rain2 = 1;
    }
  }
  else if ((data.code >= 700) && (data.code < 800)) {
    if (new Date().getHours() >= 7 && new Date().getHours() <= 19) {
      //day-fog
      a = {
      bg1:0xC618, bg2:0x0200,
      path:0x3000,
      mtn1:0x3B38, mtn2:0x0005,
      lake:0x000F,
      tree1:0x03E0, tree2:0, tree3:0x59E0,
      fog:0xFFFF
      };
    }
    else {
      //night-fog
      a = {
      bg1:0, bg2:0x0005,
      path:0,
      mtn1:0x0010, mtn2:0x000F,
      lake:0x000F,
      tree1:0x0200, tree2:0, tree3:0x59E0,
      fog:0x7BEF
      };
    }
  }
  else if ((data.code >= 600) && (data.code < 700)) {
    if (new Date().getHours() >= 7 && new Date().getHours() <= 19) {
      //day-snow
      a = {
      bg1:0, bg2:0x7BEF,
      path:0xC618,
      mtn1:0xFFFF, mtn2:0x7BEF,
      lake:0x07FF,
      tree1:0xC618, tree2:0xC618, tree3:0x59E0,
      cloud1:0x7BEF, cloud2:1,
      snow:0xFFFF,
      clock: 0
      };
    }
    else {
      //night-snow
      a = {
      bg1:0, bg2:0x0005,
      path:0,
      mtn1:0x0010, mtn2:0x000F,
      lake:0x000F,
      tree1:0x39E7, tree2:0x39E7, tree3:0x59E0,
      cloud1:0x4208, cloud2:1,
      snow:0xFFFF
      };
    }
  }
  draw(a);
}

function readWeather() {
  var weatherJson = require("Storage").readJSON('weather.json', 1);
  // save updated weather data if available and it has been an hour since last updated
  if (weatherJson && weatherJson.weather && weatherJson.weather.time && (data.time === undefined || (data.time + 3600000) < weatherJson.weather.time)) {
    data.time = weatherJson.weather.time;
    data.temp = weatherJson.weather.temp;
    data.code = weatherJson.weather.code;
    require("Storage").writeJSON('mtnclock.json', data);
  }
}

function updateWeather() {
  const current = weather.get();
  if (current) {
    data.temp = current.temp;
    data.code = current.code;
    data.time = Date.now();
    require("Storage").writeJSON('mtnclock.json', data);
    setWeather();
  }
}

if (weather) {
  weather.on("update", updateWeather);
}

const _GB = global.GB;
global.GB = (event) => {
  if (!weather && event.t==="weather" && event.v !== 2) {
    // Fallback in case weather app is not installed
    data.temp = event.temp;
    data.code = event.code;
    data.time = Date.now();
    require("Storage").writeJSON('mtnclock.json', data);
    setWeather();
  }
  if (_GB) setTimeout(_GB, 0, event);
};

var drawTimeout;

//update watchface in next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    readWeather();
    setWeather();
    queueDraw();
  }, 60000 - (Date.now() % 60000));
}

queueDraw();
readWeather();
setWeather();
Bangle.setUI("clock");

if (data.showWidgets) {
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
