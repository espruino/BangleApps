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

function drawEventHeader(event, y) {
  var x = 0;
  var time = isActive(event) ? new Date() : new Date(event.timestamp * 1000);

  //Don't need to know what time the event is at if its all day
  if (isActive(event) || !event.allDay) {
    g.setFont("Vector", 24);
    var timeStr = zp(time.getHours()) + ":" + zp(time.getMinutes());
    g.drawString(timeStr, 0, y);
    y += 3;
    x = 13*timeStr.length+5;
  }

  g.setFont("12x20", 1);

  if (isActive(event)) {
    g.drawString(zp(time.getDate())+". " + require("locale").month(time,1),x,y);
  } else {
    var offset = 0-time.getTimezoneOffset()/1440;
    var days = Math.floor((time.getTime()/1000)/86400+offset)-Math.floor(getTime()/86400+offset);
    if(days > 0 || event.allDay) {
      var daysStr = days===1?/*LANG*/"tomorrow":/*LANG*/"in "+days+/*LANG*/" days";
      g.drawString(daysStr,x,y);
    }
  }
  y += 21;
  return y;
}

function drawEventBody(event, y) {
  g.setFont("12x20", 1);
  var lines = g.wrapString(event.title, g.getWidth()-15);
  var yStart = y;
  if (lines.length > 2) {
    lines = lines.slice(0,2);
    lines[1] += "...";
  }
  g.drawString(lines.join('\n'),10,y);
  y+=20 * lines.length;
  if(event.location) {
    g.drawImage(atob("DBSBAA8D/H/nDuB+B+B+B3Dn/j/B+A8A8AYAYAYAAAAAAA=="),10,y);
    var loclines = g.wrapString(event.location, g.getWidth()-30);
    if(loclines.length>1) loclines[0] += "...";
    g.drawString(loclines[0],25,y);
    y+=20;
  }
  if (event.color) {
    var oldColor = g.getColor();
    g.setColor("#"+(0x1000000+Number(event.color)).toString(16).padStart(6,"0"));
    g.fillRect(0,yStart,5,y-3);
    g.setColor(oldColor);
  }
  y+=5;
  return y;
}

function drawEvent(event, y) {
  y = drawEventHeader(event, y);
  y = drawEventBody(event, y);
  return y;
}

var curEventHeight = 0;

function drawCurrentEvents(y) {
  g.setColor(g.theme.dark ? "#0ff" : "#00f");
  g.clearRect(0,y,g.getWidth()-5,y+curEventHeight);
  curEventHeight = y;

  if(current.length === 0) {
    y = drawEvent({timestamp: getTime(), durationInSeconds: 100}, y);
  } else {
    y = drawEventHeader(current[0],y);
    for (var e of current) {
      y = drawEventBody(e,y);
    }
  }
  curEventHeight = y-curEventHeight;
  return y;
}

function drawFutureEvents(y) {
  g.setColor(g.theme.fg);
  for (var e of next) {
    y = drawEvent(e, y);
    if(y>g.getHeight())break;
  }
  return y;
}

function fullRedraw() {
  g.clearRect(0,24,g.getWidth()-5,g.getHeight());
  updateCalendar();
  var y = 30;
  y = drawCurrentEvents(y);
  drawFutureEvents(y);
}

function buzzForEvents() {
  let nextEvent = next[0]; if (!nextEvent) return;
  // No buzz for all day events or events before 7am
  // TODO: make this configurable
  if (nextEvent.allDay || (new Date(nextEvent.timestamp * 1000)).getHours() < 7) return;
  let minToEvent = Math.round((nextEvent.timestamp - getTime()) / 60.0);
  switch (minToEvent) {
    case 30: require("buzz").pattern(":"); break;
    case 15: require("buzz").pattern(", ,"); break;
    case 1: require("buzz").pattern(": : :"); break;
  }
}

function redraw() {
  g.reset();
  if (current.find(e=>!isActive(e)) || next.find(isActive)) {
    fullRedraw();
  } else {
    drawCurrentEvents(30);
  }
  buzzForEvents();
}

g.clear();
fullRedraw();
buzzForEvents();
/*var minuteInterval =*/ setInterval(redraw, 60 * 1000);

Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
