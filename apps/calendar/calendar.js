const maxX = g.getWidth();
const maxY = g.getHeight();
const fontSize = g.getWidth() > 200 ? 2 : 1;
const rowN = 7;
const colN = 7;
const headerH = maxY / 7;
const rowH = (maxY - headerH) / rowN;
const colW = maxX / colN;
const color1 = "#035AA6";
const color2 = "#4192D9";
const color3 = "#026873";
const color4 = "#038C8C";
const gray1 = "#bbbbbb";
const black = "#000000";
const white = "#ffffff";
const red = "#d41706";
const blue = "#0000ff";
const yellow = "#ffff00";
let bgColor = color4;
let bgColorMonth = color1;
let bgColorDow = color2;
let bgColorWeekend = color3;
let fgOtherMonth = gray1;
let fgSameMonth = white;
let bgEvent = blue;
const eventsPerDay=6; // how much different events per day we can display
const date = new Date();

const timeutils = require("time_utils");
let settings = require('Storage').readJSON("calendar.json", true) || {};
let startOnSun = ((require("Storage").readJSON("setting.json", true) || {}).firstDayOfWeek || 0) === 0;
 // all alarms that run on a specific date
const events = (require("Storage").readJSON("sched.json",1) || []).filter(a => a.on && a.date).map(a => {
  const date = new Date(a.date);
  const time = timeutils.decodeTime(a.t);
  date.setHours(time.h);
  date.setMinutes(time.m);
  date.setSeconds(time.s);
  return {date: date, msg: a.msg};
});
events.sort((a,b) => a.date - b.date);

if (settings.ndColors === undefined) {
  settings.ndColors = !g.theme.dark;
}

if (settings.ndColors === true) {
  bgColor = white;
  bgColorMonth = blue;
  bgColorDow = black;
  bgColorWeekend = yellow;
  fgOtherMonth = blue;
  fgSameMonth = black;
  bgEvent = color2;
}

function getDowLbls(locale) {
  let dowLbls;
  //TODO: Find some clever way to generate this programmatically from locale lib
  switch (locale) {
    case "de_AT":
    case "de_CH":
    case "de_DE":
      if (startOnSun) {
        dowLbls = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
      } else {
        dowLbls = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
      }
      break;
    case "nl_NL":
      if (startOnSun) {
        dowLbls = ["zo", "ma", "di", "wo", "do", "vr", "za"];
      } else {
        dowLbls = ["ma", "di", "wo", "do", "vr", "za", "zo"];
      }
      break;
    case "fr_BE":
    case "fr_CH":
    case "fr_FR":
      if (startOnSun) {
        dowLbls = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
      } else {
        dowLbls = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
      }
      break;
    case "sv_SE":
      if (startOnSun) {
        dowLbls = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
      } else {
        dowLbls = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
      }
      break;
    case "it_CH":
    case "it_IT":
      if (startOnSun) {
        dowLbls = ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"];
      } else {
        dowLbls = ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"];
      }
      break;
    case "oc_FR":
      if (startOnSun) {
        dowLbls = ["dg", "dl", "dm", "dc", "dj", "dv", "ds"];
      } else {
        dowLbls = ["dl", "dm", "dc", "dj", "dv", "ds", "dg"];
      }
      break;
    default:
      if (startOnSun) {
        dowLbls = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
      } else {
        dowLbls = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
      }
      break;
  }
  return dowLbls;
}

function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function drawCalendar(date) {
  g.setBgColor(bgColor);
  g.clearRect(0, 0, maxX, maxY);
  g.setBgColor(bgColorMonth);
  g.clearRect(0, 0, maxX, headerH);
  if (startOnSun){
    g.setBgColor(bgColorWeekend);
    g.clearRect(0, headerH + rowH, colW, maxY);
    g.setBgColor(bgColorDow);
    g.clearRect(0, headerH, maxX, headerH + rowH);
    g.setBgColor(bgColorWeekend);
    g.clearRect(colW * 6, headerH + rowH, maxX, maxY);
  } else {
    g.setBgColor(bgColorDow);
    g.clearRect(0, headerH, maxX, headerH + rowH);
    g.setBgColor(bgColorWeekend);
    g.clearRect(colW * 5, headerH + rowH, maxX, maxY);
  }
  for (let y = headerH; y < maxY; y += rowH) {
    g.drawLine(0, y, maxX, y);
  }
  for (let x = 0; x < maxX; x += colW) {
    g.drawLine(x, headerH, x, maxY);
  }

  const month = date.getMonth();
  const year = date.getFullYear();
  const localeMonth = require('locale').month(date);
  g.setFontAlign(0, 0);
  g.setFont("6x8", fontSize);
  g.setColor(white);
  g.drawString(`${localeMonth} ${year}`, maxX / 2, headerH / 2);
  g.drawPoly([10, headerH / 2, 20, 10, 20, headerH - 10], true);
  g.drawPoly(
    [maxX - 10, headerH / 2, maxX - 20, 10, maxX - 20, headerH - 10],
    true
  );

  g.setFont("6x8", fontSize);
  let dowLbls = getDowLbls(require('locale').name);
  dowLbls.forEach((lbl, i) => {
    g.drawString(lbl, i * colW + colW / 2, headerH + rowH / 2);
  });

  date.setDate(1);
  const dow = date.getDay() + (startOnSun ? 1 : 0);
  const dowNorm = dow === 0 ? 7 : dow;

  const monthMaxDayMap = {
    0: 31,
    1: (2020 - year) % 4 === 0 ? 29 : 28,
    2: 31,
    3: 30,
    4: 31,
    5: 30,
    6: 31,
    7: 31,
    8: 30,
    9: 31,
    10: 30,
    11: 31
  };

  let days = [];
  let nextMonthDay = 1;
  let thisMonthDay = 51;
  let prevMonthDay = monthMaxDayMap[month > 0 ? month - 1 : 11] - dowNorm + 1;
  for (let i = 0; i < colN * (rowN - 1) + 1; i++) {
    if (i < dowNorm) {
      days.push(prevMonthDay);
      prevMonthDay++;
    } else if (thisMonthDay <= monthMaxDayMap[month] + 50) {
      days.push(thisMonthDay);
      thisMonthDay++;
    } else {
      days.push(nextMonthDay);
      nextMonthDay++;
    }
  }

  const weekBeforeMonth = new Date(date.getTime());
  weekBeforeMonth.setDate(weekBeforeMonth.getDate() - 7);
  const week2AfterMonth = new Date(date.getFullYear(), date.getMonth()+1, 0);
  week2AfterMonth.setDate(week2AfterMonth.getDate() + 14);
  const eventsThisMonth = events.filter(ev => ev.date > weekBeforeMonth && ev.date < week2AfterMonth);

  let i = 0;
  for (y = 0; y < rowN - 1; y++) {
    for (x = 0; x < colN; x++) {
      i++;
      const day = days[i];
      const curMonth = day < 15 ? month+1 : day < 50 ? month-1 : month;
      const curDay = new Date(year, curMonth, day > 50 ? day-50 : day);
      const isToday = sameDay(curDay, new Date());
      const x1 = x * colW;
      const y1 = y * rowH + headerH + rowH;
      const x2 = x * colW + colW;
      const y2 = y * rowH + headerH + rowH + rowH;
      if (isToday) {
        g.setColor(red);
        g.drawRect(x1, y1, x2, y2);
        g.drawRect(
          x1 + 1,
          y1 + 1,
          x2 - 1,
          y2 - 1
        );
      }

      if (eventsThisMonth.length > 0) {
        // Display events for this day
        g.setColor(bgEvent);
        eventsThisMonth.forEach((ev, idx) => {
          if (sameDay(ev.date, curDay)) {
            const hour = ev.date.getHours() + ev.date.getMinutes()/60.0;
            const slice = hour/24*(eventsPerDay-1); // slice 0 for 0:00 up to eventsPerDay for 23:59
            const height = (y2-2) - (y1+2); // height of a cell
            const sliceHeight = height/eventsPerDay;
            const ystart = (y1+2) + slice*sliceHeight;
            g.fillRect(x1+1, ystart, x2-2, ystart+sliceHeight);

            eventsThisMonth.splice(idx, 1); // this event is no longer needed
          }
        });
      }

      require("Font8x12").add(Graphics);
      g.setFont("8x12", fontSize);
      g.setColor(day < 50 ? fgOtherMonth : fgSameMonth);
      g.drawString(
        (day > 50 ? day - 50 : day).toString(),
        x * colW + colW / 2,
        headerH + rowH + y * rowH + rowH / 2
      );
    }
  }
}

function setUI() {
  Bangle.setUI({
    mode : "custom",
    swipe: (dirLR, dirUD) => {
      if (dirLR<0) { // left
        const month = date.getMonth();
        let prevMonth = month > 0 ? month - 1 : 11;
        if (prevMonth === 11) date.setFullYear(date.getFullYear() - 1);
        date.setMonth(prevMonth);
        drawCalendar(date);
      } else if (dirLR>0) { // right
        const month = date.getMonth();
        let nextMonth = month < 11 ? month + 1 : 0;
        if (nextMonth === 0) date.setFullYear(date.getFullYear() + 1);
        date.setMonth(nextMonth);
        drawCalendar(date);
      } else if (dirUD<0) { // up
        date.setFullYear(date.getFullYear() - 1);
        drawCalendar(date);
      } else if (dirUD>0) { // down
        date.setFullYear(date.getFullYear() + 1);
        drawCalendar(date);
      }
    },
    btn: (n) => n === (process.env.HWVERSION === 2 ? 1 : 3) && load(),
    touch: (n,e) => {
      const menu = events.filter(ev => ev.date.getFullYear() === date.getFullYear() && ev.date.getMonth() === date.getMonth()).map(e => {
        const dateStr = require("locale").date(e.date, 1);
        const timeStr = require("locale").time(e.date, 1);
        return { title: `${dateStr} ${timeStr}` + (e.msg ? " " + e.msg : "") };
      });
      if (menu.length === 0) {
        menu.push({title: /*LANG*/"No events"});
      }
      menu[""] = { title: require("locale").month(date) + " " + date.getFullYear() };
      menu["< Back"] = () => {
        E.showMenu();
        drawCalendar(date);
        setUI();
      };
      E.showMenu(menu);
    }
  });
}

drawCalendar(date);
setUI();
// No space for widgets!
