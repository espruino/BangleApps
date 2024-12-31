{

const defaultSettings = {
  loadWidgets    : false,
  textAboveHands : false,
  shortHrHand    : false,
  show24HourMode : false
};

const settings = Object.assign(defaultSettings, require('Storage').readJSON('cc_clock24.json', 1) || {});

const center = {
  "x": g.getWidth()/2,
  "y": g.getHeight()/2
};

const hourNumberPositions = (function() {
  let z = [];
  let sk = 1;
  for (let i = -10; i < 50; i += 5){
    let alpha = i * 2 * Math.PI / 60;
    let xsk = center.x + 2 + Math.cos(alpha) * (center.x - 10),
        ysk = center.y + 2 + Math.sin(alpha) * (center.x - 10);
    if (sk==3){ xsk -= 10; }
    if (sk==6){ ysk -= 10; }
    if (sk==9){ xsk += 10; }
    if (sk==12){ ysk += 10; }
    if (sk==10){ xsk += 3; }
    z.push([sk, xsk, ysk]);
    sk += 1;
  }
  return z;
})();

const calcHandPolygon = function(len, dia, alpha) {
  const x = center.x + Math.cos(alpha) * len/2,
        y = center.y + Math.sin(alpha) * len/2,
        d = {
          "d": 3,
          "x": dia/2 * Math.cos(alpha + Math.PI/2),
          "y": dia/2 * Math.sin(alpha + Math.PI/2)
        },
  return [
    center.x - d.x,
    center.y - d.y,
    center.x + d.x,
    center.y + d.y,
    x + d.x,
    y + d.y,
    x - d.x, 
    y - d.y
  ];
};

const drawHands = function(date) {
  let m = date.getMinutes(),
      h = date.getHours(), 
      s = date.getSeconds();
  g.setColor(1, 1, 1);
  
  let numHoursForHourHand = settings.show24HourMode? 24 : 12;
  
  if (h > numHoursForHourHand){
    h = h - numHoursForHourHand;
  }
  
  // calculates the position of the minute, second and hour hand
  h = 2 * Math.PI / numHoursForHourHand * (h + m/60) - Math.PI/2;
  m = 2 * Math.PI / 60 * m - Math.PI/2;
  s = 2 * Math.PI / 60 * s - Math.PI/2;
  
  //g.setColor(1,0,0);
  const hourPolygon = calcHandPolygon(settings.shortHrHand? 88 : 100, 5, h);
  g.fillPoly(hourPolygon, true);
  //g.setColor(1, 1, 1);
  const minutePolygon = calcHandPolygon(150, 5, m);
  g.fillPoly(minutePolygon, true);
  if (unlock){
    const secondPolygon = calcHandPolygon(150, 2, s);
    g.fillPoly(secondPolygon, true);
  }
  g.fillCircle(center.x, center.y, 4);
};

const drawText = function(date) {
  g.setFont("Vector", 10);
  g.setBgColor(0, 0, 0);
  g.setColor(1, 1, 1);
  
  const dateStr = require("locale").date(date);
  g.drawString(dateStr, center.x, center.y + 20, true);
  
  const batteryStr = Math.round(E.getBattery()/5) * 5 + "%";
  
  if (Bangle.isCharging()) {
    g.setBgColor(1, 0, 0);
  }
  g.drawString(batteryStr, center.x, center.y + 40, true);
};

const drawNumbers = function() {
  //draws the numbers on the screen
  g.setFont("Vector", 20);
  g.setColor(1, 1, 1);
  g.setBgColor(0, 0, 0);
  for(let i = 0; i < 12; i++){
    hour = hourNumberPositions[i][0]
    if (settings.show24HourMode){
      hour *= 2;
    }
    g.drawString(hour, hourNumberPositions[i][1], hourNumberPositions[i][2], true);
  }
};

let drawTimeout;
let queueMillis = 1000;
let unlock = true;

const updateState = function() {
  if (Bangle.isLCDOn()) {
    if (!Bangle.isLocked()) {
      queueMillis = 1000;
      unlock = true;
    } else {
      queueMillis = 60000;
      unlock = false;
    }
    draw();
  } else {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
};

const queueDraw = function() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, queueMillis - (Date.now() % queueMillis));
};

const draw = function() {
  // draw black rectangle in the middle to clear screen from scale and hands
  g.setColor(0, 0, 0);
  g.fillRect(10, 10, 2 * center.x - 10, 2 * center.x - 10);
  // prepare for drawing the text
  g.setFontAlign(0, 0);
  // do drawing
  drawNumbers();
  const date = new Date();
  if (settings.textAboveHands) {
    drawHands(date); 
    drawText(date);
  } else {
    drawText(date); 
    drawHands(date);
  }
  queueDraw();
};

//draws the scale once the app is startet
const drawScale = function() {
  // clear the screen
  g.setBgColor(0, 0, 0);
  g.clear();
  
  // draw the ticks of the scale
  for (let i = -14; i < 47; i++){
    const alpha = i * 2 * Math.PI/60;
    let d = 2;
    if (i % 5 == 0) { 
      d = 5;
    }
    g.fillPoly(calcHandPolygon(300, d, alpha), true);
    g.setColor(0, 0, 0);
    g.fillRect(10, 10, 2 * center.x - 10, 2 * center.x - 10);
    g.setColor(1, 1, 1);
  }
};

//// main running sequence ////

// Show launcher when middle button pressed, and widgets that we're clock
Bangle.setUI({
  mode: "clock",
  remove: function() {
    Bangle.removeListener('lcdPower', updateState);
    Bangle.removeListener('lock', updateState);
    Bangle.removeListener('charging', draw);
    
    // We clear drawTimout after removing all listeners, because they can add one again
    if (drawTimeout) {
      clearTimeout(drawTimeout);
    }
    
    drawTimeout = undefined;
    require("widget_utils").show();
  }
});

// Load widgets if needed, and make them show swipeable
if (settings.loadWidgets) {
  Bangle.loadWidgets();
  require("widget_utils").swipeOn();
} else if (global.WIDGETS) {
  require("widget_utils").hide();
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower', updateState);
Bangle.on('lock', updateState);
Bangle.on('charging', draw); // Immediately redraw when charger (dis)connected

updateState();
drawScale();
draw();

}
