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

let settings = require('Storage').readJSON("calendar.json", true) || {};
if (settings.startOnSun === undefined)
  settings.startOnSun = false;
if (settings.ndColors === undefined)
  if (process.env.HWVERSION == 2) {
    settings.ndColors = true;
  } else {
    settings.ndColors = false;
  }

if (settings.ndColors === true) {
  let bgColor = white;
  let bgColorMonth = blue;
  let bgColorDow = black;
  let bgColorWeekend = yellow;
  let fgOtherMonth = blue;
  let fgSameMonth = black;
} else {
  let bgColor = color4;
  let bgColorMonth = color1;
  let bgColorDow = color2;
  let bgColorWeekend = color3;
  let fgOtherMonth = gray1;
  let fgSameMonth = white;
}

function getDowLbls(locale) {
  let dowLbls;
  //TODO: Find some clever way to generate this programmatically from locale lib
  switch (locale) {
    case "de_AT":
    case "de_CH":
    case "de_DE":
      if (settings.startOnSun) {
        dowLbls = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
      } else {
        dowLbls = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
      }
      break;
    case "nl_NL":
      if (settings.startOnSun) {
        dowLbls = ["zo", "ma", "di", "wo", "do", "vr", "za"];
      } else {
        dowLbls = ["ma", "di", "wo", "do", "vr", "za", "zo"];
      }
      break;
    case "fr_BE":
    case "fr_CH":
    case "fr_FR":
      if (settings.startOnSun) {
        dowLbls = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
      } else {
        dowLbls = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
      }
      break;
    case "sv_SE":
      if (settings.startOnSun) {
        dowLbls = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
      } else {
        dowLbls = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
      }
      break;
    case "it_CH":
    case "it_IT":
      if (settings.startOnSun) {
        dowLbls = ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"];
      } else {
        dowLbls = ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"];
      }
      break;
    case "oc_FR":
      if (settings.startOnSun) {
        dowLbls = ["dg", "dl", "dm", "dc", "dj", "dv", "ds"];
      } else {
        dowLbls = ["dl", "dm", "dc", "dj", "dv", "ds", "dg"];
      }
      break;
    default:
      if (settings.startOnSun) {
        dowLbls = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
      } else {
        dowLbls = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
      }
      break;
  }
  return dowLbls;
}

function drawCalendar(date) {
  g.setBgColor(bgColor);
  g.clearRect(0, 0, maxX, maxY);
  g.setBgColor(bgColorMonth);
  g.clearRect(0, 0, maxX, headerH);
  g.setBgColor(bgColorDow);
  g.clearRect(0, headerH, maxX, headerH + rowH);
  g.setBgColor(bgColorWeekend);
  g.clearRect(colW * 5, headerH + rowH, maxX, maxY);
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
  const dow = date.getDay() + (settings.startOnSun ? 1 : 0);
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
  let prevMonthDay = monthMaxDayMap[month > 0 ? month - 1 : 11] - dowNorm;
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

  let i = 0;
  for (y = 0; y < rowN - 1; y++) {
    for (x = 0; x < colN; x++) {
      i++;
      const day = days[i];
      const isToday =
        today.year === year && today.month === month && today.day === day - 50;
      if (isToday) {
        g.setColor(red);
        let x1 = x * colW;
        let y1 = y * rowH + headerH + rowH;
        let x2 = x * colW + colW;
        let y2 = y * rowH + headerH + rowH + rowH;
        g.drawRect(x1, y1, x2, y2);
        g.drawRect(
          x1 + 1,
          y1 + 1,
          x2 - 1,
          y2 - 1
        );
      }
      g.setColor(day < 50 ? fgOtherMonth : fgSameMonth);
      g.drawString(
        (day > 50 ? day - 50 : day).toString(),
        x * colW + colW / 2,
        headerH + rowH + y * rowH + rowH / 2
      );
    }
  }
}

const date = new Date();
const today = {
  day: date.getDate(),
  month: date.getMonth(),
  year: date.getFullYear()
};
drawCalendar(date);
clearWatch();
Bangle.on("touch", area => {
  const month = date.getMonth();
  let prevMonth;
  if (area == 1) {
    let prevMonth = month > 0 ? month - 1 : 11;
    if (prevMonth === 11) date.setFullYear(date.getFullYear() - 1);
    date.setMonth(prevMonth);
  } else {
    let prevMonth = month < 11 ? month + 1 : 0;
    if (prevMonth === 0) date.setFullYear(date.getFullYear() + 1);
    date.setMonth(month + 1);
  }
  drawCalendar(date);
});

// Show launcher when button pressed
Bangle.setUI("clock"); // TODO: ideally don't set 'clock' mode
// No space for widgets!
