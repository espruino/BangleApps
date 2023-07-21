/* CALENDAR is a list of:
  {id:int,
    type,
    timestamp,
    durationInSeconds,
    title,
    description,
    location,
    color:int,
    calName,
    allDay: bool,
  }
*/

Bangle.loadWidgets();
Bangle.drawWidgets();

var FILE = "android.calendar.json";

var Locale = require("locale");

var fontSmall = "6x8";
var fontMedium = g.getFonts().includes("6x15")?"6x15":"6x8:2";
var fontBig = g.getFonts().includes("12x20")?"12x20":"6x8:2";
var fontLarge = g.getFonts().includes("6x15")?"6x15:2":"6x8:4";

//FIXME maybe write the end from GB already? Not durationInSeconds here (or do while receiving?)
var CALENDAR = require("Storage").readJSON("android.calendar.json",true)||[];
var settings = require("Storage").readJSON("agenda.settings.json",true)||{};

CALENDAR=CALENDAR.sort((a,b)=>a.timestamp - b.timestamp);

function getDate(timestamp) {
  return new Date(timestamp*1000);
}
function formatDay(date) {
  let formattedDate = Locale.dow(date,1) + " " + Locale.date(date).replace(/\d\d\d\d/,"");
  if (!settings.useToday) {
    return formattedDate;
  }
  const today = new Date(Date.now());
  if (date.getDay() == today.getDay() && date.getMonth() == today.getMonth())
     return /*LANG*/"Today ";
  else {
    const tomorrow = new Date(Date.now() + 86400 * 1000);
    if (date.getDay() == tomorrow.getDay() && date.getMonth() == tomorrow.getMonth()) {
       return /*LANG*/"Tomorrow ";
    }
    return formattedDate;
  }
}
function formatDateLong(date, includeDay, allDay) {
  let shortTime = Locale.time(date,1)+Locale.meridian(date);
  if(allDay) shortTime = "";
  if(includeDay || allDay) {
    return formatDay(date)+" "+shortTime;
  }
  return shortTime;
}
function formatDateShort(date, allDay) {
  return formatDay(date)+(allDay?"":Locale.time(date,1)+Locale.meridian(date));
}

var lines = [];
function showEvent(ev) {
  var bodyFont = fontBig;
  if(!ev) return;
  g.setFont(bodyFont);
  //var lines = [];
  if (ev.title) lines = g.wrapString(ev.title, g.getWidth()-10);
  var titleCnt = lines.length;
  var start = getDate(ev.timestamp);
  var end = getDate((+ev.timestamp) + (+ev.durationInSeconds));
  var includeDay = true;
  if (titleCnt) lines.push(""); // add blank line after title
  if(start.getDay() == end.getDay() && start.getMonth() == end.getMonth())
    includeDay = false;
  if(includeDay && ev.allDay) {
    //single day all day (average to avoid getting previous day)
    lines = lines.concat(
      g.wrapString(formatDateLong(new Date((start+end)/2), includeDay, ev.allDay), g.getWidth()-10));
  } else if(includeDay || ev.allDay) {
    lines = lines.concat(
      /*LANG*/"Start"+":",
      g.wrapString(formatDateLong(start, includeDay, ev.allDay), g.getWidth()-10),
      /*LANG*/"End"+":",
      g.wrapString(formatDateLong(end, includeDay, ev.allDay), g.getWidth()-10));
  } else {
    lines = lines.concat(
      g.wrapString(formatDateShort(start,true), g.getWidth()-10),
      g.wrapString(/*LANG*/"Start"+": "+formatDateLong(start, includeDay, ev.allDay), g.getWidth()-10),
      g.wrapString(/*LANG*/"End"+": "+formatDateLong(end, includeDay, ev.allDay), g.getWidth()-10));
  }
  if(ev.location)
    lines = lines.concat("",/*LANG*/"Location"+": ", g.wrapString(ev.location, g.getWidth()-10));
  if(ev.description && ev.description.trim())
    lines = lines.concat("",g.wrapString(ev.description, g.getWidth()-10));
  if(ev.calName)
    lines = lines.concat("",/*LANG*/"Calendar"+": ", g.wrapString(ev.calName, g.getWidth()-10));
  lines = lines.concat("",/*LANG*/"< Back");
  E.showScroller({
    h : g.getFontHeight(), // height of each menu item in pixels
    c : lines.length, // number of menu items
    // a function to draw a menu item
    draw : function(idx, r) {
      // FIXME: in 2v13 onwards, clearRect(r) will work fine. There's a bug in 2v12
      g.setBgColor(idx<titleCnt ? g.theme.bg2 : g.theme.bg).
        setColor(idx<titleCnt ? g.theme.fg2 : g.theme.fg).
        clearRect(r.x,r.y,r.x+r.w, r.y+r.h);
      g.setFont(bodyFont).drawString(lines[idx], r.x, r.y);
    }, select : function(idx) {
      if (idx>=lines.length-2)
        showList();
    },
    back : () => showList()
  });
}

function showList() {
  //it might take time for GB to delete old events, decide whether to show them grayed out or hide entirely
  if(!settings.pastEvents) {
    let now = new Date();
    //TODO add threshold here?
    CALENDAR = CALENDAR.filter(ev=>ev.timestamp + ev.durationInSeconds > now/1000);
  }
  if(CALENDAR.length == 0) {
    E.showMessage(/*LANG*/"No events");
    return;
  }
  E.showScroller({
    h : 52,
    c : Math.max(CALENDAR.length,3), // workaround for 2v10.219 firmware (min 3 not needed for 2v11)
    draw : function(idx, r) {"ram"
      var ev = CALENDAR[idx];
      g.setColor(g.theme.fg);
      g.clearRect(r.x,r.y,r.x+r.w, r.y+r.h);
      if (!ev) return;
      var isPast = false;
      var x = r.x+2, title = ev.title;
      var body = formatDateShort(getDate(ev.timestamp),ev.allDay)+"\n"+(ev.location?ev.location:/*LANG*/"No location");
      if(settings.pastEvents) isPast = ev.timestamp + ev.durationInSeconds < (new Date())/1000;
      if (title) g.setFontAlign(-1,-1).setFont(fontBig)
        .setColor(isPast ? "#888" : g.theme.fg).drawString(title, x+4,r.y+2);
      if (body) {
        g.setFontAlign(-1,-1).setFont(fontMedium).setColor(isPast ? "#888" : g.theme.fg);
        g.drawString(body, x+10,r.y+20);
      }
      g.setColor("#888").fillRect(r.x,r.y+r.h-1,r.x+r.w-1,r.y+r.h-1); // dividing line between items
      if(ev.color) {
        g.setColor("#"+(0x1000000+Number(ev.color)).toString(16).padStart(6,"0"));
        g.fillRect(r.x,r.y+4,r.x+3, r.y+r.h-4);
      }
    },
    select : idx => showEvent(CALENDAR[idx]),
    back : () => load()
  });
}
showList();
