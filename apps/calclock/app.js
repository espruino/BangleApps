var calendar = [];
var current = [];
var next = [];

function updateCalendar() {
  calendar = require("Storage").readJSON("android.calendar.json",true)||[];
  calendar = calendar.filter(e => isActive(e) || getTime() <= e.timestamp);
  calendar.sort((a,b) => a.timestamp - b.timestamp);

  current = calendar.filter(isActive);
  next = calendar.filter(e=>!isActive(e));
}

function isActive(event) {
  var timeActive = getTime() - event.timestamp;
  return timeActive >= 0 && timeActive <= event.durationInSeconds;
}
function zp(str) {
  return ("0"+str).substr(-2);
}

function drawEvent(event, y) {
  g.setFont("Vector", 24);

  var time = isActive(event) ? new Date() : new Date(event.timestamp * 1000);
  var timeStr = zp(time.getHours()) + ":" + zp(time.getMinutes());
  g.drawString(timeStr, 5, y);
  y += 24;

  g.setFont("6x15", 1);
  if (isActive(event)) {
    g.drawString(require("locale").date(time,1),15*timeStr.length,y-15);
  } else {
    var offset = 0-time.getTimezoneOffset()/1440;
    var days = Math.floor((time.getTime()/1000)/86400+offset)-Math.floor(getTime()/86400+offset);
    if(days > 0) {
      var daysStr = days===1?/*LANG*/"tomorrow":/*LANG*/"in "+days+/*LANG*/" days";
      g.drawString(daysStr,15*timeStr.length,y-15);
    }
  }

  g.setFont("12x20", 1);
  var lines = g.wrapString(event.title, g.getWidth()-10);
  g.drawString(lines.join('\n'), 5, y);
  y += 20 * lines.length;
  y += 5;

  return y;
}

var curEventHeight = 0;

function drawCurrentEvents(y) {
  g.setColor("#0ff");
  g.clearRect(5, y, g.getWidth() - 5, y + curEventHeight);
  curEventHeight = y;

  if(current.length === 0) {
    y = drawEvent({timestamp: getTime(), durationInSeconds: 100}, y);
  } else {
    for (var e of current) {
      y = drawEvent(e, y);
    }
  }
  curEventHeight = y - curEventHeight;
  return y;
}

function drawFutureEvents(y) {
  g.setColor("#fff");
  for (var e of next) {
    y = drawEvent(e, y);
    if(y>g.getHeight())break;
  }
  return y;
}

function fullRedraw() {
  g.clearRect(5,24,g.getWidth()-5,g.getHeight());
  updateCalendar();
  var y = 30;
  y = drawCurrentEvents(y);
  drawFutureEvents(y);
}

function redraw() {
  g.reset();
  if (current.find(e=>!isActive(e)) || next.find(isActive)) {
    fullRedraw();
  } else {
    drawCurrentEvents(30);
  }
}

// ------------------ DEBUG -----------------
// calendar[2].timestamp = getTime();

// Clear the screen once, at startup
g.clear();
// draw immediately at first
fullRedraw();
var minuteInterval = setInterval(redraw, 60 * 1000);

Bangle.loadWidgets();
Bangle.drawWidgets();
Bangle.setUI("clock");