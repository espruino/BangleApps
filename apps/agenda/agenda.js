/* CALENDAR is a list of:
  {id:int,
    type,
    timestamp,
    durationInSeconds,
    title,
    description,
    location,
    allDay: bool,
  }
  the file on storage has the same content but is an object indexed by id
*/

var FILE = "android.calendar.json"

var fontSmall = "6x8";
var fontMedium = g.getFonts().includes("6x15")?"6x15":"6x8:2";
var fontBig = g.getFonts().includes("12x20")?"12x20":"6x8:2";
var fontLarge = g.getFonts().includes("6x15")?"6x15:2":"6x8:4";

//FIXME maybe write the end from GB already? Not durationInSeconds here (or do while receiving?)
var cal;
try { cal = require("Storage").readJSON("android.calendar.json"); } catch (e) {}
if (!cal) //cal = {}; // first event
    cal = { //FIXME test
        1: {id: 1, title:"foo", timestamp: 1653577989371, durationInSeconds: 3000, location: "somewhere"},
        2: {id: 2, title:"last", timestamp: 1653579989371, durationInSeconds: 3000, location: "somewhere"},
        3: {id: 3, title:"bar", timestamp: 1653578989371, durationInSeconds: 3000, location: "somewhere"}
    };

function formatDateLong(timestamp) {
    return new Date(timestamp*1000).toString();
}
function formatDateShort(timestamp) {
    return new Date(timestamp*1000).toISOString();
}

function showEvent(ev) {
  var bodyFont = fontBig;
  g.setFont(bodyFont);
  var lines = [];
  if (ev.title) lines = g.wrapString(ev.title, g.getWidth()-10)
  var titleCnt = lines.length;
  if (titleCnt) lines.push(""); // add blank line after title
  lines = lines.concat(
      g.wrapString(formatDateLong(ev.timestamp)+"\n", g.getWidth()-10),
      g.wrapString(formatDateLong((+ev.timestamp) + (+ev.durationInSeconds))+"\n", g.getWidth()-10),
      g.wrapString(ev.location, g.getWidth()-10),
      ["",/*LANG*/"< Back"]);
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
        showEvent(ev);
    },
    back : () => showList()
  });
}

CALENDAR=Object.keys(cal)
    .sort((a,b)=>cal[a].timestamp - cal[b].timestamp)
    .map(k=>cal[k]); //make it an array

function showList() {
    E.showScroller({
        h : 48,
        c : Math.max(CALENDAR.length,3), // workaround for 2v10.219 firmware (min 3 not needed for 2v11)
        draw : function(idx, r) {"ram"
            var ev = CALENDAR[idx];
            g.setColor(g.theme.fg);
            g.clearRect(r.x,r.y,r.x+r.w, r.y+r.h);
            if (!ev) return;
            var x = r.x+2, title = ev.title, body = formatDateShort(ev.timestamp)+
                "\n"+ev.location;
            var m = ev.title+"\n"+ev.location, longBody=false;
            if (title) g.setFontAlign(-1,-1).setFont(fontBig).drawString(title, x,r.y+2);
            if (body) {
                g.setFontAlign(-1,-1).setFont("6x8");
                var l = g.wrapString(body, r.w-(x+14));
                if (l.length>3) {
                    l = l.slice(0,3);
                    l[l.length-1]+="...";
                }
                longBody = l.length>2;
                g.drawString(l.join("\n"), x+10,r.y+20);
            }
            //if (!longBody && msg.src) g.setFontAlign(1,1).setFont("6x8").drawString(msg.src, r.x+r.w-2, r.y+r.h-2);
            g.setColor("#888").fillRect(r.x,r.y+r.h-1,r.x+r.w-1,r.y+r.h-1); // dividing line between items
        },
        select : idx => showEvent(CALENDAR[idx]),
        back : () => load()
    });
}
showList();
